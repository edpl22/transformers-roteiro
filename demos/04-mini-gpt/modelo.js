// Inferência do mini-GPT em JS puro, sem dependências. Funciona no navegador e em Node.
// Duas rotas de cálculo: forward completo e passo incremental com KV cache. Ambas contam multiplicações.
function decodificar(b64) {
  const bin = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Float32Array(bytes.buffer);
}

export class MiniGPT {
  constructor({ meta, parametros }) {
    this.meta = meta;
    Object.assign(this, { T: meta.T, d: meta.d, h: meta.h, L: meta.L, vocab: [...meta.vocab] });
    this.dh = this.d / this.h;
    this.p = {};
    for (const [k, { b64 }] of Object.entries(parametros)) this.p[k] = Float64Array.from(decodificar(b64));
    this.indice = new Map(this.vocab.map((c, i) => [c, i]));
    this.mults = 0;
  }

  codificar(texto) { return [...texto].filter((c) => this.indice.has(c)).map((c) => this.indice.get(c)); }
  decodificar(ids) { return ids.map((i) => this.vocab[i]).join(""); }

  // y = x W, com x de tamanho n e W de forma (n, m)
  linear(x, W, m) {
    const n = x.length, y = new Float64Array(m);
    for (let i = 0; i < n; i++) {
      const xi = x[i], base = i * m;
      for (let j = 0; j < m; j++) y[j] += xi * W[base + j];
    }
    this.mults += n * m;
    return y;
  }

  layerNorm(x, g, b) {
    const d = x.length, y = new Float64Array(d);
    let mu = 0, v = 0;
    for (let i = 0; i < d; i++) mu += x[i];
    mu /= d;
    for (let i = 0; i < d; i++) v += (x[i] - mu) ** 2;
    const s = Math.sqrt(v / d + 1e-5);
    for (let i = 0; i < d; i++) y[i] = ((x[i] - mu) / s) * g[i] + b[i];
    return y;
  }

  // Calcula a saída de um bloco para a posição mais recente, dado o cache de K e V das posições anteriores.
  blocoPasso(i, x, cache) {
    const { p, d, h, dh } = this;
    const hn = this.layerNorm(x, p[`b${i}.ln1.g`], p[`b${i}.ln1.b`]);
    const q = this.linear(hn, p[`b${i}.Wq`], d);
    cache.k.push(this.linear(hn, p[`b${i}.Wk`], d));
    cache.v.push(this.linear(hn, p[`b${i}.Wv`], d));
    const z = new Float64Array(d), raiz = Math.sqrt(dh), n = cache.k.length;
    const atencao = [];
    for (let c = 0; c < h; c++) {
      const ini = c * dh, s = new Float64Array(n);
      let max = -Infinity;
      for (let j = 0; j < n; j++) {
        let t = 0;
        for (let m = 0; m < dh; m++) t += q[ini + m] * cache.k[j][ini + m];
        s[j] = t / raiz;
        if (s[j] > max) max = s[j];
      }
      this.mults += n * dh;
      let soma = 0;
      for (let j = 0; j < n; j++) { s[j] = Math.exp(s[j] - max); soma += s[j]; }
      for (let j = 0; j < n; j++) {
        const a = s[j] / soma;
        s[j] = a;
        for (let m = 0; m < dh; m++) z[ini + m] += a * cache.v[j][ini + m];
      }
      this.mults += n * dh;
      atencao.push(s);
    }
    const o = this.linear(z, p[`b${i}.Wo`], d);
    const x1 = x.map((v, m) => v + o[m]);
    const h2 = this.layerNorm(x1, p[`b${i}.ln2.g`], p[`b${i}.ln2.b`]);
    const a = this.linear(h2, p[`b${i}.W1`], 4 * d).map((v, m) => Math.max(0, v + p[`b${i}.b1`][m]));
    const o2 = this.linear(a, p[`b${i}.W2`], d);
    return { saida: x1.map((v, m) => v + o2[m] + p[`b${i}.b2`][m]), atencao };
  }

  novoCache() {
    return { n: 0, blocos: Array.from({ length: this.L }, () => ({ k: [], v: [] })), atencao: null };
  }

  // Processa um único token novo reaproveitando K e V. Sem o cache, seria preciso recalcular todos.
  passo(id, cache) {
    if (cache.n >= this.T) throw new Error("Contexto cheio: com posição aprendida, a janela deslizante invalida o cache.");
    const { p, d } = this;
    let x = new Float64Array(d);
    for (let m = 0; m < d; m++) x[m] = p.tok[id * d + m] + p.pos[cache.n * d + m];
    for (let i = 0; i < this.L; i++) {
      const r = this.blocoPasso(i, x, cache.blocos[i]);
      x = r.saida;
      cache.atencao = r.atencao;
    }
    cache.n++;
    const hf = this.layerNorm(x, p["lnf.g"], p["lnf.b"]);
    return this.linear(hf, p.cabeca, this.vocab.length);
  }

  // Forward completo, como em um modelo sem cache: calcula toda a matriz Q K^T, aplica a máscara causal
  // e refaz todas as posições (no máximo T). Rota independente de passo(), para a comparação ser real.
  completo(ids) {
    const { p, d, h, dh } = this;
    const janela = ids.slice(-this.T), n = janela.length, raiz = Math.sqrt(dh);
    let X = janela.map((id, t) => {
      const x = new Float64Array(d);
      for (let m = 0; m < d; m++) x[m] = p.tok[id * d + m] + p.pos[t * d + m];
      return x;
    });
    let atencao = null;
    for (let i = 0; i < this.L; i++) {
      const H = X.map((x) => this.layerNorm(x, p[`b${i}.ln1.g`], p[`b${i}.ln1.b`]));
      const Q = H.map((x) => this.linear(x, p[`b${i}.Wq`], d));
      const K = H.map((x) => this.linear(x, p[`b${i}.Wk`], d));
      const V = H.map((x) => this.linear(x, p[`b${i}.Wv`], d));
      const Z = X.map(() => new Float64Array(d));
      atencao = [];
      for (let c = 0; c < h; c++) {
        const ini = c * dh;
        for (let t = 0; t < n; t++) {
          const s = new Float64Array(n);
          let max = -Infinity;
          for (let j = 0; j < n; j++) {
            let v = 0;
            for (let m = 0; m < dh; m++) v += Q[t][ini + m] * K[j][ini + m];
            s[j] = j > t ? -Infinity : v / raiz;       // máscara causal depois de calcular a linha inteira
            if (s[j] > max) max = s[j];
          }
          this.mults += n * dh;
          let soma = 0;
          for (let j = 0; j < n; j++) { s[j] = Math.exp(s[j] - max); soma += s[j]; }
          for (let j = 0; j <= t; j++) {
            s[j] /= soma;
            for (let m = 0; m < dh; m++) Z[t][ini + m] += s[j] * V[j][ini + m];
          }
          this.mults += (t + 1) * dh;
          if (t === n - 1) atencao.push(s);
        }
      }
      X = X.map((x, t) => {
        const o = this.linear(Z[t], p[`b${i}.Wo`], d);
        const x1 = x.map((v, m) => v + o[m]);
        const h2 = this.layerNorm(x1, p[`b${i}.ln2.g`], p[`b${i}.ln2.b`]);
        const a = this.linear(h2, p[`b${i}.W1`], 4 * d).map((v, m) => Math.max(0, v + p[`b${i}.b1`][m]));
        const o2 = this.linear(a, p[`b${i}.W2`], d);
        return x1.map((v, m) => v + o2[m] + p[`b${i}.b2`][m]);
      });
    }
    const hf = this.layerNorm(X[n - 1], p["lnf.g"], p["lnf.b"]);
    return { logits: this.linear(hf, p.cabeca, this.vocab.length), atencao };
  }
}

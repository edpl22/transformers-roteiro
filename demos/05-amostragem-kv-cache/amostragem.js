// Estratégias de amostragem: temperatura, top-k (Fan et al., 2018) e top-p (Holtzman et al., 2020).
export function softmaxTemperatura(logits, temperatura) {
  const l = Array.from(logits);
  if (temperatura < 1e-6) {                       // limite T -> 0: decodificação gulosa
    const m = l.indexOf(Math.max(...l));
    return l.map((_, i) => (i === m ? 1 : 0));
  }
  const max = Math.max(...l);
  const e = l.map((v) => Math.exp((v - max) / temperatura));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

// Mantém os k mais prováveis. k <= 0 ou k >= tamanho: não corta nada.
export function filtroTopK(p, k) {
  if (k <= 0 || k >= p.length) return p.map(() => true);
  const ordem = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const manter = p.map(() => false);
  for (let i = 0; i < k; i++) manter[ordem[i][1]] = true;
  return manter;
}

// Núcleo: menor conjunto, em ordem decrescente de probabilidade, cuja soma atinge pelo menos top_p.
export function filtroTopP(p, topP) {
  if (topP >= 1) return p.map(() => true);
  const ordem = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const manter = p.map(() => false);
  let soma = 0;
  for (const [v, i] of ordem) {
    manter[i] = true;
    soma += v;
    if (soma >= topP) break;
  }
  return manter;
}

// Ordem usual: temperatura, depois top-k, depois top-p (sobre o que restou, renormalizado).
export function distribuicao(logits, { temperatura = 1, topK = 0, topP = 1 } = {}) {
  const base = softmaxTemperatura(logits, temperatura);
  const mK = filtroTopK(base, topK);
  const somaK = base.reduce((s, v, i) => s + (mK[i] ? v : 0), 0);
  const posK = base.map((v, i) => (mK[i] ? v / somaK : 0));
  const mP = filtroTopP(posK, topP);
  const manter = base.map((_, i) => mK[i] && mP[i]);
  const soma = posK.reduce((s, v, i) => s + (manter[i] ? v : 0), 0);
  return { base, manter, final: posK.map((v, i) => (manter[i] ? v / soma : 0)) };
}

export function amostrar(p, u) {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    a += p[i];
    if (u < a) return i;
  }
  return p.findLastIndex((v) => v > 0);
}

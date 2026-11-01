// Contexto de uma cena: desenha elementos ocultos e os revela com a Web Animations API.
// Com `instantaneo` ligado, os mesmos passos aplicam só o estado final: é assim que voltar um passo funciona.
import { el, fmt, matrizHTML, svgEl, tex } from "../../demos/_comum/prancha.js";
import { FUNCOES } from "../../sfx/sfx.js";

export const COR = {
  az: "var(--azul-prussia)", vm: "var(--vermelho-lapis)", oc: "var(--ocre)", vd: "var(--verde-oliva)",
  ti: "var(--tinta)", gr: "var(--grafite)", rg: "var(--regua)", pa: "var(--papel)",
};
const EASE = {
  entrada: "cubic-bezier(0.16, 1, 0.3, 1)",
  saida: "cubic-bezier(0.7, 0, 0.84, 0)",
  traco: "cubic-bezier(0.65, 0, 0.35, 1)",
};
export const DUR = { micro: 150, curta: 300, media: 600, longa: 1200 };

// Zonas da prancha: colunas 1 a 12 e linhas A a F. col(1) é a borda esquerda da coluna 1.
export const col = (n) => 40 + ((n - 1) * 1840) / 12;
export const lin = (l) => 40 + ("ABCDEF".indexOf(l) * 1000) / 6;

const lista = (x) => (Array.isArray(x) ? x.flat(Infinity).filter(Boolean) : [x]);

export class Cena {
  constructor(raiz, { palco, dados, tocarSom, abrirDemoFn, carimbarFn, moldura }) {
    Object.assign(this, { raiz, palco, dados, tocarSom, abrirDemoFn, carimbarFn, moldura });
    this.instantaneo = false;
    this.anims = [];
    this.timers = [];
    this.s = svgEl("svg", { viewBox: "0 0 1920 1080" });
    this.h = el("div", { class: "camada" });
    this.s.append(svgEl("defs", {}, svgEl("pattern", { id: "hachura", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
      svgEl("rect", { width: 8, height: 8, fill: "#F2EDE0" }), svgEl("rect", { width: 2, height: 8, fill: "#B5332A" }))));
    raiz.append(this.s, this.h);
  }

  /* ---------- Criação: tudo nasce oculto, exceto com { ja: true } ---------- */
  _html(no, o = {}) {
    no.classList.add("el");
    if (o.x !== undefined) no.style.left = `${o.x}px`;
    if (o.y !== undefined) no.style.top = `${o.y}px`;
    if (o.w !== undefined) no.style.width = `${o.w}px`;
    if (o.h !== undefined) no.style.height = `${o.h}px`;
    if (o.fs) no.style.fontSize = `${o.fs}px`;
    if (o.cor) no.style.color = o.cor;
    if (o.al) no.style.textAlign = o.al;
    if (o.tf) no.style.transform = o.tf;
    if (!o.ja) no.style.visibility = "hidden";
    this.h.append(no);
    return no;
  }

  _svg(no, o = {}) {
    if (!o.ja) no.style.visibility = "hidden";
    (o.pai ?? this.s).append(no);
    return no;
  }

  titulo(texto, { ja = true } = {}) {
    const t = this._html(el("div", { class: "t-titulo" }, texto), { x: 72, y: 64, ja });
    this._html(el("div", { class: "regra" }), { x: 72, y: 140, w: 1776, ja });
    return t;
  }

  txt(conteudo, o = {}) {
    const no = el("div", { class: o.cl ?? "t-texto" });
    no.innerHTML = conteudo;
    return this._html(no, o);
  }

  rot(conteudo, o = {}) { return this.txt(conteudo, { cl: "t-rotulo", ...o }); }
  nota(conteudo, o = {}) { return this.txt(conteudo, { cl: "t-nota", ...o }); }
  sub(conteudo, o = {}) { return this.txt(conteudo, { cl: "t-sub", ...o }); }

  eq(fonte, o = {}) {
    const no = el("div", {});
    tex(no, fonte, false);
    no.style.fontSize = `${o.fs ?? 30}px`;
    no.style.whiteSpace = "nowrap";
    if (o.cor) no.style.color = o.cor;
    const fs = o.fs;
    delete o.fs;
    const r = this._html(no, o);
    o.fs = fs;
    return r;
  }

  mat(M, o = {}) {
    const m = matrizHTML(M, { casas: o.casas ?? 0, cor: o.cor ?? "" });
    if (o.fs) m.style.fontSize = `${o.fs}px`;
    const p = { ...o };
    delete p.fs;
    delete p.cor;
    return this._html(m, p);
  }

  peca(texto, o = {}) {
    const no = el("div", { class: `peca ${o.cl ?? ""}` }, texto);
    const p = { ...o };
    delete p.cl;
    return this._html(no, p);
  }

  // Fileira de tokens centrados em xs; devolve as peças, com as posições conhecidas em .cx e .topo
  frase(tokens, { x0, x1, y, cl, ja, fs } = {}) {
    const passo = (x1 - x0) / tokens.length;
    return tokens.map((t, i) => {
      const cx = x0 + passo * (i + 0.5);
      const p = this.peca(t, { x: cx, y, cl, ja, fs, tf: "translateX(-50%)" });
      p.cx = cx;
      p.topo = y;
      p.base = y + 46;
      p.dataset.semdy = "1";
      return p;
    });
  }

  caixa(texto, x, y, w, h, o = {}) {
    const no = el("div", { class: `caixa ${o.cl ?? ""}` });
    no.innerHTML = texto;
    const p = { ...o };
    delete p.cl;
    return this._html(no, { x, y, w, h, ...p });
  }

  // Vetor com células coloridas por valor; a cor vem da função (Q, K, V, Z).
  vetor(vals, o = {}) {
    const cor = o.cor ?? COR.ti;
    const v = el("div", { class: "vetor", style: `color:${cor}` });
    for (const a of vals) {
      const c = el("i", { style: `background:${cor};opacity:${Math.max(0.08, Math.abs(a))}` });
      if (o.lado) { c.style.width = `${o.lado}px`; c.style.height = `${o.lado}px`; }
      v.append(c);
    }
    const p = { ...o };
    delete p.cor;
    return this._html(v, p);
  }

  tabela(cabecalho, linhas, o = {}) {
    const num = o.num ?? [];
    const t = el("table", { class: "tb" });
    const th = el("tr");
    cabecalho.forEach((c, i) => th.append(el("th", { class: num.includes(i) ? "num" : "" }, c)));
    t.append(th);
    t.linhas = linhas.map((l) => {
      const tr = el("tr");
      l.forEach((c, i) => { const td = el("td", { class: num.includes(i) ? "num" : "" }); td.innerHTML = c; tr.append(td); });
      if (!o.ja) tr.style.visibility = "hidden";
      t.append(tr);
      return tr;
    });
    if (o.fs) t.style.fontSize = `${o.fs}px`;
    const p = { ...o };
    delete p.num;
    delete p.fs;
    return this._html(t, p);
  }

  codigo(linhas, o = {}) {
    const c = el("div", { class: "codigo" });
    c.linhas = linhas.map((l) => { const s = el("span", { class: "fc" }); s.innerHTML = l || " "; c.append(s); return s; });
    return this._html(c, o);
  }

  // Mapa de calor em hachura de grafite, com rótulos opcionais
  mapa(A, o = {}) {
    const { lado = 56, rotulos = null, casas = 2, mascara = false, fs = 19 } = o;
    const n = A[0].length;
    const larguraRot = rotulos ? (o.largRot ?? 110) : 0;
    const g = el("div", { class: "mapa", style: `grid-template-columns:${rotulos ? `${larguraRot}px ` : ""}repeat(${n},${o.ladoX ?? lado}px);grid-auto-rows:${lado}px` });
    if (rotulos) {
      g.append(el("div", { class: "cab" }));
      (o.rotulosK ?? rotulos).forEach((t) => g.append(el("div", { class: "cab" }, t)));
    }
    g.cels = A.map((linha, i) => {
      if (rotulos) g.append(el("div", { class: "cab" }, rotulos[i]));
      return linha.map((p, j) => {
        const cortada = mascara && j > i;
        const t = Math.max(0, Math.min(1, p));
        const f = [242 + (27 - 242) * t, 237 + (36 - 237) * t, 224 + (48 - 224) * t].map(Math.round);
        const c = el("div", { class: `cel${cortada ? " cortada" : ""}`, style: `${cortada ? "" : `background:rgb(${f});color:${t > 0.55 ? "#F2EDE0" : "#1B2430"};`}font-size:${fs}px` }, cortada || casas < 0 ? "" : fmt(p, casas));
        g.append(c);
        return c;
      });
    });
    const p = { ...o };
    for (const k of ["lado", "rotulos", "casas", "mascara", "fs", "ladoX", "largRot", "rotulosK"]) delete p[k];
    return this._html(g, p);
  }

  path(d, o = {}) {
    return this._svg(svgEl("path", { d, fill: o.fill ?? "none", stroke: o.cor ?? COR.ti, "stroke-width": o.esp ?? 2, "stroke-linecap": o.cap ?? "butt", ...(o.dash ? { "stroke-dasharray": o.dash } : {}) }), o);
  }

  ret(x, y, w, h, o = {}) {
    return this._svg(svgEl("rect", { x, y, width: w, height: h, fill: o.fill ?? "none", stroke: o.cor ?? COR.ti, "stroke-width": o.esp ?? 2, ...(o.dash ? { "stroke-dasharray": o.dash } : {}), ...(o.op !== undefined ? { opacity: o.op } : {}) }), o);
  }

  circ(cx, cy, r, o = {}) {
    return this._svg(svgEl("circle", { cx, cy, r, fill: o.fill ?? "none", stroke: o.cor ?? COR.ti, "stroke-width": o.esp ?? 2 }), o);
  }

  // Seta com ponta triangular. A ponta só aparece quando o traço chega nela.
  seta(d, o = {}) {
    const cor = o.cor ?? COR.ti;
    const p = this.path(d, { ...o, cor });
    const L = p.getTotalLength();
    const a = p.getPointAtLength(L), b = p.getPointAtLength(Math.max(0, L - 4));
    const ang = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI;
    const t = (o.ponta ?? 11) + (o.esp ?? 2);
    p._ponta = this._svg(svgEl("path", { d: `M${-t} ${-t * 0.5}L0 0L${-t} ${t * 0.5}z`, fill: cor, transform: `translate(${a.x} ${a.y}) rotate(${ang})` }), o);
    // Encurta o traço para não vazar pela ponta quando for grosso
    return p;
  }

  // Linha de cota: arco entre dois pontos, com espessura proporcional ao peso (0,75 + 20·p).
  cota(x0, x1, y, p, o = {}) {
    if (Math.abs(x1 - x0) < 1) {
      return this.path(`M${x0 - 7} ${y}C${x0 - 46} ${y - 66} ${x0 + 46} ${y - 66} ${x0 + 7} ${y}`, { cor: o.cor ?? COR.az, esp: 0.75 + 20 * p, ...o });
    }
    const topo = y - Math.min(o.alt ?? 150, 44 + Math.abs(x1 - x0) * 0.26);
    return this.path(`M${x0} ${y}C${x0} ${topo} ${x1} ${topo} ${x1} ${y}`, { cor: o.cor ?? COR.az, esp: 0.75 + 20 * p, ...o });
  }

  /* ---------- Revelação ---------- */
  _mostrar(n) { n.style.visibility = "visible"; }

  entra(alvos, { dur = DUR.media, delay = 0, stag = 0, dy = 8 } = {}) {
    lista(alvos).forEach((n, i) => {
      this._mostrar(n);
      if (this.instantaneo) return;
      const base = n.style.transform || "";
      const de = n instanceof SVGElement || n.dataset?.semdy ? { opacity: 0 } : { opacity: 0, transform: `${base} translateY(${dy}px)` };
      const para = n instanceof SVGElement || n.dataset?.semdy ? { opacity: n.getAttribute?.("opacity") ?? 1 } : { opacity: 1, transform: base || "none" };
      this.anims.push(n.animate([de, para], { duration: dur, delay: delay + i * stag, easing: EASE.entrada, fill: "backwards" }));
    });
  }

  // Desenha o traço da origem ao destino.
  traca(alvos, { dur = DUR.longa, delay = 0, stag = 0 } = {}) {
    lista(alvos).forEach((n, i) => {
      this._mostrar(n);
      const inicio = delay + i * stag;
      if (n._ponta) this.entra(n._ponta, { dur: DUR.micro, delay: inicio + dur });
      if (this.instantaneo) return;
      if (n.getAttribute("stroke-dasharray")) {             // traço já tracejado: entra por opacidade
        this.anims.push(n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: inicio, easing: EASE.traco, fill: "backwards" }));
        return;
      }
      const L = n.getTotalLength();
      n.style.strokeDasharray = L;
      const a = n.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, delay: inicio, easing: EASE.traco, fill: "backwards" });
      a.onfinish = () => { n.style.strokeDasharray = ""; };
      this.anims.push(a);
    });
  }

  sai(alvos, { dur = DUR.curta, delay = 0 } = {}) {
    lista(alvos).forEach((n) => {
      const ocultar = () => {
        n.style.visibility = "hidden";
        if (n._ponta) n._ponta.style.visibility = "hidden";
      };
      if (this.instantaneo) return ocultar();
      const a = n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, delay, easing: EASE.saida, fill: "forwards" });
      a.onfinish = () => { ocultar(); a.cancel(); };
      this.anims.push(a);
    });
  }

  // Muda uma propriedade de estilo ou atributo com transição, terminando no valor final.
  muda(n, de, para, { dur = DUR.media, delay = 0 } = {}) {
    Object.assign(n.style, para);
    if (this.instantaneo) return;
    this.anims.push(n.animate([de, para], { duration: dur, delay, easing: EASE.entrada, fill: "backwards" }));
  }

  esp(path, de, para, o = {}) { path.setAttribute("stroke-width", para); this.muda(path, { strokeWidth: `${de}px` }, { strokeWidth: `${para}px` }, o); }

  opaco(alvos, valor, o = {}) {
    lista(alvos).forEach((n) => {
      const atual = n.style.opacity === "" ? 1 : Number(n.style.opacity);
      this.muda(n, { opacity: atual }, { opacity: valor }, { dur: DUR.micro, ...o });
    });
  }

  // Troca de texto no mesmo lugar, para valores que se transformam
  troca(n, html, o = {}) {
    n.innerHTML = html;
    this.muda(n, { opacity: 0 }, { opacity: 1 }, { dur: DUR.media, ...o });
  }

  som(nome, delay = 0) {
    if (!FUNCOES[nome]) throw new Error(`SFX inexistente: ${nome}`);
    if (this.instantaneo) return;
    this.timers.push(setTimeout(() => this.tocarSom(nome), delay));
  }

  demo(url, reserva, o) { this.abrirDemoFn(url, reserva, this.instantaneo, o); }
  carimbar(id) { this.carimbarFn(id, this.instantaneo); }

  concluir() { for (const a of this.anims) { try { a.finish(); } catch { /* já cancelada */ } } this.anims = []; }

  destruir() {
    this.timers.forEach(clearTimeout);
    this.anims.forEach((a) => { try { a.cancel(); } catch { /* já cancelada */ } });
    this.raiz.remove();
  }
}

import { corPeso, el, fmt, matrizHTML, montarPrancha, svgEl, tex } from "../_comum/prancha.js";
import { EXEMPLO_MAO, atencao, gerador, softmax } from "./atencao.js";
import { FRASES, matrizes } from "./frases.js";
import { tocar } from "../../sfx/sfx.js";

const $ = (id) => document.getElementById(id);
const TITULOS = {
  mao: "Três tokens, uma conta no papel",
  frase: "Cada token pondera todos os outros",
  escala: "Sem a escala, o softmax satura",
};

/* ---------- Aba 1: conta à mão ---------- */
const { tokens, Q, K, V } = EXEMPLO_MAO;
const R = atencao(Q, K, V);
const PASSOS = [
  { eq: "Q K^{\\top}", M: R.pontuacao, casas: 0, cor: "", leg: "Produto escalar de cada consulta com cada chave" },
  { eq: "\\dfrac{Q K^{\\top}}{\\sqrt{d_k}},\\ \\sqrt{d_k}=2", M: R.escalada, casas: 2, cor: "", leg: "Divide por √d_k = √4 = 2" },
  { eq: "A=\\mathrm{softmax}(\\cdot)", M: R.A, casas: 3, cor: "", leg: "Softmax linha a linha: cada linha soma 1" },
  { eq: "Z = A\\,V", M: R.Z, casas: 3, cor: "z", leg: "Média dos valores ponderada pelos pesos" },
];
let passo = 0;

function montarMao() {
  const bloco = (rotulo, classe, M) => el("div", { class: "bloco" }, el("span", { class: `rotulo ${classe}` }, rotulo), matrizHTML(M, { cor: classe }));
  $("entradas").replaceChildren(
    el("div", { class: "bloco" }, el("span", { class: "rotulo" }, "linhas"), ...tokens.map((t) => el("span", { class: "mono", style: "font-size:26px;line-height:32.5px" }, t))),
    bloco("Q: consultas", "q", Q), bloco("K: chaves", "k", K), bloco("V: valores", "v", V));
  $("etapas").replaceChildren(...PASSOS.map((p, i) => {
    const eq = el("div", { class: "eq" }); tex(eq, p.eq);
    return el("div", { class: "etapa", id: `etapa-${i}` }, eq, matrizHTML(p.M, { casas: p.casas, cor: p.cor }));
  }));
}

function mostrarPasso() {
  PASSOS.forEach((_, i) => $(`etapa-${i}`).classList.toggle("oculto", i >= passo));
  $("legenda-passo").textContent = passo === 0 ? "Entradas escritas à mão" : PASSOS[passo - 1].leg;
  $("passo").disabled = passo === PASSOS.length;
}

/* ---------- Aba 2: frase ---------- */
let iFrase = 0, foco = 1, comEscala = true;

function calcular(iF) {
  const m = matrizes(FRASES[iF]);
  return { ...m, ...atencao(m.Q, m.K, m.V, { escalar: comEscala }) };
}

function desenharFrase() {
  const frase = FRASES[iFrase], r = calcular(iFrase), n = frase.length;
  const LARG = 1026, ROT = 130, passoX = (LARG - ROT) / n;
  const xDe = (j) => ROT + passoX * (j + 0.5);

  const arcos = $("arcos");
  arcos.replaceChildren();
  r.A[foco].forEach((p, j) => {
    if (j === foco) {
      const xj = xDe(j);
      arcos.append(svgEl("path", { d: `M${xj - 7} 150C${xj - 46} 84 ${xj + 46} 84 ${xj + 7} 150`, fill: "none", stroke: "#17507F", "stroke-width": 0.75 + 20 * p }));
      return;
    }
    const x0 = xDe(foco), x1 = xDe(j), topo = 150 - Math.min(130, 44 + Math.abs(x1 - x0) * 0.26);
    arcos.append(svgEl("path", { d: `M${x0} 150C${x0} ${topo} ${x1} ${topo} ${x1} 150`, fill: "none", stroke: "#17507F", "stroke-width": 0.75 + 20 * p }));
  });
  frase.forEach((t, j) => {
    const tx = svgEl("text", { x: xDe(j), y: 180, class: j === foco ? "foco" : "" });
    tx.textContent = t;
    tx.addEventListener("mouseenter", () => focar(j));
    arcos.append(tx);
  });

  const mapa = $("mapa");
  mapa.style.gridTemplateColumns = `${ROT}px repeat(${n}, 1fr)`;
  mapa.style.gridAutoRows = "64px";
  const celulas = [el("div", { class: "cab rotulo" }, "Q↓  K→")];
  frase.forEach((t) => celulas.push(el("div", { class: "cab" }, t)));
  r.A.forEach((linha, i) => {
    celulas.push(el("div", { class: `cab${i === foco ? " foco" : ""}`, onmouseenter: () => focar(i) }, frase[i]));
    linha.forEach((p) => {
      const c = corPeso(p);
      celulas.push(el("div", { class: `cel${i === foco ? " foco" : ""}`, style: `background:${c.fundo};color:${c.texto}`, onmouseenter: () => focar(i) }, fmt(p, 2)));
    });
  });
  mapa.replaceChildren(...celulas);

  $("tit-tabela").textContent = `Consulta: “${frase[foco]}”`;
  $("tabela").replaceChildren(
    el("tr", {}, el("th", {}, "chave"), el("th", {}, "q · k"), el("th", {}, comEscala ? "÷ √6" : "sem ÷"), el("th", {}, "peso")),
    ...frase.map((t, j) => el("tr", {}, el("td", {}, t), el("td", {}, fmt(r.pontuacao[foco][j], 2)), el("td", {}, fmt(r.escalada[foco][j], 2)), el("td", {}, fmt(r.A[foco][j], 3)))));
  desenharPlano(r, frase);
}

function desenharPlano(r, frase) {
  const pl = $("plano");
  pl.replaceChildren();
  const X0 = 90, Y0 = 268, L = 480, H = 220;
  const px = (v) => [X0 + v[0] * L, Y0 - v[1] * H];
  pl.append(svgEl("path", { d: `M${X0} ${Y0 - H - 8}V${Y0}H${X0 + L + 8}`, fill: "none", stroke: "#1B2430", "stroke-width": 2 }));
  const eixoX = svgEl("text", { x: X0 + L + 8, y: Y0 - 12, "text-anchor": "end" }); eixoX.textContent = "finanças";
  const eixoY = svgEl("text", { x: X0 + 10, y: Y0 - H - 8 }); eixoY.textContent = "lugar";
  pl.append(eixoX, eixoY);
  const vistos = new Set();
  frase.forEach((t, j) => {
    const chave = r.V[j].join();
    if (vistos.has(chave)) return;
    vistos.add(chave);
    const [x, y] = px(r.V[j]);
    pl.append(svgEl("rect", { x: x - 4, y: y - 4, width: 8, height: 8, fill: "none", stroke: "#94650A", "stroke-width": 2 }));
    // Tokens sobre o eixo vertical ficam à esquerda dele, longe da seta de saída.
    const noEixoY = r.V[j][0] === 0;
    const tx = noEixoY
      ? svgEl("text", { x: x - 10, y: y + 6, "text-anchor": "end" })
      : svgEl("text", { x: x + 9, y: r.V[j][1] > 0 ? y - 8 : y + 22 });
    tx.textContent = t;
    pl.append(tx);
  });
  const [a, b] = px(r.V[foco]), [c, d] = px(r.Z[foco]);
  pl.append(svgEl("defs", {}, svgEl("marker", { id: "ponta", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, svgEl("path", { d: "M0 0L10 5L0 10z", fill: "#2E6A4F" }))));
  pl.append(svgEl("path", { d: `M${a} ${b}L${c} ${d}`, stroke: "#2E6A4F", "stroke-width": 3, fill: "none", "marker-end": "url(#ponta)" }));
  const rot = svgEl("text", { x: Math.min(c + 12, 500), y: Math.max(d - 12, 40), style: "fill:#2E6A4F;font-weight:600" });
  rot.textContent = `Z = (${fmt(r.Z[foco][0], 2)}; ${fmt(r.Z[foco][1], 2)})`;
  pl.append(rot);
}

function focar(j) {
  if (j === foco) return;
  foco = j;
  desenharFrase();
}

/* ---------- Aba 3: por que dividir por √d_k ---------- */
const DKS = Array.from({ length: 11 }, (_, i) => 2 ** i);
const N_CHAVES = 8;

function sorteio(dk, semente) {
  const g = gerador(semente);
  const vet = () => Array.from({ length: dk }, () => g.normal());
  const q = vet();
  return Array.from({ length: N_CHAVES }, () => vet().reduce((s, x, i) => s + x * q[i], 0));
}

const CURVA = DKS.map((dk) => {
  let bruta = 0, escalada = 0;
  for (let t = 0; t < 500; t++) {
    const s = sorteio(dk, 1000 * dk + t);
    bruta += Math.max(...softmax(s));
    escalada += Math.max(...softmax(s.map((x) => x / Math.sqrt(dk))));
  }
  return { dk, bruta: bruta / 500, escalada: escalada / 500 };
});

function desenharCurva(iDk) {
  const s = $("curva");
  s.replaceChildren();
  const X0 = 70, Y0 = 450, L = 930, H = 420;
  const x = (i) => X0 + (L * i) / 10;
  const y = (p) => Y0 - H * p;
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    s.append(svgEl("path", { d: `M${X0} ${y(p)}H${X0 + L}`, stroke: "#CFC8B4", "stroke-width": 1 }));
    const t = svgEl("text", { x: X0 - 12, y: y(p) + 6, "text-anchor": "end" }); t.textContent = fmt(p, 2); s.append(t);
  }
  DKS.forEach((dk, i) => { const t = svgEl("text", { x: x(i), y: Y0 + 28, "text-anchor": "middle" }); t.textContent = dk; s.append(t); });
  const linha = (campo, cor) => svgEl("path", { d: CURVA.map((c, i) => `${i ? "L" : "M"}${x(i)} ${y(c[campo])}`).join(""), fill: "none", stroke: cor, "stroke-width": 3 });
  s.append(linha("bruta", "#B5332A"), linha("escalada", "#2E6A4F"));
  const r1 = svgEl("text", { x: x(6.3), y: y(CURVA[7].bruta) - 14, style: "fill:#B5332A;font-weight:600" }); r1.textContent = "sem escala";
  const r2 = svgEl("text", { x: x(6.3), y: y(CURVA[7].escalada) - 14, style: "fill:#2E6A4F;font-weight:600" }); r2.textContent = "com escala: QKᵀ/√d_k";
  s.append(r1, r2);
  s.append(svgEl("path", { d: `M${x(iDk)} ${y(1)}V${Y0}`, stroke: "#17507F", "stroke-width": 2, "stroke-dasharray": "6 5" }));
  s.append(svgEl("circle", { cx: x(iDk), cy: y(CURVA[iDk].bruta), r: 7, fill: "#B5332A" }), svgEl("circle", { cx: x(iDk), cy: y(CURVA[iDk].escalada), r: 7, fill: "#2E6A4F" }));
}

function barras(alvo, pesos, classe) {
  alvo.replaceChildren(...pesos.map((p, i) => el("div", { class: `barra ${classe}` },
    el("span", {}, `k${i + 1}`), el("i", { style: `width:${Math.max(0.3, 100 * p)}%` }), el("span", {}, fmt(p, 3)))));
}

function desenharEscala() {
  const i = Number($("dk").value), dk = DKS[i];
  $("dk-valor").textContent = dk;
  desenharCurva(i);
  const s = sorteio(dk, 7);
  const pb = softmax(s), pe = softmax(s.map((x) => x / Math.sqrt(dk)));
  barras($("b-bruta"), pb, "bruta");
  barras($("b-escalada"), pe, "escalada");
  // ∂p/∂s de um softmax é p(1 − p): tende a zero quando o maior peso se aproxima de 1.
  const sens = (p) => Math.max(...p) * (1 - Math.max(...p));
  const num = (x) => (x < 0.001 ? x.toExponential(1).replace(".", ",") : fmt(x, 3));
  $("dados-escala").replaceChildren(
    el("div", {}, `Var(q·k) esperada = d_k = ${dk}`),
    el("div", { class: "k" }, `sem escala: p(1−p) = ${num(sens(pb))}`),
    el("div", { class: "z" }, `com escala: p(1−p) = ${num(sens(pe))}`));
}

/* ---------- Navegação ---------- */
function abrir(aba) {
  document.querySelectorAll(".painel").forEach((p) => p.classList.toggle("visivel", p.id === aba));
  document.querySelectorAll("[data-aba]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.aba === aba)));
  $("titulo").textContent = TITULOS[aba];
  document.body.dataset.aba = aba;
}

await montarPrancha();
tex($("formula"), "\\mathrm{Attention}(Q,K,V)=\\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V");
montarMao(); mostrarPasso(); desenharFrase(); desenharEscala();

document.querySelectorAll("[data-aba]").forEach((b) => b.addEventListener("click", () => abrir(b.dataset.aba)));
$("passo").addEventListener("click", () => {
  passo = Math.min(PASSOS.length, passo + 1);
  mostrarPasso();
  tocar(passo === 3 ? "softmaxNormaliza" : "multiplicaMatriz");
});
$("volta").addEventListener("click", () => { passo = 0; mostrarPasso(); });
$("trocar").addEventListener("click", () => { iFrase = 1 - iFrase; foco = FRASES[iFrase].indexOf("banco"); desenharFrase(); tocar("softmaxNormaliza"); });
$("alterna-escala").addEventListener("click", (e) => {
  comEscala = !comEscala;
  e.currentTarget.setAttribute("aria-pressed", String(comEscala));
  desenharFrase();
});
$("dk").addEventListener("input", desenharEscala);
addEventListener("keydown", (e) => {
  const abas = { 1: "mao", 2: "frase", 3: "escala" };
  if (abas[e.key]) abrir(abas[e.key]);
  if (e.key === "ArrowRight" && document.body.dataset.aba === "mao") $("passo").click();
  // Dentro da animação, ← e → passam a cena; ↑ e ↓ movem o foco do mesmo jeito.
  const prox = e.key === "ArrowRight" || e.key === "ArrowDown", ant = e.key === "ArrowLeft" || e.key === "ArrowUp";
  if (prox && document.body.dataset.aba === "frase") { e.preventDefault(); focar((foco + 1) % FRASES[iFrase].length); }
  if (ant && document.body.dataset.aba === "frase") { e.preventDefault(); focar((foco + FRASES[iFrase].length - 1) % FRASES[iFrase].length); }
});
const inicial = new URLSearchParams(location.search).get("aba") ?? "frase";
abrir(inicial);
if (new URLSearchParams(location.search).has("completo")) { passo = PASSOS.length; mostrarPasso(); }
document.documentElement.dataset.pronto = "1";

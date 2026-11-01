import { corPeso, el, fmt, montarPrancha, tex } from "../_comum/prancha.js";
import { calcular, mudancaPorPosicao } from "./mascara.js";
import { tocar } from "../../sfx/sfx.js";

const $ = (id) => document.getElementById(id);
const FRASE = ["o", "gato", "subiu", "no", "muro", "alto"];
const POS_TROCA = 4;
const OPCOES = ["muro", "telhado"];
let opcao = 0, foco = 2;

function tokens(k) {
  const t = [...FRASE];
  t[POS_TROCA] = OPCOES[k];
  return t;
}

function desenharMapa(alvo, A, t, causal) {
  const n = t.length;
  alvo.style.gridTemplateColumns = `110px repeat(${n}, 1fr)`;
  const c = [el("div", { class: "cab rotulo" }, "Q↓ K→")];
  t.forEach((x, j) => c.push(el("div", { class: "cab", style: j === POS_TROCA ? "color:#B5332A" : "" }, x)));
  A.forEach((linha, i) => {
    c.push(el("div", { class: `cab${i === foco ? " foco" : ""}`, onmouseenter: () => focar(i) }, t[i]));
    linha.forEach((p, j) => {
      const cortada = causal && j > i;
      const cor = corPeso(p);
      c.push(el("div", { class: `cel${cortada ? " cortada" : ""}${i === foco ? " foco" : ""}`, style: cortada ? "" : `background:${cor.fundo};color:${cor.texto}`, onmouseenter: () => focar(i) }, cortada ? "" : fmt(p, 2)));
    });
  });
  alvo.replaceChildren(...c);
}

function desenharMudanca(alvo, d, t) {
  const max = 1.2;
  alvo.replaceChildren(el("div", { class: "rotulo" }, "‖Z novo − Z anterior‖ depois da troca"),
    ...d.map((v, i) => el("div", { class: `linha-mudou${v === 0 ? " zero" : ""}` },
      el("span", {}, t[i]), el("i", { style: `width:${Math.min(100, (100 * v) / max)}%` }), el("span", { style: "text-align:right" }, v === 0 ? "0" : fmt(v, 3)))));
}

function desenhar() {
  const t = tokens(opcao), r = calcular(t), outra = calcular(tokens(1 - opcao));
  $("frase").replaceChildren(...t.map((x, j) => el("span", { class: j === POS_TROCA ? "alvo" : "" }, x)));
  desenharMapa($("mapa-a"), r.bidirecional.A, t, false);
  desenharMapa($("mapa-b"), r.causal.A, t, true);
  desenharMudanca($("mudou-a"), mudancaPorPosicao(r.bidirecional.Z, outra.bidirecional.Z), t);
  desenharMudanca($("mudou-b"), mudancaPorPosicao(r.causal.Z, outra.causal.Z), t);
}

function focar(i) {
  if (i === foco) return;
  foco = i;
  desenhar();
}

await montarPrancha();
tex($("eq-a"), "\\mathrm{softmax}\\!\\left(QK^{\\top}/\\sqrt{d_k}\\right)");
tex($("eq-b"), "\\mathrm{softmax}\\!\\left(QK^{\\top}/\\sqrt{d_k}+M\\right),\\ M_{ij}=-\\infty\\ \\text{se}\\ j>i,\\ \\text{senão}\\ 0");
$("troca").addEventListener("click", () => { opcao = 1 - opcao; desenhar(); tocar("mascaraCorta"); });
addEventListener("keydown", (e) => { if (e.key === " " || e.key === "ArrowRight") { e.preventDefault(); $("troca").click(); } });
desenhar();
document.documentElement.dataset.pronto = "1";

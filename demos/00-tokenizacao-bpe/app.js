import { montarPrancha, el } from "../_comum/prancha.js";
import { tocar } from "../../sfx/sfx.js";
import { FIM, contarPares, fundir, inicializar, melhorPar, tokenizar } from "./bpe.js";

const CORPUS = { gato: 5, gatos: 3, pato: 6, patos: 2, gatinho: 2, patinho: 1, mato: 3 };
const $ = (id) => document.getElementById(id);

let vocab, fusoes, ultima;

function peca(s) {
  const c = s === FIM ? "peca fim" : ultima && s === ultima.a + ultima.b ? "peca fundida" : "peca";
  return el("span", { class: c }, s);
}

function desenhar() {
  $("palavras").replaceChildren(...vocab.map((w) =>
    el("div", { class: "linha-palavra" }, el("span", { class: "freq" }, `${w.freq}×`), ...w.simbolos.map(peca))));

  const ordenados = [...contarPares(vocab)].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, 9);
  const topo = melhorPar(contarPares(vocab));
  const max = ordenados[0]?.[1] ?? 1;
  $("pares").replaceChildren(...ordenados.map(([par, c]) => {
    const [a, b] = par.split("\u0000");
    const eTopo = topo && a === topo.a && b === topo.b;
    return el("div", { class: `barra${eTopo ? " top" : ""}` },
      el("span", {}, `${a}+${b}`),
      el("i", { style: `width:${(100 * c) / max}%` }),
      el("span", {}, String(c)));
  }));

  $("fusoes").replaceChildren(...fusoes.map((f, i) => el("div", {}, `${i + 1}. ${f.a}+${f.b}`)));
  $("estado").textContent = `${fusoes.length} fusões · ${new Set(vocab.flatMap((w) => w.simbolos)).size} símbolos em uso`;
  $("proxima").disabled = !topo;

  const pal = $("nova").value.trim().toLowerCase();
  const toks = pal ? tokenizar(pal, fusoes) : [];
  $("saida").replaceChildren(...toks.map(peca));
  $("saida-nota").textContent = pal ? `${toks.length} tokens, incluindo o marcador de fim de palavra </w>` : "";
}

function reiniciar() {
  vocab = inicializar(CORPUS); fusoes = []; ultima = null;
  desenhar();
}

function proxima() {
  const m = melhorPar(contarPares(vocab));
  if (!m) return;
  fusoes.push(m); ultima = m;
  tocar("tokenEntra");
  vocab = vocab.map((w) => ({ ...w, simbolos: fundir(w.simbolos, m.a, m.b) }));
  desenhar();
}

await montarPrancha();
$("proxima").addEventListener("click", proxima);
$("reiniciar").addEventListener("click", reiniciar);
$("nova").addEventListener("input", desenhar);
addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.key === "ArrowRight") proxima();
  if (e.key.toLowerCase() === "r") reiniciar();
});
reiniciar();
document.documentElement.dataset.pronto = "1";

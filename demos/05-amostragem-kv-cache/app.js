import { el, fmt, montarPrancha, svgEl } from "../_comum/prancha.js";
import { MiniGPT } from "../04-mini-gpt/modelo.js";
import { distribuicao } from "./amostragem.js";
import { tocar } from "../../sfx/sfx.js";

const $ = (id) => document.getElementById(id);
const N_BARRAS = 16;
let modelo;

const visivel = (c) => (c === " " ? "espaço" : c === "\n" ? "⏎" : c);

function desenharDistribuicao() {
  const T = Number($("temp").value), k = Number($("k").value), p = Number($("p").value);
  $("temp-v").textContent = fmt(T, 1);
  $("k-v").textContent = k === 0 ? "desligado" : k;
  $("p-v").textContent = p >= 1 ? "desligado" : fmt(p, 2);
  const ids = modelo.codificar($("prompt").value.toLowerCase() || " ");
  const { logits } = modelo.completo(ids);
  const d = distribuicao(logits, { temperatura: T, topK: k, topP: p });
  const ordem = d.base.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, N_BARRAS);
  const max = Math.max(...d.final, ...d.base);
  $("barras").replaceChildren(...ordem.map(([v, i]) => el("div", { class: `barra${d.manter[i] ? "" : " cortado"}` },
    el("span", {}, visivel(modelo.vocab[i])),
    el("div", { class: "trilho" },
      el("i", { class: "base", style: `width:${(100 * v) / max}%` }),
      el("i", { class: "final", style: `width:${(100 * d.final[i]) / max}%` })),
    el("span", { style: "text-align:right" }, fmt(d.final[i], 3)))));
  const n = d.manter.filter(Boolean).length;
  $("legenda").textContent = `${n} de ${d.base.length} caracteres seguem elegíveis. Contorno: antes do corte. Preenchido: após renormalizar. Mostrando os ${N_BARRAS} mais prováveis.`;
}

function desenharEsquema() {
  const s = $("esquema");
  s.replaceChildren();
  const n = 8, lado = 18, gap = 3, x0 = 70;
  const grade = (y0, titulo, cor, comCache) => {
    const t = svgEl("text", { x: 0, y: y0 + 16 }); t.textContent = titulo; s.append(t);
    for (let passo = 1; passo <= n; passo++) {
      for (let j = 0; j < passo; j++) {
        const nova = j === passo - 1;
        const calcula = comCache ? nova : true;
        s.append(svgEl("rect", {
          x: x0 + (passo - 1) * (n * 8 + 6) + j * 8, y: y0, width: 7, height: lado,
          fill: calcula ? cor : "none", stroke: calcula ? cor : "#CFC8B4", "stroke-width": 1,
        }));
      }
    }
  };
  grade(30, "sem", "#B5332A", false);
  grade(80, "com", "#2E6A4F", true);
  const a = svgEl("text", { x: x0, y: 16 }); a.textContent = "passo 1 → 8: cada traço é uma posição processada no passo"; s.append(a);
  const b = svgEl("text", { x: 0, y: 130 }); b.textContent = "preenchido: Q, K, V recalculados · vazio: K e V lidos do cache"; s.append(b);
  const c = svgEl("text", { x: 0, y: 156 }); c.textContent = "Mesmo com cache, a nova consulta compara com todas as chaves:"; s.append(c);
  const d = svgEl("text", { x: 0, y: 180 }); d.textContent = "cada passo custa O(n), e a sequência inteira custa O(n²) na atenção."; s.append(d);
}

function comparar() {
  tocar("multiplicaMatriz");
  const seq = modelo.codificar("o homem que a viagem me parecia sem destino, replicou o animal, ainda ").slice(0, modelo.T);
  modelo.mults = 0;
  let t0 = performance.now();
  const logitsSem = seq.map((_, n) => modelo.completo(seq.slice(0, n + 1)).logits);
  const msSem = performance.now() - t0;
  const multsSem = modelo.mults;

  modelo.mults = 0;
  const cache = modelo.novoCache();
  t0 = performance.now();
  const logitsCom = seq.map((id) => modelo.passo(id, cache));
  const msCom = performance.now() - t0;
  const multsCom = modelo.mults;

  let dif = 0;
  logitsCom.forEach((l, n) => l.forEach((v, i) => { dif = Math.max(dif, Math.abs(v - logitsSem[n][i])); }));

  const milhoes = (x) => `${fmt(x / 1e6, 1)} mi`;
  $("sem").textContent = milhoes(multsSem);
  $("com").textContent = milhoes(multsCom);
  $("sem-ms").textContent = `multiplicações · ${Math.round(msSem)} ms`;
  $("com-ms").textContent = `multiplicações · ${Math.round(msCom)} ms`;
  const r = $("resultado-kv");
  r.textContent = `${fmt(multsSem / multsCom, 1)} vezes menos multiplicações. Maior diferença entre logits das duas rotas: ${dif.toExponential(1).replace(".", ",")}.`;
  r.dataset.pronto = "1";
}

await montarPrancha();
modelo = new MiniGPT(await (await fetch("../04-mini-gpt/pesos.json")).json());
$("k").max = modelo.vocab.length;
for (const id of ["temp", "k", "p", "prompt"]) $(id).addEventListener("input", desenharDistribuicao);
$("comparar").addEventListener("click", comparar);
desenharDistribuicao();
desenharEsquema();
document.documentElement.dataset.pronto = "1";

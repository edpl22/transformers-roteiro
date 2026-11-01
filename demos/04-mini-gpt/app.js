import { el, fmt, montarPrancha, svgEl, tex } from "../_comum/prancha.js";
import { gerador } from "../01-self-attention/atencao.js";
import { amostrar, softmaxTemperatura } from "../05-amostragem-kv-cache/amostragem.js";
import { MiniGPT } from "./modelo.js";
import { tocar } from "../../sfx/sfx.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const INTERVALO_MS = 30;
const INTERVALO_SOM_MS = 125;   // no máximo 8 toques por segundo, abaixo da voz
let ultimoSom = 0;
let modelo = null, pregravada = null;
let ids = [], gerando = false, temporizador = null, nSemente = 0;
const g = gerador(2017);

const visivel = (c) => (c === " " ? "espaço" : c === "\n" ? "⏎" : c);

function mostrarTexto(semente, resto) {
  $("saida").replaceChildren(el("div", {}, el("span", { class: "semente" }, semente), resto));
}

function reiniciar() {
  if (!modelo) return;
  const texto = $("prompt").value.toLowerCase();
  ids = modelo.codificar(texto.length ? texto : " ");
  nSemente = ids.length;
  mostrarTexto(modelo.decodificar(ids), "");
  desenharBarras(distribuicaoAtual(), null);
}

function distribuicaoAtual() {
  return softmaxTemperatura(modelo.completo(ids).logits, Number($("temp").value));
}

function desenharBarras(p, sorteado) {
  const topo = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 10);
  const escala = Math.max(0.25, topo[0][0]);   // comprimento da barra; o valor exato aparece ao lado
  $("barras").replaceChildren(...topo.map(([v, i]) => el("div", { class: `barra${i === sorteado ? " sorteado" : ""}` },
    el("span", {}, visivel(modelo.vocab[i])), el("i", { style: `width:${Math.max(0.4, (100 * v) / escala)}%` }), el("span", { style: "text-align:right" }, fmt(v, 3)))));
}

function passoGeracao() {
  const p = distribuicaoAtual();
  const i = amostrar(p, g.uniforme());
  ids.push(i);
  desenharBarras(p, i);
  if (performance.now() - ultimoSom > INTERVALO_SOM_MS) { tocar("amostraToken"); ultimoSom = performance.now(); }
  const t = modelo.decodificar(ids);
  const semente = t.slice(0, nSemente);
  mostrarTexto(semente, t.slice(nSemente).slice(-900));
}

function alternar() {
  gerando = !gerando;
  $("gerar").textContent = gerando ? "Parar" : "Gerar";
  $("gerar").setAttribute("aria-pressed", String(gerando));
  if (gerando) {
    temporizador = setInterval(passoGeracao, INTERVALO_MS);
  } else clearInterval(temporizador);
}

function desenharCurva(meta) {
  const s = $("curva");
  const X0 = 44, L = 630, Y0 = 170, H = 150;
  const min = 1.2, max = meta.perda_uniforme + 0.1;
  const y = (v) => Y0 - (H * (v - min)) / (max - min);
  const x = (p) => X0 + (L * p) / meta.passos;
  for (const v of [1.5, 2, 2.5, 3, 3.5]) {
    s.append(svgEl("path", { d: `M${X0} ${y(v)}H${X0 + L}`, stroke: "#CFC8B4", "stroke-width": 1 }));
    const t = svgEl("text", { x: X0 - 6, y: y(v) + 5, "text-anchor": "end" }); t.textContent = fmt(v, 1); s.append(t);
  }
  s.append(svgEl("path", { d: `M${X0} ${y(meta.perda_bigrama)}H${X0 + L}`, stroke: "#B5332A", "stroke-width": 2, "stroke-dasharray": "7 5" }));
  const tb = svgEl("text", { x: X0 + L, y: y(meta.perda_bigrama) - 7, "text-anchor": "end", style: "fill:#B5332A" }); tb.textContent = "bigramas"; s.append(tb);
  s.append(svgEl("path", { d: meta.curva.map((c, i) => `${i ? "L" : "M"}${x(c.passo)} ${y(c.validacao)}`).join(""), fill: "none", stroke: "#2E6A4F", "stroke-width": 3 }));
  const fim = meta.curva.at(-1);
  const tf = svgEl("text", { x: x(fim.passo), y: y(fim.validacao) - 12, "text-anchor": "end", style: "fill:#2E6A4F;font-weight:600" }); tf.textContent = `validação ${fmt(fim.validacao, 2)}`; s.append(tf);
  const te = svgEl("text", { x: X0 + L, y: 192, "text-anchor": "end" }); te.textContent = `passo ${meta.passos}`; s.append(te);
  $("ficha").textContent = `${meta.n_parametros.toLocaleString("pt-BR")} parâmetros · ${meta.L} blocos · ${meta.h} cabeças · d=${meta.d} · T=${meta.T} · corpus: Machado de Assis`;
}

// Fallback: se os pesos não carregarem ou o parâmetro ?pregravado for usado, mostra saídas gravadas no treino.
async function usarPregravada(motivo) {
  pregravada = await (await fetch("dados/saida_pregravada.json")).json();
  $("aviso").textContent = `Saída pré-gravada: ${motivo}`;
  $("gerar").disabled = true;
  $("prompt").disabled = true;
  const mostrar = () => {
    const chaves = Object.keys(pregravada.amostras).map(Number);
    const t = Number($("temp").value);
    const k = chaves.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a));
    const texto = pregravada.amostras[String(k)];
    mostrarTexto(pregravada.prompt, texto.slice(pregravada.prompt.length));
    $("aviso").textContent = `Saída pré-gravada, T = ${fmt(k, 1)}: ${motivo}`;
  };
  $("temp").addEventListener("input", mostrar);
  mostrar();
}

await montarPrancha();
tex($("formula"), "p_i=\\dfrac{\\exp(z_i/T)}{\\sum_j \\exp(z_j/T)}");
const atualizarT = () => { $("temp-v").textContent = fmt($("temp").value, 1); if (modelo && !gerando) desenharBarras(distribuicaoAtual(), null); };
$("temp").addEventListener("input", atualizarT);
$("gerar").addEventListener("click", alternar);
$("limpar").addEventListener("click", () => { if (gerando) alternar(); reiniciar(); });
$("prompt").addEventListener("input", () => { if (gerando) alternar(); reiniciar(); });
addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" && e.target.type === "text") return;
  if (e.key === " ") { e.preventDefault(); alternar(); }
});
atualizarT();

try {
  if (params.has("pregravado")) throw new Error("modo de contingência ativado");
  const pesos = await (await fetch("pesos.json")).json();
  modelo = new MiniGPT(pesos);
  desenharCurva(pesos.meta);
  reiniciar();
} catch (erro) {
  await usarPregravada(erro.message);
}
document.documentElement.dataset.pronto = "1";

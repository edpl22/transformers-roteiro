// Sobreposição de ensaio (?ensaio): tempo, alvo, desvio e o texto da fala, lido de roteiro/11-falas.md.
// O texto é dividido nas marcas [▶]: o trecho do passo atual aparece inteiro, e o seguinte, mais claro.
// Sem o parâmetro, este elemento não existe no DOM e não pode aparecer na gravação.
import { el } from "../../demos/_comum/prancha.js";

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function lerFalas(md) {
  const falas = {};
  for (const bloco of md.split(/^### /m).slice(1)) {
    const id = bloco.slice(0, 7);
    const corpo = bloco.slice(bloco.indexOf("\n") + 1).split(/^---|^## /m)[0];
    falas[id] = corpo.split("[▶]").map((t) => t.replace(/\[([^\]]*)\]\(#[ap]\d\)/g, "$1").replace(/\s+/g, " ").trim());
  }
  return falas;
}

// Ações em itálico, como *(Clicar em "Gerar".)*, viram <i>; o resto é texto.
function trecho(t, classe) {
  const p = el("p", { class: classe });
  for (const parte of t.split(/(\*\([^)]*\)\*)/)) {
    if (!parte) continue;
    p.append(parte.startsWith("*(") ? el("i", {}, parte.slice(1, -1)) : parte);
  }
  return p;
}

export class Ensaio {
  static async criar(palco, cenas) {
    const md = await (await fetch(new URL("../../roteiro/11-falas.md", import.meta.url))).text();
    return new Ensaio(palco, cenas, lerFalas(md));
  }

  constructor(palco, cenas, falas) {
    Object.assign(this, { cenas, falas, inicio: null });
    this.n = el("div", { id: "ensaio" });
    palco.append(this.n);
    this.relogio = setInterval(() => this.pintar(), 250);
  }

  atualizar(c, passo) {
    this.inicio ??= performance.now();
    this.c = c;
    this.passo = passo;
    this.pintar();
  }

  pintar() {
    if (!this.c || this.n.hidden) return;
    const t = (performance.now() - this.inicio) / 1000;
    const c = this.c;
    const desvio = t - c.inicio_s;
    const atrasado = t > c.fim_s;
    const partes = this.falas[c.id] ?? [];
    const texto = el("div", { class: "texto" });
    if (partes[this.passo]) texto.append(trecho(partes[this.passo], "agora"));
    if (partes[this.passo + 1]) texto.append(el("div", { class: "prox" }, "depois do clique"), trecho(partes[this.passo + 1], "depois"));
    this.n.replaceChildren(
      el("div", {}, el("b", { class: atrasado ? "atrasado" : "" }, mmss(t)), `  alvo ${mmss(c.inicio_s)}–${mmss(c.fim_s)}`),
      el("div", {}, `${c.id} · passo ${this.passo + 1} de ${partes.length || "?"} · desvio ${desvio >= 0 ? "+" : "−"}${mmss(Math.abs(desvio))}`),
      texto);
  }

  alternar() { this.n.hidden = !this.n.hidden; this.pintar(); }
}

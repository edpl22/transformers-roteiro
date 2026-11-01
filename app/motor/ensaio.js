// Sobreposição de ensaio (?ensaio): tempo, alvo, desvio e tópicos de fala lidos de roteiro/05-cenas.md.
// Sem o parâmetro, este elemento não existe no DOM e não pode aparecer na gravação.
import { el } from "../../demos/_comum/prancha.js";

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function lerTopicos(md) {
  const topicos = {};
  for (const bloco of md.split(/^### /m).slice(1)) {
    const id = bloco.slice(0, 7);
    const m = bloco.match(/\*\*Fala \(\d+ s\):\*\*([\s\S]*?)^- \*\*Rubrica/m);
    if (m) topicos[id] = m[1].split("\n").map((l) => l.trim().replace(/^- /, "")).filter(Boolean);
  }
  return topicos;
}

export class Ensaio {
  static async criar(palco, cenas) {
    const md = await (await fetch(new URL("../../roteiro/05-cenas.md", import.meta.url))).text();
    return new Ensaio(palco, cenas, lerTopicos(md));
  }

  constructor(palco, cenas, topicos) {
    Object.assign(this, { cenas, topicos, inicio: null });
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
    const lista = el("ul");
    for (const l of this.topicos[c.id] ?? []) { const li = el("li"); li.innerHTML = l.replace(/\$[^$]*\$/g, (x) => x.slice(1, -1)).replace(/\*+/g, ""); lista.append(li); }
    this.n.replaceChildren(
      el("div", {}, el("b", { class: atrasado ? "atrasado" : "" }, mmss(t)), `  alvo ${mmss(c.inicio_s)}–${mmss(c.fim_s)}`),
      el("div", {}, `${c.id} · passo ${this.passo + 1} · desvio ${desvio >= 0 ? "+" : "−"}${mmss(Math.abs(desvio))}`),
      lista);
  }

  alternar() { this.n.hidden = !this.n.hidden; this.pintar(); }
}

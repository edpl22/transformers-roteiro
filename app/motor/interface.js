// Interface de quem apresenta: tela inicial, barra de controles, índice, ajuda e dicas.
// No modo Gravar nada disto é criado, a não ser a tela inicial, que fica fora do vídeo.
import { el } from "../../demos/_comum/prancha.js";

const COR_PESSOA = { a1: "var(--azul-prussia)", a2: "var(--vermelho-lapis)", a3: "var(--ocre)", a4: "var(--verde-oliva)" };
const OCULTAR_MS = 2600;
const ALTURA_RODAPE = 940;   // na demo, a barra só aparece com o mouse no rodapé

// O que experimentar em cada cena com demonstração.
const DICAS = {
  "C03-S02": "Clique em “Próxima fusão” e veja o vocabulário crescer.",
  "C04-S04": "Arraste o controle de d_k e compare as barras.",
  "C04-S07": "Passe o mouse sobre um token e use “Trocar frase”.",
  "C06-S02": "Passe o mouse sobre a matriz para mudar a posição.",
  "C07-S04": "Clique em “Trocar o token futuro” e leia as barras.",
  "C08-S03": "Veja a curva e a ficha do treino real.",
  "C09-S02": "Clique em “Gerar” e mude a temperatura.",
  "C09-S03": "Mova top-k e top-p e veja o que é cortado.",
  "C09-S04": "Clique em “Gerar 64 tokens das duas formas”.",
};

const ATALHOS = [
  ["Clique no palco, Espaço, →, PageDown", "Próximo passo; no último, próxima cena"],
  ["←, PageUp", "Volta um passo"],
  ["M", "Abre o índice de cenas"],
  ["F", "Tela cheia"],
  ["S", "Liga e desliga o som"],
  ["E", "Mostra tempo e tópicos de fala"],
  ["D", "Na demo, troca pela imagem de contingência"],
  ["PageDown", "Dentro de uma demo, sai e avança; setas e espaço pertencem à demo"],
  ["H", "Abre esta ajuda"],
  ["Esc", "Fecha o índice ou a ajuda"],
];

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Tela inicial. Espaço escolhe o modo em destaque; os botões escolhem os demais.
export function montarPreparo(palco, { modoInicial, ultima, iniciar }) {
  const modos = [
    ["apresentar", "Apresentar", "Controles na tela. Avance com clique, Espaço ou clicker."],
    ["ensaiar", "Ensaiar", "Mostra tempo, desvio e tópicos de fala de cada cena."],
    ["gravar", "Gravar", "Tela limpa, sem controles. Inicie o OBS antes de começar."],
  ];
  const botoes = modos.map(([id, nome, texto]) => {
    const b = el("button", { class: `modo${id === modoInicial ? " destaque" : ""}`, "data-modo": id, onclick: () => iniciar(id, false) },
      el("b", {}, nome), el("span", {}, texto));
    return b;
  });
  const painel = el("div", { id: "preparo" },
    el("div", { class: "preparo-titulo" }, "Transformers"),
    el("div", { class: "preparo-aviso" }, "Tela de preparação: não entra no vídeo"),
    el("div", { class: "preparo-modos" }, ...botoes));
  if (ultima) {
    painel.append(el("button", { class: "retomar", onclick: () => iniciar(modoInicial, true) }, `Continuar de onde parou: ${ultima.id}, ${ultima.titulo}`));
  }
  painel.append(el("div", { class: "preparo-pe" }, "Aperte Espaço para começar em ", el("b", {}, modos.find((m) => m[0] === modoInicial)[1])));
  palco.append(painel);
}

export class Interface {
  constructor(palco, { cenas, acoes }) {
    Object.assign(this, { palco, cenas, acoes, timer: null, timerDica: null, sobre: false, estado: null });
    this.total = cenas.at(-1).fim_s;
    this.barra = this.montarBarra();
    this.caixaDica = el("div", { id: "dica", hidden: "" });
    palco.append(this.barra, this.caixaDica);
    addEventListener("mousemove", () => this.mexeu());
    this.barra.addEventListener("mouseenter", () => { this.sobre = true; this.mostrar(); });
    this.barra.addEventListener("mouseleave", () => { this.sobre = false; this.mostrar(); });
  }

  botao(rotulo, titulo, acao, id) {
    const b = el("button", { title: titulo, id, onclick: (e) => { e.stopPropagation(); acao(); e.currentTarget.blur(); this.acoes.focarDemo(); } }, rotulo);
    return b;
  }

  montarBarra() {
    this.bVoltar = this.botao("← Voltar", "Voltar um passo (←)", () => this.acoes.voltar(), "b-voltar");
    this.bAvancar = this.botao("Avançar →", "Próximo passo (Espaço)", () => this.acoes.avancar(), "b-avancar");
    this.rotulo = el("div", { class: "barra-nome" });
    this.passos = el("div", { class: "barra-passos" });
    this.tempo = el("div", { class: "barra-tempo" });
    this.segmentos = this.cenas.map((c, i) => {
      const s = el("button", {
        class: "seg", "data-cena": c.id, title: `${c.id} · ${c.titulo} · ${mmss(c.inicio_s)}`,
        style: `flex:${c.duracao_s} 0 0;background:${COR_PESSOA[c.apresentador]}`,
        onclick: (e) => { e.stopPropagation(); e.currentTarget.blur(); this.acoes.ir(i); this.acoes.focarDemo(); },
        onmouseenter: () => this.previa(c),
        onmouseleave: () => this.pintarRotulo(),
      });
      return s;
    });
    this.bSom = this.botao("Som", "Liga e desliga o som (S)", () => this.acoes.alternarSom(), "b-som");
    return el("div", { id: "barra", role: "toolbar", "aria-label": "Controles da apresentação" },
      el("div", { class: "barra-nav" }, this.bVoltar, this.bAvancar),
      el("div", { class: "barra-info" }, this.rotulo, this.passos),
      el("div", { class: "barra-linha" }, el("div", { class: "barra-segs" }, ...this.segmentos), this.tempo),
      el("div", { class: "barra-acoes" },
        this.botao("Índice", "Índice de cenas (M)", () => this.alternarIndice(), "b-indice"),
        this.bSom,
        this.botao("Ensaio", "Tempo e tópicos de fala (E)", () => this.acoes.alternarEnsaio(), "b-ensaio"),
        this.botao("Tela cheia", "Tela cheia (F)", () => this.acoes.telaCheia(), "b-cheia"),
        this.botao("Ajuda", "Atalhos (H)", () => this.alternarAjuda(), "b-ajuda")));
  }

  // Qualquer movimento mostra a barra, exceto em demo: lá o mouse trabalha na demo, e a barra só vem pelo rodapé.
  mexeu() {
    this.palco.classList.remove("cursor-oculto");
    if (!this.estado?.demo || this.sobre) this.mostrar();
  }

  mexeuNaDemo(y) { if (y > ALTURA_RODAPE) this.mostrar(); }

  mostrar() {
    this.barra.classList.add("visivel");
    clearTimeout(this.timer);
    if (this.sobre) return;
    this.timer = setTimeout(() => {
      this.barra.classList.remove("visivel");
      if (!this.estado?.demo) this.palco.classList.add("cursor-oculto");
    }, OCULTAR_MS);
  }

  previa(c) {
    this.rotulo.replaceChildren(el("b", {}, c.id), ` ${c.titulo}`);
    this.tempo.textContent = `ir para ${mmss(c.inicio_s)}`;
  }

  pintarRotulo() {
    const e = this.estado;
    if (!e) return;
    this.rotulo.replaceChildren(el("b", {}, e.cena.id), ` ${e.cena.titulo}`);
    this.tempo.textContent = `${mmss(e.cena.inicio_s)} de ${mmss(this.total)}`;
  }

  atualizar(e) {
    const mudouCena = this.estado?.cena !== e.cena;
    this.estado = e;
    this.pintarRotulo();
    this.passos.replaceChildren(
      ...Array.from({ length: e.passos }, (_, k) => el("i", { class: k <= e.passo ? "feito" : "" })),
      el("span", {}, `passo ${e.passo + 1} de ${e.passos}`));
    this.segmentos.forEach((s, k) => {
      s.classList.toggle("feito", k < e.indice);
      s.classList.toggle("atual", k === e.indice);
    });
    this.bVoltar.disabled = e.indice === 0 && e.passo === 0;
    const fim = e.indice === this.cenas.length - 1 && e.passo === e.passos - 1;
    this.bAvancar.disabled = fim;
    this.bAvancar.textContent = fim ? "Fim" : e.passo === e.passos - 1 ? "Próxima cena →" : "Avançar →";
    this.bSom.textContent = e.mudo ? "Som desligado" : "Som ligado";
    if (this.indice) this.pintarIndice();
    if (mudouCena) {
      const dica = DICAS[e.cena.id];
      if (dica) this.dica(`${dica} Controles: leve o mouse ao rodapé.`, 7000, true);
      else this.caixaDica.hidden = true;
    }
  }

  // Na demo, a dica fica no alto, porque embaixo cobriria os dados que estão sendo mostrados.
  dica(texto, ms, noTopo = false) {
    this.caixaDica.textContent = texto;
    this.caixaDica.classList.toggle("no-topo", noTopo);
    this.caixaDica.hidden = false;
    clearTimeout(this.timerDica);
    this.timerDica = setTimeout(() => { this.caixaDica.hidden = true; }, ms);
  }

  esconderDica() { this.caixaDica.hidden = true; }

  /* ---------- Índice ---------- */
  alternarIndice() {
    if (this.indice) return this.fecharPaineis();
    this.fecharPaineis();
    this.indice = el("div", { id: "indice", class: "painel", role: "dialog", "aria-label": "Índice de cenas" });
    this.palco.append(this.indice);
    this.pintarIndice();
    return null;
  }

  pintarIndice() {
    const e = this.estado;
    const pessoas = [...new Set(this.cenas.map((c) => c.apresentador))];
    const colunas = pessoas.map((p) => {
      const dela = this.cenas.filter((c) => c.apresentador === p);
      const col = el("div", { class: "indice-col" }, el("h3", { style: `color:${COR_PESSOA[p]}` }, dela[0].nomePessoa), el("div", { class: "indice-papel" }, dela[0].papelPessoa));
      let cap = null;
      for (const c of dela) {
        if (c.capitulo !== cap) {
          cap = c.capitulo;
          col.append(el("div", { class: "indice-cap" }, cap.titulo));
        }
        const i = this.cenas.indexOf(c);
        const b = el("button", {
          class: `indice-cena${e && i === e.indice ? " atual" : ""}`, "data-cena": c.id,
          onclick: (ev) => { ev.stopPropagation(); this.fecharPaineis(); this.acoes.ir(i); this.acoes.focarDemo(); },
        }, el("span", { class: "indice-tempo" }, mmss(c.inicio_s)), el("span", { class: "indice-nome" }, c.titulo));
        if (c.demo) b.append(el("span", { class: "indice-demo" }, "demo"));
        col.append(b);
      }
      return col;
    });
    this.indice.replaceChildren(
      el("div", { class: "painel-topo" }, el("h2", {}, "Índice de cenas"), this.botao("Fechar (Esc)", "Fechar", () => this.fecharPaineis())),
      el("div", { class: "indice-grade" }, ...colunas));
  }

  /* ---------- Ajuda ---------- */
  alternarAjuda() {
    if (this.ajuda) return this.fecharPaineis();
    this.fecharPaineis();
    const linhas = ATALHOS.map(([t, a]) => el("tr", {}, el("td", { class: "tecla" }, t), el("td", {}, a)));
    this.ajuda = el("div", { id: "ajuda", class: "painel", role: "dialog", "aria-label": "Ajuda" },
      el("div", { class: "painel-topo" }, el("h2", {}, "Como controlar a apresentação"), this.botao("Fechar (Esc)", "Fechar", () => this.fecharPaineis())),
      el("table", {}, ...linhas),
      el("p", {}, "A barra aparece quando o mouse se move e some sozinha. Para gravar sem nada disto na tela, escolha o modo Gravar na tela inicial."),
      this.botao("Voltar à tela inicial", "Voltar à tela inicial", () => this.acoes.telaInicial(), "b-inicio"));
    this.palco.append(this.ajuda);
    return null;
  }

  painelAberto() { return Boolean(this.indice || this.ajuda); }

  fecharPaineis() {
    this.indice?.remove();
    this.ajuda?.remove();
    this.indice = null;
    this.ajuda = null;
  }
}

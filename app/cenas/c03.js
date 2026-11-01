// Capítulo C03: tokenização e embeddings.
import { COR, DUR } from "../motor/cena.js";
import { gerador } from "../../demos/01-self-attention/atencao.js";

function vetorFixo(semente, n = 12) {
  const g = gerador(semente);
  return Array.from({ length: n }, () => g.uniforme() * 0.85 + 0.1);
}

export default {
  "C03-S01": {
    montar(c) {
      c.titulo("Nem caractere, nem palavra");
      const fileiras = [
        { rot: "caracteres", pecas: [..."desatenção"], nota: "sequência longa", valor: "10 tokens · vocabulário de dezenas" },
        { rot: "palavras", pecas: ["desatenção"], nota: "palavra rara fica sem representação", valor: "1 token · vocabulário de centenas de milhares" },
        { rot: "subpalavras", pecas: ["des", "atenção"], nota: "o meio-termo", valor: "2 tokens · vocabulário de dezenas de milhares" },
      ];
      const r = fileiras.map((f, i) => {
        const y = 200 + i * 240;
        const rot = c.sub(f.rot, { x: 72, y });
        let x = 72;
        const pecas = f.pecas.map((t) => {
          const p = c.peca(t, { x, y: y + 60, cl: i === 2 ? "azul" : "" });
          x += 24 + t.length * 16 + 12;
          return p;
        });
        const nota = c.txt(f.nota, { cl: i === 2 ? "t-rotulo" : "t-nota", x: 1000, y: y + 66, fs: 26, cor: i === 2 ? COR.az : undefined });
        const valor = c.rot(f.valor, { x: 1000, y: y + 110 });
        return { rot, pecas, nota, valor };
      });
      const aviso = c.rot("Valores em ordem de grandeza; a segmentação é ilustrativa.", { x: 72, y: 900 });
      return { r, aviso };
    },
    passos: [
      (c, { r, aviso }) => {
        r.forEach((f, i) => { c.entra([f.rot, f.valor], { dur: DUR.curta, delay: i * 500 }); c.entra(f.pecas, { dur: DUR.curta, delay: i * 500, stag: 30 }); c.som("tokenEntra", i * 500); });
        c.entra(aviso, { delay: 1500 });
      },
      (c, { r }) => c.entra(r.map((f) => f.nota), { stag: 250 }),
    ],
  },

  "C03-S02": {
    montar(c) {
      c.titulo("WordPiece: mesma ideia, outro critério", { ja: false });
      const a = c.sub("BPE, como na demo", { x: 120, y: 320 });
      const pa = [c.peca("r", { x: 120, y: 390 }), c.peca("atos", { x: 180, y: 390, cl: "azul" }), c.peca("</w>", { x: 300, y: 390, cl: "tracejada" })];
      const b = c.sub("WordPiece, no BERT", { x: 1000, y: 320 });
      const pb = [c.peca("play", { x: 1000, y: 390 }), c.peca("##ing", { x: 1110, y: 390, cl: "azul" })];
      const na = c.txt("funde o par mais frequente e marca o fim de palavra", { x: 120, y: 480, w: 720 });
      const nb = c.txt("escolhe peças por outro critério e marca a continuação com ##", { x: 1000, y: 480, w: 800 });
      const tit = c.h.querySelectorAll(".t-titulo, .regra");
      return { a, pa, b, pb, na, nb, tit: [...tit] };
    },
    passos: [
      (c) => c.demo("demos/00-tokenizacao-bpe/", "demo-00-bpe.png"),
      (c, r) => { c.demo(null); c.entra(r.tit, { dur: DUR.curta }); c.entra([r.a, r.pa, r.na], { dur: DUR.curta, stag: 60 }); c.entra([r.b, r.pb, r.nb], { dur: DUR.curta, delay: 500, stag: 60 }); },
    ],
  },

  "C03-S03": {
    montar(c) {
      c.titulo("O embedding é uma tabela aprendida");
      c.eq("E\\in\\mathbb{R}^{|\\mathcal{V}|\\times d_{\\mathrm{model}}}", { x: 1500, y: 74, fs: 34, ja: true });
      const toks = ["o", "banco", "gato", "praça", "crédito", "muro", "…"];
      const X = 200, Y0 = 200, A = 74;
      const rotulos = toks.map((t, i) => c.txt(t, { cl: "t-mono", x: 62, y: Y0 + i * A + 12, w: 110, al: "right", fs: 24, ja: true }));
      const linhas = toks.map((_, i) => (i === 6 ? null : c.vetor(vetorFixo(11 + i), { x: X, y: Y0 + i * A + 8, cor: COR.gr, ja: true, lado: 28 })));
      const tabela = c.ret(X - 12, Y0 - 6, 400 + 80, A * 7 + 8, { ja: true });
      const eixoT = c.rot("uma linha por token · |V| linhas", { x: 72, y: 730 });
      const sel = (i, sem) => {
        const y = Y0 + i * A + 8;
        return {
          moldura: c.ret(X - 8, y - 6, 472, 50, { cor: COR.az, esp: 3 }),
          seta: c.seta(`M${X + 470} ${y + 18}H930`, { cor: COR.az, esp: 3 }),
          id: c.txt(`id = ${i}`, { cl: "t-rotulo", x: 720, y: y - 28, cor: COR.az }),
          vet: c.vetor(vetorFixo(sem), { x: 940, y: y, cor: COR.az, lado: 28 }),
          nome: c.txt(toks[i], { cl: "t-mono", x: 1420, y: y + 4, cor: COR.az }),
        };
      };
      const s1 = sel(1, 12), s2 = sel(4, 15);
      const pontos = [["gato", 1180, 620], ["cão", 1260, 660], ["banco", 1500, 800], ["crédito", 1620, 760], ["praça", 1680, 640]];
      const pts = pontos.map(([t, x, y]) => [c.circ(x, y, 7, { fill: COR.ti }), c.rot(t, { x: x + 12, y: y - 30 })]);
      const eixoP = c.rot("projeção 2D ilustrativa", { x: 1080, y: 880 });
      const prox = [c.path("M1180 620L1260 660", { cor: COR.az, esp: 2 }), c.path("M1500 800L1620 760", { cor: COR.az, esp: 2 })];
      const moldP = c.ret(1060, 560, 788, 360, { cor: COR.rg, esp: 1 });
      const d = c.txt("d<sub>model</sub> = 512 no artigo original", { cl: "t-rotulo", x: 72, y: 780 });
      const al = c.txt("valores iniciais aleatórios, ajustados no treino", { cl: "t-rotulo", x: 72, y: 820 });
      const cada = c.nota("dimensões isoladas não têm significado garantido", { x: 72, y: 880 });
      return { rotulos, linhas, tabela, eixoT, s1, s2, pts, eixoP, prox, moldP, d, al, cada };
    },
    passos: [
      (c, r) => { const s = r.s1; c.entra(r.eixoT); c.traca(s.moldura, { dur: DUR.curta }); c.entra(s.id, { dur: DUR.curta }); c.traca(s.seta, { dur: DUR.media, delay: 200 }); c.entra([s.vet, s.nome], { delay: 600 }); c.som("tokenEntra", 600); c.entra([r.d, r.al], { delay: 1000, stag: 200 }); },
      (c, r) => { const s = r.s2; c.traca(s.moldura, { dur: DUR.micro }); c.entra(s.id, { dur: DUR.micro }); c.traca(s.seta, { dur: DUR.curta }); c.entra([s.vet, s.nome], { dur: DUR.curta, delay: 200 }); c.som("tokenEntra", 200); },
      (c, r) => { c.entra([r.moldP, r.eixoP], { dur: DUR.curta }); c.entra(r.pts, { dur: DUR.curta, stag: 60, delay: 100 }); c.traca(r.prox, { dur: DUR.media, delay: 600 }); c.entra(r.cada, { delay: 1200 }); },
    ],
  },

  "C03-S04": {
    montar(c) {
      c.titulo("Mesma palavra, mesmo vetor");
      const f1 = c.frase(["o", "banco", "aprovou", "o", "crédito"], { x0: 180, x1: 1740, y: 180 });
      const f2 = c.frase(["sentei", "no", "banco", "da", "praça"], { x0: 180, x1: 1740, y: 300 });
      f1[1].classList.add("azul"); f2[2].classList.add("azul");
      const v = vetorFixo(12, 12);
      const v1 = c.vetor(v, { x: 310, y: 560, cor: COR.az, lado: 30 });
      const v2 = c.vetor(v, { x: 1190, y: 560, cor: COR.az, lado: 30 });
      const s1 = c.seta(`M${f1[1].cx - 30} 228C${f1[1].cx - 120} 300 500 400 500 552`, { cor: COR.az, esp: 3 });
      const s2 = c.seta(`M${f2[2].cx} 348C${f2[2].cx} 460 1380 440 1380 552`, { cor: COR.az, esp: 3 });
      const igual = c.txt("=", { cl: "t-titulo", x: 900, y: 540, w: 120, al: "center", fs: 76, cor: COR.vm });
      const nota = c.sub("A tabela não vê os vizinhos.", { x: 72, y: 720, w: 1776, al: "center", cor: COR.vm });
      return { f1, f2, v1, v2, s1, s2, igual, nota };
    },
    passos: [
      (c, r) => { c.entra(r.f1, { dur: DUR.curta, stag: 70 }); c.entra(r.f2, { dur: DUR.curta, delay: 450, stag: 70 }); },
      (c, r) => { c.traca([r.s1, r.s2], { dur: DUR.media, stag: 150 }); c.entra([r.v1, r.v2], { delay: 600 }); },
      (c, r) => { c.entra(r.igual, { dur: DUR.curta }); c.entra(r.nota, { delay: 300 }); },
      (c) => c.carimbar("a2"),
    ],
  },
};

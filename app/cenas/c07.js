// Capítulo C07: o bloco completo.
import { COR, DUR } from "../motor/cena.js";
import { planta } from "./_util.js";

// LayerNorm real de um vetor pequeno: média 0 e variância 1 ao longo das features.
const X = [2.4, -0.6, 1.2, 3.0, 0.3, -1.1];
const MEDIA = X.reduce((a, b) => a + b, 0) / X.length;
const DP = Math.sqrt(X.reduce((a, b) => a + (b - MEDIA) ** 2, 0) / X.length);
const N = X.map((v) => (v - MEDIA) / DP);

export default {
  "C07-S01": {
    montar(c) {
      c.titulo("Dois atalhos para treinar pilhas profundas");
      const Y = 330;
      const ent = c.seta(`M130 ${Y}H560`, { esp: 4 });
      const bloco = c.caixa("Multi-head attention", 560, Y - 80, 400, 160, { fs: 34, cl: "azul" });
      const sai = c.seta(`M960 ${Y}H1168`, { esp: 4 });
      const res = c.seta(`M300 ${Y}V190H1198V${Y - 34}`, { cor: COR.vd, esp: 3 });
      const rotR = c.rot("conexão residual: caminho direto para o sinal e o gradiente", { x: 400, y: 150, cor: COR.vd });
      const soma = c.circ(1198, Y, 30, { esp: 3, fill: COR.pa });
      const somaT = c.txt("+", { cl: "t-sub", x: 1186, y: Y - 22 });
      const norma = c.caixa("LayerNorm", 1300, Y - 60, 280, 120, { fs: 34 });
      const s2 = c.seta(`M1228 ${Y}H1296`, { esp: 3 });
      const s3 = c.seta(`M1580 ${Y}H1780`, { esp: 4 });
      const eq = c.eq("\\mathrm{LayerNorm}(x+\\mathrm{Sublayer}(x))", { x: 72, y: 540, fs: 36 });
      const rotP = c.rot("post-norm, como no artigo original", { x: 72, y: 610 });
      const vA = c.mat([X], { x: 960, y: 510, casas: 1, fs: 26 });
      const vB = c.mat([N], { x: 960, y: 610, casas: 2, fs: 26, cor: "z" });
      const rA = [c.rot("antes", { x: 870, y: 524 }), c.rot("depois", { x: 860, y: 624, cor: COR.vd })];
      const rM = c.rot("média 0, variância 1, por posição, ao longo das features", { x: 960, y: 680 });
      const pre = c.eq("x+\\mathrm{Sublayer}(\\mathrm{LayerNorm}(x))", { x: 72, y: 760, fs: 36 });
      const rotPre = c.rot("pre-norm: GPT-2 e muitos modelos posteriores, inclusive nosso mini-GPT", { x: 72, y: 830, fs: 24 });
      return { ent, bloco, sai, res, rotR, soma, somaT, norma, s2, s3, eq, rotP, vA, vB, rA, rM, pre, rotPre };
    },
    passos: [
      (c, r) => { c.traca(r.ent, { dur: DUR.media }); c.entra(r.bloco, { dur: DUR.curta, delay: 300 }); c.traca(r.sai, { dur: DUR.media, delay: 500 }); },
      (c, r) => { c.traca(r.res, { dur: DUR.media }); c.entra([r.soma, r.somaT, r.rotR], { dur: DUR.curta, delay: 500 }); c.som("multiplicaMatriz", 500); },
      (c, r) => { c.traca(r.s2, { dur: DUR.curta }); c.entra(r.norma, { dur: DUR.curta, delay: 200 }); c.traca(r.s3, { dur: DUR.curta, delay: 400 }); c.entra([r.eq, r.rotP, r.rA[0], r.vA], { delay: 400 }); c.entra([r.rA[1], r.vB, r.rM], { delay: 900 }); },
      (c, r) => c.entra([r.pre, r.rotPre], { stag: 200 }),
    ],
  },

  "C07-S02": {
    montar(c) {
      c.titulo("A mesma rede, em cada posição");
      c.eq("\\mathrm{FFN}(x)=\\max(0,\\,xW_1+b_1)W_2+b_2", { x: 1130, y: 76, fs: 32, ja: true });
      const Y = [190, 310, 430, 550, 670];
      const ent = Y.map((y, i) => c.vetor([0.8, 0.3, 0.6, 0.45].map((v) => ((v * (i + 3)) % 1) * 0.8 + 0.15), { x: 120, y, cor: COR.ti, lado: 40 }));
      const sai = Y.map((y, i) => c.vetor([0.5, 0.2, 0.9, 0.35].map((v) => ((v * (i + 5)) % 1) * 0.8 + 0.15), { x: 1440, y, cor: COR.vd, lado: 40 }));
      const ffn = c.caixa("FFN<br>512 → 2048 → 512", 700, 340, 500, 160, { fs: 36 });
      const liga = Y.map((y) => c.seta(`M330 ${y + 24}C520 ${y + 24} 520 420 696 420`, { esp: 1.5 }));
      const liga2 = Y.map((y) => c.seta(`M1204 420C1320 420 1320 ${y + 24} 1434 ${y + 24}`, { esp: 1.5, cor: COR.vd }));
      const larga = c.vetor(Array.from({ length: 16 }, (_, i) => ((i * 0.37) % 1) * 0.8 + 0.1), { x: 690, y: 530, cor: COR.az, lado: 28 });
      const r1 = c.rot("expande com ReLU no meio, depois contrai", { x: 690, y: 590 });
      const n = c.sub("Mesmos pesos nas posições de uma camada; pesos diferentes de uma camada para outra.", { x: 72, y: 830, w: 1776, al: "center" });
      return { ent, sai, ffn, liga, liga2, larga, r1, n };
    },
    passos: [
      (c, r) => { c.entra(r.ent, { dur: DUR.curta, stag: 60 }); c.entra(r.ffn, { dur: DUR.curta, delay: 300 }); c.traca(r.liga[0], { dur: DUR.media, delay: 400 }); c.entra(r.larga, { delay: 800 }); c.entra(r.r1, { delay: 1000 }); c.som("multiplicaMatriz", 800); },
      (c, r) => { c.traca(r.liga.slice(1), { dur: DUR.longa, stag: 80 }); c.traca(r.liga2, { dur: DUR.longa, delay: 300, stag: 80 }); c.entra(r.sai, { dur: DUR.curta, delay: 900, stag: 60 }); c.entra(r.n, { delay: 1400 }); },
    ],
  },

  "C07-S03": {
    montar(c) {
      c.titulo("A planta completa");
      const p = planta(c, { x: 100, y: 145, esc: 1.2, tracejar: ["cross"] });
      const tab = c.tabela(["Modelo", "Partes usadas"], [["Original", "encoder e decoder"], ["BERT", "só encoder"], ["GPT", "só decoder, sem cross-attention"]], { x: 1090, y: 220, w: 740 });
      const n = c.rot("N = 6 no artigo original.", { x: 1090, y: 500, fs: 26 });
      const d = c.rot("“Decoder-only” indica a máscara causal, não uma cópia do decoder original.", { x: 1090, y: 550, w: 740, fs: 26 });
      return { p, tab, n, d };
    },
    passos: [
      (c, r) => { c.entra(r.p.caixas, { dur: DUR.curta, stag: 90 }); r.p.caixas.forEach((_, i) => c.som("tokenEntra", i * 90)); c.traca([r.p.setas.enc, r.p.setas.dec], { dur: DUR.curta, delay: 500, stag: 60 }); },
      (c, r) => { c.entra(r.p.molduras, { dur: DUR.curta }); c.traca(r.p.setas.ponte, { dur: DUR.media, delay: 200 }); c.entra(r.n, { delay: 400 }); },
      (c, r) => { c.entra(r.tab); r.tab.linhas.forEach((l, i) => c.entra(l, { dur: DUR.curta, delay: 300 + i * 300 })); c.entra(r.d, { delay: 1200 }); },
    ],
  },

  "C07-S04": {
    montar() { return {}; },
    passos: [(c) => { c.demo("demos/03-mascara-causal/", "demo-03-mascara.png"); }],
  },

  "C07-S05": {
    montar(c) {
      c.titulo("Cross-attention: mesma fórmula, outra origem");
      const orig = c.frase(["the", "cat", "sleeps"], { x0: 120, x1: 1160, y: 180 });
      const dest = c.frase(["o", "gato", "dorme", "aqui"], { x0: 120, x1: 1160, y: 720 });
      const rotO = c.rot("origem: saída do encoder", { x: 72, y: 150 });
      const rotD = c.rot("destino: decoder", { x: 72, y: 780 });
      const kv = orig.map((o) => c.seta(`M${o.cx} 232V360`, { cor: COR.vm, esp: 2.5 }));
      const rotK = c.eq("K,\\ V", { x: 180, y: 290, fs: 32, cor: COR.vm });
      const q = dest.map((d) => c.seta(`M${d.cx} 712V500`, { cor: COR.az, esp: 2.5 }));
      const rotQ = c.eq("Q", { x: 180, y: 580, fs: 32, cor: COR.az });
      const pesos = [[0.1, 0.1, 0.1, 0.1], [0.5, 0.75, 0.1, 0.1], [0.1, 0.1, 0.75, 0.2]];
      const cotas = orig.flatMap((o, i) => dest.map((d, j) => c.path(`M${o.cx} 360C${o.cx} 440 ${d.cx} 420 ${d.cx} 500`, { cor: COR.ti, esp: 0.5 + 8 * pesos[i][j] })));
      const A = [[0.06, 0.88, 0.06], [0.05, 0.83, 0.12], [0.08, 0.06, 0.86], [0.2, 0.25, 0.55]];
      const mapa = c.mapa(A, { x: 1290, y: 240, lado: 70, ladoX: 100, rotulos: ["o", "gato", "dorme", "aqui"], rotulosK: ["the", "cat", "sleeps"], fs: 22, largRot: 110 });
      const rotM = c.rot("retangular: m × n", { x: 1290, y: 620, fs: 26 });
      const ilus = c.rot("Pesos ilustrativos.", { x: 1290, y: 660 });
      const fecha = c.sub("É Bahdanau, com produto escalar e sem RNN.", { x: 1290, y: 720, w: 560, cor: COR.az });
      return { orig, dest, rotO, rotD, kv, rotK, q, rotQ, cotas, mapa, rotM, ilus, fecha };
    },
    passos: [
      (c, r) => { c.entra([r.orig, r.rotO, r.dest, r.rotD], { dur: DUR.curta, stag: 40 }); c.traca(r.kv, { dur: DUR.media, delay: 300, stag: 70 }); c.entra(r.rotK, { delay: 700 }); },
      (c, r) => { c.traca(r.q, { dur: DUR.media, stag: 70 }); c.entra(r.rotQ, { delay: 400 }); },
      (c, r) => { c.traca(r.cotas, { dur: DUR.media, stag: 25 }); c.som("multiplicaMatriz"); c.entra([r.mapa, r.rotM, r.ilus], { delay: 500, stag: 150 }); c.som("softmaxNormaliza", 700); },
      (c, r) => c.entra(r.fecha),
    ],
  },
};

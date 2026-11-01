// Capítulo C02: limites das RNNs e atenção de Bahdanau.
import { COR, DUR } from "../motor/cena.js";
import { corrente, eixos } from "./_util.js";

const FRASE = ["o", "gato", "subiu", "no", "muro", "alto"];

export default {
  "C02-S01": {
    montar(c) {
      c.titulo("A RNN lê um token de cada vez");
      c.eq("h_t = f(h_{t-1},\\, x_t)", { x: 1480, y: 76, fs: 36, ja: true });
      const rn = corrente(c, FRASE, { x0: 120, x1: 1800, y: 240 });
      const rots = rn.elos.map((e, i) => c.eq(`h_${i + 1}`, { x: 120 + rn.passo * (i + 1) - 14, y: 240, fs: 26, cor: COR.az }));
      const larg = rn.elos.map((_, i) => c.vetor([0.7, 0.3, 0.85, 0.5], { x: 120 + rn.passo * (i + 1) - 30, y: 322, cor: COR.az, lado: 11 }));
      const barras = FRASE.map((_, i) => c.ret(120 + i * 200, 610, 196, 56, { fill: COR.ti }));
      const rotB = c.rot("tempo de cálculo: um passo só começa quando o anterior termina", { x: 120, y: 560 });
      const nota = c.nota("passo t depende de t − 1: não dá para paralelizar dentro da sequência", { x: 120, y: 690, fs: 26 });
      const fixo = c.nota("o vetor h não cresce, por mais longo que seja o texto", { x: 120, y: 740, fs: 26 });
      return { rn, rots, larg, barras, rotB, nota, fixo };
    },
    passos: [
      (c, r) => {
        c.entra(r.rotB);
        FRASE.forEach((_, i) => {
          const d = i * 650;
          c.entra([r.rn.palavras[i], r.rn.celulas[i]], { dur: DUR.curta, delay: d });
          c.entra(r.barras[i], { dur: DUR.curta, delay: d });
          c.som("tokenEntra", d);
          if (r.rn.elos[i]) c.traca(r.rn.elos[i], { dur: 400, delay: d + 200 });
          if (r.rots[i]) c.entra(r.rots[i], { dur: DUR.curta, delay: d + 300 });
        });
      },
      (c, r) => c.entra(r.larg, { stag: 60 }),
      (c, r) => c.entra([r.nota, r.fixo], { stag: 300 }),
    ],
  },

  "C02-S02": {
    montar(c) {
      c.titulo("Um produto longo some ou explode");
      const rn = corrente(c, FRASE, { x0: 120, x1: 1800, y: 158, lado: 64, ja: true });
      rn.palavras.forEach((p) => { p.style.top = "226px"; p.style.fontSize = "22px"; });
      const X = FRASE.map((_, i) => 120 + rn.passo * (i + 0.5));
      const grad = X.slice(1).map((x, i) => c.seta(`M${x} 288L${X[i] + 20} 288`, { cor: COR.vm, esp: 1.5 + i * 1.6, ponta: 8 }));
      const eq = c.eq("\\frac{\\partial h_T}{\\partial h_k}=\\prod_{t=k+1}^{T}\\frac{\\partial h_t}{\\partial h_{t-1}}", { x: 690, y: 312, fs: 34 });
      const g = eixos(c, { x: 170, y: 480, w: 700, h: 400, xmin: 0, xmax: 50, ymin: 0.001, ymax: 1000, marcasY: [0.001, 0.01, 0.1, 1, 10, 100, 1000], rotY: (v) => String(v).replace(".", ","), marcasX: [0, 10, 20, 30, 40, 50], fy: Math.log10 });
      const pts = (b) => Array.from({ length: 51 }, (_, n) => [n, b ** n]);
      const s1 = g.serie(pts(0.9), { cor: COR.az });
      const s2 = g.serie(pts(1.1), { cor: COR.vm });
      const r1 = c.eq("0{,}9^{50}\\approx 0{,}005", { x: g.X(50) - 200, y: g.Y(0.005) + 8, fs: 26, cor: COR.az });
      const r2 = c.eq("1{,}1^{50}\\approx 117", { x: g.X(50) - 170, y: g.Y(117) - 52, fs: 26, cor: COR.vm });
      // Esquema da LSTM: estado de célula quase reto, com portas
      const y = 600;
      const celula = c.caixa("", 1020, 500, 740, 280, { cl: "tracejada" });
      const estado = c.seta(`M960 ${y}H1830`, { cor: COR.az, esp: 5 });
      const portas = ["esquecer", "entrar", "sair"].map((p, i) => c.caixa(p, 1090 + i * 230, 660, 170, 70, { fs: 24 }));
      const liga = [0, 1, 2].map((i) => c.seta(`M${1175 + i * 230} 660V${y + 4}`, { esp: 2 }));
      const rotE = c.rot("estado de célula: caminho quase aditivo", { x: 1070, y: 546, cor: COR.az });
      const atenua = c.nota("atenua, não elimina; a leitura continua em série", { x: 1020, y: 800, fs: 24 });
      return { grad, eq, g, s1, s2, r1, r2, celula, estado, portas, liga, rotE, atenua };
    },
    passos: [
      (c, r) => { c.traca(r.grad.reverse(), { dur: 350, stag: 300 }); c.som("multiplicaMatriz", 300); c.entra(r.eq, { delay: 1400 }); },
      (c, r) => { c.entra(r.g.partes, { dur: DUR.curta }); c.traca([r.s1, r.s2], { stag: 200 }); c.entra([r.r1, r.r2], { dur: DUR.curta, delay: 1400, stag: 100 }); },
      (c, r) => { c.entra([r.celula, r.portas], { dur: DUR.curta }); c.traca(r.liga, { dur: DUR.curta, delay: 200 }); c.traca(r.estado, { delay: 300 }); c.entra([r.rotE, r.atenua], { delay: 1300, stag: 300 }); },
    ],
  },

  "C02-S03": {
    montar(c) {
      c.titulo("Atenção de Bahdanau: um contexto para cada palavra");
      const Y = [206, 284, 362, 440, 518];
      const hs = Y.map((y, i) => c.eq(`h_${i + 1}`, { x: 112, y, fs: 30, cor: COR.oc }));
      const caixasH = Y.map((y) => c.ret(92, y - 8, 76, 60, { cor: COR.oc }));
      const rotE = c.rot("encoder: RNN", { x: 72, y: 160 });
      const s = c.caixa("s<sub>i−1</sub>", 1620, 310, 170, 90, { fs: 30, cl: "azul" });
      const rotD = c.rot("decoder", { x: 1620, y: 270 });
      const funil = [...Y.map((y) => c.path(`M170 ${y + 22}L800 355`, { cor: COR.vm })), c.caixa("c", 800, 315, 80, 80, { fs: 34, cl: "verm" }), c.seta("M880 355H1616", { cor: COR.vm, esp: 3 })];
      const rotF = c.nota("frase inteira em um único vetor", { x: 930, y: 310 });
      const pesos = [0.06, 0.1, 0.62, 0.17, 0.05];
      const finas = Y.map((y) => c.path(`M172 ${y + 22}C700 ${y + 22} 1100 355 1616 355`, { cor: COR.az, esp: 1 }));
      const eqs = [
        c.eq("e_{ij}=a(s_{i-1},\\,h_j)", { x: 100, y: 660, fs: 32 }),
        c.eq("\\alpha_{ij}=\\dfrac{\\exp(e_{ij})}{\\sum_k\\exp(e_{ik})}", { x: 640, y: 640, fs: 32 }),
        c.eq("c_i=\\sum_j\\alpha_{ij}\\,h_j", { x: 1240, y: 650, fs: 32 }),
      ];
      const rots = [
        c.rot("compatibilidade: uma pequena rede (atenção aditiva)", { x: 100, y: 780, w: 500 }),
        c.rot("normalização dos pesos", { x: 640, y: 780 }),
        c.rot("média ponderada", { x: 1240, y: 780 }),
      ];
      const receita = c.sub("pontuar · normalizar · fazer média", { x: 100, y: 870, cor: COR.az });
      return { hs, caixasH, rotE, s, rotD, funil, rotF, pesos, finas, eqs, rots, receita };
    },
    passos: [
      (c, r) => { c.entra([r.hs, r.caixasH, r.rotE, r.s, r.rotD], { dur: DUR.curta }); c.traca(r.funil.filter((n) => n instanceof SVGElement), { dur: DUR.media, delay: 200 }); c.entra(r.funil.filter((n) => !(n instanceof SVGElement)), { delay: 600 }); c.entra(r.rotF, { delay: 800 }); },
      (c, r) => { c.sai(r.funil); c.sai(r.rotF); c.traca(r.finas, { delay: 200, stag: 80 }); },
      (c, r) => { r.finas.forEach((f, i) => c.esp(f, 1, 0.75 + 20 * r.pesos[i], { dur: DUR.longa })); c.som("softmaxNormaliza", 700); },
      (c, r) => { r.eqs.forEach((e, i) => c.entra([e, r.rots[i]], { delay: i * 350 })); c.entra(r.receita, { delay: 1300 }); },
    ],
  },

  "C02-S04": {
    montar(c) {
      c.titulo("Vaswani et al., 2017");
      const corr = corrente(c, FRASE, { x0: 320, x1: 1600, y: 200, lado: 70, ja: true });
      const risco = c.path("M300 250L1620 250", { cor: COR.vm, esp: 6 });
      const pergunta = c.txt("E se retirarmos a recorrência?", { cl: "t-titulo", x: 72, y: 520, w: 1776, al: "center", fs: 92 });
      const fonte = c.rot("“Attention Is All You Need”", { x: 72, y: 650, w: 1776, al: "center", fs: 28 });
      return { corr, risco, pergunta, fonte };
    },
    passos: [
      (c, r) => { c.traca(r.risco, { dur: DUR.media }); c.som("mascaraCorta", 200); c.sai([r.corr.celulas, r.corr.elos, r.corr.palavras, r.risco], { delay: 800 }); },
      (c, r) => c.entra([r.pergunta, r.fonte], { stag: 300 }),
    ],
  },
};

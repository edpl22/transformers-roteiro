// Capítulo C06: codificação posicional.
import { EXEMPLO_MAO, atencao } from "../../demos/01-self-attention/atencao.js";
import { COR, DUR } from "../motor/cena.js";

const { tokens, Q, K, V } = EXEMPLO_MAO;
const ordem = [2, 1, 0];
const perm = (M) => ordem.map((i) => M[i]);

export default {
  "C06-S01": {
    montar(c) {
      c.titulo("Embaralhe os tokens: as saídas só mudam de lugar");
      const a = atencao(Q, K, V), b = atencao(perm(Q), perm(K), perm(V));
      const t2 = perm(tokens);
      const fa = c.frase(tokens, { x0: 160, x1: 760, y: 220 });
      const ma = c.mapa(a.A, { x: 170, y: 300, lado: 72, ladoX: 120, rotulos: tokens, casas: 3, fs: 22, largRot: 110 });
      const fb = c.frase(t2, { x0: 1040, x1: 1640, y: 220 });
      const mb = c.mapa(b.A, { x: 1050, y: 300, lado: 72, ladoX: 120, rotulos: t2, casas: 3, fs: 22, largRot: 110 });
      const arcos = [0, 1, 2].map((i) => c.seta(`M${fa[i].cx} 212C${fa[i].cx} 160 ${fb[2 - i].cx} 160 ${fb[2 - i].cx} 212`, { cor: COR.az, esp: 2 }));
      const ligas = c.txt("mesmos valores, em outra posição", { cl: "t-rotulo", x: 690, y: 420, w: 340, al: "center", cor: COR.az });
      const eq = c.eq("f(PX)=P\\,f(X),\\quad P:\\ \\text{matriz de permutação}", { x: 460, y: 680, fs: 36 });
      const n = c.txt("Nada na fórmula sabe o que é “antes”.", { cl: "t-sub", x: 72, y: 780, w: 1776, al: "center", cor: COR.vm });
      return { fa, ma, fb, mb, arcos, ligas, eq, n };
    },
    passos: [
      (c, r) => { c.entra(r.fa, { dur: DUR.curta, stag: 100 }); c.entra(r.ma, { delay: 300 }); },
      (c, r) => { c.traca(r.arcos, { dur: DUR.longa, stag: 150 }); r.arcos.forEach((_, i) => c.som("tokenEntra", i * 150)); c.entra(r.fb, { dur: DUR.curta, delay: 900, stag: 100 }); c.entra(r.mb, { delay: 1100 }); },
      (c, r) => c.entra([r.ligas, r.eq, r.n], { stag: 250 }),
    ],
  },

  "C06-S02": {
    montar(c) {
      c.titulo("A entrada é a soma de embedding e posição");
      const v1 = [0.9, 0.2, 0.5, 0.7, 0.3, 0.6, 0.15, 0.8];
      const v2 = [0.1, 0.85, 0.3, 0.75, 0.5, 0.9, 0.4, 0.2];
      const a = c.vetor(v1, { x: 300, y: 400, cor: COR.ti, lado: 44 });
      const mais = c.txt("+", { cl: "t-titulo", x: 800, y: 380, fs: 64 });
      const b = c.vetor(v2, { x: 860, y: 400, cor: COR.az, lado: 44 });
      const ig = c.txt("=", { cl: "t-titulo", x: 1360, y: 380, fs: 64 });
      const d = c.vetor(v1.map((x, i) => Math.min(1, (x + v2[i]) / 1.6)), { x: 1420, y: 460, cor: COR.vd, lado: 34 });
      const rots = [c.rot("embedding do token", { x: 300, y: 350 }), c.rot("PE: sem parâmetro a treinar", { x: 860, y: 350 }), c.rot("entrada, mesma dimensão", { x: 1420, y: 420 })];
      return { a, mais, b, ig, d, rots };
    },
    passos: [
      (c, r) => c.entra([r.a, r.rots[0], r.mais, r.b, r.rots[1], r.ig, r.d, r.rots[2]], { stag: 110 }),
      (c) => c.demo("demos/02-codificacao-posicional/", "demo-02-posicional.png"),
    ],
  },

  "C06-S03": {
    montar(c) {
      c.titulo("Três formas de informar a posição");
      const col = [["Senoidal", "fixa, somada à entrada", "Vaswani et al., 2017"], ["Aprendida", "tabela de posições, somada à entrada; limitada ao tamanho máximo do treino", "BERT, GPT"], ["RoPE", "gira pares de dimensões de Q e K; o produto escalar passa a depender da distância", "Su et al., 2024"]];
      const X = [72, 680, 1288];
      const r = col.map(([n, t, f], i) => [
        c.sub(n, { x: X[i], y: 170 }),
        c.txt(t, { x: X[i], y: 620, w: 540, fs: 26 }),
        c.rot(f, { x: X[i], y: 760 }),
        c.ret(X[i], 230, 540, 370, { cor: COR.rg, esp: 1 }),
      ]);
      const sen = [0, 1, 2].map((k) => {
        let d = "";
        for (let x = 0; x <= 500; x += 4) d += `${x ? "L" : "M"}${92 + x} ${300 + k * 110 - 34 * Math.sin((x / 500) * Math.PI * 2 * (8 / 2 ** k))}`;
        return c.path(d, { cor: [COR.az, COR.vm, COR.oc][k], esp: 2.5 });
      });
      const tab = Array.from({ length: 6 }, (_, i) => c.vetor([0.8, 0.3, 0.6, 0.2, 0.9, 0.4, 0.5, 0.7].map((v) => ((v * (i + 2)) % 1) * 0.8 + 0.15), { x: 740, y: 250 + i * 54, cor: COR.gr, lado: 30 }));
      const ox = 1558, oy = 470;
      const vet = (ang, cor) => c.seta(`M${ox} ${oy}L${ox + 170 * Math.cos(ang)} ${oy - 170 * Math.sin(ang)}`, { cor, esp: 4 });
      const antes = [vet(0.25, COR.az), vet(0.95, COR.vm)];
      const depois = [vet(0.75, COR.az), vet(1.45, COR.vm)];
      const arcoA = c.path(`M${ox + 90 * Math.cos(0.25)} ${oy - 90 * Math.sin(0.25)}A90 90 0 0 0 ${ox + 90 * Math.cos(0.95)} ${oy - 90 * Math.sin(0.95)}`, { esp: 2 });
      const arcoB = c.path(`M${ox + 90 * Math.cos(0.75)} ${oy - 90 * Math.sin(0.75)}A90 90 0 0 0 ${ox + 90 * Math.cos(1.45)} ${oy - 90 * Math.sin(1.45)}`, { esp: 2 });
      const rotR = c.rot("deslocados: mesmo ângulo", { x: 1310, y: 250, cor: COR.gr });
      return { r, sen, tab, antes, depois, arcoA, arcoB, rotR };
    },
    passos: [
      (c, r) => { c.entra(r.r, { dur: DUR.media, stag: 40 }); c.traca(r.sen, { dur: DUR.longa, delay: 200, stag: 100 }); c.entra(r.tab, { dur: DUR.curta, delay: 500, stag: 50 }); c.traca([r.antes, r.arcoA], { dur: DUR.media, delay: 900 }); },
      (c, r) => { c.sai([r.antes, r.arcoA], { dur: DUR.curta }); c.traca([r.depois, r.arcoB], { dur: DUR.longa, delay: 200 }); c.som("tokenEntra", 600); c.entra(r.rotR, { delay: 1000 }); },
    ],
  },
};

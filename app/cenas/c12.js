// Capítulo C12: limitações e questões em aberto.
import { fmt } from "../../demos/_comum/prancha.js";
import { COR, DUR } from "../motor/cena.js";

export default {
  "C12-S01": {
    montar(c) {
      c.titulo("Notas de revisão: plausível não é verdadeiro");
      const a = c.sub("Alucinação", { x: 72, y: 170 });
      const fr = c.txt("“O artigo Attention Is All You Need foi publicado em 1995.”", { x: 72, y: 240, w: 820, fs: 36 });
      const rot = c.rot("Exemplo fabricado para ilustração: bem formado e falso.", { x: 72, y: 350, w: 820 });
      const circ = c.ret(60, 230, 836, 110, { cor: COR.vm, esp: 3 });
      const nota = c.nota("o objetivo do treino é prever tokens; nada garante a verdade", { x: 72, y: 410, w: 820, fs: 26 });
      const mit = c.rot("Mitigações existem, mas é uma questão em aberto.", { x: 72, y: 490, w: 820, fs: 26 });

      const b = c.sub("Contexto finito", { x: 1000, y: 170 });
      const toks = Array.from({ length: 12 }, (_, i) => c.peca(`t${i + 1}`, { x: 1000 + i * 70, y: 270, fs: 20 }));
      const jan = c.ret(1000 + 4 * 70 - 8, 256, 8 * 70 + 8, 72, { cor: COR.az, esp: 4 });
      const janRot = c.rot("janela de contexto", { x: 1272, y: 340, cor: COR.az });
      const fora = toks.slice(0, 4);
      const riscos = fora.map((_, i) => c.path(`M${996 + i * 70} 262L${1056 + i * 70} 316`, { cor: COR.vm, esp: 3 }));
      const rotF = c.rot("o que sai da janela, o modelo não vê", { x: 1000, y: 400, w: 820, fs: 26, cor: COR.vm });
      const rotM = c.rot("Mesmo dentro dela, o desempenho varia com a posição da informação (Liu et al., 2024).", { x: 1000, y: 460, w: 820, fs: 26 });
      return { a, fr, rot, circ, nota, mit, b, toks, jan, janRot, riscos, rotF, rotM };
    },
    passos: [
      () => {},                                               // silêncio intencional na abertura da prancha
      (c, r) => { c.entra([r.a, r.fr, r.rot], { dur: DUR.curta, stag: 120 }); c.traca(r.circ, { dur: DUR.media, delay: 400 }); c.entra([r.nota, r.mit], { delay: 800, stag: 300 }); },
      (c, r) => { c.entra([r.b, r.toks], { dur: DUR.curta }); c.traca(r.jan, { dur: DUR.media, delay: 200 }); c.entra(r.janRot, { delay: 500 }); c.traca(r.riscos, { dur: DUR.curta, delay: 800, stag: 100 }); c.som("mascaraCorta", 800); c.entra([r.rotF, r.rotM], { delay: 1200, stag: 250 }); },
    ],
  },

  "C12-S02": {
    montar(c) {
      c.titulo("Custos fora do modelo");
      const a = c.sub("Tabela de materiais", { x: 72, y: 170 });
      const t = c.tabela(["Treino do GPT-3, estimativa", ""], [["Energia", "1.287 MWh"], ["Carbono", "552 tCO₂e"]], { x: 72, y: 230, w: 780, num: [1] });
      const f = c.rot("Fonte: Patterson et al. (2021). Local e hardware alteram muito esse valor.", { x: 72, y: 400, w: 780 });
      const b = c.sub("O corpus entra no modelo", { x: 1000, y: 170 });
      const fr = c.txt("“A enfermeira disse que ___”", { cl: "t-mono", x: 1000, y: 230, fs: 30 });
      const dist = [["ela", 0.72], ["ele", 0.18], ["a equipe", 0.1]];
      const barras = dist.map(([n, p], i) => [
        c.rot(n, { x: 1000, y: 296 + i * 54, fs: 26 }),
        c.ret(1160, 296 + i * 54, 620 * p, 34, { fill: i === 0 ? COR.vm : COR.ti, cor: "none", esp: 0 }),
        c.rot(fmt(p, 2), { x: 1170 + 620 * p, y: 296 + i * 54, fs: 24 }),
      ]);
      const il = c.rot("Ilustração, não medição.", { x: 1000, y: 470 });
      const nv = c.nota("modelos aprendem regularidades do corpus, incluindo estereótipos e sub-representação", { x: 1000, y: 510, w: 820 });
      const q = c.sub("Questões em aberto", { x: 72, y: 620 });
      const itens = ["Interpretabilidade", "Verificação", "Eficiência", "Avaliação de danos"].map((t2, i) => c.caixa(t2, 72 + i * 448, 680, 420, 96, { fs: 32 }));
      return { a, t, f, b, fr, barras, il, nv, q, itens };
    },
    passos: [
      (c, r) => { c.entra([r.a, r.t], { dur: DUR.curta }); r.t.linhas.forEach((l, i) => c.entra(l, { dur: DUR.curta, delay: 200 + i * 250 })); c.entra(r.f, { delay: 800 }); },
      (c, r) => { c.entra([r.b, r.fr], { dur: DUR.curta }); c.entra(r.barras, { delay: 300, stag: 60 }); c.entra([r.il, r.nv], { delay: 900, stag: 200 }); },
      (c, r) => { c.entra(r.q, { dur: DUR.curta }); c.entra(r.itens, { dur: DUR.curta, delay: 200, stag: 150 }); },
    ],
  },
};

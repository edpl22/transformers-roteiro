// Capítulo C10: custo quadrático e variantes eficientes.
import { COR, DUR } from "../motor/cena.js";

export default {
  "C10-S01": {
    montar(c) {
      c.titulo("Dobrar o contexto quadruplica os pares");
      const q = [[512, 90], [1024, 180], [2048, 360]];
      let x = 110;
      const base = 720;
      const itens = q.map(([n, l]) => {
        const item = [
          c.ret(x, base - l, l, l, { fill: COR.ti, cor: COR.ti, op: 0.85 }),
          c.eq(`n=${n}`, { x, y: base + 16, fs: 28 }),
        ];
        x += l + 90;
        return item;
      });
      const tab = c.tabela(["n", "pares n²"], q.map(([n]) => [String(n), (n * n).toLocaleString("pt-BR")]), { x: 1160, y: 220, w: 660, num: [0, 1] });
      const cotas = c.rot("× 2 em n → × 4 em área", { x: 1160, y: 500, fs: 28, cor: COR.az });
      const eq = c.eq("O(n^2)\\ \\text{por cabeça e por camada}", { x: 1160, y: 560, fs: 32 });
      const ffn = c.rot("Em contraste, a FFN cresce linearmente com n.", { x: 1160, y: 640, w: 660, fs: 26 });
      return { itens, tab, cotas, eq, ffn };
    },
    passos: [
      (c, r) => { c.entra(r.itens[0]); c.entra(r.tab, { dur: DUR.curta }); c.entra(r.tab.linhas[0], { dur: DUR.curta }); c.som("multiplicaMatriz"); },
      (c, r) => { [1, 2].forEach((i, k) => { c.entra(r.itens[i], { delay: k * 700 }); c.entra(r.tab.linhas[i], { dur: DUR.curta, delay: k * 700 }); c.som("multiplicaMatriz", k * 700); }); c.entra([r.cotas, r.eq, r.ffn], { delay: 1200, stag: 200 }); },
    ],
  },

  "C10-S02": {
    montar(c) {
      c.titulo("Duas respostas diferentes ao custo");
      const N = 12, L = 40, X1 = 110, X2 = 1050, Y = 240;
      const grade = (x) => {
        const it = [];
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) it.push(c.ret(x + j * L, Y + i * L, L - 2, L - 2, { fill: COR.gr, cor: "none", esp: 0, op: 0.35 }));
        return it;
      };
      const a = grade(X1);
      const janelas = Array.from({ length: 4 }, (_, i) => c.ret(X1 + i * L * 3 - 2, Y + i * L * 3 - 2, L * 3, L * 3, { cor: COR.az, esp: 4 }));
      const b = [];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const manter = Math.abs(i - j) <= 1 || (i % 4 === 0 && j % 4 === 0);
          b.push(c.ret(X2 + j * L, Y + i * L, L - 2, L - 2, manter ? { fill: COR.ti, cor: "none", esp: 0 } : { fill: "url(#hachura)", cor: COR.vm, esp: 0.5 }));
        }
      }
      const tA = [c.sub("FlashAttention", { x: X1, y: 170 }), c.txt("mesma atenção exata, com menos acessos à memória de GPU (tiling)", { x: X1, y: 740, w: 800, fs: 26 }), c.nota("não é aproximação; o custo aritmético segue quadrático", { x: X1, y: 830, w: 800 })];
      const tB = [c.sub("Atenção esparsa", { x: X2, y: 170 }), c.eq("O(n\\sqrt{n})\\ \\text{em Child et al.}", { x: X2, y: 740, fs: 30 }), c.txt("muda o padrão: calcula só parte dos pares. Exemplos: Sparse Transformer, Longformer. Desenho ilustrativo.", { x: X2, y: 800, w: 800, fs: 26 })];
      return { a, janelas, b, tA, tB };
    },
    passos: [
      (c, r) => { c.entra(r.a, { dur: DUR.micro }); c.entra(r.tA[0], { dur: DUR.curta }); r.janelas.forEach((w, i) => c.traca(w, { dur: DUR.curta, delay: 200 + i * 260 })); c.entra([r.tA[1], r.tA[2]], { delay: 1200, stag: 250 }); },
      (c, r) => { c.entra(r.b, { dur: DUR.micro }); c.entra(r.tB, { delay: 300, stag: 200 }); c.som("mascaraCorta", 200); },
    ],
  },
};

// Capítulo C01: abertura e integrantes.
import { COR, DUR } from "../motor/cena.js";
import { mmss } from "./_util.js";

const TESE = "A representação de um token depende do contexto: um Transformer calcula, em paralelo, quanto cada posição deve aproveitar de todas as outras, e aprende esses pesos otimizando a previsão de tokens.";

export default {
  "C01-S01": {
    montar(c) {
      c.dados.moldura.style.visibility = "hidden";
      c.dados.carimbo.style.visibility = "hidden";
      const r = {};
      r.bordas = [c.ret(40, 40, 1840, 1000), c.ret(24, 24, 1872, 1032, { esp: 1 })];
      r.titulo = c.txt("Transformers", { cl: "t-titulo", x: 72, y: 190, fs: 160 });
      r.sub = c.sub("Inteligência Artificial · Engenharia de Computação", { x: 80, y: 370 });
      r.tokens = c.frase(["o", "banco", "aprovou"], { x0: 1180, x1: 1840, y: 470 });
      const [a, b, d] = r.tokens;
      r.cotas = [c.cota(b.cx, a.cx, 470, 0.08), c.cota(b.cx, b.cx, 470, 0.25), c.cota(b.cx, d.cx, 470, 0.6)];
      r.tese = c.txt(TESE, { x: 80, y: 600, w: 1500, fs: 36 });
      return r;
    },
    passos: [
      () => {},                                              // silêncio intencional: folha vazia
      (c, r) => {
        c.traca(r.bordas);
        c.som("transicaoCapitulo");
        c.entra(c.dados.moldura, { dur: DUR.curta, delay: 1000 });
        c.sai(r.bordas, { delay: 1300 });
        c.entra(c.dados.carimbo, { delay: 1000 });
      },
      (c, r) => c.entra([r.titulo, r.sub], { stag: 150 }),
      (c, r) => {
        c.entra(r.tokens, { dur: DUR.curta, stag: 120 });
        r.tokens.forEach((_, i) => c.som("tokenEntra", i * 120));
        c.traca(r.cotas, { delay: 400, stag: 350 });
      },
      (c, r) => c.entra(r.tese, { dur: DUR.media }),
    ],
  },

  "C01-S02": {
    montar(c) {
      const { pessoas, cenas } = c.dados;
      c.titulo("Quem cuida de cada prancha");
      const total = cenas.at(-1).fim_s;
      const linhas = pessoas.map((p) => {
        const dela = cenas.filter((s) => s.apresentador === p.id);
        const caps = [...new Set(dela.map((s) => s.capitulo.id))];
        return [`${p.nome}`, p.papel, `${caps[0]} a ${caps.at(-1)}`, `${mmss(dela[0].inicio_s)}–${mmss(dela.at(-1).fim_s)}`];
      });
      const t = c.tabela(["Nome", "Papel", "Capítulos", "Tempo"], linhas, { x: 72, y: 170, w: 1776, ja: true, fs: 32 });
      t.style.fontSize = "32px";
      const X0 = 72, L = 1776, Y = 690;
      const x = (s) => X0 + (L * s) / total;
      const blocos = pessoas.map((p, i) => {
        const dela = cenas.filter((s) => s.apresentador === p.id);
        const a = dela[0].inicio_s, b = dela.at(-1).fim_s;
        return [
          c.ret(x(a), Y, x(b) - x(a) - 4, 70, { fill: [COR.az, COR.vm, COR.oc, COR.vd][i], cor: COR.ti }),
          c.rot(p.nome, { x: x(a) + 10, y: Y + 84, fs: 22 }),
        ];
      });
      const demos = cenas.filter((s) => s.demo);
      const marcas = demos.map((s) => c.path(`M${x(s.inicio_s)} ${Y - 26}V${Y + 2}`, { esp: 3 }));
      const rotM = c.rot(`Marcas: ${demos.length} cenas com implementação`, { x: 72, y: Y - 70 });
      const reguas = c.rot(`35 min · de 00:00 a ${mmss(total)}`, { x: 1400, y: Y - 70, w: 448, al: "right" });
      return { t, blocos, marcas, rotM, reguas };
    },
    passos: [
      (c, r) => {
        r.t.linhas.forEach((l, i) => {
          c.entra(l, { dur: DUR.curta, delay: i * 400 });
          c.entra(r.blocos[i], { dur: DUR.curta, delay: i * 400 });
          c.som(i === 0 ? "trocaApresentador" : "tokenEntra", i * 400);
        });
        c.entra(r.reguas, { delay: 1600 });
      },
      (c, r) => { c.entra(r.rotM); c.entra(r.marcas, { dur: DUR.micro, stag: 80 }); },
    ],
  },
};

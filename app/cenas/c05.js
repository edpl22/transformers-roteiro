// Capítulo C05: multi-head attention.
import { gerador, softmax } from "../../demos/01-self-attention/atencao.js";
import { COR, DUR } from "../motor/cena.js";
import { planta } from "./_util.js";

// Mapas ilustrativos, com semente fixa: não vêm de um modelo treinado.
function mapaSorteado(semente, n = 5) {
  const g = gerador(semente);
  return Array.from({ length: n }, () => softmax(Array.from({ length: n }, () => g.normal() * 1.6)));
}

export default {
  "C05-S01": {
    montar(c) {
      c.titulo("Várias atenções em paralelo");
      c.eq("h=8,\\quad d_k=d_v=d_{\\mathrm{model}}/h=64", { x: 1180, y: 80, fs: 30, ja: true });
      const X0 = 96, L = 1728, Y = 175, passo = L / 8;
      const barra = c.ret(X0, Y, L, 52, { fill: COR.az, cor: COR.ti });
      const rotB = c.rot("d<sub>model</sub> = 512", { x: X0 + 124, y: 232 });
      const cortes = Array.from({ length: 7 }, (_, i) => c.path(`M${X0 + passo * (i + 1)} ${Y - 10}V${Y + 62}`, { cor: COR.pa, esp: 4 }));
      const mapas = Array.from({ length: 8 }, (_, i) => c.mapa(mapaSorteado(100 + i), { x: X0 + passo * i + 14, y: 330, lado: 36, casas: -1 }));
      const rots = Array.from({ length: 8 }, (_, i) => c.rot(`cabeça ${i + 1} · 64`, { x: X0 + passo * i + 14, y: 290, fs: 18 }));
      const quedas = Array.from({ length: 8 }, (_, i) => c.seta(`M${X0 + passo * (i + 0.5)} 232V286`, { esp: 2 }));
      const aviso = c.rot("Pesos sorteados com semente fixa, só para ilustrar.", { x: 1370, y: 612, w: 460, fs: 20 });
      const juntas = Array.from({ length: 8 }, (_, i) => c.path(`M${X0 + passo * (i + 0.5)} 526C${X0 + passo * (i + 0.5)} 590 ${X0 + L / 2} 560 ${X0 + L / 2} 612`, { esp: 1.5, cor: COR.vd }));
      const conc = c.caixa("Concat", X0 + L / 2 - 340, 612, 300, 60, { cl: "verde" });
      const wo = c.caixa("W<sup>O</sup>", X0 + L / 2 + 40, 612, 200, 60, { cl: "verde" });
      const liga = c.seta(`M${X0 + L / 2 - 40} 642H${X0 + L / 2 + 36}`, { cor: COR.vd });
      const eq1 = c.eq("\\mathrm{MultiHead}(Q,K,V)=\\mathrm{Concat}(\\mathrm{head}_1,\\dots,\\mathrm{head}_h)W^O", { x: 96, y: 730, fs: 32 });
      const eq2 = c.eq("\\mathrm{head}_i=\\mathrm{Attention}(QW_i^Q,\\,KW_i^K,\\,VW_i^V)", { x: 96, y: 810, fs: 32 });
      const custo = c.rot("Dimensão reduzida por cabeça: custo total parecido com o de uma só cabeça completa.", { x: 96, y: 890, fs: 26 });
      return { barra, rotB, cortes, mapas, rots, quedas, aviso, juntas, conc, wo, liga, eq1, eq2, custo };
    },
    passos: [
      (c, r) => { c.entra([r.barra, r.rotB], { dur: DUR.curta }); c.traca(r.cortes, { dur: DUR.media, delay: 300, stag: 50 }); c.som("mascaraCorta", 400); },
      (c, r) => { c.traca(r.quedas, { dur: DUR.curta }); c.entra([r.mapas, r.rots], { dur: DUR.longa, delay: 200 }); c.entra(r.aviso, { delay: 800 }); },
      (c, r) => { c.traca(r.juntas, { dur: DUR.media }); c.entra(r.conc, { dur: DUR.curta, delay: 500 }); c.traca(r.liga, { dur: DUR.curta, delay: 700 }); c.entra(r.wo, { dur: DUR.curta, delay: 900 }); c.som("multiplicaMatriz", 700); c.entra([r.eq1, r.eq2, r.custo], { delay: 1100, stag: 200 }); },
    ],
  },

  "C05-S02": {
    montar(c) {
      c.titulo("Vistas diferentes da mesma frase");
      const frase = ["o", "gato", "subiu", "no", "muro"];
      const vistas = [["Vista 1", [[1, 2, 0.5], [2, 4, 0.2], [4, 1, 0.1]]], ["Vista 2", [[0, 1, 0.4], [3, 4, 0.5], [2, 3, 0.15]]], ["Vista 3", [[1, 1, 0.3], [2, 0, 0.1], [4, 2, 0.45]]]];
      const r = vistas.map(([nome, cotas], k) => {
        const x0 = 72 + k * 600, x1 = x0 + 560, y = 460;
        const p = c.frase(frase, { x0, x1, y, fs: 22 });
        return {
          itens: [c.sub(nome, { x: x0, y: 200 }), p, c.ret(x0 - 8, 190, 576, 340, { cor: COR.rg, esp: 1 })],
          cotas: cotas.map(([a, b, w]) => c.cota(p[a].cx, p[b].cx, 452, w, { alt: 170 })),
        };
      });
      const nota = c.txt("Padrões observados depois do treino, não programados. Aqui, ilustrativos.", { cl: "t-sub", x: 72, y: 610, w: 1776, al: "center", cor: COR.vm });
      const nota2 = c.txt("Peso de atenção não é explicação do modelo.", { cl: "t-rotulo", x: 72, y: 670, w: 1776, al: "center", fs: 26 });
      return { r, nota, nota2 };
    },
    passos: [
      (c, { r }) => r.forEach((v, i) => { c.entra(v.itens, { dur: DUR.curta, delay: i * 500 }); c.traca(v.cotas, { dur: DUR.media, delay: i * 500 + 200, stag: 100 }); }),
      (c, r) => c.entra([r.nota, r.nota2], { stag: 200 }),
    ],
  },

  "C05-S03": {
    montar(c) {
      c.titulo("A peça central está pronta");
      const p = planta(c, { x: 120, y: 180, esc: 0.72, tracejar: ["emb", "emb2", "ffn", "mask", "cross", "ffn2", "saida"] });
      const caixa = c.caixa("Multi-head attention", 960, 330, 620, 170, { cl: "azul", fs: 44 });
      const e = [["Q", COR.az, 1040], ["K", COR.vm, 1270], ["V", COR.oc, 1500]].map(([t, cor, x]) => [c.seta(`M${x} 240V324`, { cor, esp: 3 }), c.eq(t, { x: x - 12, y: 190, fs: 34, cor })]);
      const s = [c.seta("M1270 500V600", { cor: COR.vd, esp: 3 }), c.eq("Z", { x: 1258, y: 610, fs: 34, cor: COR.vd })];
      const rec = c.sub("pontuar · escalar · normalizar · fazer média, em várias cabeças", { x: 840, y: 730, w: 1000, al: "center" });
      const prov = c.nota("Em nenhuma conta aparece a ordem das palavras.", { x: 840, y: 800, w: 1000, al: "center", fs: 26 });
      return { p, caixa, e, s, rec, prov };
    },
    passos: [
      (c, r) => { c.entra(r.caixa); c.traca(r.e.map((x) => x[0]), { dur: DUR.curta, delay: 150 }); c.entra(r.e.map((x) => x[1]), { dur: DUR.curta, delay: 300 }); c.traca(r.s[0], { dur: DUR.curta, delay: 300 }); c.entra(r.s[1], { dur: DUR.curta, delay: 500 }); c.entra(r.rec, { delay: 500 }); },
      (c, r) => { c.entra(r.p.tudo, { dur: DUR.media }); c.muda(r.p.self, { opacity: 0 }, { opacity: 1 }, { delay: 400 }); r.p.self.classList.add("azul"); c.entra(r.prov, { delay: 500 }); },
      (c) => c.carimbar("a3"),
    ],
  },
};

// Capítulo C08: treinamento. A curva vem de demos/04-mini-gpt/pesos.json, gerada no treino real.
import { fmt } from "../../demos/_comum/prancha.js";
import { COR, DUR } from "../motor/cena.js";
import { eixos } from "./_util.js";

const { meta } = await (await fetch(new URL("../../demos/04-mini-gpt/pesos.json", import.meta.url))).json();

export default {
  "C08-S01": {
    montar(c) {
      c.titulo("Dois objetivos de treino");
      c.eq("\\mathcal{L}=-\\frac{1}{|T|}\\sum_{t\\in T}\\log p_\\theta(y_t\\mid\\text{entrada})", { x: 1120, y: 58, fs: 30, ja: true });
      const toks = ["o", "gato", "subiu", "no", "muro"];
      const a = c.sub("Próximo token (GPT)", { x: 72, y: 170 });
      const ent = c.frase(toks.slice(0, 4), { x0: 72, x1: 900, y: 260 });
      const alvo = c.frase(toks.slice(1), { x0: 72, x1: 900, y: 440, cl: "verde" });
      const rE = [c.rot("entrada", { x: 72, y: 225 }), c.rot("alvo: a mesma sequência, deslocada em uma posição", { x: 72, y: 500 })];
      const setasA = ent.map((e, i) => c.seta(`M${e.cx} 312L${alvo[i].cx} 434`, { cor: COR.vd, esp: 2.5 }));
      const nA = c.rot("Exige máscara causal.", { x: 72, y: 560, fs: 26, cor: COR.vm });
      const b = c.sub("Masked LM (BERT)", { x: 1000, y: 170 });
      const fb = c.frase(["o", "gato", "[MASK]", "no", "muro"], { x0: 1000, x1: 1848, y: 260 });
      fb[2].classList.add("verm");
      const rB = c.rot("entrada com tokens escondidos", { x: 1000, y: 225 });
      const alvoB = c.peca("subiu", { x: fb[2].cx - 40, y: 440, cl: "verde" });
      const setasB = [0, 1, 3, 4].map((i) => c.seta(`M${fb[i].cx} 312C${fb[i].cx} 380 ${fb[2].cx} 340 ${fb[2].cx} 316`, { cor: COR.az, esp: 2 }));
      const sB = c.seta(`M${fb[2].cx} 312V434`, { cor: COR.vd, esp: 2.5 });
      const nB = c.rot("Os escondidos não estão na entrada: pode olhar para os dois lados.", { x: 1000, y: 560, w: 848, fs: 26, cor: COR.az });
      const vals = c.tabela(["Tokens selecionados: 15%", ""], [["viram [MASK]", "80%"], ["viram token aleatório", "10%"], ["ficam iguais", "10%"]], { x: 1000, y: 650, w: 848, num: [1] });
      return { a, ent, alvo, rE, setasA, nA, b, fb, rB, alvoB, setasB, sB, nB, vals };
    },
    passos: [
      (c, r) => { c.entra([r.a, r.ent, r.rE[0]], { dur: DUR.curta, stag: 40 }); c.traca(r.setasA, { dur: DUR.media, delay: 300, stag: 80 }); c.entra([r.alvo, r.rE[1]], { dur: DUR.curta, delay: 600, stag: 40 }); c.entra(r.nA, { delay: 1000 }); },
      (c, r) => { c.entra([r.b, r.fb, r.rB], { dur: DUR.curta, stag: 40 }); c.som("mascaraCorta", 300); c.traca(r.setasB, { dur: DUR.media, delay: 500, stag: 80 }); c.traca(r.sB, { dur: DUR.curta, delay: 900 }); c.entra(r.alvoB, { dur: DUR.curta, delay: 1100 }); c.entra(r.nB, { delay: 1200 }); },
      (c, r) => { c.entra(r.vals, { dur: DUR.curta }); r.vals.linhas.forEach((l, i) => c.entra(l, { dur: DUR.curta, delay: 200 + i * 200 })); },
    ],
  },

  "C08-S02": {
    montar(c) {
      c.titulo("Teacher forcing: treino em paralelo");
      const toks = ["o", "gato", "subiu", "no", "muro"];
      const a = c.sub("Com teacher forcing: uma única passada", { x: 72, y: 165 });
      const ent = c.frase(toks.slice(0, 4), { x0: 72, x1: 1000, y: 230 });
      const blocos = ent.map((e) => c.caixa("modelo", e.cx - 80, 310, 160, 50, { fs: 24 }));
      const sa = c.frase(toks.slice(1), { x0: 72, x1: 1000, y: 395, cl: "verde" });
      const liga = ent.map((e, i) => [c.seta(`M${e.cx} 282V306`, {}), c.seta(`M${e.cx} 362L${sa[i].cx} 391`, { cor: COR.vd })]);
      const b = c.sub("Sem ele: a saída vira a próxima entrada", { x: 72, y: 500 });
      const prev = ["o", "gato", "correu", "pela", "rua"];
      const cad = prev.map((t, i) => c.peca(t, { x: 90 + i * 200, y: 570, cl: i >= 2 ? "verm" : "" }));
      const setasB = prev.slice(0, -1).map((_, i) => c.seta(`M${200 + i * 200} 594H${285 + i * 200}`, { cor: i >= 1 ? COR.vm : COR.ti, esp: 2.5 }));
      const erro = c.nota("um erro contamina tudo o que vem depois, e o cálculo é sequencial", { x: 90, y: 650, fs: 26 });
      const lr = c.eq("lrate=d_{\\mathrm{model}}^{-0{,}5}\\cdot\\min(step^{-0{,}5},\\ step\\cdot warmup^{-1{,}5})", { x: 72, y: 730, fs: 32 });
      const ar = c.rot("Artigo original: Adam · warmup = 4000 · label smoothing de 0,1 · dropout de 0,1", { x: 72, y: 810, fs: 26 });
      return { a, ent, blocos, sa, liga, b, cad, setasB, erro, lr, ar };
    },
    passos: [
      (c, r) => { c.entra([r.a, r.ent, r.blocos], { dur: DUR.curta }); c.traca(r.liga, { dur: DUR.media, delay: 200 }); c.entra(r.sa, { delay: 600 }); c.som("multiplicaMatriz", 400); },
      (c, r) => { c.entra(r.b, { dur: DUR.curta }); r.cad.forEach((p, i) => { c.entra(p, { dur: DUR.curta, delay: 200 + i * 350 }); if (r.setasB[i]) c.traca(r.setasB[i], { dur: DUR.curta, delay: 400 + i * 350 }); }); c.entra(r.erro, { delay: 1900 }); },
      (c, r) => c.entra([r.lr, r.ar], { stag: 300 }),
    ],
  },

  "C08-S03": {
    montar(c) {
      c.titulo("Um treino real, com gradiente escrito à mão");
      const cod = c.codigo([
        "<span class='cm'># demos/04-mini-gpt/modelo_numpy.py: volta da atenção</span>",
        "vbar = A.transpose(0, 1, 3, 2) @ zbar",
        "Abar = zbar @ v.transpose(0, 1, 3, 2)",
        "sbar = A * (Abar - (A * Abar).sum(-1, keepdims=True))",
        "qbar = sbar @ k / np.sqrt(dh)",
        "kbar = sbar.transpose(0, 1, 3, 2) @ q / np.sqrt(dh)",
      ], { x: 72, y: 170 });
      cod.style.fontSize = "24px";
      const pior = c.rot("Conferido por diferenças finitas: pior erro relativo ≈ 3 × 10⁻⁶", { x: 72, y: 376, w: 860, fs: 24 });
      const g = eixos(c, { x: 1100, y: 180, w: 720, h: 420, xmin: 0, xmax: meta.passos, ymin: 1.2, ymax: 4, marcasY: [1.5, 2, 2.5, 3, 3.5], rotY: (v) => fmt(v, 1), marcasX: [0, 2000, 4000, 6000] });
      const curva = g.serie(meta.curva.map((p) => [p.passo, p.validacao]), { cor: COR.vd });
      const big = c.path(`M1100 ${g.Y(meta.perda_bigrama)}H1820`, { cor: COR.vm, esp: 2, dash: "7 5" });
      const fim = meta.curva.at(-1), ini = meta.curva[0];
      const vals = [
        c.rot(`início: ${fmt(ini.validacao, 2)}`, { x: g.X(0) + 30, y: g.Y(ini.validacao) - 10, cor: COR.vd, fs: 24 }),
        c.rot(`bigramas: ${fmt(meta.perda_bigrama, 2)}`, { x: 1560, y: g.Y(meta.perda_bigrama) - 34, cor: COR.vm, fs: 24 }),
        c.rot(`validação final: ${fmt(fim.validacao, 2)}`, { x: 1500, y: g.Y(fim.validacao) - 40, cor: COR.vd, fs: 24 }),
      ];
      const ficha = c.tabela(["Ficha técnica", ""], [["Parâmetros", meta.n_parametros.toLocaleString("pt-BR")], ["Blocos · cabeças · d", `${meta.L} · ${meta.h} · ${meta.d}`], ["Contexto", `${meta.T} caracteres`], ["Corpus", "812 mil caracteres, Machado de Assis"], ["Treino", `${meta.passos} passos, cerca de 24 min de CPU`]], { x: 72, y: 450, w: 880, num: [1] });
      return { cod, pior, g, curva, big, vals, ficha };
    },
    passos: [
      (c, r) => { c.entra(r.cod, { dur: DUR.curta }); r.cod.linhas.slice(3).forEach((l, i) => { l.classList.add("marca"); c.muda(l, { opacity: 0.3 }, { opacity: 1 }, { dur: DUR.curta, delay: 300 + i * 250 }); }); c.entra(r.pior, { delay: 1000 }); },
      (c, r) => { c.entra(r.g.partes, { dur: DUR.curta }); c.traca(r.curva, { dur: DUR.longa * 2, delay: 200 }); c.traca(r.big, { dur: DUR.curta, delay: 300 }); c.entra(r.ficha, { delay: 400 }); r.ficha.linhas.forEach((l, i) => c.entra(l, { dur: DUR.curta, delay: 400 + i * 150 })); },
      (c, r) => c.entra(r.vals, { dur: DUR.curta, stag: 300 }),
      (c) => c.demo("demos/04-mini-gpt/?cena=C08-S03&apresentador=a3", "demo-04-treino.png"),
      (c) => { c.demo(null); c.carimbar("a4"); },
    ],
  },
};

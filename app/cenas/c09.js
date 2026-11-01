// Capítulo C09: inferência. As demos cuidam da geração, da amostragem e do KV cache.
import { COR, DUR } from "../motor/cena.js";

export default {
  "C09-S01": {
    montar(c) {
      c.titulo("Gerar é prever, sortear e repetir");
      const n = [["Contexto", 150, 300], ["Modelo", 620, 300], ["Distribuição", 620, 620], ["Amostra", 150, 620]];
      const cx = n.map(([t, x, y]) => c.caixa(t, x, y, 300, 110, { fs: 36 }));
      const set = [
        c.seta("M450 355H616", { esp: 3 }), c.seta("M770 410V616", { esp: 3 }),
        c.seta("M620 675H454", { esp: 3 }), c.seta("M300 620V414", { esp: 3, cor: COR.az }),
      ];
      const ctx = c.txt("o homem", { cl: "t-mono", x: 170, y: 190, fs: 30 });
      const passos = [" que", " era", " um"];
      const novos = passos.map((t, i) => c.txt(t, { cl: "t-mono", x: 170 + 126 + i * 72 + (i ? 10 : 0), y: 190, fs: 30, cor: COR.az }));
      const cod = c.codigo([
        "<span class='cm'># laço autorregressivo</span>",
        "while not parar(ids):",
        "    logits = modelo(ids)[-1]",
        "    p = softmax(logits / T)",
        "    ids.append(sortear(p))",
      ], { x: 1040, y: 320 });
      const n1 = c.rot("No treino, tínhamos a resposta certa.<br>Agora, cada token depende do anterior.", { x: 1040, y: 590, w: 800, fs: 26 });
      const n2 = c.rot("A saída é uma distribuição, não uma resposta pronta.", { x: 1040, y: 680, w: 800, fs: 26 });
      return { cx, set, ctx, novos, cod, n1, n2 };
    },
    passos: [
      (c, r) => { c.entra([r.ctx, r.cx[0]], { dur: DUR.curta }); c.traca(r.set[0], { dur: DUR.curta, delay: 200 }); c.entra(r.cx[1], { dur: DUR.curta, delay: 400 }); c.traca(r.set[1], { dur: DUR.curta, delay: 500 }); c.entra(r.cx[2], { dur: DUR.curta, delay: 700 }); c.traca(r.set[2], { dur: DUR.curta, delay: 800 }); c.entra(r.cx[3], { dur: DUR.curta, delay: 1000 }); c.traca(r.set[3], { dur: DUR.curta, delay: 1100 }); },
      (c, r) => { r.novos.forEach((n, i) => { c.entra(n, { dur: DUR.curta, delay: i * 500 }); c.som("amostraToken", i * 500); }); c.entra([r.cod, r.n1, r.n2], { delay: 300, stag: 300 }); },
    ],
  },

  "C09-S02": {
    montar() { return {}; },
    passos: [(c) => c.demo("demos/04-mini-gpt/", "demo-04-mini-gpt.png")],
  },

  "C09-S03": {
    montar() { return {}; },
    passos: [(c) => c.demo("demos/05-amostragem-kv-cache/", "demo-05-amostragem.png")],
  },

  "C09-S04": {
    montar() { return {}; },
    passos: [(c) => c.demo("demos/05-amostragem-kv-cache/?cena=C09-S04", "demo-05-amostragem.png")],
  },
};

// Capítulo C11: famílias e aplicações.
import { gerador } from "../../demos/01-self-attention/atencao.js";
import { COR, DUR } from "../motor/cena.js";
import { eixos, planta } from "./_util.js";

const SO_ENC = ["emb2", "mask", "cross", "ffn2", "saida"];
const SO_DEC = ["emb", "self", "ffn", "cross"];

export default {
  "C11-S01": {
    montar(c) {
      c.titulo("Modelos de uma mesma linha de projeto");
      const esc = 0.72;
      const fam = [
        ["BERT · 2018", SO_ENC, 72, "só encoder · bidirecional · masked LM", "representação: busca, classificação, extração"],
        ["GPT · 2018 a 2020", SO_DEC, 680, "só decoder · máscara causal · próximo token", "GPT-3: 175 bilhões de parâmetros"],
        ["T5 · 2019", [], 1288, "encoder e decoder · texto para texto", "tradução, resumo e classificação, com prefixo na entrada"],
      ];
      return fam.map(([nome, tr, x, a, b]) => {
        const p = planta(c, { x, y: 180, esc: 0.72, tracejar: tr, rotulos: { emb: "Embedding", emb2: "Embedding", self: "Self-attention", mask: "Mascarada", cross: "Cross", saida: "Saída" } });
        return { p, nome: c.sub(nome, { x, y: 160 }), a: c.rot(a, { x, y: 660, w: 540, fs: 24 }), b: c.txt(b, { x, y: 730, w: 540, fs: 26 }), esc };
      });
    },
    passos: [0, 1, 2].map((i) => (c, r) => {
      c.entra([r[i].nome, r[i].p.tudo], { dur: DUR.media });
      c.som("tokenEntra");
      c.entra([r[i].a, r[i].b], { dur: DUR.curta, delay: 400, stag: 150 });
    }),
  },

  "C11-S02": {
    montar(c) {
      c.titulo("O que vira token em cada domínio");
      const X = [72, 680, 1288], W = 540;
      const nomes = ["ViT: visão", "Whisper: áudio", "AlphaFold 2: proteínas"];
      const cab = nomes.map((n, i) => c.sub(n, { x: X[i], y: 165 }));
      // Imagem em blocos de 16 × 16, em traço
      const img = [c.ret(X[0] + 90, 225, 320, 240, { esp: 2 })];
      const cortes = [];
      for (let k = 1; k < 4; k++) cortes.push(c.path(`M${X[0] + 90 + 80 * k} 225V465`, { cor: COR.az, esp: 2 }));
      for (let k = 1; k < 3; k++) cortes.push(c.path(`M${X[0] + 90} ${225 + 80 * k}H${X[0] + 410}`, { cor: COR.az, esp: 2 }));
      // Espectrograma em hachura
      const g = gerador(5);
      const esp = [];
      for (let i = 0; i < 26; i++) for (let j = 0; j < 12; j++) esp.push(c.ret(X[1] + 20 + i * 19, 225 + j * 20, 18, 19, { fill: COR.ti, cor: "none", esp: 0, op: 0.08 + 0.75 * g.uniforme() * (1 - j / 16) }));
      const cortesA = [1, 2, 3, 4].map((k) => c.path(`M${X[1] + 20 + k * 95} 225V465`, { cor: COR.az, esp: 2 }));
      // Cadeia de resíduos
      const pts = Array.from({ length: 14 }, (_, i) => [X[2] + 40 + i * 34, 345 + 90 * Math.sin(i * 0.9)]);
      const cadeia = c.path(pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(""), { esp: 2.5 });
      const nos = pts.map(([x, y]) => c.circ(x, y, 7, { fill: COR.pa, cor: COR.az, esp: 2.5 }));
      const linhas = [
        ["blocos de 16 × 16, projetados linearmente", "Encoder, com token de classificação", "classe da imagem"],
        ["espectrograma log-Mel de 80 canais, com duas camadas convolucionais", "Encoder e decoder", "texto"],
        ["sequência e alinhamentos", "Evoformer, Invariant Point Attention e módulo de estrutura", "coordenadas 3D"],
      ];
      const fluxo = linhas.map(([t, m, s], i) => {
        const x = X[i];
        return [
          c.rot(t, { x, y: 490, w: W, fs: 22 }),
          c.caixa(m, x, 590, W, 96, { fs: 28 }),
          c.seta(`M${x + W / 2} 560V586`, { esp: 2 }),
          c.seta(`M${x + W / 2} 686V728`, { esp: 2, cor: COR.vd }),
          c.txt(s, { cl: "t-sub", x, y: 736, w: W, al: "center", cor: COR.vd }),
        ];
      });
      const nota = c.nota("AlphaFold 2 não é um Transformer genérico: usa atenção em módulos próprios do domínio.", { x: 1288, y: 800, w: 560, fs: 22 });
      return { cab, img, cortes, esp, cortesA, cadeia, nos, fluxo, nota };
    },
    passos: [
      (c, r) => { c.entra([r.cab[0], r.img], { dur: DUR.curta }); c.traca(r.cortes, { dur: DUR.curta, delay: 200, stag: 60 }); c.som("tokenEntra", 300); c.entra(r.fluxo[0].filter((n) => !(n instanceof SVGElement)), { delay: 600 }); c.traca(r.fluxo[0].filter((n) => n instanceof SVGElement), { dur: DUR.curta, delay: 700 }); },
      (c, r) => { c.entra(r.cab[1], { dur: DUR.curta }); c.entra(r.esp, { dur: DUR.curta }); c.traca(r.cortesA, { dur: DUR.curta, delay: 300, stag: 60 }); c.som("tokenEntra", 400); c.entra(r.fluxo[1].filter((n) => !(n instanceof SVGElement)), { delay: 600 }); c.traca(r.fluxo[1].filter((n) => n instanceof SVGElement), { dur: DUR.curta, delay: 700 }); },
      (c, r) => { c.entra(r.cab[2], { dur: DUR.curta }); c.traca(r.cadeia, { dur: DUR.media }); c.entra(r.nos, { dur: DUR.micro, delay: 300, stag: 25 }); c.som("tokenEntra", 400); c.entra(r.fluxo[2].filter((n) => !(n instanceof SVGElement)), { delay: 600 }); c.traca(r.fluxo[2].filter((n) => n instanceof SVGElement), { dur: DUR.curta, delay: 700 }); c.entra(r.nota, { delay: 1000 }); },
    ],
  },

  "C11-S03": {
    montar(c) {
      c.titulo("Código, várias mídias e leis de escala");
      const cod = c.codigo(["def soma_pares(nums):", "    return sum(n for n in nums", "               if n % 2 == 0)"], { x: 72, y: 215 });
      cod.linhas.slice(1).forEach((l) => { l.style.color = COR.az; l.style.visibility = "hidden"; });
      const tc = [c.sub("Modelos de código", { x: 72, y: 165 }), c.rot("Codex: GPT treinado em repositórios públicos. Exemplo ilustrativo.", { x: 72, y: 340, w: 840 })];
      const tm = [c.sub("Modelos multimodais", { x: 72, y: 450 }), c.rot("CLIP liga imagem e texto; o GPT-4 aceita imagens e texto como entrada.", { x: 72, y: 780, w: 840 })];
      const quadro = c.ret(120, 520, 260, 220, { esp: 2 });
      const des = c.path("M150 700L225 590L285 660L325 620L360 700z", { esp: 2, cor: COR.gr });
      const frase = c.peca("um gato sobre o muro", { x: 560, y: 600, cl: "azul" });
      const liga = c.cota(380, 560, 630, 0.3, { alt: 80, cor: COR.az });
      const g = eixos(c, { x: 1090, y: 220, w: 720, h: 440, xmin: 7, xmax: 11, ymin: 1.5, ymax: 8, marcasX: [7, 8, 9, 10, 11], rotX: (v) => `10${{ 7: "⁷", 8: "⁸", 9: "⁹", 10: "¹⁰", 11: "¹¹" }[v]}`, marcasY: [2, 4, 8], rotY: (v) => String(v), fy: Math.log10 });
      const pts = Array.from({ length: 21 }, (_, i) => { const e = 7 + (i * 4) / 20; return [e, (8.8e13 / 10 ** e) ** 0.076]; });
      const reta = g.serie(pts, { cor: COR.vd });
      const tit = c.sub("Perda × parâmetros (log-log)", { x: 1090, y: 165 });
      const eq = c.eq("L(N)=(N_c/N)^{\\alpha_N},\\quad \\alpha_N\\approx 0{,}076", { x: 1090, y: 710, fs: 30 });
      const fonte = c.rot("Ajuste de Kaplan et al. (2020), redesenhado a partir da equação publicada.", { x: 1090, y: 760, w: 740, fs: 20 });
      const ch = c.txt("Chinchilla: dobrar o modelo pede dobrar os tokens de treino.", { x: 1090, y: 840, w: 740, fs: 26 });
      const emp = c.nota("Relações empíricas, não leis da natureza.", { x: 72, y: 880, fs: 24 });
      return { cod, tc, tm, quadro, des, frase, liga, g, reta, tit, eq, fonte, ch, emp };
    },
    passos: [
      (c, r) => { c.entra([r.tc[0], r.cod, r.tc[1]], { dur: DUR.curta, stag: 150 }); r.cod.linhas.slice(1).forEach((l, i) => { c.entra(l, { dur: DUR.curta, delay: 500 + i * 400 }); c.som("amostraToken", 500 + i * 400); }); },
      (c, r) => { c.entra([r.tm[0], r.quadro, r.frase, r.tm[1]], { dur: DUR.curta, stag: 100 }); c.traca(r.des, { dur: DUR.media, delay: 100 }); c.traca(r.liga, { dur: DUR.media, delay: 500 }); },
      (c, r) => { c.entra([r.tit, r.g.partes], { dur: DUR.curta }); c.traca(r.reta, { dur: DUR.longa, delay: 300 }); c.entra([r.eq, r.fonte], { delay: 1000, stag: 200 }); c.entra([r.ch, r.emp], { delay: 1500, stag: 250 }); },
    ],
  },
};

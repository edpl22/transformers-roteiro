// Capítulo C13: síntese e referências.
import { COR, DUR } from "../motor/cena.js";
import { planta } from "./_util.js";

const REFS = [
  ["Fontes primárias", [
    "VASWANI, A. et al. Attention is all you need. NeurIPS, 2017.",
    "BAHDANAU, D.; CHO, K.; BENGIO, Y. Neural machine translation by jointly learning to align and translate. ICLR, 2015.",
    "DEVLIN, J. et al. BERT. NAACL, 2019.",
    "RADFORD, A. et al. Improving language understanding by generative pre-training. OpenAI, 2018.",
    "RADFORD, A. et al. Language models are unsupervised multitask learners. OpenAI, 2019.",
    "BROWN, T. B. et al. Language models are few-shot learners. NeurIPS, 2020.",
    "DOSOVITSKIY, A. et al. An image is worth 16x16 words. ICLR, 2021.",
    "KAPLAN, J. et al. Scaling laws for neural language models. arXiv, 2020.",
    "JUMPER, J. et al. Highly accurate protein structure prediction with AlphaFold. Nature, v. 596, 2021.",
    "DAO, T. et al. FlashAttention. NeurIPS, 2022.",
  ]],
  ["Material didático", [
    "JURAFSKY, D.; MARTIN, J. H. Speech and language processing. 3. ed., rascunho, 2026.",
    "RUSH, A. The annotated transformer. NLP-OSS, 2018.",
  ]],
];

export default {
  "C13-S01": {
    montar(c) {
      c.titulo("O desenho de conjunto");
      const nums = { emb: "03 · 06", emb2: "03 · 06", self: "04 · 05", ffn: "07", mask: "07", cross: "07", ffn2: "07", saida: "09" };
      const x = 90, y = 160;
      const p = planta(c, { x, y, esc: 1.08, rotulos: {} });
      const pos = { emb: [0, 560], emb2: [400, 560], self: [0, 320], ffn: [0, 200], mask: [400, 400], cross: [400, 280], ffn2: [400, 160], saida: [400, 40] };
      const marcas = Object.entries(nums).map(([k, v]) => c.rot(`pr. ${v}`, { x: x + pos[k][0] * 1.08, y: y + pos[k][1] * 1.08 - 26, fs: 18, cor: COR.az }));
      const lista = ["Tokens e embeddings", "Posição", "Atenção com várias cabeças", "Residuais, norma e FFN", "Máscara causal", "Próximo token ou masked LM", "Geração por amostragem"];
      const itens = lista.map((t, i) => c.txt(t, { cl: "t-sub", x: 980, y: 170 + i * 58, fs: 34 }));
      const fluxo = c.seta(`M${x + 173 * 1.08} ${y + 700}L${x + 173 * 1.08} ${y + 670}`, { cor: COR.az, esp: 4 });
      const tese = c.txt("A representação de um token depende do contexto: um Transformer calcula, em paralelo, quanto cada posição deve aproveitar de todas as outras, e aprende esses pesos otimizando a previsão de tokens.", { x: 980, y: 600, w: 860, fs: 33 });
      const cod = c.rot("Tudo o que apareceu na tela tem código e testes no repositório.", { x: 980, y: 860, w: 860, fs: 24 });
      return { p, marcas, itens, fluxo, tese, cod };
    },
    passos: [
      (c, r) => { r.p.caixas.forEach((b, i) => { c.entra(b, { dur: DUR.curta, delay: i * 180 }); c.entra(r.marcas[i], { dur: DUR.curta, delay: i * 180 }); c.som("tokenEntra", i * 180); }); c.entra(r.itens, { dur: DUR.curta, stag: 180 }); },
      (c, r) => { c.traca([r.p.setas.enc, r.p.setas.dec, r.p.setas.ponte], { dur: DUR.curta, stag: 120 }); c.entra(r.p.molduras, { dur: DUR.curta, delay: 700 }); c.traca(r.fluxo, { dur: DUR.curta }); },
      (c, r) => c.entra([r.tese, r.cod], { stag: 500 }),
    ],
  },

  "C13-S02": {
    montar(c) {
      c.titulo("Referências");
      let y = 165;
      const blocos = REFS.map(([tit, itens]) => {
        const b = [c.txt(tit, { cl: "t-sub", x: 72, y, fs: 30 })];
        y += 44;
        for (const it of itens) {
          b.push(c.txt(it, { cl: "t-texto", x: 72, y, w: 1220, fs: 23 }));
          y += it.length > 105 ? 66 : 36;
        }
        y += 16;
        return b;
      });
      const nomes = c.dados.pessoas.map((p, i) => [c.txt(p.nome, { cl: "t-sub", x: 1340, y: 170 + i * 92, fs: 32 }), c.rot(p.papel, { x: 1340, y: 210 + i * 92 })]);
      const lic = c.rot("Lista completa em roteiro/10-referencias.md.<br>Fontes: Barlow, IBM Plex Mono (OFL).<br>Equações: KaTeX (MIT).<br>Corpus: Machado de Assis, domínio público.", { x: 1340, y: 570, w: 510, fs: 20 });
      const ob = c.txt("Obrigado.", { cl: "t-titulo", x: 1340, y: 760, fs: 72, cor: COR.az });
      return { blocos, nomes, lic, ob };
    },
    passos: [
      (c, r) => { c.som("transicaoCapitulo"); r.blocos.forEach((b, i) => c.entra(b, { dur: DUR.curta, delay: i * 400, stag: 40 })); },
      (c, r) => { c.entra(r.nomes, { dur: DUR.curta, stag: 120 }); c.entra(r.lic, { delay: 600 }); c.entra(r.ob, { delay: 900 }); },
    ],
  },
};

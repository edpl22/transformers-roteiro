// Capítulo C04: self-attention. Todos os números vêm de demos/01-self-attention/atencao.js.
import { fmt } from "../../demos/_comum/prancha.js";
import { EXEMPLO_MAO, atencao } from "../../demos/01-self-attention/atencao.js";
import { FRASES, matrizes } from "../../demos/01-self-attention/frases.js";
import { COR, DUR } from "../motor/cena.js";

const FORMULA = "\\mathrm{Attention}(Q,K,V)=\\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V";
const { tokens, Q, K, V } = EXEMPLO_MAO;
const R = atencao(Q, K, V);

export default {
  "C04-S01": {
    montar(c) {
      c.titulo("Cada token pondera todos os outros");
      const frase = FRASES[0];
      const m = matrizes(frase);
      const a = atencao(m.Q, m.K, m.V);
      const p = c.frase(frase, { x0: 200, x1: 1720, y: 470 });
      const i = 1;
      p[i].classList.add("azul");
      const finas = p.map((q) => c.cota(p[i].cx, q.cx, 462, 0, { alt: 240 }));
      const pesos = a.A[i];
      const zv = c.vetor([0.65, 0.09], { x: p[i].cx - 40, y: 560, cor: COR.vd, lado: 34 });
      const zr = c.eq("z_{\\text{banco}}", { x: p[i].cx + 50, y: 562, fs: 30, cor: COR.vd });
      const form = c.eq("z_i=\\sum_j \\alpha_{ij}\\,v_j", { x: 72, y: 720, fs: 44 });
      const rot = c.rot("A mesma receita de Bahdanau, agora dentro da própria frase.", { x: 480, y: 738, fs: 26 });
      const lim = c.nota("Limites da metáfora: aqui o vetor muda de fato,<br>e peso alto não prova compreensão.", { x: 72, y: 840, fs: 26 });
      return { p, finas, pesos, zv, zr, form, rot, lim };
    },
    passos: [
      (c, r) => { c.entra(r.p, { dur: DUR.curta, stag: 110 }); r.p.forEach((_, k) => c.som("tokenEntra", k * 110)); },
      (c, r) => c.traca(r.finas, { stag: 90 }),
      (c, r) => { r.finas.forEach((f, k) => c.esp(f, 0.75, 0.75 + 20 * r.pesos[k], { dur: DUR.longa })); c.som("softmaxNormaliza", 600); c.entra([r.zv, r.zr], { delay: 900 }); c.entra([r.form, r.rot], { delay: 1200 }); },
      (c, r) => c.entra(r.lim),
    ],
  },

  "C04-S02": {
    montar(c) {
      c.titulo("Três projeções do mesmo vetor");
      const X = [[0.8, 0.2, 0.5, 0.1], [0.3, 0.9, 0.2, 0.6], [0.1, 0.4, 0.7, 0.3]];
      const fileira = (x, y, cor, sem) => X.map((l, i) => c.vetor(l.map((v, j) => ((v * (sem + j + 1)) % 1) * 0.8 + 0.15), { x, y: y + i * 42, cor, lado: 30 }));
      const xm = fileira(120, 400, COR.ti, 0);
      const rotX = [c.eq("X", { x: 190, y: 340, fs: 40 }), c.rot("n × d<sub>model</sub>", { x: 140, y: 540 })];
      const W = [["W^Q", COR.az, 210], ["W^K", COR.vm, 430], ["W^V", COR.oc, 650]];
      const setas1 = W.map(([, cor, y]) => c.seta(`M300 460C500 460 500 ${y} 760 ${y}`, { cor, esp: 3 }));
      const wb = W.map(([t, cor, y]) => { const b = c.caixa("", 760, y - 44, 120, 88, { cl: cor === COR.az ? "azul" : cor === COR.vm ? "verm" : "ocre" }); return [b, c.eq(t, { x: 792, y: y - 26, fs: 32, cor })]; });
      const setas2 = W.map(([, cor, y]) => c.seta(`M884 ${y}H1120`, { cor, esp: 3 }));
      const mQ = fileira(1130, 150, COR.az, 2.3), mK = fileira(1130, 372, COR.vm, 3.7), mV = fileira(1130, 594, COR.oc, 5.1);
      const eqs = [c.eq("Q=XW^Q", { x: 1340, y: 180, fs: 30, cor: COR.az }), c.eq("K=XW^K", { x: 1340, y: 402, fs: 30, cor: COR.vm }), c.eq("V=XW^V", { x: 1340, y: 624, fs: 30, cor: COR.oc })];
      const anal = [c.sub("consulta: o que procuro", { x: 1340, y: 226, fs: 30, cor: COR.az }), c.sub("chave: o que cada ficha oferece", { x: 1340, y: 448, fs: 30, cor: COR.vm }), c.sub("valor: o conteúdo usado", { x: 1340, y: 670, fs: 30, cor: COR.oc })];
      const foco = [150, 372, 594].map((y) => c.ret(1122, y + 40, 164, 42, { cor: COR.ti, esp: 3 }));
      const focoX = c.ret(112, 440, 164, 42, { cor: COR.ti, esp: 3 });
      const dif = c.txt("Em vez de pegar uma ficha, tomamos um pouco de todas.", { cl: "t-sub", x: 72, y: 830, w: 1776, al: "center" });
      return { xm, rotX, setas1, setas2, wb, mQ, mK, mV, eqs, anal, foco, focoX, dif };
    },
    passos: [
      (c, r) => c.entra([r.xm, r.rotX], { dur: DUR.curta, stag: 40 }),
      (c, r) => { [0, 1, 2].forEach((i) => { const d = i * 500; c.traca(r.setas1[i], { dur: DUR.media, delay: d }); c.entra(r.wb[i], { dur: DUR.curta, delay: d + 400 }); c.som("multiplicaMatriz", d + 300); }); },
      (c, r) => { [0, 1, 2].forEach((i) => { const d = i * 300; c.traca(r.setas2[i], { dur: DUR.curta, delay: d }); c.entra([[r.mQ, r.mK, r.mV][i], r.eqs[i]], { dur: DUR.media, delay: d + 200, stag: 60 }); c.entra(r.anal[i], { delay: d + 500 }); }); },
      (c, r) => { c.traca([r.focoX, r.foco], { dur: DUR.curta, stag: 100 }); c.entra(r.dif, { delay: 500 }); },
    ],
  },

  "C04-S03": {
    montar(c) {
      c.titulo("Produto escalar mede alinhamento");
      c.eq(FORMULA, { x: 1160, y: 66, fs: 28, ja: true });
      const O = [320, 700];
      const q = c.seta(`M${O[0]} ${O[1]}L620 420`, { cor: COR.az, esp: 4 });
      const k1 = c.seta(`M${O[0]} ${O[1]}L680 480`, { cor: COR.vm, esp: 4 });
      const k2 = c.seta(`M${O[0]} ${O[1]}L640 860`, { cor: COR.vm, esp: 4 });
      const rots = [c.eq("q", { x: 630, y: 380, fs: 34, cor: COR.az }), c.eq("k_1", { x: 690, y: 464, fs: 30, cor: COR.vm }), c.eq("k_2", { x: 650, y: 850, fs: 30, cor: COR.vm })];
      const arco = c.path("M440 588A170 170 0 0 1 462 610", { cor: COR.ti, esp: 2 });
      const rq = [c.rot("alinhados: pontuação alta", { x: 700, y: 510, w: 240 }), c.rot("quase ortogonais: pontuação baixa", { x: 200, y: 900 })];
      const def = c.eq("q\\cdot k=\\sum_i q_ik_i=\\lVert q\\rVert\\lVert k\\rVert\\cos\\theta", { x: 980, y: 190, fs: 36 });
      const qg = Q[1], kd = K[2];
      const contaT = c.eq(`q_{\\text{gato}}\\cdot k_{\\text{dorme}}=${qg.map((v, i) => `${v}\\cdot${kd[i]}`).join("+")}=5`, { x: 980, y: 310, fs: 32 });
      const QM = c.mat(Q, { x: 980, y: 480, cor: "q" });
      const KT = c.mat(K[0].map((_, j) => K.map((l) => l[j])), { x: 1200, y: 460, cor: "k" });
      const rotQ = [c.eq("Q", { x: 1050, y: 430, fs: 28, cor: COR.az }), c.eq("K^{\\top}", { x: 1240, y: 410, fs: 28, cor: COR.vm }), c.eq("QK^{\\top}", { x: 1500, y: 430, fs: 28 })];
      const S = c.mat(R.pontuacao, { x: 1480, y: 480 });
      const lq = c.ret(976, 517, 160, 36, { cor: COR.az, esp: 3 });
      const lk = c.ret(1275, 456, 32, 146, { cor: COR.vm, esp: 3 });
      const fim = c.rot("todos os pares de uma vez, com rotinas de matrizes muito otimizadas", { x: 980, y: 680, w: 860 });
      return { q, k1, k2, rots, arco, rq, def, contaT, QM, KT, rotQ, S, lq, lk, fim };
    },
    passos: [
      (c, r) => { c.traca([r.q, r.k1, r.k2], { dur: DUR.media, stag: 150 }); c.entra(r.rots, { dur: DUR.curta, delay: 700 }); c.traca(r.arco, { dur: DUR.curta, delay: 800 }); c.entra(r.rq, { delay: 1000 }); c.entra(r.def, { delay: 1100 }); },
      (c, r) => c.entra(r.contaT),
      (c, r) => { c.entra([r.QM, r.KT, r.rotQ], { dur: DUR.curta }); c.traca([r.lq, r.lk], { dur: DUR.curta, delay: 300 }); c.entra(r.S, { delay: 700 }); c.som("multiplicaMatriz", 500); c.entra(r.fim, { delay: 900 }); },
    ],
  },

  "C04-S04": {
    montar(c) {
      c.titulo("Por que dividir por √d_k");
      const y = [220, 420, 620];
      const linhas = [
        ["1", "q_i,\\,k_i\\ \\text{independentes, média } 0,\\ \\text{variância } 1", "hipótese do artigo"],
        ["2", "q\\cdot k=\\sum_{i=1}^{d_k}q_ik_i\\ \\Rightarrow\\ \\mathrm{Var}(q\\cdot k)=d_k", "cada termo tem variância 1"],
        ["3", "\\mathrm{Var}\\!\\left(\\frac{q\\cdot k}{\\sqrt{d_k}}\\right)=1", "a escala das pontuações deixa de depender de d_k"],
      ];
      return linhas.map(([n, e, t], i) => [
        c.txt(n, { cl: "t-titulo", x: 72, y: y[i], cor: COR.gr }),
        c.eq(e, { x: 150, y: y[i] + 4, fs: 38 }),
        c.rot(t, { x: 150, y: y[i] + 92, fs: 26 }),
      ]);
    },
    passos: [
      (c, r) => c.entra(r[0], { stag: 100 }),
      (c, r) => c.entra(r[1], { stag: 100 }),
      (c, r) => c.entra(r[2], { stag: 100 }),
      (c) => { c.demo("demos/01-self-attention/?aba=escala&cena=C04-S04", "demo-01-escala.png"); },
    ],
  },

  "C04-S05": {
    montar(c) {
      c.titulo("A fórmula completa");
      const eqTudo = c.eq(FORMULA, { x: 330, y: 300, fs: 64 });
      const partes = [
        ["\\mathrm{softmax}", "pesos por linha, somam 1", 640, COR.az],
        ["QK^{\\top}", "compatibilidade", 1060, COR.ti],
        ["\\sqrt{d_k}", "escala", 1370, COR.ti],
        ["V", "média dos valores", 1560, COR.oc],
      ].map(([e, t, x, cor]) => [c.eq(e, { x, y: 640, fs: 40, cor }), c.rot(t, { x, y: 720, fs: 26 })]);
      const cotas = [[1180, 636, 780], [1450, 636, 1130], [1470, 636, 1410], [1630, 636, 1600]].map(([a, b, d]) => c.path(`M${a} 460C${a} 560 ${d} 520 ${d} ${b}`, { cor: COR.gr, esp: 1.5 }));
      return { eqTudo, partes, cotas };
    },
    passos: [
      (c, r) => { c.entra(r.eqTudo); c.som("softmaxNormaliza", 300); },
      (c, r) => { c.traca(r.cotas, { dur: DUR.media, stag: 150 }); c.entra(r.partes, { dur: DUR.curta, delay: 300, stag: 150 }); },
    ],
  },

  "C04-S06": {
    montar(c) {
      c.titulo("Três tokens, uma conta no papel");
      c.eq(FORMULA, { x: 1160, y: 66, fs: 28, ja: true });
      const rotulos = [c.rot("linhas", { x: 72, y: 160 }), ...tokens.map((t, i) => c.txt(t, { cl: "t-mono", x: 72, y: 198 + i * 37, fs: 26 }))];
      const e1 = [c.txt("Q: consultas", { cl: "t-rotulo q", x: 200, y: 160 }), c.mat(Q, { x: 200, y: 190, cor: "q", fs: 28 })];
      const e2 = [c.txt("K: chaves", { cl: "t-rotulo k", x: 440, y: 160 }), c.mat(K, { x: 440, y: 190, cor: "k", fs: 28 })];
      const e3 = [c.txt("V: valores", { cl: "t-rotulo v", x: 680, y: 160 }), c.mat(V, { x: 680, y: 190, cor: "v", fs: 28 })];
      const dk = c.eq("d_k=4,\\quad\\sqrt{d_k}=2", { x: 880, y: 220, fs: 32 });
      const nota = c.nota("Números escolhidos para a conta caber na tela; não são pesos aprendidos.", { x: 880, y: 280, fs: 22 });
      const col = [72, 500, 950, 1450];
      const etapa = (i, eq, M, casas, cor) => [c.eq(eq, { x: col[i], y: 370, fs: 32 }), c.mat(M, { x: col[i], y: 470, casas, cor, fs: 30 })];
      const et = [
        etapa(0, "QK^{\\top}", R.pontuacao, 0),
        etapa(1, "\\dfrac{QK^{\\top}}{2}", R.escalada, 2),
        etapa(2, "A=\\mathrm{softmax}(\\cdot)", R.A, 3),
        etapa(3, "Z=AV", R.Z, 3, "z"),
      ];
      const somas = R.A.map((l, i) => c.rot(`= ${fmt(l.reduce((a, b) => a + b, 0), 0)}`, { x: 1330, y: 479 + i * 39, fs: 26 }));
      const conta = c.eq("z_{\\text{gato}}=0{,}067\\,(1,0)+0{,}111\\,(0,1)+0{,}821\\,(1,1)=(0{,}889;\\ 0{,}933)", { x: 72, y: 660, fs: 32, cor: COR.vd });
      const linhaG = c.ret(66, 512, 150, 42, { cor: COR.az, esp: 3 });
      const p = c.frase(tokens, { x0: 1000, x1: 1820, y: 880 });
      p[1].classList.add("azul");
      const pes = R.A[1];
      const cotas = p.map((q, j) => c.cota(p[1].cx, q.cx, 872, pes[j] * 0.7, { alt: 110 }));
      const fim = c.rot("Cada linha de pesos soma 1, e a saída de cada token mistura os demais.", { x: 72, y: 760, w: 880, fs: 26 });
      return { rotulos, e1, e2, e3, dk, nota, et, somas, conta, linhaG, p, cotas, fim };
    },
    passos: [
      (c, r) => { c.entra([r.rotulos, r.e1, r.e2, r.e3], { dur: DUR.curta, stag: 40 }); c.entra([r.dk, r.nota], { delay: 500, stag: 150 }); c.som("tokenEntra"); },
      (c, r) => { c.entra(r.et[0], { stag: 200 }); c.traca(r.linhaG, { dur: DUR.media }); c.som("multiplicaMatriz", 200); },
      (c, r) => { c.sai(r.linhaG, { dur: DUR.micro }); c.entra(r.et[1], { stag: 200 }); },
      (c, r) => { c.entra(r.et[2], { stag: 200 }); c.entra(r.somas, { dur: DUR.curta, delay: 500, stag: 80 }); c.som("softmaxNormaliza", 300); },
      (c, r) => { c.entra(r.conta, { dur: DUR.media }); c.entra(r.et[3], { delay: 500, stag: 200 }); },
      (c, r) => { c.entra(r.p, { dur: DUR.curta }); c.traca(r.cotas, { delay: 150, stag: 150 }); c.entra(r.fim, { delay: 600 }); },
    ],
  },

  "C04-S07": {
    montar(c) {
      c.titulo("Poucas linhas de código, testadas");
      const cod = c.codigo([
        "<span class='cm'>// demos/01-self-attention/atencao.js</span>",
        "export function atencao(Q, K, V, { mascara = null, escalar = true } = {}) {",
        "  const dk = K[0].length;",
        "  const pontuacao = matmul(Q, transposta(K));",
        "  const escalada = pontuacao.map((l) =&gt; l.map((s) =&gt; (escalar ? s / Math.sqrt(dk) : s)));",
        "  const mascarada = escalada.map((l, i) =&gt; l.map((s, j) =&gt; (mascara &amp;&amp; !mascara[i][j] ? -Infinity : s)));",
        "  const A = mascarada.map(softmax);",
        "  return { dk, pontuacao, escalada, mascarada, A, Z: matmul(A, V) };",
        "}",
      ], { x: 72, y: 200, fs: 24 });
      cod.style.fontSize = "24px";
      cod.linhas[6].classList.add("marca");
      const t = c.rot("Teste: JS, NumPy, conta escalar e conta à mão coincidem com tolerância de 10⁻¹².", { x: 72, y: 600, fs: 26 });
      return { cod, t };
    },
    passos: [
      (c, r) => c.entra([r.cod, r.t], { stag: 300 }),
      (c) => c.demo("demos/01-self-attention/?aba=frase", "demo-01-frase.png"),
    ],
  },
};

// Desenhos que se repetem em mais de uma cena.
import { COR } from "../motor/cena.js";

export const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Planta do Transformer original. Devolve as caixas por nome, para acender ou preencher partes.
// `tudo` traz caixas, setas e rótulos, para revelar em conjunto. Tamanho nominal: 720 × 640 × esc.
export function planta(c, { x, y, esc = 1, ja = false, tracejar = [], rotulos = {} } = {}) {
  const fs = Math.round(24 * esc);
  const px = (v) => v * esc;
  const caixa = (nome, texto, cx, cy, w, h) => {
    const cl = tracejar.includes(nome) ? "tracejada" : "";
    const b = c.caixa(rotulos[nome] ?? texto, x + px(cx), y + px(cy), px(w), px(h), { ja, fs, cl });
    b.nome = nome;
    return b;
  };
  const p = {
    emb: caixa("emb", "Embedding + posição", 0, 560, 320, 64),
    emb2: caixa("emb2", "Embedding + posição", 400, 560, 320, 64),
    self: caixa("self", "Self-attention + norma", 0, 320, 320, 76),
    ffn: caixa("ffn", "FFN + norma", 0, 200, 320, 76),
    mask: caixa("mask", "Atenção mascarada + norma", 400, 400, 320, 76),
    cross: caixa("cross", "Cross-attention + norma", 400, 280, 320, 76),
    ffn2: caixa("ffn2", "FFN + norma", 400, 160, 320, 76),
    saida: caixa("saida", "Linear + softmax", 400, 40, 320, 64),
  };
  const seta = (x0, y0, x1, y1, o = {}) => c.seta(`M${x + px(x0)} ${y + px(y0)}L${x + px(x1)} ${y + px(y1)}`, { ja, ...o });
  const setas = {
    enc: [seta(160, 560, 160, 396), seta(160, 320, 160, 276)],
    dec: [seta(560, 560, 560, 476), seta(560, 400, 560, 356), seta(560, 280, 560, 236), seta(560, 160, 560, 104)],
    ponte: [c.seta(`M${x + px(160)} ${y + px(200)}C${x + px(160)} ${y + px(130)} ${x + px(340)} ${y + px(180)} ${x + px(400)} ${y + px(318)}`, { ja, cor: COR.vm })],
  };
  const molduraEnc = c.ret(x - px(14), y + px(166), px(348), px(244), { ja, dash: "7 5", cor: COR.gr });
  const molduraDec = c.ret(x + px(386), y + px(126), px(348), px(364), { ja, dash: "7 5", cor: COR.gr });
  const n1 = c.rot("× N", { x: x - px(14), y: y + px(414), ja, fs: Math.max(18, fs - 2) });
  const n2 = c.rot("× N", { x: x + px(386), y: y + px(494), ja, fs: Math.max(18, fs - 2) });
  const caixas = Object.values(p);
  return { ...p, caixas, setas, molduras: [molduraEnc, molduraDec, n1, n2], tudo: [caixas, setas.enc, setas.dec, setas.ponte, molduraEnc, molduraDec, n1, n2] };
}

// Corrente de células de RNN em linha.
export function corrente(c, tokens, { x0, x1, y, lado = 92, ja = false } = {}) {
  const passo = (x1 - x0) / tokens.length;
  const celulas = tokens.map((_, i) => c.caixa("", x0 + passo * i + (passo - lado) / 2, y, lado, lado, { ja, fs: 24 }));
  const palavras = tokens.map((t, i) => c.txt(t, { cl: "t-mono", x: x0 + passo * i, y: y + lado + 14, w: passo, al: "center", ja }));
  const elos = tokens.slice(0, -1).map((_, i) => {
    const a = x0 + passo * i + (passo + lado) / 2, b = x0 + passo * (i + 1) + (passo - lado) / 2;
    return c.seta(`M${a} ${y + lado / 2}L${b - 2} ${y + lado / 2}`, { ja, esp: 3 });
  });
  return { celulas, palavras, elos, passo };
}

// Gráfico simples com eixos; devolve funções de escala e o caminho de uma série.
export function eixos(c, { x, y, w, h, xmin, xmax, ymin, ymax, ja = false, marcasY = [], rotY = (v) => String(v), marcasX = [], rotX = (v) => String(v), fy = (v) => v } = {}) {
  const X = (v) => x + ((v - xmin) / (xmax - xmin)) * w;
  const Y = (v) => y + h - ((fy(v) - fy(ymin)) / (fy(ymax) - fy(ymin))) * h;
  const partes = [c.path(`M${x} ${y}V${y + h}H${x + w}`, { ja, esp: 2 })];
  for (const m of marcasY) {
    partes.push(c.path(`M${x} ${Y(m)}H${x + w}`, { ja, cor: COR.rg, esp: 1 }));
    partes.push(c.rot(rotY(m), { x: x - 90, y: Y(m) - 14, w: 80, al: "right", ja, fs: 20 }));
  }
  for (const m of marcasX) partes.push(c.rot(rotX(m), { x: X(m) - 40, y: y + h + 8, w: 80, al: "center", ja, fs: 20 }));
  const serie = (pts, o = {}) => c.path(pts.map(([a, b], i) => `${i ? "L" : "M"}${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join(""), { esp: 3, ...o });
  return { X, Y, partes, serie };
}

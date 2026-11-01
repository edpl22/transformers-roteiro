// Prova numérica da máscara causal. Rode com: node demos/03-mascara-causal/teste.mjs
import assert from "node:assert/strict";
import { calcular, mudancaPorPosicao } from "./mascara.js";

const A = ["o", "gato", "subiu", "no", "muro", "alto"];
const B = ["o", "gato", "subiu", "no", "telhado", "alto"];   // só a posição 4 muda
const ra = calcular(A), rb = calcular(B);

// 1. Triangular inferior: nada acima da diagonal; cada linha soma 1.
ra.causal.A.forEach((l, i) => {
  l.forEach((p, j) => { if (j > i) assert.equal(p, 0); });
  assert.ok(Math.abs(l.reduce((a, b) => a + b, 0) - 1) < 1e-12);
});
// 2. A primeira posição só vê a si mesma.
assert.equal(ra.causal.A[0][0], 1);
// 3. Bidirecional: em geral, nenhuma célula é nula.
assert.ok(ra.bidirecional.A.flat().every((p) => p > 0));

// 4. Sem vazamento: mudar o token 4 não altera as saídas 0 a 3 com máscara; sem máscara, altera todas.
const dc = mudancaPorPosicao(ra.causal.Z, rb.causal.Z);
const db = mudancaPorPosicao(ra.bidirecional.Z, rb.bidirecional.Z);
for (let i = 0; i < 4; i++) assert.equal(dc[i], 0);
assert.ok(dc[4] > 0 && dc[5] > 0);
assert.ok(db.every((d) => d > 0));

const f = (x) => x.map((v) => v.toFixed(3)).join("  ");
console.log("mudança por posição, causal:      ", f(dc));
console.log("mudança por posição, bidirecional:", f(db));
console.log("OK: máscara causal sem vazamento do futuro");

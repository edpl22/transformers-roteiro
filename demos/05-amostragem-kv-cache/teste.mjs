// Confere amostragem e KV cache. Rode com: node demos/05-amostragem-kv-cache/teste.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MiniGPT } from "../04-mini-gpt/modelo.js";
import { amostrar, distribuicao, filtroTopK, filtroTopP, softmaxTemperatura } from "./amostragem.js";

const perto = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
const soma = (x) => x.reduce((a, b) => a + b, 0);

// Temperatura: T = 1 é o softmax comum; T baixa concentra; T -> 0 é gulosa.
const logits = [2, 1, 0, -1];
const e = logits.map(Math.exp);
softmaxTemperatura(logits, 1).forEach((p, i) => perto(p, e[i] / soma(e)));
assert.ok(softmaxTemperatura(logits, 0.2)[0] > softmaxTemperatura(logits, 1)[0]);
assert.ok(softmaxTemperatura(logits, 5)[0] < softmaxTemperatura(logits, 1)[0]);
assert.deepEqual(softmaxTemperatura(logits, 0), [1, 0, 0, 0]);

// Top-k e top-p: exemplo conferido à mão.
const p = [0.5, 0.3, 0.15, 0.05];
assert.deepEqual(filtroTopK(p, 2), [true, true, false, false]);
assert.deepEqual(filtroTopP(p, 0.5), [true, false, false, false]);   // 0,5 já atinge 0,5
assert.deepEqual(filtroTopP(p, 0.75), [true, true, false, false]);   // 0,5 + 0,3 = 0,8
assert.deepEqual(filtroTopP(p, 0.9), [true, true, true, false]);     // 0,95
const d = distribuicao(logits, { temperatura: 1, topK: 3, topP: 1 });
perto(soma(d.final), 1);
assert.equal(d.final[3], 0);
assert.equal(amostrar([0, 1, 0], 0.5), 1);

// Modelo: inferência em JS bate com NumPy; o KV cache não muda o resultado e reduz o trabalho.
const pesos = JSON.parse(readFileSync(new URL("../04-mini-gpt/pesos.json", import.meta.url), "utf8"));
const fixture = JSON.parse(readFileSync(new URL("../04-mini-gpt/dados/fixture.json", import.meta.url), "utf8"));
const m = new MiniGPT(pesos);

const ids = m.codificar(fixture.prompt);
assert.equal(ids.length, [...fixture.prompt].length);
const { logits: lJS } = m.completo(ids);
let piorNumpy = 0;
fixture.logits_ultimo.forEach((v, i) => { piorNumpy = Math.max(piorNumpy, Math.abs(v - lJS[i])); });
assert.ok(piorNumpy < 1e-6, `JS x NumPy: ${piorNumpy}`);

const N = m.T;
const texto = m.codificar("o homem que a viagem me parecia sem destino, replicou o animal, ainda ");
const seq = Array.from({ length: N }, (_, i) => texto[i % texto.length]);

m.mults = 0;
const cache = m.novoCache();
let piorCache = 0;
for (let n = 0; n < seq.length; n++) {
  const inc = m.passo(seq[n], cache);
  const antes = m.mults;
  const comp = m.completo(seq.slice(0, n + 1)).logits;
  m.mults = antes;   // o forward de conferência não entra na contagem do cache
  comp.forEach((v, i) => { piorCache = Math.max(piorCache, Math.abs(v - inc[i])); });
}
const multsCache = m.mults;
m.mults = 0;
for (let n = 0; n < seq.length; n++) m.completo(seq.slice(0, n + 1));
const multsSem = m.mults;
assert.ok(piorCache < 1e-9, `cache x completo: ${piorCache}`);
assert.ok(multsSem > 5 * multsCache);

console.log(`JS x NumPy: maior diferença em um logit = ${piorNumpy.toExponential(2)}`);
console.log(`KV cache x forward completo: maior diferença = ${piorCache.toExponential(2)}`);
console.log(`Gerando ${N} tokens: ${multsSem.toLocaleString("pt-BR")} multiplicações sem cache, ${multsCache.toLocaleString("pt-BR")} com cache (${(multsSem / multsCache).toFixed(1).replace(".", ",")} vezes menos)`);
console.log("OK: amostragem e KV cache conferidos");

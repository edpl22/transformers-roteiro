// Mesmos Q, K, V com e sem máscara causal. Vetores pseudoaleatórios fixos por token: o padrão dos pesos
// não tem significado linguístico; o que a demo mostra é quais células podem ser não nulas.
import { atencao, gerador, mascaraCausal } from "../01-self-attention/atencao.js";

const DK = 16;

function semente(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

function vetor(token, papel) {
  const g = gerador(semente(`${papel}:${token}`));
  return Array.from({ length: DK }, () => g.normal());
}

export function calcular(tokens) {
  const Q = tokens.map((t) => vetor(t, "q"));
  const K = tokens.map((t) => vetor(t, "k"));
  const V = tokens.map((t) => vetor(t, "v"));
  return {
    bidirecional: atencao(Q, K, V),
    causal: atencao(Q, K, V, { mascara: mascaraCausal(tokens.length) }),
  };
}

// Quanto cada posição de saída mudou entre duas frases.
export function mudancaPorPosicao(Z1, Z2) {
  return Z1.map((l, i) => Math.sqrt(l.reduce((s, x, c) => s + (x - Z2[i][c]) ** 2, 0)));
}

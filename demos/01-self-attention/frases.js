// Vetores escritos à mão para ilustrar o mecanismo. NÃO são pesos aprendidos.
// Dimensões de Q e K (d_k = 6): finanças, lugar, ação, gramática, pessoa, objeto.
// Dimensões de V (d_v = 2): finanças, lugar. Assim a saída pode ser desenhada em um plano.
export const DIMENSOES = ["finanças", "lugar", "ação", "gramática", "pessoa", "objeto"];

export const LEXICO = {
  o:       { q: [0, 0, 0, 0, 0, 1],     k: [0, 0, 0, 1, 0, 0],     v: [0, 0] },
  banco:   { q: [2, 2, 0.5, 0, 0, 0],   k: [0.5, 0.5, 0, 0, 0, 1], v: [0.5, 0.5] },
  aprovou: { q: [1, 0, 0, 0, 0, 2],     k: [1, 0, 1, 0, 0, 0],     v: [0.6, 0] },
  "crédito": { q: [2, 0, 1, 0, 0, 0],   k: [2, 0, 0, 0, 0, 1],     v: [1, 0] },
  sentei:  { q: [0, 1, 0, 0, 0, 2],     k: [0, 1, 1, 0, 1, 0],     v: [0, 0.6] },
  no:      { q: [0, 0, 0, 0, 0, 2],     k: [0, 0.3, 0, 1, 0, 0],   v: [0, 0.1] },
  da:      { q: [0, 0, 0, 0, 0, 2],     k: [0, 0, 0, 1, 0, 0],     v: [0, 0] },
  "praça": { q: [0, 2, 0, 0, 0, 0.5],   k: [0, 2, 0, 0, 0, 1],     v: [0, 1] },
};

export const FRASES = [
  ["o", "banco", "aprovou", "o", "crédito"],
  ["sentei", "no", "banco", "da", "praça"],
];

export function matrizes(frase) {
  return {
    Q: frase.map((t) => LEXICO[t].q),
    K: frase.map((t) => LEXICO[t].k),
    V: frase.map((t) => LEXICO[t].v),
  };
}

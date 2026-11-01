// Byte Pair Encoding em nível de caractere, como no algoritmo 1 de Sennrich et al. (2016).
export const FIM = "</w>";

export function inicializar(corpus) {
  return Object.entries(corpus).map(([palavra, freq]) => ({ palavra, freq, simbolos: [...palavra, FIM] }));
}

export function contarPares(vocab) {
  const pares = new Map();
  for (const { simbolos, freq } of vocab) {
    for (let i = 0; i < simbolos.length - 1; i++) {
      const par = simbolos[i] + "\u0000" + simbolos[i + 1];
      pares.set(par, (pares.get(par) ?? 0) + freq);
    }
  }
  return pares;
}

// Par mais frequente; empate resolvido pela ordem lexicográfica por pontos de código, para ser determinístico.
export function melhorPar(pares) {
  let melhor = null, n = -1;
  for (const [par, c] of pares) {
    if (c > n || (c === n && par < melhor)) { melhor = par; n = c; }
  }
  return melhor === null ? null : { a: melhor.split("\u0000")[0], b: melhor.split("\u0000")[1], contagem: n };
}

export function fundir(simbolos, a, b) {
  const saida = [];
  for (let i = 0; i < simbolos.length; i++) {
    if (i < simbolos.length - 1 && simbolos[i] === a && simbolos[i + 1] === b) { saida.push(a + b); i++; }
    else saida.push(simbolos[i]);
  }
  return saida;
}

export function treinar(corpus, nFusoes) {
  let vocab = inicializar(corpus);
  const fusoes = [];
  for (let k = 0; k < nFusoes; k++) {
    const m = melhorPar(contarPares(vocab));
    if (!m) break;
    fusoes.push(m);
    vocab = vocab.map((w) => ({ ...w, simbolos: fundir(w.simbolos, m.a, m.b) }));
  }
  return { fusoes, vocab };
}

// Tokeniza uma palavra nova aplicando as fusões na ordem em que foram aprendidas.
export function tokenizar(palavra, fusoes) {
  let s = [...palavra, FIM];
  for (const { a, b } of fusoes) s = fundir(s, a, b);
  return s;
}

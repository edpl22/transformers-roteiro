// Codificação posicional senoidal de Vaswani et al. (2017), seção 3.5.
export function codificacaoPosicional(nPos, dModel) {
  const pe = [];
  for (let pos = 0; pos < nPos; pos++) {
    const linha = new Array(dModel);
    for (let d = 0; d < dModel; d++) {
      const i = Math.floor(d / 2);
      const angulo = pos / 10000 ** ((2 * i) / dModel);
      linha[d] = d % 2 === 0 ? Math.sin(angulo) : Math.cos(angulo);
    }
    pe.push(linha);
  }
  return pe;
}

// Valor em posição real: usado só para desenhar a curva contínua entre as posições inteiras.
export function valorContinuo(pos, d, dModel) {
  const i = Math.floor(d / 2);
  const a = pos / 10000 ** ((2 * i) / dModel);
  return d % 2 === 0 ? Math.sin(a) : Math.cos(a);
}

// Comprimento de onda da dimensão 2i (ou 2i+1): vai de 2π até 10000·2π, em progressão geométrica.
export function comprimentoDeOnda(i, dModel) {
  return 2 * Math.PI * 10000 ** ((2 * i) / dModel);
}

export function produtoEscalar(a, b) {
  return a.reduce((s, x, k) => s + x * b[k], 0);
}

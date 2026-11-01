// Scaled dot-product attention em JS puro: Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) V.
export function matmul(A, B) {
  return A.map((linha) => B[0].map((_, j) => linha.reduce((s, a, k) => s + a * B[k][j], 0)));
}

export function transposta(A) {
  return A[0].map((_, j) => A.map((l) => l[j]));
}

export function softmax(x) {
  const m = Math.max(...x);                       // subtrai o máximo para evitar overflow em exp
  const e = x.map((v) => (v === -Infinity ? 0 : Math.exp(v - m)));
  const soma = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / soma);
}

// mascara[i][j] === false impede a consulta i de ver a posição j (a célula recebe -inf antes do softmax).
export function atencao(Q, K, V, { mascara = null, escalar = true } = {}) {
  const dk = K[0].length;
  const pontuacao = matmul(Q, transposta(K));
  const escalada = pontuacao.map((l) => l.map((s) => (escalar ? s / Math.sqrt(dk) : s)));
  const mascarada = escalada.map((l, i) => l.map((s, j) => (mascara && !mascara[i][j] ? -Infinity : s)));
  const A = mascarada.map(softmax);
  return { dk, pontuacao, escalada, mascarada, A, Z: matmul(A, V) };
}

// Máscara causal: cada posição vê apenas ela mesma e as anteriores.
export function mascaraCausal(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j <= i));
}

// Gerador determinístico (mulberry32) e normal padrão (Box-Muller), para que a demo repita os mesmos números.
export function gerador(semente) {
  let a = semente >>> 0;
  const uniforme = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => Math.sqrt(-2 * Math.log(1 - uniforme())) * Math.cos(2 * Math.PI * uniforme());
  return { uniforme, normal };
}

// Exemplo calculado à mão no roteiro (cena C04-S06).
export const EXEMPLO_MAO = {
  tokens: ["o", "gato", "dorme"],
  Q: [[1, 0, 0, 1], [0, 2, 1, 0], [2, 1, 0, 0]],
  K: [[1, 0, 0, 0], [2, 0, 1, 1], [0, 2, 1, 0]],
  V: [[1, 0], [0, 1], [1, 1]],
};

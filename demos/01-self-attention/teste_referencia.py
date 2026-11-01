"""Compara a atenção em JS com NumPy, com a conta escalar e com o exemplo feito à mão."""
import json
import math
import pathlib
import subprocess

import numpy as np

from referencia import atencao_escalar, atencao_numpy

AQUI = pathlib.Path(__file__).parent
TOL = 1e-12

JS = """
import { atencao, gerador, EXEMPLO_MAO } from './atencao.js';
import { FRASES, matrizes } from './frases.js';
const { Q, K, V } = EXEMPLO_MAO;
const g = gerador(42);
const aleat = (l, c) => Array.from({ length: l }, () => Array.from({ length: c }, () => g.normal()));
const R = { Q: aleat(7, 16), K: aleat(7, 16), V: aleat(7, 5) };
console.log(JSON.stringify({
  mao: atencao(Q, K, V), maoSemEscala: atencao(Q, K, V, { escalar: false }), Q, K, V,
  R, rnd: atencao(R.Q, R.K, R.V),
  frases: FRASES.map((f) => ({ f, ...atencao(...Object.values(matrizes(f))), m: matrizes(f) })),
}));
"""
r = json.loads(subprocess.run(["node", "--input-type=module", "-e", JS], cwd=AQUI, capture_output=True, text=True, encoding="utf8", check=True).stdout)

# 1. Exemplo à mão: pontuações e pesos calculados no papel (d_k = 4, logo sqrt(d_k) = 2)
S_MAO = np.array([[1, 3, 0], [0, 1, 5], [2, 4, 2]], dtype=float)
assert np.array_equal(np.array(r["mao"]["pontuacao"]), S_MAO)
e = np.exp(S_MAO / 2)
A_MAO = e / e.sum(axis=1, keepdims=True)
assert np.abs(np.array(r["mao"]["A"]) - A_MAO).max() < TOL
Z_MAO = A_MAO @ np.array(r["V"], dtype=float)
assert np.abs(np.array(r["mao"]["Z"]) - Z_MAO).max() < TOL

# 2. JS x NumPy x conta escalar, com vetores aleatórios
A_np, Z_np = atencao_numpy(r["R"]["Q"], r["R"]["K"], r["R"]["V"])
A_es, Z_es = atencao_escalar(r["R"]["Q"], r["R"]["K"], r["R"]["V"])
assert np.abs(np.array(r["rnd"]["A"]) - A_np).max() < TOL
assert np.abs(np.array(r["rnd"]["Z"]) - Z_np).max() < TOL
assert np.abs(A_np - np.array(A_es)).max() < TOL and np.abs(Z_np - np.array(Z_es)).max() < TOL
assert np.abs(A_np.sum(axis=1) - 1).max() < TOL

# 3. Afirmação do artigo: q.k tem média 0 e variância d_k (componentes independentes, média 0, variância 1)
g = np.random.default_rng(0)
for d in (16, 64, 512):
    prod = (g.standard_normal((200_000, d)) * g.standard_normal((200_000, d))).sum(axis=1)
    assert abs(prod.mean()) < 0.05 * math.sqrt(d), prod.mean()
    assert abs(prod.var() / d - 1) < 0.02, prod.var()
    print(f"d_k={d:4d}: média(q.k)={prod.mean():+.3f}  var(q.k)={prod.var():8.2f}  var após dividir por sqrt(d_k)={(prod / math.sqrt(d)).var():.3f}")

# 4. As frases: a mesma consulta de "banco" muda de alvo conforme o contexto
for fr in r["frases"]:
    i = fr["f"].index("banco")
    pesos = fr["A"][i]
    print(" ".join(fr["f"]), "-> pesos de banco:", [round(p, 3) for p in pesos], "Z(banco) =", [round(x, 3) for x in fr["Z"][i]])
f1, f2 = r["frases"]
assert f1["f"][int(np.argmax(f1["A"][f1["f"].index("banco")]))] == "crédito"
assert f2["f"][int(np.argmax(f2["A"][f2["f"].index("banco")]))] == "praça"

np.set_printoptions(precision=4, suppress=True)
print("Exemplo à mão, A =\n", A_MAO, "\nZ =\n", Z_MAO)
print("Sem escala, A =\n", np.array(r["maoSemEscala"]["A"]))
print("OK: JS, NumPy, conta escalar e referência à mão coincidem (tolerância", TOL, ")")

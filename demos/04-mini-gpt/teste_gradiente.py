"""Confere o backprop manual contra diferenças finitas, em um modelo minúsculo com float64."""
import numpy as np

from modelo_numpy import inicializar, perda_e_gradiente

g = np.random.default_rng(3)
V, T, d, H, L = 7, 6, 8, 2, 2
p = inicializar(V, T, d, H, L, semente=1, dtype=np.float64)
ids = g.integers(0, V, size=(3, T))
alvos = g.integers(0, V, size=(3, T))

_, grad = perda_e_gradiente(p, ids, alvos, H, L)
assert set(grad) == set(p), set(p) ^ set(grad)

pior = 0.0
for nome, W in p.items():
    pos = g.integers(0, W.size, size=min(12, W.size))
    for j in pos:
        idx = np.unravel_index(j, W.shape)
        guarda = W[idx]
        W[idx] = guarda + 1e-6
        mais, _ = perda_e_gradiente(p, ids, alvos, H, L, gradiente=False)
        W[idx] = guarda - 1e-6
        menos, _ = perda_e_gradiente(p, ids, alvos, H, L, gradiente=False)
        W[idx] = guarda
        numerico = (mais - menos) / 2e-6
        erro = abs(numerico - grad[nome][idx]) / max(1e-4, abs(numerico) + abs(grad[nome][idx]))
        pior = max(pior, erro)
        assert erro < 1e-4, (nome, idx, numerico, grad[nome][idx])
print(f"OK: {len(p)} grupos de parâmetros conferidos; pior erro relativo = {pior:.2e}")

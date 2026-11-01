"""Self-attention de referência: versão vetorizada em NumPy e versão escalar com laços explícitos."""
import math

import numpy as np


def atencao_numpy(Q, K, V, mascara=None, escalar=True):
    Q, K, V = (np.asarray(x, dtype=np.float64) for x in (Q, K, V))
    d_k = K.shape[-1]
    s = Q @ K.T
    if escalar:
        s = s / np.sqrt(d_k)
    if mascara is not None:
        s = np.where(mascara, s, -np.inf)
    s = s - s.max(axis=-1, keepdims=True)
    A = np.exp(s) / np.exp(s).sum(axis=-1, keepdims=True)
    return A, A @ V


def atencao_escalar(Q, K, V):
    """Mesma conta, termo a termo, sem álgebra matricial: serve de segunda opinião."""
    d_k = len(K[0])
    A, Z = [], []
    for q in Q:
        s = [sum(a * b for a, b in zip(q, k)) / math.sqrt(d_k) for k in K]
        e = [math.exp(x) for x in s]
        pesos = [x / sum(e) for x in e]
        A.append(pesos)
        Z.append([sum(p * v[c] for p, v in zip(pesos, V)) for c in range(len(V[0]))])
    return A, Z

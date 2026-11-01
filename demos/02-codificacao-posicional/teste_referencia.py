"""Compara a codificação posicional em JS com NumPy e confere propriedades citadas no roteiro."""
import json
import pathlib
import subprocess

import numpy as np

AQUI = pathlib.Path(__file__).parent


def pe_numpy(n_pos, d_model):
    pos = np.arange(n_pos)[:, None]
    i = np.arange(d_model // 2 + d_model % 2)[None, :]
    ang = pos / 10000 ** (2 * i / d_model)
    pe = np.zeros((n_pos, d_model))
    pe[:, 0::2] = np.sin(ang)
    pe[:, 1::2] = np.cos(ang[:, :d_model // 2])
    return pe


JS = """
import { codificacaoPosicional, comprimentoDeOnda } from './pe.js';
console.log(JSON.stringify({ pe: codificacaoPosicional(128, 64), ondas: [0, 31].map((i) => comprimentoDeOnda(i, 64)) }));
"""
r = json.loads(subprocess.run(["node", "--input-type=module", "-e", JS], cwd=AQUI, capture_output=True, text=True, check=True).stdout)
pe = pe_numpy(128, 64)
assert np.abs(np.array(r["pe"]) - pe).max() < 1e-12

# Valores conferidos à mão: em pos = 0, senos valem 0 e cossenos valem 1.
assert np.allclose(pe[0, 0::2], 0) and np.allclose(pe[0, 1::2], 1)
# Primeira dimensão: sin(pos), com comprimento de onda 2*pi.
assert np.allclose(pe[:, 0], np.sin(np.arange(128)))
assert abs(r["ondas"][0] - 2 * np.pi) < 1e-9

# Propriedade do artigo: PE(pos + k) é função linear de PE(pos), para k fixo.
k = 7
for i in (0, 5, 20):
    w = 1 / 10000 ** (2 * i / 64)
    seno = pe[:-k, 2 * i] * np.cos(k * w) + pe[:-k, 2 * i + 1] * np.sin(k * w)
    cosseno = pe[:-k, 2 * i + 1] * np.cos(k * w) - pe[:-k, 2 * i] * np.sin(k * w)
    assert np.allclose(seno, pe[k:, 2 * i]) and np.allclose(cosseno, pe[k:, 2 * i + 1])

# Sem colisão: todas as 128 posições têm vetores distintos.
dist = np.linalg.norm(pe[:, None] - pe[None, :], axis=-1) + np.eye(128) * 9
print(f"menor distância entre posições distintas: {dist.min():.3f}")
print(f"primeiras 4 dimensões em pos=1: {np.round(pe[1, :4], 4).tolist()}")
print("OK: JS coincide com NumPy; relação linear PE(pos+k) conferida")

"""Treina o mini-GPT no corpus de Machado de Assis e exporta pesos, fixture e saídas pré-gravadas.

Uso: python treinar.py [passos]
"""
import base64
import json
import math
import pathlib
import sys
import time

import numpy as np

from modelo_numpy import gerar, ida, inicializar, perda_e_gradiente

AQUI = pathlib.Path(__file__).parent
T, D, H, L, BATCH = 64, 64, 4, 3, 24
PASSOS = int(sys.argv[1]) if len(sys.argv) > 1 else 6000
LR_MAX, AQUECIMENTO = 2e-3, 300

texto = (AQUI / "dados" / "corpus_machado.txt").read_text(encoding="utf8")
vocab = "".join(sorted(set(texto)))
para_id = {c: i for i, c in enumerate(vocab)}
dados = np.fromiter((para_id[c] for c in texto), dtype=np.int32, count=len(texto))
corte = int(0.95 * len(dados))
treino, valid = dados[:corte], dados[corte:]
g = np.random.default_rng(0)


def lote(fonte, B=BATCH):
    ini = g.integers(0, len(fonte) - T - 1, size=B)
    x = np.stack([fonte[i:i + T] for i in ini])
    y = np.stack([fonte[i + 1:i + T + 1] for i in ini])
    return x, y


def perda_validacao(p, n=20):
    return float(np.mean([perda_e_gradiente(p, *lote(valid), H, L, gradiente=False)[0] for _ in range(n)]))


# Referência: um modelo de bigramas com suavização, para mostrar quanto o contexto acrescenta.
contagem = np.ones((len(vocab), len(vocab)))
np.add.at(contagem, (treino[:-1], treino[1:]), 1)
bigrama = contagem / contagem.sum(1, keepdims=True)
perda_bigrama = float(-np.log(bigrama[valid[:-1], valid[1:]]).mean())
print(f"vocab={len(vocab)} corpus={len(dados)} uniforme={math.log(len(vocab)):.3f} bigrama={perda_bigrama:.3f}", flush=True)

p = inicializar(len(vocab), T, D, H, L)
n_param = sum(w.size for w in p.values())
m1 = {k: np.zeros_like(v) for k, v in p.items()}
m2 = {k: np.zeros_like(v) for k, v in p.items()}
curva = []
t0 = time.time()
b1, b2 = 0.9, 0.98

for passo in range(1, PASSOS + 1):
    lr = LR_MAX * min(passo / AQUECIMENTO, 0.5 * (1 + math.cos(math.pi * passo / PASSOS)))
    x, y = lote(treino)
    perda, grad = perda_e_gradiente(p, x, y, H, L)
    norma = math.sqrt(sum(float((v ** 2).sum()) for v in grad.values()))
    fator = min(1.0, 1.0 / (norma + 1e-9))
    for k in p:
        gk = grad[k] * fator
        m1[k] = b1 * m1[k] + (1 - b1) * gk
        m2[k] = b2 * m2[k] + (1 - b2) * gk * gk
        p[k] -= lr * (m1[k] / (1 - b1 ** passo)) / (np.sqrt(m2[k] / (1 - b2 ** passo)) + 1e-9)
    if passo % 250 == 0 or passo == 1:
        pv = perda_validacao(p)
        curva.append({"passo": passo, "treino": round(perda, 4), "validacao": round(pv, 4)})
        print(f"passo {passo:5d} treino {perda:.3f} validacao {pv:.3f} lr {lr:.5f} {time.time() - t0:.0f}s", flush=True)

# Exportação: base64 de float32 mantém os pesos pequenos e legíveis em JS e Python.
meta = {
    "vocab": vocab, "T": T, "d": D, "h": H, "L": L, "n_parametros": n_param, "passos": PASSOS,
    "perda_uniforme": round(math.log(len(vocab)), 4), "perda_bigrama": round(perda_bigrama, 4),
    "curva": curva, "corpus": "Machado de Assis, Memórias Póstumas de Brás Cubas e Quincas Borba (Project Gutenberg, domínio público)",
}
pesos = {k: {"forma": list(v.shape), "b64": base64.b64encode(v.astype("<f4").tobytes()).decode()} for k, v in p.items()}
(AQUI / "pesos.json").write_text(json.dumps({"meta": meta, "parametros": pesos}), encoding="utf8")

# Fixture para conferir a inferência em JS contra NumPy (mesmos pesos float32 relidos em float64).
p64 = {k: v.astype(np.float64) for k, v in p.items()}
prompt = "o homem que "
ids = np.array([[para_id[c] for c in prompt]])
logits, _ = ida(p64, ids, H, L)
(AQUI / "dados" / "fixture.json").write_text(json.dumps({"prompt": prompt, "logits_ultimo": logits[0, -1].tolist()}), encoding="utf8")

# Saída pré-gravada: fallback caso a inferência ao vivo falhe durante a gravação.
amostras = {}
for temp in (0.2, 0.5, 0.8, 1.0, 1.5, 2.0):
    r = np.random.default_rng(int(temp * 10))
    s = gerar(p, ids[0].tolist(), 400, T, H, L, temp, r)
    amostras[str(temp)] = "".join(vocab[i] for i in s)
(AQUI / "dados" / "saida_pregravada.json").write_text(json.dumps({"prompt": prompt, "amostras": amostras}, ensure_ascii=False, indent=1), encoding="utf8")
print("parametros", n_param, "tempo", round(time.time() - t0), "s")
for k, v in amostras.items():
    print(f"--- T={k}\n{v}", flush=True)

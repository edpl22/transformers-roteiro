"""Mini-GPT de caracteres em NumPy puro, com backpropagation escrita à mão.

Arquitetura: embeddings de token e de posição aprendidos, blocos pre-norm (LayerNorm antes de
atenção mascarada multi-head e de FFN, com conexões residuais), LayerNorm final e projeção linear.
Usamos NumPy em vez de PyTorch para manter a dependência leve e deixar cada gradiente visível.
"""
import numpy as np

EPS = 1e-5


def inicializar(vocab, T, d, h, L, semente=0, dtype=np.float32):
    g = np.random.default_rng(semente)
    n = lambda *s: (g.standard_normal(s) * 0.02).astype(dtype)
    residual = 1.0 / np.sqrt(2 * L)  # atenua as saídas residuais, como em GPT-2
    p = {"tok": n(vocab, d) * 15, "pos": n(T, d) * 15}
    for i in range(L):
        p[f"b{i}.ln1.g"] = np.ones(d, dtype)
        p[f"b{i}.ln1.b"] = np.zeros(d, dtype)
        p[f"b{i}.Wq"] = n(d, d) * 5
        p[f"b{i}.Wk"] = n(d, d) * 5
        p[f"b{i}.Wv"] = n(d, d) * 5
        p[f"b{i}.Wo"] = n(d, d) * 5 * residual
        p[f"b{i}.ln2.g"] = np.ones(d, dtype)
        p[f"b{i}.ln2.b"] = np.zeros(d, dtype)
        p[f"b{i}.W1"] = n(d, 4 * d) * 5
        p[f"b{i}.b1"] = np.zeros(4 * d, dtype)
        p[f"b{i}.W2"] = n(4 * d, d) * 5 * residual
        p[f"b{i}.b2"] = np.zeros(d, dtype)
    p["lnf.g"] = np.ones(d, dtype)
    p["lnf.b"] = np.zeros(d, dtype)
    p["cabeca"] = n(d, vocab) * 5
    return p


def ln_ida(x, g, b):
    mu = x.mean(-1, keepdims=True)
    s = np.sqrt(((x - mu) ** 2).mean(-1, keepdims=True) + EPS)
    z = (x - mu) / s
    return z * g + b, (z, s)


def ln_volta(ybar, g, cache):
    z, s = cache
    u = ybar * g
    xbar = (u - u.mean(-1, keepdims=True)) / s - z * (u * z).mean(-1, keepdims=True) / s
    return xbar, (ybar * z).sum((0, 1)), ybar.sum((0, 1))


def separar(x, H):
    B, T, d = x.shape
    return x.reshape(B, T, H, d // H).transpose(0, 2, 1, 3)


def juntar(x):
    B, H, T, dh = x.shape
    return x.transpose(0, 2, 1, 3).reshape(B, T, H * dh)


def bloco_ida(p, i, x, H):
    T = x.shape[1]
    h, c1 = ln_ida(x, p[f"b{i}.ln1.g"], p[f"b{i}.ln1.b"])
    q, k, v = (separar(h @ p[f"b{i}.W{n}"], H) for n in "qkv")
    dh = q.shape[-1]
    s = q @ k.transpose(0, 1, 3, 2) / np.sqrt(dh)
    s = np.where(np.tri(T, dtype=bool), s, -np.inf)   # máscara causal
    e = np.exp(s - s.max(-1, keepdims=True))
    A = e / e.sum(-1, keepdims=True)
    z = juntar(A @ v)
    x1 = x + z @ p[f"b{i}.Wo"]
    h2, c2 = ln_ida(x1, p[f"b{i}.ln2.g"], p[f"b{i}.ln2.b"])
    a = h2 @ p[f"b{i}.W1"] + p[f"b{i}.b1"]
    r = np.maximum(a, 0)
    x2 = x1 + r @ p[f"b{i}.W2"] + p[f"b{i}.b2"]
    return x2, dict(h=h, c1=c1, q=q, k=k, v=v, A=A, z=z, h2=h2, c2=c2, a=a, r=r, H=H, dh=dh)


def _produto(a, b):
    """Soma, em B e T, de a[...,None] @ b[...,None,:]: gradiente de um peso linear."""
    return a.reshape(-1, a.shape[-1]).T @ b.reshape(-1, b.shape[-1])


def bloco_volta(p, i, x2bar, c, g):
    x1bar = x2bar
    g[f"b{i}.W2"] = _produto(c["r"], x2bar)
    g[f"b{i}.b2"] = x2bar.sum((0, 1))
    abar = (x2bar @ p[f"b{i}.W2"].T) * (c["a"] > 0)
    g[f"b{i}.W1"] = _produto(c["h2"], abar)
    g[f"b{i}.b1"] = abar.sum((0, 1))
    h2bar = abar @ p[f"b{i}.W1"].T
    xl, g[f"b{i}.ln2.g"], g[f"b{i}.ln2.b"] = ln_volta(h2bar, p[f"b{i}.ln2.g"], c["c2"])
    x1bar = x1bar + xl

    xbar = x1bar
    g[f"b{i}.Wo"] = _produto(c["z"], x1bar)
    zbar = separar(x1bar @ p[f"b{i}.Wo"].T, c["H"])
    A, q, k, v, dh = c["A"], c["q"], c["k"], c["v"], c["dh"]
    vbar = A.transpose(0, 1, 3, 2) @ zbar
    Abar = zbar @ v.transpose(0, 1, 3, 2)
    sbar = A * (Abar - (A * Abar).sum(-1, keepdims=True))
    qbar = sbar @ k / np.sqrt(dh)
    kbar = sbar.transpose(0, 1, 3, 2) @ q / np.sqrt(dh)
    hbar = 0
    for n, b in (("q", qbar), ("k", kbar), ("v", vbar)):
        b = juntar(b)
        g[f"b{i}.W{n}"] = _produto(c["h"], b)
        hbar = hbar + b @ p[f"b{i}.W{n}"].T
    xl, g[f"b{i}.ln1.g"], g[f"b{i}.ln1.b"] = ln_volta(hbar, p[f"b{i}.ln1.g"], c["c1"])
    return xbar + xl


def ida(p, ids, H, L):
    T = ids.shape[1]
    x = p["tok"][ids] + p["pos"][:T]
    caches = []
    for i in range(L):
        x, c = bloco_ida(p, i, x, H)
        caches.append(c)
    h, cf = ln_ida(x, p["lnf.g"], p["lnf.b"])
    return h @ p["cabeca"], (h, cf, caches)


def perda_e_gradiente(p, ids, alvos, H, L, gradiente=True):
    B, T = ids.shape
    logits, (h, cf, caches) = ida(p, ids, H, L)
    m = logits - logits.max(-1, keepdims=True)
    P = np.exp(m)
    P /= P.sum(-1, keepdims=True)
    linhas, cols = np.arange(B)[:, None], np.arange(T)[None, :]
    perda = -np.log(P[linhas, cols, alvos] + 1e-30).mean()
    if not gradiente:
        return float(perda), None
    lbar = P.copy()
    lbar[linhas, cols, alvos] -= 1
    lbar /= B * T
    g = {"cabeca": _produto(h, lbar)}
    hbar = lbar @ p["cabeca"].T
    xbar, g["lnf.g"], g["lnf.b"] = ln_volta(hbar, p["lnf.g"], cf)
    for i in reversed(range(L)):
        xbar = bloco_volta(p, i, xbar, caches[i], g)
    tb = np.zeros_like(p["tok"])
    np.add.at(tb, ids, xbar)
    g["tok"] = tb
    pb = np.zeros_like(p["pos"])
    pb[:T] = xbar.sum(0)
    g["pos"] = pb
    return float(perda), g


def gerar(p, inicio, n, T, H, L, temperatura, rng):
    ids = list(inicio)
    for _ in range(n):
        ctx = np.array([ids[-T:]])
        logits, _ = ida(p, ctx, H, L)
        l = logits[0, -1].astype(np.float64) / temperatura
        l -= l.max()
        q = np.exp(l)
        q /= q.sum()
        ids.append(int(rng.choice(len(q), p=q)))
    return ids

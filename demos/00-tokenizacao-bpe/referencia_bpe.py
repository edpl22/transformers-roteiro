"""Implementação de referência do BPE em Python, independente da versão em JS."""
FIM = "</w>"


def fundir(simbolos, a, b):
    saida, i = [], 0
    while i < len(simbolos):
        if i < len(simbolos) - 1 and simbolos[i] == a and simbolos[i + 1] == b:
            saida.append(a + b)
            i += 2
        else:
            saida.append(simbolos[i])
            i += 1
    return saida


def treinar(corpus, n_fusoes):
    vocab = {p: list(p) + [FIM] for p in corpus}
    fusoes = []
    for _ in range(n_fusoes):
        pares = {}
        for p, s in vocab.items():
            for a, b in zip(s, s[1:]):
                pares[(a, b)] = pares.get((a, b), 0) + corpus[p]
        if not pares:
            break
        (a, b), c = sorted(pares.items(), key=lambda kv: (-kv[1], kv[0][0] + "\0" + kv[0][1]))[0]
        fusoes.append({"a": a, "b": b, "contagem": c})
        vocab = {p: fundir(s, a, b) for p, s in vocab.items()}
    return fusoes, vocab


def tokenizar(palavra, fusoes):
    s = list(palavra) + [FIM]
    for f in fusoes:
        s = fundir(s, f["a"], f["b"])
    return s

"""Valida roteiro/mapa-tempo.json e a coerência dos documentos com ele.

Falha (código 1) se o total sair de 30 a 40 min, se a diferença entre apresentadores passar de 2 min,
se um timecode de 05-cenas.md divergir do JSON, ou se um documento citar cena ou demo inexistente.
"""
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ROTEIRO = RAIZ / "roteiro"
MIN_TOTAL, MAX_TOTAL = 30 * 60, 40 * 60
MARGEM_ALVO = 3 * 60
DIF_MAX = 2 * 60


def mmss(s):
    return f"{s // 60:02d}:{s % 60:02d}"


def carregar():
    """Devolve o mapa com início e fim calculados em cada cena e capítulo, e o config de apresentadores."""
    mapa = json.loads((ROTEIRO / "mapa-tempo.json").read_text(encoding="utf8"))
    pessoas = json.loads((RAIZ / "config" / "apresentadores.json").read_text(encoding="utf8"))
    t = 0
    for cap in mapa["capitulos"]:
        cap["inicio_s"] = t
        for cena in cap["cenas"]:
            cena["inicio_s"] = t
            t += cena["duracao_s"]
            cena["fim_s"] = t
        cap["fim_s"] = t
        cap["duracao_s"] = t - cap["inicio_s"]
    return mapa, pessoas, t


def main():
    mapa, pessoas, total = carregar()
    erros, avisos = [], []
    nomes = {p["id"]: p["nome"] for p in pessoas}
    por_pessoa = {p["id"]: 0 for p in pessoas}
    cenas = {}
    for cap in mapa["capitulos"]:
        if cap["apresentador"] not in nomes:
            erros.append(f"{cap['id']}: apresentador desconhecido {cap['apresentador']}")
            continue
        por_pessoa[cap["apresentador"]] += cap["duracao_s"]
        for c in cap["cenas"]:
            if c["id"] in cenas:
                erros.append(f"cena repetida: {c['id']}")
            if not c["id"].startswith(cap["id"] + "-"):
                erros.append(f"cena {c['id']} fora do capítulo {cap['id']}")
            cenas[c["id"]] = (c, cap)
            if "demo" in c and not (RAIZ / c["demo"] / "index.html").exists():
                erros.append(f"{c['id']}: demo inexistente {c['demo']}")

    print(f"Total: {mmss(total)} ({total} s)  alvo: {mapa['alvo_min']} min")
    if not MIN_TOTAL <= total <= MAX_TOTAL:
        erros.append(f"total {mmss(total)} fora de 30 a 40 min")
    if abs(total - mapa["alvo_min"] * 60) > MARGEM_ALVO:
        avisos.append(f"total {mmss(total)} fora da margem de ±3 min do alvo")

    for pid, s in por_pessoa.items():
        print(f"  {nomes[pid]:<22} {mmss(s)}")
        if s == 0:
            erros.append(f"{nomes[pid]} não apresenta nada")
    dif = max(por_pessoa.values()) - min(por_pessoa.values())
    print(f"Maior diferença entre apresentadores: {mmss(dif)} (limite 02:00)")
    if dif > DIF_MAX:
        erros.append(f"diferença de {mmss(dif)} entre apresentadores")

    # Timecodes declarados no roteiro cena a cena
    arq_cenas = ROTEIRO / "05-cenas.md"
    if arq_cenas.exists():
        texto = arq_cenas.read_text(encoding="utf8")
        vistos = {}
        for m in re.finditer(r"^### (C\d\d-S\d\d) · (\d\d:\d\d)–(\d\d:\d\d)", texto, re.M):
            vistos[m.group(1)] = (m.group(2), m.group(3))
        for cid, (c, cap) in cenas.items():
            esperado = (mmss(c["inicio_s"]), mmss(c["fim_s"]))
            if cid not in vistos:
                erros.append(f"05-cenas.md: falta a cena {cid}")
            elif vistos[cid] != esperado:
                erros.append(f"05-cenas.md: {cid} declara {vistos[cid]}, o mapa diz {esperado}")
            else:
                bloco = texto[texto.index(f"### {cid} "):]
                proximo = re.search(r"^### C\d\d-S\d\d", bloco[5:], re.M)
                bloco = bloco[: proximo.start() + 5] if proximo else bloco
                if f"(#{cap['apresentador']})" not in bloco:
                    erros.append(f"05-cenas.md: {cid} não cita o apresentador {cap['apresentador']}")
                for campo in ("Objetivo", "Composição", "Animação", "SFX", "Fala", "Rubrica", "Referências"):
                    if f"**{campo}" not in bloco:
                        erros.append(f"05-cenas.md: {cid} sem o campo {campo}")
                if "demo" in c and c["demo"] not in bloco:
                    erros.append(f"05-cenas.md: {cid} não cita {c['demo']}")
                fala = re.search(r"\*\*Fala \((\d+) s\):\*\*(.*?)(?=^- \*\*Rubrica)", bloco, re.S | re.M)
                if fala:
                    soma = sum(int(x) for x in re.findall(r"^\s*- \((\d+) s\)", fala.group(2), re.M))
                    if int(fala.group(1)) != c["duracao_s"] or soma != c["duracao_s"]:
                        erros.append(f"05-cenas.md: {cid} fala declara {fala.group(1)} s, tópicos somam {soma} s, a cena tem {c['duracao_s']} s")
                else:
                    erros.append(f"05-cenas.md: {cid} sem bloco de fala reconhecível")
        print(f"05-cenas.md: {len(vistos)} de {len(cenas)} cenas com timecode")

    # Toda referência a cena nos documentos precisa existir
    for arq in sorted(ROTEIRO.glob("*.md")):
        for cid in set(re.findall(r"\bC\d\d-S\d\d\b", arq.read_text(encoding="utf8"))):
            if cid not in cenas:
                erros.append(f"{arq.name}: cena inexistente {cid}")

    for a in avisos:
        print("AVISO:", a)
    for e in erros:
        print("ERRO:", e)
    if erros:
        sys.exit(1)
    print("OK: tempo, equilíbrio e referências cruzadas conferidos")


if __name__ == "__main__":
    main()

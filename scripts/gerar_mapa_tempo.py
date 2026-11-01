"""Gera roteiro/04-mapa-tempo.md a partir do JSON e aplica os nomes do config em todo o roteiro.

Nos documentos, apresentador e papel são links: [nome](#a1) e [papel](#p1). Este script troca o texto
desses links pelo valor atual de config/apresentadores.json. Para usar nomes reais, edite o config e rode:
python scripts/gerar_mapa_tempo.py
"""
import pathlib
import re

from check_timing import ROTEIRO, carregar, mmss


def gerar_mapa(mapa, pessoas, total):
    nomes = {p["id"]: p for p in pessoas}
    linhas = [
        "# 4. Mapa de tempo",
        "",
        "> Arquivo gerado por `scripts/gerar_mapa_tempo.py`. Edite `roteiro/mapa-tempo.json`, não este arquivo.",
        "",
        "## Capítulos",
        "",
        "| Capítulo | Título | Apresentador | Início | Fim | Duração |",
        "|---|---|---|---:|---:|---:|",
    ]
    for c in mapa["capitulos"]:
        linhas.append(f"| {c['id']} | {c['titulo']} | {nomes[c['apresentador']]['nome']} | {mmss(c['inicio_s'])} | {mmss(c['fim_s'])} | {mmss(c['duracao_s'])} |")
    linhas += [f"| **Total** | | | | | **{mmss(total)}** |", "", "## Divisão entre apresentadores", "",
               "| Apresentador | Papel | Capítulos | Tempo |", "|---|---|---|---:|"]
    for p in pessoas:
        caps = [c for c in mapa["capitulos"] if c["apresentador"] == p["id"]]
        linhas.append(f"| {p['nome']} | {p['papel']} | {', '.join(c['id'] for c in caps)} | {mmss(sum(c['duracao_s'] for c in caps))} |")
    linhas += ["", "## Cenas", "", "| Cena | Título | Início | Fim | Duração | Demo |", "|---|---|---:|---:|---:|---|"]
    for c in mapa["capitulos"]:
        for s in c["cenas"]:
            demo = f"`{s['demo']}`" if "demo" in s else ""
            linhas.append(f"| {s['id']} | {s['titulo']} | {mmss(s['inicio_s'])} | {mmss(s['fim_s'])} | {mmss(s['duracao_s'])} | {demo} |")
    (ROTEIRO / "04-mapa-tempo.md").write_text("\n".join(linhas) + "\n", encoding="utf8")


def aplicar_nomes(pessoas):
    alterados = 0
    for arq in ROTEIRO.glob("*.md"):
        texto = arq.read_text(encoding="utf8")
        novo = texto
        for i, p in enumerate(pessoas, 1):
            novo = re.sub(rf"\[[^\]]*\]\(#a{i}\)", f"[{p['nome']}](#a{i})", novo)
            novo = re.sub(rf"\[[^\]]*\]\(#p{i}\)", f"[{p['papel']}](#p{i})", novo)
        if novo != texto:
            arq.write_text(novo, encoding="utf8")
            alterados += 1
    return alterados


mapa, pessoas, total = carregar()
gerar_mapa(mapa, pessoas, total)
n = aplicar_nomes(pessoas)
print(f"04-mapa-tempo.md gerado; nomes aplicados em {n} arquivo(s) alterado(s)")

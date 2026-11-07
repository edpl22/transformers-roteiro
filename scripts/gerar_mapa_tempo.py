"""Gera 04-mapa-tempo.md e as fichas de ensaio a partir do JSON e aplica os nomes do config em todo o roteiro.

Nos documentos, apresentador e papel são links: [nome](#a1) e [papel](#p1). Este script troca o texto
desses links pelo valor atual de config/apresentadores.json. Para usar nomes reais, edite o config e rode:
python scripts/gerar_mapa_tempo.py
"""
import pathlib
import re

from check_timing import CLIQUE, ROTEIRO, carregar, ler_falas, mmss


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


def bloco(texto, inicio, fim):
    m = re.search(rf"^- \*\*{inicio}[^\n]*\*\*(.*?)(?=^- \*\*{fim})", texto, re.S | re.M)
    return m.group(1).strip("\n") if m else ""


def gerar_fichas(mapa, pessoas):
    """Uma ficha por apresentador, só com o que se usa no ensaio: tempo, texto falado, cliques na demo e passagem."""
    texto = (ROTEIRO / "05-cenas.md").read_text(encoding="utf8")
    falas = ler_falas()
    nomes = {p["id"]: p["nome"] for p in pessoas}
    sem_link = lambda t: re.sub(r"\[([^\]]*)\]\(#[ap]\d\)", r"\1", t)
    pasta = ROTEIRO / "fichas"
    pasta.mkdir(exist_ok=True)
    caps = mapa["capitulos"]
    for p in pessoas:
        dele = [c for c in caps if c["apresentador"] == p["id"]]
        primeiro, ultimo = caps.index(dele[0]), caps.index(dele[-1])
        recebe = f"recebe de {nomes[caps[primeiro - 1]['apresentador']]}" if primeiro else "abre o vídeo"
        passa = f"passa para {nomes[caps[ultimo + 1]['apresentador']]}" if ultimo + 1 < len(caps) else "encerra o vídeo"
        total = sum(c["duracao_s"] for c in dele)
        linhas = [
            f"# Ficha de ensaio: {p['nome']}",
            "",
            "> Gerada por `scripts/gerar_mapa_tempo.py` a partir de `05-cenas.md` e `11-falas.md`. Edite o roteiro, não este arquivo.",
            "",
            f"**Papel:** {p['papel']}  ",
            f"**Tempo:** {mmss(total)}, de {mmss(dele[0]['inicio_s'])} a {mmss(dele[-1]['fim_s'])}  ",
            f"**Passagens:** {recebe}; {passa}",
            "",
            "Ensaie com `http://localhost:8000/app/?ensaio`, que mostra este texto na tela, trecho por trecho. Avance com clique, `Espaço`, `→` ou clicker. Nas demos, o Espaço e as setas também passam a cena; `D` só serve para trocar a demo pela imagem de contingência, se ela travar.",
            "",
            "**[▶]** = avance um passo. *(Itálico entre parênteses)* = ação, não se lê.",
        ]
        for c in dele:
            linhas += ["", f"## {c['id']}: {c['titulo']} ({mmss(c['duracao_s'])})"]
            for s in c["cenas"]:
                ini = texto.index(f"### {s['id']} ")
                prox = re.search(r"^(### C\d\d-S\d\d|## Capítulo)", texto[ini + 5:], re.M)
                trecho = texto[ini: ini + 5 + prox.start()] if prox else texto[ini:]
                linhas += ["", f"### {s['id']} · {mmss(s['inicio_s'])}–{mmss(s['fim_s'])} · {s['titulo']}"]
                if "demo" in s:
                    linhas += ["", f"**Na demo:** {sem_link(bloco(trecho, 'Interação', 'SFX')).strip()}"]
                linhas += ["", sem_link(falas[s["id"]]["texto"]).replace(CLIQUE, "**[▶]**")]
        (pasta / f"{p['id']}.md").write_text("\n".join(linhas) + "\n", encoding="utf8")


mapa, pessoas, total = carregar()
gerar_mapa(mapa, pessoas, total)
n = aplicar_nomes(pessoas)
gerar_fichas(mapa, pessoas)
print(f"04-mapa-tempo.md e {len(pessoas)} fichas gerados; nomes aplicados em {n} arquivo(s) alterado(s)")

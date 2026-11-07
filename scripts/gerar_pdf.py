"""Monta roteiro/roteiro-transformers.pdf a partir de 01-conceito, 05-cenas, 11-falas, 10-referencias, do mapa de tempo e do config.

O PDF é para leitura e ensaio: traz objetivo, tela, cliques, demo, texto falado e referências de cada cena, sem os
detalhes de produção (zonas, easings e SFX), que continuam nos documentos em Markdown.
Uso: python scripts/gerar_pdf.py
"""
import functools
import html
import http.server
import pathlib
import re
import threading

from check_timing import CLIQUE, RAIZ, ROTEIRO, carregar, ler_falas, mmss

SAIDA = ROTEIRO / "roteiro-transformers.pdf"
TEMP = ROTEIRO / ".roteiro-pdf.html"
MATEMATICA = re.compile(r"(\$\$.*?\$\$|\$[^$\n]+\$)", re.S)

CSS = """
@page { size: A4; margin: 17mm 17mm 18mm; }
body { background: #fff; color: var(--tinta); font: 400 10.4pt/1.42 var(--fonte-texto); margin: 0; }
h1, h2, h3, h4 { font-family: var(--fonte-titulo); font-weight: 600; margin: 0; line-height: 1.1; }
h1 { font-size: 27pt; border-bottom: 2px solid var(--tinta); padding-bottom: 5pt; margin: 0 0 11pt; break-after: avoid; }
h2 { font-size: 15pt; margin: 14pt 0 4pt; break-after: avoid; }
p { margin: 0 0 6pt; }
ul, ol { margin: 2pt 0 5pt; padding-left: 15pt; }
li { margin-bottom: 2pt; }
code { font: 500 8.8pt var(--fonte-mono); overflow-wrap: anywhere; }
.katex { font-size: 1.05em; }
.katex-display { margin: 5pt 0; overflow: hidden; }

.capa { height: 252mm; display: flex; flex-direction: column; break-after: page; }
.capa .moldura-capa { border: 2px solid var(--tinta); outline: 1px solid var(--tinta); outline-offset: 4px; padding: 13mm 11mm; flex: 1; display: flex; flex-direction: column; }
.capa .nome { font: 700 62pt/1 var(--fonte-titulo); margin: 22mm 0 3mm; }
.capa .sub { font: 600 19pt/1.2 var(--fonte-titulo); margin-bottom: 15mm; }
.capa .tese { font-size: 13pt; line-height: 1.4; border-left: 3px solid var(--azul-prussia); padding-left: 10pt; margin-bottom: 15mm; }
.capa .rodape { margin-top: auto; font: 500 9pt var(--fonte-mono); color: var(--grafite); }

table { border-collapse: collapse; width: 100%; font-size: 9.6pt; margin-bottom: 9pt; font-variant-numeric: tabular-nums; }
th { font: 600 11pt var(--fonte-titulo); text-align: left; border-bottom: 2px solid var(--tinta); padding: 3pt 6pt; }
td { border-bottom: 1px solid var(--regua); padding: 3pt 6pt; vertical-align: top; }
.dir { text-align: right; }
tr { break-inside: avoid; }

.parte { break-before: page; }
.pessoa { font: 500 9.5pt var(--fonte-mono); color: var(--grafite); margin: -6pt 0 9pt; }
.capitulo { font: 600 18pt/1.1 var(--fonte-titulo); margin: 15pt 0 7pt; color: var(--azul-prussia); break-after: avoid; }
.cena { margin-bottom: 12pt; }
.cena-topo { display: flex; justify-content: space-between; align-items: baseline; gap: 10pt; border-bottom: 1.5px solid var(--tinta); padding-bottom: 2pt; margin-bottom: 5pt; break-after: avoid; }
.cena-topo h3 { font-size: 14pt; }
.cena-topo span { font: 500 8.8pt var(--fonte-mono); white-space: nowrap; color: var(--grafite); }
.rot { font: 600 10.6pt/1.2 var(--fonte-titulo); text-transform: uppercase; letter-spacing: .03em; color: var(--grafite); margin: 5pt 0 1pt; break-after: avoid; }
.fala { border-left: 3px solid var(--azul-prussia); padding: 1pt 0 1pt 8pt; margin-top: 5pt; }
.fala .rot { color: var(--azul-prussia); margin-top: 0; }
.fala p { margin-bottom: 4pt; }
.fala i { color: var(--verde-oliva); }
.clique { font: 600 7.5pt/1 var(--fonte-mono); color: var(--papel); background: var(--azul-prussia); padding: 1pt 3pt; margin-right: 3pt; vertical-align: 1pt; }
.demo { border-left: 3px solid var(--verde-oliva); padding: 1pt 0 1pt 8pt; margin-top: 5pt; }
.demo .rot { color: var(--verde-oliva); margin-top: 0; }
.refs-cena { font-size: 8.8pt; color: var(--grafite); margin-top: 4pt; }
.ref { font-size: 9.3pt; margin-bottom: 4.5pt; overflow-wrap: anywhere; }
"""


def inline(texto):
    """Markdown em linha para HTML; a matemática passa intacta para o KaTeX."""
    saida = []
    for parte in MATEMATICA.split(texto):
        if MATEMATICA.fullmatch(parte):
            bloco = parte.startswith("$$")
            fonte = parte.strip("$").strip()
            saida.append(f'<span class="tex" data-bloco="{int(bloco)}" data-tex="{html.escape(fonte, quote=True)}"></span>')
            continue
        t = re.sub(r"\[([^\]]*)\]\(#[ap]\d\)", r"\1", parte)
        t = re.sub(r"\[([^\]]*)\]\(([^)]*)\)", r"\1", t)
        t = html.escape(t, quote=False)
        t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
        t = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", t)
        t = re.sub(r"(?<!\w)\*([^*\n]+)\*(?!\w)", r"<i>\1</i>", t)
        saida.append(t)
    return "".join(saida)


def blocos(md):
    """Parágrafos e listas aninhadas. Tabelas e títulos ficam de fora: quem chama escolhe o trecho."""
    # Fórmula em bloco ocupa uma linha só, para o parser de linhas não a cortar
    md = re.sub(r"\$\$\s*(.*?)\s*\$\$", lambda m: "$$" + " ".join(m.group(1).split()) + "$$", md, flags=re.S)
    out, pilha, paragrafo = [], [], []

    def fecha_par():
        if paragrafo:
            out.append(f"<p>{inline(' '.join(paragrafo))}</p>")
            paragrafo.clear()

    def fecha_ate(nivel):
        while pilha and pilha[-1][0] > nivel:
            out.append(f"</li></{pilha.pop()[1]}>")

    for linha in md.split("\n"):
        if not linha.strip():
            fecha_par()
            continue
        m = re.match(r"^(\s*)(-|\d+\.) (.*)$", linha)
        if m:
            fecha_par()
            nivel, tag = len(m.group(1)), "ul" if m.group(2) == "-" else "ol"
            fecha_ate(nivel)
            if pilha and pilha[-1][0] == nivel:
                out.append("</li>")
            else:
                out.append(f"<{tag}>")
                pilha.append((nivel, tag))
            out.append(f"<li>{inline(m.group(3))}")
        elif pilha:
            out.append(" " + inline(linha.strip()))
        else:
            paragrafo.append(linha.strip())
    fecha_par()
    fecha_ate(-1)
    return "".join(out)


def campo(trecho, nome, proximos):
    m = re.search(rf"^- \*\*{nome}[^\n]*?\*\*(.*?)(?=^- \*\*(?:{proximos})|\Z)", trecho, re.S | re.M)
    if not m:
        return ""
    return re.sub(r"^  ", "", m.group(1).strip("\n"), flags=re.M).strip()


def sem_producao(t):
    """Tira do texto de leitura o que só interessa a quem implementa: zonas, tamanhos de fonte, durações e easings."""
    ZONA = r"zona [A-F]\d*(?:[–-][A-F]?\d+)?"
    t = re.sub(rf"\b[Nn]a {ZONA}, ", "", t)
    t = re.sub(rf" para a {ZONA}", "", t)
    t = re.sub(rf" na {ZONA}:", ":", t)
    t = re.sub(rf"\b[Zz]ona [A-F]\d*(?:[–-][A-F]?\d+)?: ?", "", t)
    t = re.sub(rf",? ?\(?(?:na )?\b[Zz]ona [A-F]\d*(?:[–-][A-F]?\d+)?\)?", "", t)
    t = re.sub(r" em (?:Barlow Condensed de )?\d+ px", "", t)
    t = re.sub(r" Hierarquia: [^.]*\.", "", t)
    t = re.sub(r" Saída: [^.\n]*\.", "", t)
    t = re.sub(r" ?\(`(?:micro|curta|media|longa|entrada|saida|traco)`[^)]*\)", "", t)
    t = re.sub(r",\s*([,.:])", r"\1", t)
    t = re.sub(r"(^|\. |\n\s*)([a-zà-ú])", lambda m: m.group(1) + m.group(2).upper(), t)
    return t


def secao(md, titulo):
    m = re.search(rf"^## {re.escape(titulo)}\n(.*?)(?=^## |\Z)", md, re.S | re.M)
    return m.group(1) if m else ""


def montar():
    mapa, pessoas, total = carregar()
    nomes = {p["id"]: p for p in pessoas}
    conceito = (ROTEIRO / "01-conceito.md").read_text(encoding="utf8")
    cenas = (ROTEIRO / "05-cenas.md").read_text(encoding="utf8")
    refs = (ROTEIRO / "10-referencias.md").read_text(encoding="utf8")
    caps = mapa["capitulos"]
    tese = re.search(r"^> (.*)$", conceito, re.M).group(1)
    falas = ler_falas()

    h = [f"""<section class="capa"><div class="moldura-capa">
      <div class="nome">Transformers</div>
      <div class="sub">Roteiro do vídeo-apresentação<br>Inteligência Artificial · Engenharia de Computação</div>
      <div class="tese">{inline(tese)}</div>
      <table><tr><th>Apresentador</th><th>Papel</th><th class="dir">Tempo</th></tr>"""]
    for p in pessoas:
        s = sum(c["duracao_s"] for c in caps if c["apresentador"] == p["id"])
        h.append(f'<tr><td>{html.escape(p["nome"])}</td><td>{html.escape(p["papel"])}</td><td class="dir">{mmss(s)}</td></tr>')
    h.append(f"""</table><div class="rodape">Duração total: {mmss(total)} · {sum(len(c["cenas"]) for c in caps)} cenas · {len(caps)} capítulos</div></div></section>""")

    # Visão geral
    metafora = secao(conceito, "Metáfora central: a planta cotada").split("| Prancha")[0]
    h.append('<section><h1>Visão geral</h1><h2>A metáfora: a planta cotada</h2>' + blocos(metafora))
    h.append("<h2>Onde a metáfora para de valer</h2>" + blocos(secao(conceito, "Limites declarados da metáfora")))
    arco = re.sub(r"<a id=[^\n]*\n", "", secao(conceito, "Arco narrativo"))
    h.append("<h2>Arco narrativo</h2>" + blocos(arco))
    h.append('</section><section class="parte"><h1>Mapa de tempo</h1><table><tr><th>Cap.</th><th>Título</th><th>Apresentador</th><th class="dir">Início</th><th class="dir">Fim</th></tr>')
    for c in caps:
        h.append(f'<tr><td>{c["id"]}</td><td>{html.escape(c["titulo"])}</td><td>{html.escape(nomes[c["apresentador"]]["nome"])}</td><td class="dir">{mmss(c["inicio_s"])}</td><td class="dir">{mmss(c["fim_s"])}</td></tr>')
    h.append("</table></section>")

    h.append("""<section><h1 style="margin-top:20pt">Como usar a animação</h1>
      <p>Na pasta do projeto, rode <code>python -m http.server 8000</code> e abra <code>http://localhost:8000/app/</code>. Na tela inicial, escolha <b>Apresentar</b>, <b>Ensaiar</b> ou <b>Gravar</b>; este último deixa a tela limpa, sem controles. Mexa o mouse para ver a barra, com linha do tempo clicável e índice de cenas.</p>
      <table><tr><th>Tecla</th><th>Ação</th></tr>
      <tr><td>Clique, <code>Espaço</code>, <code>→</code>, <code>PageDown</code></td><td>Próximo passo; no último, próxima cena. A tela inicial não entra no vídeo: comece a gravar e só então escolha o modo.</td></tr>
      <tr><td><code>←</code>, <code>PageUp</code></td><td>Volta um passo.</td></tr>
      <tr><td><code>M</code></td><td>Índice de cenas.</td></tr>
      <tr><td>Dentro de uma demo</td><td>Espaço, setas e clicker passam a cena como em qualquer outra; o mouse continua livre na demo. Com o cursor num campo de texto, use <code>PageDown</code>.</td></tr>
      <tr><td><code>D</code>, dentro de uma demo</td><td>Troca a demo pela imagem de contingência, se algo der errado.</td></tr>
      <tr><td><code>E</code></td><td>Mostra ou esconde tempo e texto da fala.</td></tr>
      <tr><td><code>H</code></td><td>Ajuda com todos os atalhos.</td></tr></table>
      <p>Nas cenas a seguir, cada item de <b>Cliques</b> corresponde a um avanço do apresentador. O primeiro acontece ao entrar na cena. O texto falado é o que se diz, palavra por palavra; <span class="clique">▶</span> marca o momento de avançar, e o itálico entre parênteses é uma ação, que não se lê.</p></section>""")

    # Cena a cena
    pessoa_atual = None
    for c in caps:
        if c["apresentador"] != pessoa_atual:
            pessoa_atual = c["apresentador"]
            p = nomes[pessoa_atual]
            dele = [x for x in caps if x["apresentador"] == pessoa_atual]
            h.append(f'<section class="parte"><h1>{html.escape(p["nome"])}</h1><div class="pessoa">{html.escape(p["papel"])} · de {mmss(dele[0]["inicio_s"])} a {mmss(dele[-1]["fim_s"])}</div></section>')
        h.append(f'<div class="capitulo">{c["id"]} · {html.escape(c["titulo"])}</div>')
        for s in c["cenas"]:
            ini = cenas.index(f"### {s['id']} ")
            prox = re.search(r"^(### C\d\d-S\d\d|## Capítulo|---$)", cenas[ini + 5:], re.M)
            t = cenas[ini: ini + 5 + prox.start()] if prox else cenas[ini:]
            prox_campos = "Apresentador|Objetivo|Composição|Animação|Interação|SFX|Fala|Rubrica|Referências"
            interacao = campo(t, "Interação", prox_campos)
            h.append(f'<article class="cena"><div class="cena-topo"><h3>{s["id"]} · {html.escape(s["titulo"])}</h3><span>{mmss(s["inicio_s"])}–{mmss(s["fim_s"])} · {mmss(s["duracao_s"])}</span></div>')
            h.append(f'<div><b>Objetivo:</b> {inline(campo(t, "Objetivo", prox_campos))}</div>')
            h.append('<div class="rot">Na tela</div>' + blocos(sem_producao(campo(t, "Composição", prox_campos))))
            animacao = sem_producao(campo(t, "Animação", prox_campos))
            if animacao:
                h.append('<div class="rot">Cliques</div>' + blocos(animacao))
            if "demo" in s or not re.match(r"nenhuma", interacao, re.I):
                h.append('<div class="demo"><div class="rot">Demonstração</div>' + blocos(sem_producao(interacao)) + "</div>")
            fala = blocos(falas[s["id"]]["texto"].replace(CLIQUE, "\x01")).replace("\x01", '<span class="clique">▶</span>')
            h.append(f'<div class="fala"><div class="rot">Texto falado</div>{fala}</div>')
            h.append(f'<div class="refs-cena"><b>Referências:</b> {inline(campo(t, "Referências", prox_campos))}</div></article>')

    # Referências
    h.append('<section class="parte"><h1>Referências</h1>')
    corpo = refs[refs.index("## Transformer e atenção"):]
    for linha in corpo.split("\n"):
        if linha.startswith("## "):
            h.append(f"<h2>{html.escape(linha[3:])}</h2>")
        elif linha.strip():
            h.append(f'<p class="ref">{inline(linha)}</p>')
    h.append("</section>")

    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Transformers: roteiro</title>
<link rel="stylesheet" href="/assets/vendor/katex/katex.min.css"><link rel="stylesheet" href="/styles/tokens.css"><style>{CSS}</style></head>
<body>{"".join(h)}<script src="/assets/vendor/katex/katex.min.js"></script>
<script>document.querySelectorAll('.tex').forEach((e) => katex.render(e.dataset.tex, e, {{ displayMode: e.dataset.bloco === '1', throwOnError: true }}));
document.fonts.ready.then(() => {{ document.documentElement.dataset.pronto = '1'; }});</script></body></html>"""


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class Servidor(http.server.ThreadingHTTPServer):
    def handle_error(self, *a):
        pass


def main():
    from playwright.sync_api import sync_playwright

    TEMP.write_text(montar(), encoding="utf8")
    srv = Servidor(("127.0.0.1", 0), functools.partial(Silencioso, directory=str(RAIZ)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    rodape = '<div style="width:100%;font:9px Consolas,monospace;color:#59616C;padding:0 17mm;display:flex;justify-content:space-between"><span>Transformers: roteiro</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>'
    try:
        with sync_playwright() as p:
            nav = p.chromium.launch(headless=True)
            pg = nav.new_page()
            erros = []
            pg.on("pageerror", lambda e: erros.append(str(e)))
            pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/roteiro/{TEMP.name}", wait_until="networkidle")
            pg.wait_for_function("document.documentElement.dataset.pronto === '1'")
            if erros:
                raise SystemExit(f"Erro na página: {erros}")
            pg.pdf(path=str(SAIDA), prefer_css_page_size=True, print_background=True, display_header_footer=True,
                   header_template="<span></span>", footer_template=rodape, outline=True, tagged=True)
            nav.close()
    finally:
        srv.shutdown()
        TEMP.unlink(missing_ok=True)
    print(f"{SAIDA.relative_to(RAIZ)}: {SAIDA.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()

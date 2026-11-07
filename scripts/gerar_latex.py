"""Gera roteiro/latex/roteiro-transformers.tex a partir do roteiro e o compila, se houver um compilador LaTeX.

O .tex usa só pacotes comuns e compila em pdfLaTeX, XeLaTeX ou Tectonic; serve também para o Overleaf.
O conteúdo é o mesmo do PDF de leitura: objetivo, tela, cliques, demonstração, texto falado e referências de cada cena.
Uso: python scripts/gerar_latex.py [caminho do compilador]
"""
import pathlib
import re
import shutil
import subprocess
import sys

from check_timing import CLIQUE, ROTEIRO, carregar, ler_falas, mmss
from gerar_pdf import campo, secao, sem_producao

PASTA = ROTEIRO / "latex"
TEX = PASTA / "roteiro-transformers.tex"
CAMPOS = "Apresentador|Objetivo|Composição|Animação|Interação|SFX|Fala|Rubrica|Referências"
TROCAS = {"\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}", "<": r"\textless{}", ">": r"\textgreater{}"}
# Símbolos que nem toda fonte de texto traz: viram matemática, que existe em qualquer compilador.
SIMBOLOS = {"→": r"$\rightarrow$", "←": r"$\leftarrow$", "×": r"$\times$", "≈": r"$\approx$", "−": r"$-$", "₂": r"\textsubscript{2}", "⁻¹²": r"\textsuperscript{$-$12}", "⁻⁶": r"\textsuperscript{$-$6}"}
PARTES = re.compile(r"(\$\$.*?\$\$|\$[^$\n]+\$|https?://[^\s)]+[^\s).,;]|`[^`]+`)", re.S)


def esc(t):
    t = "".join(TROCAS.get(c, c) for c in t)
    for k, v in SIMBOLOS.items():
        t = t.replace(k, v)
    return t


def codigo(t):
    return r"\texttt{" + esc(t).replace("/", r"/\allowbreak{}") + "}"


def inline(texto):
    """Markdown em linha para LaTeX. A matemática do roteiro já é LaTeX e passa intacta."""
    texto = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", texto).replace("√d_k", r"$\sqrt{d_k}$")
    texto = re.sub(r'"([^"\n]*)"', "“\\1”", texto)
    # Ações em itálico, *( ... )*, podem conter fórmula: marcadas antes de separar a matemática do texto
    texto = re.sub(r"\*(\([^)]*\))\*", "\0i\\1\0f", texto)
    saida = []
    for parte in PARTES.split(texto):
        if parte.startswith("$$"):
            saida.append(r"\[" + " ".join(parte.strip("$").split()) + r"\]")
        elif parte.startswith("$"):
            saida.append(parte)
        elif parte.startswith("http"):
            saida.append(r"\url{" + parte + "}")
        elif parte.startswith("`"):
            saida.append(codigo(parte.strip("`")))
        else:
            t = re.sub(r"\*\*([^*]+)\*\*", lambda m: "\0b" + m.group(1) + "\0f", parte)
            t = re.sub(r"(?<!\w)\*([^*\n]+)\*(?!\w)", lambda m: "\0i" + m.group(1) + "\0f", t)
            saida.append(esc(t).replace("\0b", r"\textbf{").replace("\0i", r"\emph{").replace("\0f", "}"))
    return "".join(saida)


def blocos(md):
    """Parágrafos e listas aninhadas."""
    md = re.sub(r"\$\$\s*(.*?)\s*\$\$", lambda m: "$$" + " ".join(m.group(1).split()) + "$$", md, flags=re.S)
    out, pilha, paragrafo = [], [], []

    def fecha_par():
        if paragrafo:
            out.append(inline(" ".join(paragrafo)) + "\n")
            paragrafo.clear()

    def fecha_ate(nivel):
        while pilha and pilha[-1][0] > nivel:
            out.append(rf"\end{{{pilha.pop()[1]}}}")

    for linha in md.split("\n"):
        if not linha.strip():
            fecha_par()
            continue
        m = re.match(r"^(\s*)(-|\d+\.) (.*)$", linha)
        if m:
            fecha_par()
            nivel, amb = len(m.group(1)), "itemize" if m.group(2) == "-" else "enumerate"
            fecha_ate(nivel)
            if not (pilha and pilha[-1][0] == nivel):
                out.append(rf"\begin{{{amb}}}")
                pilha.append((nivel, amb))
            out.append(r"\item " + inline(m.group(3)))
        elif pilha:
            out.append(inline(linha.strip()))
        else:
            paragrafo.append(linha.strip())
    fecha_par()
    fecha_ate(-1)
    return "\n".join(out)


def tabela(colunas, cabecalho, linhas):
    corpo = [r"\begin{tabularx}{\linewidth}{" + colunas + "}", r"\toprule", " & ".join(rf"\textbf{{{c}}}" for c in cabecalho) + r" \\", r"\midrule"]
    corpo += [" & ".join(l) + r" \\" for l in linhas]
    return "\n".join(corpo + [r"\bottomrule", r"\end{tabularx}"])


PREAMBULO = r"""% Gerado por scripts/gerar_latex.py a partir de roteiro/*.md. Edite o roteiro, não este arquivo.
\documentclass[11pt,a4paper]{article}
\usepackage{iftex}
\ifPDFTeX
  \usepackage[T1]{fontenc}
  \usepackage[utf8]{inputenc}
  \usepackage{lmodern}
\else
  \usepackage{fontspec}
\fi
\usepackage[brazil]{babel}
\usepackage[a4paper,margin=2.2cm]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{xcolor}
\usepackage{booktabs,tabularx,enumitem,framed,fancyhdr,titlesec}
\usepackage{xurl}
\usepackage[hidelinks,pdftitle={Transformers: roteiro},pdflang={pt-BR},bookmarksdepth=3]{hyperref}

\definecolor{tinta}{HTML}{1B2430}
\definecolor{grafite}{HTML}{59616C}
\definecolor{azul}{HTML}{17507F}
\definecolor{verde}{HTML}{2E6A4F}
\AtBeginDocument{\color{tinta}}

\setcounter{secnumdepth}{0}
\setcounter{tocdepth}{2}
\setlength{\parindent}{0pt}
\setlength{\parskip}{4pt}
\setlist{nosep,leftmargin=1.5em}
\renewcommand{\arraystretch}{1.15}
\allowdisplaybreaks

\titleformat{\section}{\normalfont\huge\bfseries}{}{0pt}{}[{\titlerule[1pt]}]
\titleformat{\subsection}{\normalfont\Large\bfseries\color{azul}}{}{0pt}{}
\titleformat{\subsubsection}{\normalfont\large\bfseries}{}{0pt}{}[{\titlerule[0.6pt]}]
\titlespacing*{\subsection}{0pt}{14pt}{5pt}
\titlespacing*{\subsubsection}{0pt}{12pt}{4pt}

\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\fancyfoot[L]{\small\color{grafite}Transformers: roteiro}
\fancyfoot[R]{\small\color{grafite}\thepage}

\newcommand{\rotulo}[1]{\par\vspace{3pt}\noindent{\small\bfseries\color{grafite}\MakeUppercase{#1}}\par\nopagebreak}
\newenvironment{barralateral}[2]{%
  \def\FrameCommand{{\color{#1}\vrule width 2pt}\hspace{7pt}}%
  \MakeFramed{\advance\hsize-\width\FrameRestore}%
  \noindent{\small\bfseries\color{#1}\MakeUppercase{#2}}\par\nopagebreak
}{\endMakeFramed}
\newcommand{\cena}[3]{\subsubsection[#1 · #2]{#1 · #2\hfill{\normalfont\small\ttfamily\color{grafite}#3}}}
\newcommand{\clique}{\colorbox{azul}{\color{white}\scriptsize$\blacktriangleright$}\,}
\newcommand{\refscena}[1]{\par\vspace{2pt}{\footnotesize\color{grafite}\textbf{Referências:} #1\par}}
"""


def montar():
    mapa, pessoas, total = carregar()
    nomes = {p["id"]: p for p in pessoas}
    conceito = (ROTEIRO / "01-conceito.md").read_text(encoding="utf8")
    cenas = (ROTEIRO / "05-cenas.md").read_text(encoding="utf8")
    refs = (ROTEIRO / "10-referencias.md").read_text(encoding="utf8")
    caps = mapa["capitulos"]
    tese = re.search(r"^> (.*)$", conceito, re.M).group(1)
    n_cenas = sum(len(c["cenas"]) for c in caps)
    falas = ler_falas()

    linhas_pessoas = [[esc(p["nome"]), esc(p["papel"]), mmss(sum(c["duracao_s"] for c in caps if c["apresentador"] == p["id"]))] for p in pessoas]
    t = [PREAMBULO, r"\begin{document}", r"\begin{titlepage}", r"\vspace*{3cm}",
         r"{\fontsize{50}{54}\selectfont\bfseries Transformers\par}", r"\vspace{8pt}",
         r"{\Large\bfseries Roteiro do vídeo-apresentação\par}", r"{\large Inteligência Artificial $\cdot$ Engenharia de Computação\par}",
         r"\vspace{1.6cm}", r"{\large " + inline(tese) + r"\par}", r"\vspace{1.6cm}",
         tabela("Xlr", ["Apresentador", "Papel", "Tempo"], linhas_pessoas), r"\vfill",
         r"{\small\ttfamily\color{grafite}Duração total: " + f"{mmss(total)} $\\cdot$ {n_cenas} cenas $\\cdot$ {len(caps)} capítulos" + r"\par}", r"\end{titlepage}",
         r"\tableofcontents", r"\clearpage"]

    # Visão geral
    metafora = secao(conceito, "Metáfora central: a planta cotada").split("| Prancha")[0]
    arco = re.sub(r"<a id=[^\n]*\n", "", secao(conceito, "Arco narrativo"))
    t += [r"\section{Visão geral}", r"\subsection{A metáfora: a planta cotada}", blocos(metafora),
          r"\subsection{Onde a metáfora para de valer}", blocos(secao(conceito, "Limites declarados da metáfora")),
          r"\subsection{Arco narrativo}", blocos(arco), r"\clearpage", r"\section{Mapa de tempo}",
          tabela("llXrr", ["Cap.", "Apresentador", "Título", "Início", "Fim"],
                 [[c["id"], esc(nomes[c["apresentador"]]["nome"]), esc(c["titulo"]), mmss(c["inicio_s"]), mmss(c["fim_s"])] for c in caps])]

    t += [r"\section{Como usar a animação}",
          inline("Na pasta do projeto, rode `python -m http.server 8000` e abra `http://localhost:8000/app/`. Na tela inicial, escolha **Apresentar**, **Ensaiar** ou **Gravar**; este último deixa a tela limpa, sem controles. Mexa o mouse para ver a barra, com linha do tempo clicável e índice de cenas."),
          "", tabela("lX", ["Tecla", "Ação"], [
              [inline("Clique, `Espaço`, →, `PageDown`"), "Próximo passo; no último, próxima cena. A tela inicial não entra no vídeo: comece a gravar e só então escolha o modo."],
              [inline("←, `PageUp`"), "Volta um passo."],
              [codigo("M"), "Índice de cenas."],
              [inline("Dentro de uma demo"), inline("Espaço, setas e clicker passam a cena como em qualquer outra; o mouse continua livre na demo. Com o cursor num campo de texto, use `PageDown`.")],
              [inline("`D`, na demo"), "Troca a demo pela imagem de contingência, se algo der errado."],
              [codigo("E"), "Mostra ou esconde tempo e texto da fala."],
              [codigo("H"), "Ajuda com todos os atalhos."]]),
          "", inline("Nas cenas a seguir, cada item de **Cliques** corresponde a um avanço do apresentador. O primeiro acontece ao entrar na cena. O texto falado é o que se diz, palavra por palavra; ") + r"\clique{}" + inline("marca o momento de avançar, e o *itálico entre parênteses* é uma ação, que não se lê.")]

    # Cena a cena
    pessoa_atual = None
    for c in caps:
        if c["apresentador"] != pessoa_atual:
            pessoa_atual = c["apresentador"]
            p = nomes[pessoa_atual]
            dele = [x for x in caps if x["apresentador"] == pessoa_atual]
            t += [r"\clearpage", rf"\section{{{esc(p['nome'])}}}", rf"{{\small\ttfamily\color{{grafite}}{esc(p['papel'])} $\cdot$ de {mmss(dele[0]['inicio_s'])} a {mmss(dele[-1]['fim_s'])}\par}}"]
        t.append(rf"\subsection{{{c['id']} · {esc(c['titulo'])}}}")
        for s in c["cenas"]:
            ini = cenas.index(f"### {s['id']} ")
            prox = re.search(r"^(### C\d\d-S\d\d|## Capítulo|---$)", cenas[ini + 5:], re.M)
            tr = cenas[ini: ini + 5 + prox.start()] if prox else cenas[ini:]
            interacao = campo(tr, "Interação", CAMPOS)
            t += [rf"\cena{{{s['id']}}}{{{esc(s['titulo'])}}}{{{mmss(s['inicio_s'])}--{mmss(s['fim_s'])} ({mmss(s['duracao_s'])})}}",
                  r"\textbf{Objetivo:} " + inline(campo(tr, "Objetivo", CAMPOS)) + r"\par",
                  r"\rotulo{Na tela}", blocos(sem_producao(campo(tr, "Composição", CAMPOS)))]
            animacao = sem_producao(campo(tr, "Animação", CAMPOS))
            if animacao:
                t += [r"\rotulo{Cliques}", blocos(animacao)]
            if "demo" in s or not re.match(r"nenhuma", interacao, re.I):
                t += [r"\begin{barralateral}{verde}{Demonstração}", blocos(sem_producao(interacao)), r"\end{barralateral}"]
            fala = blocos(falas[s["id"]]["texto"].replace(CLIQUE, "\x01")).replace("\x01", r"\clique{}")
            t += [r"\begin{barralateral}{azul}{Texto falado}", fala, r"\end{barralateral}",
                  r"\refscena{" + inline(campo(tr, "Referências", CAMPOS)) + "}"]

    # Referências
    t += [r"\clearpage", r"\section{Referências}", r"\begingroup\small\raggedright"]
    for linha in refs[refs.index("## Transformer e atenção"):].split("\n"):
        if linha.startswith("## "):
            t.append(rf"\subsection{{{esc(linha[3:])}}}")
        elif linha.strip():
            t.append(inline(linha) + r"\par")
    t += [r"\endgroup", r"\end{document}"]
    return "\n".join(t) + "\n"


def compilador():
    if len(sys.argv) > 1:
        return sys.argv[1]
    for nome in ("tectonic", "latexmk", "xelatex", "pdflatex"):
        achado = shutil.which(nome)
        if achado:
            return achado
    return None


def compilar(cmd):
    nome = pathlib.Path(cmd).stem.lower()
    if nome == "tectonic":
        args = [cmd, "--keep-logs", TEX.name]
    elif nome == "latexmk":
        args = [cmd, "-pdf", "-interaction=nonstopmode", TEX.name]
    else:
        args = [cmd, "-interaction=nonstopmode", TEX.name]
    for _ in range(1 if nome in ("tectonic", "latexmk") else 2):   # a segunda passada resolve o sumário
        r = subprocess.run(args, cwd=PASTA, capture_output=True, text=True, encoding="utf8", errors="replace")
    if r.returncode:
        print((r.stdout + r.stderr)[-3000:])
        sys.exit(1)
    log = TEX.with_suffix(".log").read_text(encoding="utf8", errors="replace") if TEX.with_suffix(".log").exists() else ""
    faltando = sorted(set(re.findall(r"Missing character: There is no (\S+)", log)))
    transbordos = len(re.findall(r"Overfull \\hbox \((\d+\.\d+)pt", log))
    print(f"Log: {len(faltando)} caracteres sem fonte {faltando or ''}; {transbordos} linhas além da margem")
    for extra in PASTA.iterdir():
        if extra.suffix in {".aux", ".log", ".out", ".toc", ".fls", ".fdb_latexmk"}:
            extra.unlink()
    print(f"{TEX.with_suffix('.pdf').relative_to(ROTEIRO.parent)}: {TEX.with_suffix('.pdf').stat().st_size // 1024} KB")


def main():
    PASTA.mkdir(exist_ok=True)
    TEX.write_text(montar(), encoding="utf8", newline="\n")
    print(f"{TEX.relative_to(ROTEIRO.parent)} gerado")
    cmd = compilador()
    if cmd:
        compilar(cmd)
    else:
        print("Nenhum compilador LaTeX encontrado. Compile o .tex no Overleaf ou instale o MiKTeX ou o Tectonic.")


if __name__ == "__main__":
    main()

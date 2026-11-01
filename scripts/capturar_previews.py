"""Abre cada demo em Chromium headless, falha se houver erro de console e salva screenshots.

Também verifica os SFX por renderização offline e procura na fonte os elementos proibidos pela direção de arte.
Uso: python scripts/capturar_previews.py [filtro]
"""
import functools
import http.server
import json
import pathlib
import re
import sys
import threading

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "roteiro" / "previews"
FILTRO = sys.argv[1] if len(sys.argv) > 1 else ""


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def clicar(*seletores):
    def f(pg):
        for s in seletores:
            pg.click(s)
    return f


def repetir(seletor, n):
    def f(pg):
        for _ in range(n):
            pg.click(seletor)
    return f


def rodar_mini_gpt(pg):
    pg.click("#gerar")
    pg.wait_for_function("document.getElementById('saida').textContent.length > 240", timeout=60000)
    pg.click("#gerar")


def rodar_kv(pg):
    pg.click("#comparar")
    pg.wait_for_function("document.getElementById('resultado-kv').dataset.pronto === '1'", timeout=60000)


def focar_linha_mapa(pg):
    # Move o mouse sem esperar estabilidade: o mapa é redesenhado a cada foco.
    c = pg.evaluate("(() => { const r = document.querySelector('#mapa').getBoundingClientRect(); return [r.left + 60, r.top + r.height * 0.42]; })()")
    pg.mouse.move(*c)


# (arquivo do screenshot, caminho, ação antes da captura, verificação em JS que deve dar verdadeiro)
CAPTURAS = [
    ("demo-00-bpe", "demos/00-tokenizacao-bpe/", repetir("#proxima", 5), "document.querySelectorAll('#fusoes > div').length === 5"),
    ("demo-01-mao", "demos/01-self-attention/?aba=mao&completo", None, "document.querySelectorAll('#etapas .matriz').length === 4"),
    ("demo-01-frase", "demos/01-self-attention/?aba=frase", focar_linha_mapa, "document.querySelectorAll('#arcos path').length >= 3"),
    ("demo-01-frase-praca", "demos/01-self-attention/?aba=frase", clicar("#trocar"), "document.querySelector('#tit-tabela').textContent.includes('banco')"),
    ("demo-01-escala", "demos/01-self-attention/?aba=escala", None, "document.querySelectorAll('#b-bruta .barra').length === 8"),
    ("demo-02-posicional", "demos/02-codificacao-posicional/", None, "document.querySelectorAll('#curvas path').length >= 8"),
    ("demo-03-mascara", "demos/03-mascara-causal/", None, "document.querySelectorAll('#mapa-b .cortada').length === 15 && document.querySelectorAll('#mapa-a .cortada').length === 0"),
    ("demo-04-mini-gpt", "demos/04-mini-gpt/", rodar_mini_gpt, "document.getElementById('saida').textContent.length > 240"),
    ("demo-04-treino", "demos/04-mini-gpt/?cena=C08-S03&apresentador=a3", None, "document.querySelector('.carimbo').textContent.includes('C08-S03') && document.querySelector('.carimbo').textContent.includes('08/13')"),
    ("demo-04-fallback", "demos/04-mini-gpt/?pregravado", None, "document.getElementById('saida').textContent.length > 100"),
    ("demo-05-amostragem", "demos/05-amostragem-kv-cache/", rodar_kv, "document.getElementById('resultado-kv').dataset.pronto === '1'"),
    ("sfx-preview", "sfx/preview.html", clicar("#medir"), "document.querySelectorAll('#tabela tbody tr[data-medido]').length >= 5"),
]

PROIBIDOS = [
    (r"backdrop-filter", "glassmorphism"),
    (r"box-shadow", "sombra suave"),
    (r"text-shadow", "brilho em texto"),
    (r"border-radius", "canto arredondado"),
    (r"radial-gradient", "gradiente radial/brilho"),
    (r"font-family:[^;]*\b(Inter|Poppins)\b", "Inter/Poppins"),
    (r"--fonte-[a-z]+:[^;]*\b(Inter|Poppins)\b", "Inter/Poppins"),
    (r"#(7c3aed|8b5cf6|a855f7|6366f1|4f46e5|00f0ff|00e5ff)\b", "roxo/azul neon"),
    (r"[\U0001F300-\U0001FAFF]", "emoji"),
    (r"(?i)\b(robot|optimus|autobot|decepticon|neural-brain)\b", "referência proibida"),
]


def varrer_proibidos():
    problemas = []
    arquivos = [p for pasta in ("app", "demos", "sfx", "styles") for p in (RAIZ / pasta).rglob("*") if p.suffix in {".css", ".html", ".js"}]
    for arq in arquivos:
        texto = arq.read_text(encoding="utf8")
        for padrao, nome in PROIBIDOS:
            if re.search(padrao, texto):
                problemas.append(f"{arq.relative_to(RAIZ)}: {nome}")
    print(f"Varredura da lista proibida: {len(arquivos)} arquivos, {len(problemas)} ocorrências")
    return problemas


def main():
    falhas = varrer_proibidos()
    SAIDA.mkdir(parents=True, exist_ok=True)
    manipulador = functools.partial(Silencioso, directory=str(RAIZ))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), manipulador)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/"

    with sync_playwright() as p:
        nav = p.chromium.launch(headless=True, args=["--autoplay-policy=no-user-gesture-required"])
        for nome, caminho, acao, verificacao in CAPTURAS:
            if FILTRO and FILTRO not in nome:
                continue
            pg = nav.new_page(viewport={"width": 1920, "height": 1080})
            erros = []
            pg.on("console", lambda m: erros.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
            pg.on("pageerror", lambda e: erros.append(f"exceção: {e}"))
            pg.on("requestfailed", lambda r: erros.append(f"rede: {r.url}"))
            pg.on("response", lambda r: erros.append(f"HTTP {r.status}: {r.url}") if r.status >= 400 else None)
            externos = []
            pg.on("request", lambda r: externos.append(r.url) if not r.url.startswith((base, "data:", "blob:")) else None)
            pg.goto(base + caminho, wait_until="networkidle")
            pg.wait_for_function("document.documentElement.dataset.pronto === '1'", timeout=30000)
            if acao:
                acao(pg)
                pg.wait_for_timeout(300)
            ok = pg.evaluate(verificacao)
            if not ok:
                erros.append("verificação falsa: " + verificacao)
            transbordo = pg.evaluate("""() => {
                const a = document.querySelector('.area');
                if (!a) return [];
                const lim = a.getBoundingClientRect();
                return [...a.querySelectorAll('*')]
                  .filter((e) => !(e instanceof SVGElement && e.tagName !== 'svg') && !e.closest('.katex'))
                  .filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent !== null && (r.bottom > lim.bottom + 1 || r.right > lim.right + 1); })
                  .slice(0, 5).map((e) => e.tagName + '#' + e.id + '.' + e.className);
            }""")
            pg.screenshot(path=str(SAIDA / f"{nome}.png"))
            if nome == "sfx-preview":
                print("  medições:", json.dumps(pg.evaluate("window.medicoes"), ensure_ascii=False))
            situacao = "ok" if ok and not erros and not externos and not transbordo else "FALHOU"
            print(f"{situacao:7s}{nome}  erros={len(erros)} externos={len(externos)} transbordo={transbordo}")
            for e in erros + externos:
                print("   ", e)
            if situacao != "ok":
                falhas.append(nome)
            pg.close()
        nav.close()
    srv.shutdown()
    if falhas:
        print("FALHAS:", falhas)
        sys.exit(1)
    print("OK: nenhuma falha")


main()

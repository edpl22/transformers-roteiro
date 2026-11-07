"""Percorre todas as cenas da animação em Chromium headless e falha se algo der errado.

Confere: console sem erro, sem rede externa, nada fora da área útil, voltar e avançar coerentes,
apresentador do carimbo igual ao do mapa de tempo. Salva o estado final de cada cena em roteiro/previews/cenas/.
Uso: python scripts/testar_animacao.py [--tempo-real] [filtro]
"""
import base64
import functools
import hashlib
import http.server
import pathlib
import sys
import threading

from playwright.sync_api import sync_playwright
from check_timing import ler_falas

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "roteiro" / "previews" / "cenas"
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
FILTRO = ARGS[0] if ARGS else ""
TEMPO_REAL = "--tempo-real" in sys.argv
LIMITE_PIXELS = 20   # em 2 milhões: suavização na ponta dos traços, invisível na tela

LIMITES = """() => {
  const fora = [];
  for (const e of document.querySelectorAll('.cena .el, .cena > svg > *')) {
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = e.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > 1882 || r.left < 38 || r.bottom > 968 || r.top < 20) {
      fora.push((e.textContent || e.tagName).trim().slice(0, 40) + ' [' + [r.left, r.top, r.right, r.bottom].map(Math.round) + ']');
    }
  }
  return fora.slice(0, 6);
}"""

SOBREPOSTOS = """() => {
  const blocos = [...document.querySelectorAll('.cena .el')].filter((e) => {
    const cs = getComputedStyle(e);
    return cs.visibility !== 'hidden' && (e.textContent || '').trim().length > 0 && !e.querySelector('.el');
  }).map((e) => ({ t: e.textContent.trim().slice(0, 28), r: e.getBoundingClientRect() }));
  const achados = [];
  for (let i = 0; i < blocos.length; i++) for (let j = i + 1; j < blocos.length; j++) {
    const a = blocos[i].r, b = blocos[j].r;
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w > 6 && h > 6) achados.push(blocos[i].t + ' × ' + blocos[j].t);
  }
  return achados.slice(0, 6);
}"""


# Conta pixels com diferença forte. Variações leves de suavização de borda são esperadas.
COMPARAR = """async ([a, b]) => {
  const ler = async (src) => {
    const i = new Image(); i.src = src; await i.decode();
    const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
    const x = c.getContext('2d'); x.drawImage(i, 0, 0);
    return x.getImageData(0, 0, i.width, i.height).data;
  };
  const [p, q] = await Promise.all([ler(a), ler(b)]);
  let n = 0;
  for (let k = 0; k < p.length; k += 4) {
    if (Math.abs(p[k] - q[k]) > 40 || Math.abs(p[k + 1] - q[k + 1]) > 40 || Math.abs(p[k + 2] - q[k + 2]) > 40) n++;
  }
  return n;
}"""


def data_url(arq):
    return "data:image/png;base64," + base64.b64encode(arq.read_bytes()).decode()


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class Servidor(http.server.ThreadingHTTPServer):
    def handle_error(self, *a):      # navegador fechando conexão não é falha do teste
        pass


def testar_teclado(nav, base):
    """Percorre o fluxo real: preparação, avanço, volta, clicker dentro de demo, contingência e ensaio."""
    falhas = []
    pg = nav.new_page(viewport={"width": 1920, "height": 1080})
    erros = []
    pg.on("pageerror", lambda e: erros.append(str(e)))
    estado = lambda: pg.evaluate("[document.documentElement.dataset.cena, Number(document.documentElement.dataset.passo)]")

    def conferir(nome, cond):
        print(f"{'ok' if cond else 'FALHOU':7s}teclado: {nome}")
        if not cond:
            falhas.append(f"teclado: {nome}")

    pg.goto(base + "?mudo", wait_until="networkidle")
    pg.wait_for_function("document.documentElement.dataset.pronto === '1'", timeout=60000)
    conferir("tela de preparação aparece", pg.evaluate("document.getElementById('preparo') !== null"))
    conferir("sem ?ensaio, a sobreposição não existe", pg.evaluate("document.getElementById('ensaio') === null"))
    conferir("tela inicial tem os três modos", pg.locator("#preparo button.modo").count() == 3)
    pg.screenshot(path=str(SAIDA / "interface-inicio.png"))
    pg.keyboard.press("Space")
    conferir("Espaço inicia em C01-S01", estado() == ["C01-S01", 0])
    pg.keyboard.press("ArrowRight")
    conferir("seta avança um passo", estado() == ["C01-S01", 1])
    pg.keyboard.press("PageDown")
    conferir("PageDown (clicker) avança", estado() == ["C01-S01", 2])
    pg.keyboard.press("PageUp")
    conferir("PageUp (clicker) volta", estado() == ["C01-S01", 1])
    pg.keyboard.press("Control+ArrowRight")
    conferir("Ctrl+seta pula de cena", estado()[0] == "C01-S02")
    pg.keyboard.press("g")
    conferir("G mostra a grade", pg.evaluate("document.getElementById('grade') !== null"))
    pg.keyboard.press("g")

    # Mouse: clique avança, barra aparece e some, botões funcionam
    pg.evaluate("window.motor.irPara('C04-S06', 0, { animar: false, comSom: false })")
    barra_visivel = "document.getElementById('barra').classList.contains('visivel')"
    pg.mouse.move(600, 500)
    pg.mouse.click(600, 500)
    conferir("clique no palco avança um passo", estado() == ["C04-S06", 1])
    conferir("mover o mouse mostra a barra", pg.evaluate(barra_visivel))
    sem_contraste = pg.evaluate("""() => [...document.querySelectorAll('#barra button:not(.seg)')].filter((b) => {
      const c = getComputedStyle(b), fundo = c.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(b.closest('#barra')).backgroundColor : c.backgroundColor;
      return c.color === fundo || !b.innerText.trim();
    }).map((b) => b.id)""")
    conferir(f"botões da barra têm texto visível {sem_contraste or ''}", not sem_contraste)
    pg.screenshot(path=str(SAIDA / "interface-barra.png"))
    pg.click("#b-avancar")
    conferir("botão Avançar avança", estado() == ["C04-S06", 2])
    pg.click("#b-voltar")
    conferir("botão Voltar volta", estado() == ["C04-S06", 1])
    pg.click("#barra button.seg[data-cena='C07-S01']")
    conferir("linha do tempo salta de cena", estado()[0] == "C07-S01")
    pg.mouse.move(600, 300)
    pg.wait_for_timeout(3000)
    conferir("barra some com o mouse parado", not pg.evaluate(barra_visivel))
    pg.keyboard.press("m")
    conferir("M abre o índice", pg.evaluate("document.getElementById('indice') !== null"))
    conferir("índice lista as 44 cenas", pg.locator("button.indice-cena").count() == 44)
    pg.screenshot(path=str(SAIDA / "interface-indice.png"))
    antes = estado()
    pg.keyboard.press("ArrowRight")
    conferir("com painel aberto, a seta não mexe na cena", estado() == antes)
    pg.click("button.indice-cena[data-cena='C09-S01']")
    conferir("índice salta de cena e fecha", estado()[0] == "C09-S01" and pg.evaluate("document.getElementById('indice') === null"))
    pg.keyboard.press("h")
    conferir("H abre a ajuda", pg.evaluate("document.getElementById('ajuda') !== null"))
    pg.screenshot(path=str(SAIDA / "interface-ajuda.png"))
    conferir("ajuda oferece voltar à tela inicial", pg.locator("#b-inicio").count() == 1)
    pg.keyboard.press("Escape")
    conferir("Esc fecha a ajuda", pg.evaluate("document.getElementById('ajuda') === null"))
    pg.mouse.move(600, 500)
    pg.click("#b-som")
    conferir("botão de som alterna", "Som ligado" in pg.inner_text("#b-som") and pg.evaluate("window.sfxMudo === false"))
    pg.click("#b-som")
    pg.keyboard.press("e")
    pg.wait_for_function("document.getElementById('ensaio') !== null")
    conferir("E liga o ensaio sem recarregar", True)
    pg.keyboard.press("e")

    # Memória: ao abrir de novo sem cena na URL, oferece continuar de onde parou
    pg.evaluate("window.motor.irPara('C05-S02', 1, { animar: false, comSom: false })")
    pg.goto(base + "?mudo", wait_until="networkidle")
    pg.wait_for_function("document.documentElement.dataset.pronto === '1'")
    conferir("tela inicial oferece continuar", "C05-S02" in pg.inner_text("button.retomar"))
    pg.click("button.retomar")
    conferir("continuar volta à cena e ao passo", estado() == ["C05-S02", 1])

    # Modo Gravar: nenhum controle na tela
    pg2 = nav.new_page(viewport={"width": 1920, "height": 1080})
    pg2.goto(base + "?mudo", wait_until="networkidle")
    pg2.wait_for_function("document.documentElement.dataset.pronto === '1'")
    pg2.click("#preparo button[data-modo=gravar]")
    pg2.mouse.move(800, 500)
    conferir("Gravar não cria barra nem dica", pg2.evaluate("!document.getElementById('barra') && !document.getElementById('dica')"))
    pg2.keyboard.press("m")
    pg2.keyboard.press("e")
    conferir("Gravar ignora índice e ensaio", pg2.evaluate("!document.getElementById('indice') && !document.getElementById('ensaio')"))
    pg2.keyboard.press("Space")
    conferir("Gravar avança pelo teclado", pg2.evaluate("document.documentElement.dataset.passo") == "1")
    pg2.close()

    # Demo: mouse no meio não mostra a barra; no rodapé, mostra
    pg.evaluate("location.hash = '#C07-S04'")
    pg.wait_for_function("document.getElementById('demo') !== null")
    pg.frame_locator("#demo").locator("#troca").wait_for()
    pg.wait_for_timeout(3000)
    pg.mouse.move(900, 500)
    pg.wait_for_timeout(200)
    conferir("na demo, mouse no meio não mostra a barra", not pg.evaluate(barra_visivel))
    conferir("na demo aparece a dica do que fazer", "Trocar o token futuro" in pg.inner_text("#dica"))
    conferir("a dica da demo fica no alto, sem cobrir os dados", pg.evaluate("document.getElementById('dica').getBoundingClientRect().bottom < 150"))
    pg.mouse.move(900, 1000)
    pg.wait_for_timeout(200)
    conferir("na demo, mouse no rodapé mostra a barra", pg.evaluate(barra_visivel))
    pg.screenshot(path=str(SAIDA / "interface-demo.png"))
    pg.click("#b-avancar")
    conferir("botão sai da demo", estado()[0] == "C07-S05")

    pg.evaluate("location.hash = '#C07-S04'")
    pg.wait_for_function("document.getElementById('demo') !== null")
    pg.frame_locator("#demo").locator("#troca").wait_for()
    conferir("URL abre a cena e a demo", estado()[0] == "C07-S04")
    pg.frame_locator("#demo").locator("#troca").click()
    pg.keyboard.press("PageDown")
    pg.wait_for_timeout(300)
    conferir("clicker com foco na demo avança a cena", estado()[0] == "C07-S05")
    pg.keyboard.press("PageUp")
    pg.wait_for_function("document.getElementById('demo') !== null")
    pg.frame_locator("#demo").locator("#troca").wait_for()
    pg.frame_locator("#demo").locator("#troca").click()      # foco dentro da demo, como ao vivo
    pg.keyboard.press("d")
    conferir("D troca a demo pela contingência, com o foco na demo", pg.evaluate("document.getElementById('demo-reserva') !== null && document.getElementById('demo') === null"))
    pg.wait_for_function("document.getElementById('demo-reserva').complete && document.getElementById('demo-reserva').naturalWidth > 0")
    conferir("imagem de contingência carrega", True)

    pg.keyboard.press("d")
    pg.wait_for_function("document.getElementById('demo') !== null")
    conferir("D volta para a demo", pg.evaluate("document.getElementById('demo-reserva') === null"))

    # Sem D: com o foco num botão da demo, Espaço e → passam a cena e não acionam o botão
    pg.frame_locator("#demo").locator("#troca").wait_for()
    pg.frame_locator("#demo").locator("#troca").click()
    pg.keyboard.press(" ")
    pg.wait_for_timeout(300)
    conferir("Espaço com o foco na demo avança a cena", estado()[0] == "C07-S05")
    pg.keyboard.press("ArrowLeft")
    pg.wait_for_function("document.getElementById('demo') !== null")
    conferir("← com a demo aberta volta a cena", estado()[0] == "C07-S04")
    pg.frame_locator("#demo").locator("#troca").wait_for()
    pg.frame_locator("#demo").locator("#troca").click()
    pg.keyboard.press("ArrowRight")
    pg.wait_for_timeout(300)
    conferir("→ com o foco na demo avança a cena", estado()[0] == "C07-S05")
    pg.keyboard.press("PageUp")
    pg.wait_for_function("document.getElementById('demo') !== null")
    pg.frame_locator("#demo").locator("#troca").wait_for()

    pg.evaluate("location.hash = '#C09-S02'")
    pg.wait_for_function("document.documentElement.dataset.cena === 'C09-S02' && document.getElementById('demo') !== null")
    pg.frame_locator("#demo").locator("#prompt").click()
    pg.keyboard.type("d")
    conferir("digitar d no campo de texto da demo não aciona a contingência", pg.evaluate("document.getElementById('demo') !== null"))
    pg.keyboard.type(" a")
    conferir("Espaço no campo de texto digita e não passa a cena", estado()[0] == "C09-S02" and pg.frame_locator("#demo").locator("#prompt").input_value().endswith("d a"))

    pg.goto(base + "?mudo&ensaio#C04-S06", wait_until="networkidle")
    pg.wait_for_function("document.querySelector('#ensaio .agora') !== null")
    pg.screenshot(path=str(SAIDA / "ensaio.png"))
    conferir("?ensaio mostra o texto da fala", "Três tokens" in pg.evaluate("document.querySelector('#ensaio .agora').textContent"))
    pg.evaluate("window.motor.avancar()")
    conferir("o texto do ensaio acompanha o passo", "Primeira etapa" in pg.evaluate("document.querySelector('#ensaio .agora').textContent"))
    conferir("sem exceções no fluxo de teclado", not erros)
    for e in erros:
        print("    ", e[:200])
    pg.close()
    return falhas


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    srv = Servidor(("127.0.0.1", 0), functools.partial(Silencioso, directory=str(RAIZ)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/app/"
    falhas = []

    with sync_playwright() as p:
        nav = p.chromium.launch(headless=True, args=["--autoplay-policy=no-user-gesture-required"])
        pg = nav.new_page(viewport={"width": 1920, "height": 1080})
        erros = []
        pg.on("console", lambda m: erros.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: erros.append(f"exceção: {e}"))
        pg.on("response", lambda r: erros.append(f"HTTP {r.status}: {r.url}") if r.status >= 400 else None)
        externos = []
        pg.on("request", lambda r: externos.append(r.url) if not r.url.startswith(("http://127.0.0.1", "data:", "blob:", "about:")) else None)

        pg.goto(base + ("?mudo&gravacao" if TEMPO_REAL else "?instantaneo&mudo"), wait_until="networkidle")
        pg.wait_for_function("document.documentElement.dataset.pronto === '1'", timeout=60000)
        pg.evaluate("document.querySelector('#preparo button[data-modo=gravar]')?.click()")
        cenas = pg.evaluate("window.motor.cenas()")
        print(f"{len(cenas)} cenas, {sum(c['passos'] for c in cenas)} passos")
        falas = ler_falas()
        for c in cenas:
            if falas.get(c["id"], {}).get("cliques") != c["passos"] - 1:
                falhas.append(f"{c['id']}: 11-falas.md marca {falas.get(c['id'], {}).get('cliques')} cliques, a cena tem {c['passos'] - 1}")
        print(f"11-falas.md: marcas de clique conferidas contra os passos das {len(cenas)} cenas")

        for c in cenas:
            cid = c["id"]
            if FILTRO and FILTRO not in cid:
                continue
            erros.clear()
            problemas = []
            pg.evaluate(f"window.motor.irPara('{cid}', 0, {{ animar: {'true' if TEMPO_REAL else 'false'}, comSom: false }})")
            for k in range(c["passos"]):
                if k:
                    pg.evaluate("window.motor.avancar()")
                if TEMPO_REAL:
                    pg.wait_for_function("document.getAnimations().length === 0 || document.getAnimations().every((a) => a.playState !== 'running')", timeout=15000)
                    pg.wait_for_timeout(120)
                if not pg.evaluate("document.getElementById('demo') !== null"):
                    fora = pg.evaluate(LIMITES)
                    if fora:
                        problemas.append(f"passo {k + 1} fora da área: {fora}")
            sobre = pg.evaluate(SOBREPOSTOS)
            if sobre and not pg.evaluate("document.getElementById('demo') !== null"):
                problemas.append(f"sobreposição: {sobre}")
            if pg.evaluate("document.getElementById('demo') !== null"):
                pg.wait_for_timeout(1500)                 # espera a demo carregar
            arq = SAIDA / f"{cid}{'-real' if TEMPO_REAL else ''}.png"
            pg.screenshot(path=str(arq))
            h_final = hashlib.sha1(arq.read_bytes()).hexdigest()[:8]
            referencia = SAIDA / f"{cid}.png"
            tem_demo = pg.evaluate("document.getElementById('demo') !== null")
            if TEMPO_REAL and referencia.exists() and not tem_demo:
                n = pg.evaluate(COMPARAR, [data_url(referencia), data_url(arq)])
                if n > LIMITE_PIXELS:
                    problemas.append(f"estado final em tempo real difere do instantâneo em {n} pixels")
            if TEMPO_REAL:
                arq.unlink()

            # Carimbo: nas cenas de passagem, o último passo já mostra o próximo apresentador
            quem = pg.evaluate("document.querySelector('.carimbo [data-pessoa]').dataset.pessoa")
            if quem != c["apresentador"] and cid not in ("C03-S04", "C05-S03", "C08-S03"):
                problemas.append(f"carimbo {quem}, esperado {c['apresentador']}")

            # Voltar um passo e avançar de novo precisa dar o mesmo resultado
            if c["passos"] > 1 and not TEMPO_REAL:
                pg.evaluate("window.motor.voltar()")
                if int(pg.evaluate("document.documentElement.dataset.passo")) != c["passos"] - 2:
                    problemas.append("voltar não recuou um passo")
                pg.evaluate("window.motor.avancar()")
                if pg.evaluate("document.getElementById('demo') !== null"):
                    pg.wait_for_timeout(1500)
                h2 = hashlib.sha1(pg.screenshot()).hexdigest()[:8]
                if h2 != h_final and not pg.evaluate("document.getElementById('demo') !== null"):
                    problemas.append("voltar e avançar mudou a imagem")

            problemas += erros + externos
            externos.clear()
            situacao = "ok" if not problemas else "FALHOU"
            print(f"{situacao:7s}{cid} passos={c['passos']} {h_final}")
            for x in problemas:
                print("    ", str(x)[:230])
            if problemas:
                falhas.append(cid)
        if not FILTRO:
            falhas += testar_teclado(nav, base)
        nav.close()
    srv.shutdown()
    if falhas:
        print("FALHAS:", falhas)
        sys.exit(1)
    print("OK: nenhuma falha")


main()

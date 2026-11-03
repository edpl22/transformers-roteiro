"""Mede a taxa de quadros da animação no Chrome desta máquina, sem abrir janela, usando a placa de vídeo quando possível.

Leva cerca de 3 minutos. Rode no computador que vai gravar. Antes das cenas, mede uma página parada como controle:
se o controle não alcança MINIMO_FPS, o limite vem do ambiente e a medição é descartada.
Falha se alguma cena ficar abaixo de MINIMO_FPS. As demos embutidas não entram na medição.
Não substitui olhar a gravação: o custo do programa de captura não entra na conta.
Uso: python scripts/medir_fps.py [filtro]
"""
import functools
import http.server
import pathlib
import sys
import threading

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FILTRO = sys.argv[1] if len(sys.argv) > 1 else ""
MINIMO_FPS = 55
JANELA_MS = 1400

CONTROLE = """(ms) => new Promise((fim) => {
  let n = 0; const ini = performance.now();
  const f = (t) => { n++; if (t - ini < ms) requestAnimationFrame(f); else fim(1000 * n / (t - ini)); };
  requestAnimationFrame(f);
})"""

MEDIR_CENA = """async ([id, janela]) => {
  const medir = (ms) => new Promise((fim) => {
    const t = []; const ini = performance.now(); let a = ini;
    const f = (n) => { t.push(n - a); a = n; if (n - ini < ms) requestAnimationFrame(f); else fim(t); };
    requestAnimationFrame(f);
  });
  const c = window.motor.cenas().find((x) => x.id === id);
  const t = [];
  window.motor.irPara(id, 0, { animar: true, comSom: false });
  t.push(...await medir(janela));
  for (let k = 1; k < c.passos; k++) {
    if (document.getElementById('demo')) break;
    window.motor.avancar();
    if (document.getElementById('demo')) break;
    t.push(...await medir(janela));
  }
  const o = [...t].sort((x, y) => x - y);
  return {
    fps: 1000 * t.length / t.reduce((a, b) => a + b, 0),
    p95: o[Math.floor(o.length * 0.95)],
    pior: o.at(-1),
    visivel: document.visibilityState,
  };
}"""


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class Servidor(http.server.ThreadingHTTPServer):
    def handle_error(self, *a):
        pass


def abrir(p):
    """Prefere o navegador instalado, o mesmo usado na gravação. Usa um perfil temporário, nunca o seu."""
    args = ["--use-angle=default", "--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--disable-background-timer-throttling"]
    for canal in ("chrome", "msedge", None):
        try:
            return p.chromium.launch(headless=True, channel=canal, args=args)
        except Exception as erro:
            print(f"Não abriu {canal or 'chromium'}: {str(erro).splitlines()[0][:80]}")
    sys.exit("Nenhum navegador disponível")


def main():
    srv = Servidor(("127.0.0.1", 0), functools.partial(Silencioso, directory=str(RAIZ)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        nav = abrir(p)
        print("Navegador:", nav.browser_type.name, nav.version)
        pg = nav.new_page(viewport={"width": 1920, "height": 1080})
        pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/app/?mudo&gravacao", wait_until="networkidle")
        pg.wait_for_function("document.documentElement.dataset.pronto === '1'", timeout=60000)
        pg.evaluate("document.querySelector('#preparo button[data-modo=gravar]')?.click()")
        gpu = pg.evaluate("""() => {
          const g = document.createElement('canvas').getContext('webgl');
          const e = g && g.getExtension('WEBGL_debug_renderer_info');
          return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'desconhecida';
        }""")
        print("Placa:", gpu)
        controle = pg.evaluate(CONTROLE, 3000)
        print(f"Controle, página parada: {controle:.1f} fps")
        if controle < MINIMO_FPS:
            print("Medição inválida: o limite vem do ambiente, não da animação.")
            nav.close()
            srv.shutdown()
            sys.exit(2)
        resultados = []
        for c in pg.evaluate("window.motor.cenas()"):
            if (FILTRO and FILTRO not in c["id"]) or (c["demo"] and c["passos"] == 1):
                continue
            r = pg.evaluate(MEDIR_CENA, [c["id"], JANELA_MS])
            resultados.append((c["id"], r))
        nav.close()
    srv.shutdown()

    for cid, r in sorted(resultados, key=lambda x: x[1]["fps"])[:8]:
        print(f"{cid}  {r['fps']:5.1f} fps  p95 {r['p95']:5.1f} ms  pior quadro {r['pior']:6.1f} ms  página {r['visivel']}")
    media = sum(r["fps"] for _, r in resultados) / len(resultados)
    ruins = [cid for cid, r in resultados if r["fps"] < MINIMO_FPS]
    print(f"{len(resultados)} cenas medidas; média de {media:.1f} fps; abaixo de {MINIMO_FPS} fps: {ruins or 'nenhuma'}")
    if ruins:
        sys.exit(1)
    print("OK")


main()

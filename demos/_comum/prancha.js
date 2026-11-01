// Molde de prancha: escala o palco, desenha moldura com zonas, preenche o carimbo a partir do config.
const SVG_NS = "http://www.w3.org/2000/svg";

export function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "style") n.style.cssText = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const f of filhos) n.append(f);
  return n;
}

export function svgEl(tag, attrs = {}, ...filhos) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  for (const f of filhos) n.append(f);
  return n;
}

// Cor da célula do mapa de calor: interpola papel -> tinta; texto inverte acima de 0,55.
export function corPeso(p) {
  const a = [242, 237, 224], b = [27, 36, 48];
  const t = Math.max(0, Math.min(1, p));
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * t));
  return { fundo: `rgb(${c.join(",")})`, texto: t > 0.55 ? "#F2EDE0" : "#1B2430" };
}

export function fmt(x, casas = 3) {
  return Number(x).toFixed(casas).replace(".", ",");
}

export function matrizHTML(M, { casas = 0, cor = "" } = {}) {
  const m = el("div", { class: `matriz ${cor}`, style: `grid-template-columns: repeat(${M[0].length}, auto)` });
  for (const linha of M) for (const x of linha) m.append(el("span", {}, Number.isInteger(x) && casas === 0 ? String(x) : fmt(x, casas)));
  return m;
}

export function tex(alvo, fonte, display = false) {
  window.katex.render(fonte, alvo, { displayMode: display, throwOnError: true, strict: "error" });
}

export function escalar(palco) {
  const e = Math.min(innerWidth / 1920, innerHeight / 1080);
  palco.style.transform = `scale(${e})`;
  palco.style.left = `${(innerWidth - 1920 * e) / 2}px`;
  palco.style.top = `${(innerHeight - 1080 * e) / 2}px`;
}

export function desenharMoldura(palco) {
  const s = svgEl("svg", { class: "moldura", viewBox: "0 0 1920 1080" });
  s.append(svgEl("defs", {}, svgEl("filter", { id: "traco-mao", x: "-1%", y: "-1%", width: "102%", height: "102%" },
    svgEl("feTurbulence", { type: "fractalNoise", baseFrequency: ".012", numOctaves: "1", seed: "7" }),
    svgEl("feDisplacementMap", { in: "SourceGraphic", scale: "3" }))));
  const g = svgEl("g", { fill: "none", stroke: "#1B2430", filter: "url(#traco-mao)" });
  g.append(svgEl("rect", { x: 40, y: 40, width: 1840, height: 1000, "stroke-width": 2 }));
  g.append(svgEl("rect", { x: 24, y: 24, width: 1872, height: 1032, "stroke-width": 1 }));
  for (let i = 1; i < 12; i++) {
    const x = 40 + (1840 * i) / 12;
    g.append(svgEl("path", { d: `M${x} 24V40M${x} 1040V1056`, "stroke-width": 1 }));
  }
  for (let i = 1; i < 6; i++) {
    const y = 40 + (1000 * i) / 6;
    g.append(svgEl("path", { d: `M24 ${y}H40M1880 ${y}H1896`, "stroke-width": 1 }));
  }
  s.append(g);
  for (let i = 0; i < 12; i++) {
    const x = 40 + (1840 * (i + 0.5)) / 12;
    const t = svgEl("text", { x, y: 37 }); t.textContent = i + 1; s.append(t);
  }
  for (let i = 0; i < 6; i++) {
    const y = 40 + (1000 * (i + 0.5)) / 6 + 6;
    const t = svgEl("text", { x: 32, y }); t.textContent = "ABCDEF"[i]; s.append(t);
    const u = svgEl("text", { x: 1888, y }); u.textContent = "ABCDEF"[i]; s.append(u);
  }
  palco.prepend(s);
}

async function preencherCarimbo(palco) {
  const d = palco.dataset;
  const url = new URLSearchParams(location.search);
  if (url.has("cena")) {
    d.cena = url.get("cena");
    d.folha = `${d.cena.slice(1, 3)}/13`;
  }
  if (url.has("apresentador")) d.apresentador = url.get("apresentador");
  const pessoas = await (await fetch(new URL("../../config/apresentadores.json", import.meta.url))).json();
  const p = pessoas.find((x) => x.id === d.apresentador);
  const carimbo = el("div", { class: "carimbo" },
    el("div", {}, el("small", {}, "Cena"), el("b", {}, d.cena)),
    el("div", {}, el("small", {}, "Título"), el("b", {}, d.titulo)),
    el("div", {}, el("small", {}, "Apresenta"), el("b", {}, `${p.nome} · ${p.papel}`)),
    el("div", {}, el("small", {}, "Implementação"), el("span", { class: "mono" }, d.demo)),
    el("div", {}, el("small", {}, "Prancha"), el("b", {}, d.folha)));
  palco.append(carimbo);
}

export async function montarPrancha() {
  const palco = document.querySelector(".prancha");
  escalar(palco);
  addEventListener("resize", () => escalar(palco));
  desenharMoldura(palco);
  await preencherCarimbo(palco);
  await document.fonts.ready;
  return palco;
}

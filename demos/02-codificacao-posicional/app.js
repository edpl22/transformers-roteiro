import { fmt, montarPrancha, svgEl, tex } from "../_comum/prancha.js";
import { codificacaoPosicional, comprimentoDeOnda, produtoEscalar, valorContinuo } from "./pe.js";

const $ = (id) => document.getElementById(id);
const N_POS = 100;
const CORES = ["#17507F", "#B5332A", "#94650A", "#2E6A4F"];
let pe, dModel, posFoco = 20;

function curvas() {
  const salto = Math.max(1, dModel / 16);
  const iBase = Math.min(Number($("i").value), dModel / 2 - 1 - 3 * salto);
  $("i-v").textContent = iBase;
  const s = $("curvas");
  s.replaceChildren();
  const X0 = 150, L = 866, ALT = 104, GAP = 12;
  const x = (pos) => X0 + (L * pos) / (N_POS - 1);
  [0, 1, 2, 3].forEach((n) => {
    const i = iBase + n * salto, d = 2 * i, meio = 10 + ALT / 2 + n * (ALT + GAP);
    const y = (v) => meio - (v * ALT) / 2.15;
    s.append(svgEl("path", { d: `M${X0} ${meio}H${X0 + L}`, stroke: "#CFC8B4", "stroke-width": 1 }));
    let caminho = "";
    for (let k = 0; k <= 800; k++) {
      const pos = ((N_POS - 1) * k) / 800;
      caminho += `${k ? "L" : "M"}${x(pos).toFixed(1)} ${y(valorContinuo(pos, d, dModel)).toFixed(1)}`;
    }
    s.append(svgEl("path", { d: caminho, fill: "none", stroke: CORES[n], "stroke-width": 2.5 }));
    const t = svgEl("text", { x: 0, y: meio - 4 }); t.textContent = `dim ${d}`; s.append(t);
    const o = svgEl("text", { x: 0, y: meio + 20 }); o.textContent = `λ=${fmt(comprimentoDeOnda(i, dModel), 1)}`; s.append(o);
    s.append(svgEl("circle", { cx: x(posFoco), cy: y(pe[posFoco][d]), r: 6, fill: CORES[n] }));
  });
  const fundo = 4 * (ALT + GAP) + 4;
  s.append(svgEl("path", { d: `M${x(posFoco)} 6V${fundo}`, stroke: "#1B2430", "stroke-width": 1.5, "stroke-dasharray": "5 5" }));
  const tp = svgEl("text", { x: Math.min(x(posFoco) + 8, 930), y: fundo + 16 }); tp.textContent = `pos=${posFoco}`; s.append(tp);
  const eixo = svgEl("text", { x: X0, y: fundo + 16 }); eixo.textContent = "pos=0"; s.append(eixo);
  $("leitura-onda").textContent = "Comprimento de onda λ de 2π a 10000·2π, em progressão geométrica.";
}

function mapa() {
  const c = $("mapa");
  c.width = dModel; c.height = N_POS;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(dModel, N_POS);
  const papel = [242, 237, 224], azul = [23, 80, 127], verm = [181, 51, 42];
  for (let p = 0; p < N_POS; p++) for (let d = 0; d < dModel; d++) {
    const v = pe[p][d], alvo = v >= 0 ? azul : verm, t = Math.abs(v), k = (p * dModel + d) * 4;
    for (let m = 0; m < 3; m++) img.data[k + m] = papel[m] + (alvo[m] - papel[m]) * t;
    img.data[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = "#1B2430";
  ctx.fillRect(0, posFoco, dModel, Math.max(1, N_POS / 180));
}

function similaridade() {
  const s = $("sim");
  s.replaceChildren();
  const X0 = 8, L = 674, H = 84;
  const norma = produtoEscalar(pe[posFoco], pe[posFoco]);
  const v = pe.map((l) => produtoEscalar(l, pe[posFoco]) / norma);
  const y = (u) => 94 - H * Math.max(0, u);
  s.append(svgEl("path", { d: `M${X0} 94H${X0 + L}`, stroke: "#1B2430", "stroke-width": 1.5 }));
  s.append(svgEl("path", { d: v.map((u, p) => `${p ? "L" : "M"}${X0 + (L * p) / (N_POS - 1)} ${y(u)}`).join(""), fill: "none", stroke: "#2E6A4F", "stroke-width": 2.5 }));
  const t = svgEl("text", { x: X0, y: 114 }); t.textContent = `PE(${posFoco})·PE(p), normalizado: posições próximas são mais parecidas`; s.append(t);
  $("leitura-pos").textContent = `pos ${posFoco}: [${pe[posFoco].slice(0, 4).map((x) => fmt(x, 3)).join("; ")}; …]`;
}

function tudo() {
  dModel = 2 ** Number($("dm").value);
  $("dm-v").textContent = dModel;
  $("i").max = dModel / 2 - 1 - 3 * Math.max(1, dModel / 16);
  pe = codificacaoPosicional(N_POS, dModel);
  curvas(); mapa(); similaridade();
}

await montarPrancha();
const eqs = $("eqs");
for (const f of [
  "PE_{(pos,\\,2i)}=\\sin\\!\\left(pos/10000^{2i/d_{\\mathrm{model}}}\\right)",
  "PE_{(pos,\\,2i+1)}=\\cos\\!\\left(pos/10000^{2i/d_{\\mathrm{model}}}\\right)",
]) { const d = document.createElement("div"); tex(d, f); eqs.append(d); }
$("i").addEventListener("input", tudo);
$("dm").addEventListener("input", tudo);
$("mapa").addEventListener("mousemove", (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  posFoco = Math.max(0, Math.min(N_POS - 1, Math.floor(((e.clientY - r.top) / r.height) * N_POS)));
  curvas(); mapa(); similaridade();
});
addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { posFoco = Math.min(N_POS - 1, posFoco + 1); curvas(); mapa(); similaridade(); }
  if (e.key === "ArrowUp") { posFoco = Math.max(0, posFoco - 1); curvas(); mapa(); similaridade(); }
});
tudo();
document.documentElement.dataset.pronto = "1";

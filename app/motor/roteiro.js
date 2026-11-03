// Motor da animação: lê mapa de tempo e config, mantém cena e passo atuais e responde a mouse, teclado e clicker.
import { desenharMoldura, el, escalar, svgEl } from "../../demos/_comum/prancha.js";
import { FUNCOES } from "../../sfx/sfx.js";
import { Cena } from "./cena.js";
import { Ensaio } from "./ensaio.js";
import { Interface, montarPreparo } from "./interface.js";

const CAPITULOS = ["c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10", "c11", "c12", "c13"];
const CHAVE_POSICAO = "transformers:posicao";
const url = new URLSearchParams(location.search);
const SEM_ANIMACAO = url.has("instantaneo");

const palco = document.getElementById("palco");
let mapa, pessoas, moldura, carimbo;
const cenas = [];       // lista plana: { id, titulo, capitulo, apresentador, demo, inicio_s, fim_s, def }
let i = 0, passo = 0, atual = null, carimboPessoa = null, ctx = null, ensaio = null, demoAberta = null, ui = null;
let modo = SEM_ANIMACAO || url.has("gravacao") ? "gravar" : url.has("ensaio") ? "ensaiar" : "apresentar";
let mudo = url.has("mudo");
window.sfxMudo = mudo;   // as demos embutidas consultam este valor

function tocarSom(nome) {
  if (mudo) return;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  FUNCOES[nome](ctx);
}

async function carregar() {
  const raiz = new URL("../../", import.meta.url);
  [mapa, pessoas] = await Promise.all([
    fetch(new URL("roteiro/mapa-tempo.json", raiz)).then((r) => r.json()),
    fetch(new URL("config/apresentadores.json", raiz)).then((r) => r.json()),
  ]);
  const modulos = await Promise.all(CAPITULOS.map((c) => import(`../cenas/${c}.js`)));
  const defs = Object.assign({}, ...modulos.map((m) => m.default));
  let t = 0;
  mapa.capitulos.forEach((cap, n) => {
    const pessoa = pessoas.find((p) => p.id === cap.apresentador);
    for (const s of cap.cenas) {
      if (!defs[s.id]) throw new Error(`Cena sem módulo: ${s.id}`);
      cenas.push({ ...s, capitulo: cap, apresentador: cap.apresentador, nomePessoa: pessoa.nome, papelPessoa: pessoa.papel, nCap: n + 1, inicio_s: t, fim_s: t + s.duracao_s, def: defs[s.id] });
      t += s.duracao_s;
      delete defs[s.id];
    }
  });
  const sobra = Object.keys(defs);
  if (sobra.length) throw new Error(`Módulos sem cena no mapa: ${sobra}`);
}

function montarCarimbo() {
  carimbo = el("div", { class: "carimbo" });
  palco.append(carimbo);
}

function pintarCarimbo(c, pessoaId) {
  const p = pessoas.find((x) => x.id === pessoaId);
  carimboPessoa = pessoaId;
  carimbo.replaceChildren(
    el("div", {}, el("small", {}, "Cena"), el("b", {}, c.id)),
    el("div", {}, el("small", {}, "Título"), el("b", {}, c.titulo)),
    el("div", {}, el("small", {}, "Apresenta"), el("b", { "data-pessoa": pessoaId }, `${p.nome} · ${p.papel}`)),
    el("div", {}, el("small", {}, "Implementação"), el("span", { class: "mono" }, c.demo ?? "–")),
    el("div", {}, el("small", {}, "Prancha"), el("b", {}, `${String(c.nCap).padStart(2, "0")}/13`)));
}

// Carimbo real: desce, encosta, volta, já com o nome novo.
function carimbar(pessoaId, instantaneo) {
  const c = cenas[i];
  pintarCarimbo(c, pessoaId);
  if (instantaneo) return;
  tocarSom("trocaApresentador");
  carimbo.animate([{ transform: "translateY(-14px)", opacity: 0.4 }, { transform: "none", opacity: 1 }, { transform: "none" }], { duration: 300, easing: "cubic-bezier(0.7, 0, 0.84, 0)" });
}

function fecharDemo() {
  document.getElementById("demo")?.remove();
  document.getElementById("demo-reserva")?.remove();
  demoAberta = null;
}

function focarDemo() { document.getElementById("demo")?.focus(); }

// Encaminha do iframe só o que controla a cena; setas e espaço ficam com a demo.
function ligarDemo(f) {
  f.addEventListener("load", () => {
    const j = f.contentWindow;
    j.addEventListener("keydown", (e) => {
      const digitando = e.target.tagName === "INPUT" && e.target.type === "text";
      const letra = e.key.toLowerCase();
      if (["PageDown", "PageUp", "Escape"].includes(e.key) || (!digitando && ["d", "m", "h", "f", "s", "e"].includes(letra))) { e.preventDefault(); teclar(e); }
    });
    j.addEventListener("mousemove", (e) => ui?.mexeuNaDemo(e.clientY));
  });
}

function abrirDemo(caminho, reserva, instantaneo) {
  fecharDemo();
  notificar();
  if (!caminho) return;
  const f = el("iframe", { id: "demo", title: "Demonstração", src: new URL(`../../${caminho}`, import.meta.url).href });
  ligarDemo(f);
  palco.append(f);
  demoAberta = { caminho, reserva };
  if (!instantaneo) { tocarSom("abreDemo"); f.addEventListener("load", () => f.focus()); }
  notificar();
}

// Contingência da tecla D: troca a demo pelo screenshot da mesma tela.
function alternarDemo() {
  if (!demoAberta) return;
  const f = document.getElementById("demo");
  if (f) {
    const { caminho, reserva } = demoAberta;
    f.remove();
    palco.append(el("img", { id: "demo-reserva", alt: `Contingência de ${caminho}`, src: new URL(`../../roteiro/previews/${reserva}`, import.meta.url).href }));
  } else {
    const { caminho, reserva } = demoAberta;
    abrirDemo(caminho, reserva, true);
  }
}

function notificar() {
  const c = cenas[i];
  document.documentElement.dataset.cena = c.id;
  document.documentElement.dataset.passo = passo;
  document.documentElement.dataset.passos = c.def.passos.length;
  ui?.atualizar({ cena: c, indice: i, passo, passos: c.def.passos.length, demo: Boolean(demoAberta), mudo });
  ensaio?.atualizar(c, passo);
  try { localStorage.setItem(CHAVE_POSICAO, JSON.stringify({ id: c.id, passo })); } catch { /* sem memória, sem retomada */ }
}

function novaCena() {
  const raiz = el("div", { class: "cena" });
  palco.insertBefore(raiz, carimbo);
  return new Cena(raiz, {
    palco, dados: { pessoas, mapa, cenas, moldura, carimbo },
    tocarSom, abrirDemoFn: abrirDemo, carimbarFn: carimbar, moldura,
  });
}

// Monta a cena e reconstrói os passos anteriores ao alvo sem animar e sem som.
function irPara(indice, alvo, { animar = true, comSom = true } = {}) {
  const anterior = cenas[i];
  atual?.destruir();
  fecharDemo();
  moldura.style.visibility = "visible";
  carimbo.style.visibility = "visible";
  i = indice;
  const c = cenas[i];
  const mudouPessoa = carimboPessoa !== c.apresentador;
  const mudouCapitulo = anterior.capitulo !== c.capitulo;
  pintarCarimbo(c, c.apresentador);

  atual = novaCena();
  atual.instantaneo = true;
  atual.r = c.def.montar(atual) ?? {};
  passo = Math.max(0, Math.min(alvo, c.def.passos.length - 1));
  for (let k = 0; k < passo; k++) c.def.passos[k](atual, atual.r);
  atual.instantaneo = !animar || SEM_ANIMACAO;
  c.def.passos[passo](atual, atual.r);

  if (animar && !SEM_ANIMACAO) {
    atual.raiz.animate([{ transform: "translateX(40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    if (comSom && i !== 0) {
      if (mudouPessoa) tocarSom("trocaApresentador");
      else if (mudouCapitulo) tocarSom("transicaoCapitulo");
    }
  }
  history.replaceState(null, "", `${location.search}#${c.id}`);
  notificar();
}

function avancar() {
  const c = cenas[i];
  atual.concluir();
  if (passo < c.def.passos.length - 1) {
    passo++;
    atual.instantaneo = SEM_ANIMACAO;
    c.def.passos[passo](atual, atual.r);
    notificar();
  } else if (i < cenas.length - 1) irPara(i + 1, 0);
  ui?.esconderDica();
}

function voltar() {
  if (passo > 0) irPara(i, passo - 1, { animar: false });
  else if (i > 0) { const n = i - 1; irPara(n, cenas[n].def.passos.length - 1, { animar: false }); }
}

function alternarGrade() {
  const g = document.getElementById("grade");
  if (g) return g.remove();
  const s = svgEl("svg", { id: "grade", viewBox: "0 0 1920 1080" });
  for (let k = 0; k <= 12; k++) { const x = 40 + (k * 1840) / 12; s.append(svgEl("path", { d: `M${x} 40V1040`, stroke: "#17507F", "stroke-width": 1, "stroke-dasharray": "4 6" })); }
  for (let k = 0; k <= 6; k++) { const y = 40 + (k * 1000) / 6; s.append(svgEl("path", { d: `M40 ${y}H1880`, stroke: "#17507F", "stroke-width": 1, "stroke-dasharray": "4 6" })); }
  palco.append(s);
  return null;
}

function alternarSom() {
  mudo = !mudo;
  window.sfxMudo = mudo;
  notificar();
}

async function alternarEnsaio() {
  if (modo === "gravar") return;
  if (ensaio) { ensaio.alternar(); return; }
  ensaio = await Ensaio.criar(palco, cenas);
  notificar();
}

function telaCheia() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

function teclar(e) {
  if (document.getElementById("preparo")) return iniciarDoPreparo(e);
  const k = e.key, letra = k.toLowerCase();
  if (k === "Escape") return ui?.fecharPaineis();
  if (letra === "m") return ui?.alternarIndice();
  if (letra === "h" || k === "?") return ui?.alternarAjuda();
  if (ui?.painelAberto()) return null;             // com um painel aberto, o teclado não mexe na cena
  if (e.ctrlKey && k === "ArrowRight") { e.preventDefault(); return i < cenas.length - 1 && irPara(i + 1, cenas[i + 1].def.passos.length - 1, { animar: false }); }
  if (k === "ArrowRight" || k === " " || k === "PageDown") { e.preventDefault(); return avancar(); }
  if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); return voltar(); }
  if (k === "Home") return irPara(i, 0, { comSom: false });
  if (letra === "g") return alternarGrade();
  if (letra === "e") return alternarEnsaio();
  if (letra === "d") return alternarDemo();
  if (letra === "f") return telaCheia();
  if (letra === "s") return alternarSom();
  return null;
}

// Clique no palco avança, como em uma apresentação de slides. Controles têm seus próprios cliques.
function clicar(e) {
  if (e.target.closest("button, a, input, #barra, #indice, #ajuda, #preparo, #ensaio")) return;
  if (ui?.painelAberto()) { ui.fecharPaineis(); return; }
  avancar();
}

function definirModo(novo) {
  modo = novo;
  document.documentElement.dataset.modo = modo;
  palco.classList.toggle("sem-cursor", modo === "gravar");
  if (modo === "gravar") {
    ui?.barra.remove();
    ui?.caixaDica.remove();
    ui?.fecharPaineis();
    ui = null;
    return;
  }
  ui ??= new Interface(palco, {
    cenas,
    acoes: { avancar, voltar, ir: (n) => irPara(n, 0, { comSom: false }), alternarSom, alternarEnsaio, telaCheia, focarDemo, telaInicial: () => location.assign(`${location.pathname}${location.search}`) },
  });
}

function iniciar(novoModo, retomar) {
  document.getElementById("preparo").remove();
  definirModo(novoModo);
  if (novoModo === "ensaiar") alternarEnsaio();
  if (novoModo === "gravar") telaCheia();
  if (!mudo) { ctx = new AudioContext(); ctx.resume(); }
  const salvo = retomar ? posicaoSalva() : null;
  if (salvo) irPara(cenas.findIndex((c) => c.id === salvo.id), salvo.passo, { animar: false });
  else irPara(0, 0, { comSom: false });
  if (!salvo) ui?.dica("Clique ou aperte Espaço para avançar. Mova o mouse para ver os controles.", 8000);
}

function iniciarDoPreparo(e) {
  if (![" ", "Enter", "ArrowRight", "PageDown"].includes(e.key)) return;
  e.preventDefault();
  const focado = document.activeElement?.closest?.("#preparo button");
  if (e.key === "Enter" && focado) { focado.click(); return; }
  iniciar(modo, false);
}

function posicaoSalva() {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE_POSICAO));
    const c = p && cenas.find((x) => x.id === p.id);
    return c && (c.id !== cenas[0].id || p.passo > 0) ? { id: c.id, titulo: c.titulo, passo: p.passo } : null;
  } catch { return null; }
}

async function principal() {
  escalar(palco);
  addEventListener("resize", () => escalar(palco));
  desenharMoldura(palco);
  moldura = palco.querySelector(".moldura");
  montarCarimbo();
  await document.fonts.ready;
  await carregar();
  addEventListener("keydown", teclar);
  palco.addEventListener("click", clicar);
  addEventListener("hashchange", () => {
    const n = cenas.findIndex((c) => c.id === location.hash.slice(1));
    if (n < 0) return;
    if (document.getElementById("preparo")) { document.getElementById("preparo").remove(); definirModo(modo); }
    irPara(n, 0, { comSom: false });
  });

  const alvo = location.hash.slice(1);
  const pos = cenas.findIndex((c) => c.id === alvo);
  pintarCarimbo(cenas[0], cenas[0].apresentador);
  if (pos >= 0 || SEM_ANIMACAO) {
    definirModo(modo);
    if (modo === "ensaiar") await alternarEnsaio();
    irPara(Math.max(pos, 0), Number(url.get("passo") ?? 0), { animar: !SEM_ANIMACAO, comSom: false });
  } else {
    montarPreparo(palco, { modoInicial: modo, ultima: posicaoSalva(), iniciar });
  }
  document.documentElement.dataset.pronto = "1";
}

// API usada pelos testes automáticos
window.motor = { cenas: () => cenas.map((c) => ({ id: c.id, passos: c.def.passos.length, apresentador: c.apresentador, demo: c.demo ?? null })), irPara: (id, p, o) => irPara(cenas.findIndex((c) => c.id === id), p, o), avancar, voltar };

principal();

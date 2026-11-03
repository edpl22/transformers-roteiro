// SFX sintetizados com Web Audio API, sem amostras externas (licença: código deste repositório).
// Uma função por evento. Cada uma recebe (ctx, destino, t0) e devolve o instante em que termina.
// Metáfora sonora: o escritório de desenho (lápis, régua, folha, carimbo). Ver roteiro/03-biblia-sonora.md.

// Ganho mestre: -18 dB em relação ao ganho unitário. As medições estão em roteiro/03-biblia-sonora.md.
export const GANHO_MESTRE_DB = -18;

function dbParaLinear(db) { return 10 ** (db / 20); }

function ruido(ctx, duracao) {
  const n = Math.ceil(duracao * ctx.sampleRate);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let a = 22222;                                   // ruído determinístico: todo take soa igual
  for (let i = 0; i < n; i++) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    d[i] = a / 2147483648 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function envelope(ctx, t0, ataque, pico, queda) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(pico, t0 + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + ataque + queda);
  return g;
}

// Golpe tonal seco, como bloco de madeira.
function bloco(ctx, destino, t0, freq, pico, queda = 0.07) {
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(freq, t0);
  const g = envelope(ctx, t0, 0.002, pico, queda);
  o.connect(g).connect(destino);
  o.start(t0);
  o.stop(t0 + 0.002 + queda + 0.01);
  return t0 + 0.002 + queda;
}

// Sopro de ruído filtrado, como grafite ou papel.
function sopro(ctx, destino, t0, dur, f0, f1, q, pico) {
  const s = ruido(ctx, dur + 0.02);
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t0);
  f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = envelope(ctx, t0, Math.min(0.02, dur * 0.2), pico, dur * 0.8);
  s.connect(f).connect(g).connect(destino);
  s.start(t0);
  s.stop(t0 + dur + 0.02);
  return t0 + dur;
}

function mestre(ctx, destino) {
  const g = ctx.createGain();
  g.gain.value = dbParaLinear(GANHO_MESTRE_DB);
  g.connect(destino);
  return g;
}

/** Token entrando: traço curto de lápis. */
export function tokenEntra(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  return sopro(ctx, m, t0, 0.09, 5200, 3400, 1.2, 0.8);
}

/** Multiplicação de matrizes: três toques de régua, ascendentes. */
export function multiplicaMatriz(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  [523.25, 659.25, 783.99].forEach((f, i) => bloco(ctx, m, t0 + i * 0.075, f, 0.55));
  return t0 + 2 * 0.075 + 0.072;
}

/** Softmax normalizando: dois tons que se aproximam e pousam em um único, soma = 1. */
export function softmaxNormaliza(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  const dur = 0.42;
  for (const inicio of [392, 587.33]) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(inicio, t0);
    o.frequency.exponentialRampToValueAtTime(493.88, t0 + dur * 0.8);
    const g = envelope(ctx, t0, 0.03, 0.42, dur - 0.03);
    o.connect(g).connect(m);
    o.start(t0);
    o.stop(t0 + dur + 0.01);
  }
  return t0 + dur;
}

/** Transição de capítulo: folha de papel virando. */
export function transicaoCapitulo(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  sopro(ctx, m, t0, 0.55, 900, 3800, 0.7, 1.0);
  return sopro(ctx, m, t0 + 0.32, 0.4, 3000, 700, 0.9, 0.7) ;
}

/** Troca de apresentador: carimbo batendo na prancha. */
export function trocaApresentador(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(170, t0);
  o.frequency.exponentialRampToValueAtTime(70, t0 + 0.14);
  const g = envelope(ctx, t0, 0.003, 0.95, 0.2);
  o.connect(g).connect(m);
  o.start(t0);
  o.stop(t0 + 0.22);
  sopro(ctx, m, t0, 0.05, 1800, 900, 0.8, 0.8);
  return t0 + 0.203;
}

/** Máscara causal cortando células: dois cortes secos de estilete. */
export function mascaraCorta(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  sopro(ctx, m, t0, 0.06, 7000, 2500, 2, 0.8);
  return sopro(ctx, m, t0 + 0.09, 0.06, 7000, 2500, 2, 0.8);
}

/** Token amostrado na inferência: toque único de bloco. */
export function amostraToken(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  return bloco(ctx, m, t0, 880, 0.4, 0.05);
}

/** Abertura de demo ao vivo: dois toques descendentes, avisa que o que vem é código executando. */
export function abreDemo(ctx, destino = ctx.destination, t0 = ctx.currentTime) {
  const m = mestre(ctx, destino);
  bloco(ctx, m, t0, 783.99, 0.55, 0.09);
  return bloco(ctx, m, t0 + 0.12, 587.33, 0.55, 0.12);
}

export const EVENTOS = {
  tokenEntra: "Token entrando",
  multiplicaMatriz: "Multiplicação de matrizes",
  softmaxNormaliza: "Softmax normalizando",
  transicaoCapitulo: "Transição de capítulo",
  trocaApresentador: "Troca de apresentador",
  mascaraCorta: "Máscara causal cortando",
  amostraToken: "Token amostrado",
  abreDemo: "Abertura de demo ao vivo",
};

export const FUNCOES = { tokenEntra, multiplicaMatriz, softmaxNormaliza, transicaoCapitulo, trocaApresentador, mascaraCorta, amostraToken, abreDemo };

let ctxCompartilhado = null;

// Atalho para as cenas: tocar("softmaxNormaliza") no instante do evento visual.
export function tocar(nome) {
  if (window.top?.sfxMudo) return undefined;   // botão de som da animação, quando a demo está embutida
  ctxCompartilhado ??= new AudioContext();
  if (ctxCompartilhado.state === "suspended") ctxCompartilhado.resume();
  return FUNCOES[nome](ctxCompartilhado);
}

// Renderiza fora de tempo real e mede duração audível, pico e RMS em dBFS.
export async function medir(nome) {
  const ctx = new OfflineAudioContext(1, 48000 * 2, 48000);
  const fim = FUNCOES[nome](ctx, ctx.destination, 0);
  const d = (await ctx.startRendering()).getChannelData(0);
  let pico = 0, ultimo = 0, soma = 0;
  for (let i = 0; i < d.length; i++) {
    const a = Math.abs(d[i]);
    if (a > pico) pico = a;
    if (a > 0.0005) ultimo = i;
  }
  for (let i = 0; i <= ultimo; i++) soma += d[i] * d[i];
  return {
    nome,
    duracaoDeclarada: fim,
    duracaoAudivel: ultimo / 48000,
    picoDb: 20 * Math.log10(pico),
    rmsDb: 10 * Math.log10(soma / (ultimo + 1)),
  };
}

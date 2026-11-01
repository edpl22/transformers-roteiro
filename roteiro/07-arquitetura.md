# 7. Arquitetura técnica da animação

Esta é a proposta para a etapa de implementação das cenas. Nesta etapa só existem as demos, os SFX e os tokens visuais.

## Estrutura de arquivos proposta

```text
app/
├── index.html             # palco único 1920×1080
├── motor/
│   ├── roteiro.js         # lê mapa-tempo.json e o config; mantém cena e passo atuais
│   ├── teclado.js         # teclado e clicker
│   ├── palco.js           # escala, moldura e carimbo (reaproveita demos/_comum/prancha.js)
│   ├── ensaio.js          # sobreposição de tempo, só no modo de ensaio
│   └── demo.js            # abre uma demo em iframe e encaminha o teclado
└── cenas/
    ├── c01/s01.js         # uma cena por arquivo, ID igual ao do mapa de tempo
    └── ...
config/apresentadores.json # nomes e papéis
roteiro/mapa-tempo.json    # ordem e duração
sfx/sfx.js                 # eventos sonoros
styles/tokens.css          # paleta, tipos, grid e movimento
demos/                     # demonstrações autônomas
```

## Bibliotecas

| Biblioteca | Uso | Por que | Licença |
|---|---|---|---|
| GSAP 3 (`gsap.min.js`, sem plugins pagos) | Linhas do tempo de cada cena | Rótulos por passo, `seek` para voltar, precisão de sincronia | Licença própria da GreenSock, gratuita [VERIFICAR termos vigentes antes de publicar] |
| KaTeX 0.16.11 | Equações | Já em `assets/vendor/katex`, sem rede | MIT |
| SVG e Canvas nativos | Traços e mapas | Sem dependência; Canvas para matrizes grandes | n/a |
| Web Audio API | SFX | Já em `sfx/sfx.js` | n/a |

Alternativa sem GSAP: Motion One (`motion`), caso a licença seja um problema. O contrato de cena abaixo não muda.

Não há etapa de build: ES modules servidos por `python -m http.server`, com todas as dependências copiadas para o repositório. Nada é carregado de CDN na gravação.

## Contrato de uma cena

```js
// app/cenas/c04/s06.js
export default {
  id: "C04-S06",
  montar(palco) { /* cria o DOM estático da cena e devolve referências */ },
  passos: [
    { rotulo: "entradas", tocar: (tl, r) => { /* adiciona tweens em tl */ }, sfx: "tokenEntra" },
    { rotulo: "produto",  tocar: (tl, r) => { /* ... */ }, sfx: "multiplicaMatriz" },
    { rotulo: "escala",   tocar: (tl, r) => { /* ... */ } },
    { rotulo: "softmax",  tocar: (tl, r) => { /* ... */ }, sfx: "softmaxNormaliza" },
  ],
  sair(palco) { /* remove a cena */ },
};
```

O motor valida na carga que todo ID de cena do `mapa-tempo.json` tem um módulo e vice-versa.

## Como avançar as cenas

A narração é ao vivo, por isso **o apresentador comanda o ritmo**. Cada cena é dividida em passos, e nada avança sozinho.

| Tecla | Ação | Clicker |
|---|---|---|
| `→`, `Espaço`, `PageDown` | Próximo passo; no último, próxima cena | Avançar |
| `←`, `PageUp` | Volta ao início do passo anterior | Voltar |
| `Home` | Reinicia a cena atual | n/a |
| `G` | Mostra o grid e as zonas, só para depuração | n/a |
| `E` | Liga e desliga a sobreposição de ensaio | n/a |
| `D` | Abre ou fecha a demo da cena | n/a |
| `Ctrl+→` | Pula para a próxima cena sem animar | n/a |
| `#C07-S04` na URL | Abre direto em uma cena | n/a |

**Modo de ensaio** (`?ensaio`): sobreposição no canto com o tempo decorrido, o alvo da cena (lido do mapa de tempo), o desvio acumulado e os tópicos de fala. Em modo de gravação, a sobreposição não existe no DOM, para não correr o risco de aparecer no vídeo.

## Como sincronizar os SFX

1. A primeira tecla pressionada destrava o `AudioContext` (exigência dos navegadores). O motor exige essa tecla em uma tela preta de preparação, antes de C01-S01, que não entra no vídeo.
2. Um SFX é ligado a um evento visual, nunca a um tempo absoluto: `tl.call(() => tocar("softmaxNormaliza"), null, "softmax+=0.15")`.
3. O som é agendado pelo relógio do `AudioContext`, com a latência compensada por `ctx.outputLatency` quando disponível.
4. Voltar um passo não reproduz sons: o motor ignora `tl.call` durante um `seek`.
5. A cada troca de capítulo, o motor chama `transicaoCapitulo`. Se o apresentador também muda, chama apenas `trocaApresentador`, para não sobrepor sons.
6. Dentro das demos, os mesmos eventos são chamados por `sfx.js`, com um limite de 8 chamadas por segundo para `amostraToken`.

## Gravação em 1920×1080 a 60 fps

1. **Navegador:** Chrome ou Edge em tela cheia (`F11`), monitor em 1920×1080 ou maior, escala do sistema em 100% e zoom do navegador em 100%. Em monitores maiores, janela do Chromium com `--window-size=1920,1080`.
2. **Captura:** OBS Studio, base e saída em 1920×1080, 60 fps, gravação em MKV com CQP 16 a 18 (remuxar para MP4 ao final).
3. **Trilhas separadas:** microfone na trilha 1, som do sistema (SFX) na trilha 2. Permite corrigir o equilíbrio na edição sem refazer a voz.
4. **Voz:** microfone a cerca de 15 cm, em sala silenciosa. Nível com picos em torno de −6 dBFS.
5. **Dois fluxos possíveis:**
   - *Sessão única:* os quatro na mesma sala, revezando o microfone. Como o carimbo muda em C04-S01, C06-S01 e C09-S01, a passagem coincide com um corte natural.
   - *Sessões separadas:* cada um grava seu bloco com a animação rodando no próprio computador. A frase de passagem é dita no fim do bloco, e a edição emenda sobre `trocaApresentador`.
6. **Antes de gravar:** rodar `python scripts/check_timing.py` e `python scripts/capturar_previews.py`; fechar notificações; desativar suspensão de tela.
7. **Desempenho:** alvo de 60 fps. Animar só `transform`, `opacity` e `stroke-dashoffset`; manter filtros SVG estáticos. Em matrizes grandes, Canvas em vez de DOM.

## Fallback se a demo ao vivo falhar

Regra de ouro: **o apresentador nunca depura ao vivo.** Se algo der errado, aperta `D` para fechar a demo e segue pela contingência da cena.

| Falha possível | Detecção | Fallback |
|---|---|---|
| Servidor local fora do ar | Página não abre | Reiniciar `python -m http.server 8000` antes da cena ou usar a gravação de contingência |
| `pesos.json` não carrega | `fetch` falha | A demo 04 entra sozinha no modo pré-gravado e mostra o aviso na tela |
| Mini-GPT gera texto constrangedor | Fala do apresentador | `Limpar` e gerar de novo; a semente é fixa, então o ensaio mostra o texto antes |
| Demo trava | Tela parada | `D` fecha a demo e a cena exibe o screenshot de `roteiro/previews/` com a fala prevista |
| Hover falha na captura | Tela sem reação | Setas `←` e `→` movem o foco nas demos 01 e 02; os dados são os mesmos |
| Áudio mudo | Medidor do OBS | Continuar: os SFX são reforço, não carregam informação essencial |

Antes da gravação, gravar também cada demo funcionando (cerca de 1 min cada), em `gravacoes/contingencia/`, para inserir na edição se necessário.

Toda demo funciona sem internet: `pesos.json`, fontes e KaTeX estão no repositório, e `scripts/capturar_previews.py` falha se a página fizer qualquer requisição externa.

## Verificações automáticas

| Comando | O que confere |
|---|---|
| `python scripts/check_timing.py` | Total, equilíbrio, timecodes, campos das cenas, referências cruzadas |
| `python scripts/gerar_mapa_tempo.py` | Regenera o mapa em Markdown e aplica nomes do config |
| `python scripts/capturar_previews.py` | Console sem erros, sem rede externa, sem transbordo, screenshots, medição de SFX e varredura da lista proibida |
| `python demos/00-tokenizacao-bpe/teste_referencia.py` | BPE em JS contra Python |
| `python demos/01-self-attention/teste_referencia.py` | Atenção contra NumPy e conta à mão |
| `python demos/02-codificacao-posicional/teste_referencia.py` | PE contra NumPy e propriedades do artigo |
| `node demos/03-mascara-causal/teste.mjs` | Sem vazamento do futuro |
| `python demos/04-mini-gpt/teste_gradiente.py` | Backprop contra diferenças finitas |
| `node demos/05-amostragem-kv-cache/teste.mjs` | Amostragem, JS contra NumPy, cache contra forward completo |

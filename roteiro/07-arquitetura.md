# 7. Arquitetura técnica da animação

A animação está implementada em `app/`: 44 cenas e 124 passos, sem etapa de build e sem nenhuma dependência além do que já está no repositório.

**Para abrir:** na raiz, rode `python -m http.server 8000` e acesse `http://localhost:8000/app/`.

## Estrutura de arquivos

```text
app/
├── index.html             # palco único 1920×1080
├── app.css                # camadas do palco
├── motor/
│   ├── roteiro.js         # mapa de tempo, config, cena e passo atuais, teclado, carimbo, demos
│   ├── cena.js            # primitivas de desenho e revelação, sobre a Web Animations API
│   └── ensaio.js          # sobreposição de tempo, só com ?ensaio
└── cenas/
    ├── _util.js           # desenhos repetidos: planta, corrente de RNN, eixos
    └── c01.js ... c13.js  # um módulo por capítulo, com as cenas pelo ID do mapa de tempo
config/apresentadores.json # nomes e papéis
roteiro/mapa-tempo.json    # ordem e duração
sfx/sfx.js                 # eventos sonoros
styles/tokens.css          # paleta, tipos, grid e movimento
demos/                     # demonstrações autônomas, embutidas por iframe
```

## Bibliotecas

| Biblioteca | Uso | Por que | Licença |
|---|---|---|---|
| Web Animations API (nativa) | Revelação e traços | Sem dependência; `finish()` e estado final explícito bastam para o modelo de passos | n/a |
| KaTeX 0.16.11 | Equações | Já em `assets/vendor/katex`, sem rede | MIT |
| SVG e HTML nativos | Traços, matrizes, tabelas | Sem dependência | n/a |
| Web Audio API | SFX | `sfx/sfx.js` | n/a |

A proposta inicial previa GSAP, que se mostrou desnecessário. Sem ele, some também a dúvida sobre os termos de licença.

## Contrato de uma cena

```js
// app/cenas/c04.js
export default {
  "C04-S06": {
    montar(c) {                       // cria tudo oculto e devolve referências
      const m = c.mat(Q, { x: 200, y: 190, cor: "q" });
      return { m };
    },
    passos: [                         // um item por clique; o primeiro roda ao entrar na cena
      (c, r) => { c.entra(r.m); c.som("tokenEntra"); },
    ],
  },
};
```

- O motor falha na carga se uma cena do mapa de tempo não tiver módulo, ou o contrário.
- Números de atenção, de posição e da curva de treino são importados das demos e de `pesos.json`, nunca redigitados.
- **Voltar um passo** reconstrói a cena e reaplica os passos anteriores em modo instantâneo, sem animar e sem tocar som.

## Como avançar as cenas

A narração é ao vivo, por isso **o apresentador comanda o ritmo**. Nada avança sozinho.

| Tecla | Ação | Clicker |
|---|---|---|
| `→`, `Espaço`, `PageDown` | Próximo passo; no último, próxima cena | Avançar |
| `←`, `PageUp` | Volta um passo | Voltar |
| `Home` | Reinicia a cena atual | n/a |
| `Ctrl+→` | Próxima cena, já com todos os passos aplicados | n/a |
| `D` | Na demo, alterna com o screenshot de contingência, inclusive com o foco na demo | n/a |
| `G` | Mostra o grid e as zonas, só para depuração | n/a |
| `E` | Com `?ensaio`, oculta ou mostra a sobreposição | n/a |

**Dentro de uma demo:** as setas e o espaço pertencem à demo. Para sair, use `PageDown` ou `PageUp`, que continuam funcionando com o foco na demo: é o que o clicker envia. Para voltar o foco à animação, clique fora ou use o clicker.

**Parâmetros de URL:**

| Parâmetro | Efeito |
|---|---|
| `#C07-S04` | Abre direto em uma cena |
| `?passo=2` | Junto do anterior, abre em um passo da cena |
| `?ensaio` | Mostra tempo, alvo, desvio e tópicos de fala, lidos de `05-cenas.md` |
| `?mudo` | Sem SFX |
| `?instantaneo` | Sem animação; usado nos testes |

Sem `?ensaio`, a sobreposição não existe no DOM e não pode aparecer na gravação.

## Como sincronizar os SFX

1. A tela preta de preparação, antes de C01-S01, destrava o áudio com a primeira tecla. Ela não entra no vídeo: inicie a gravação e só então pressione Espaço.
2. Um SFX é ligado ao evento visual: `c.som("softmaxNormaliza", 700)` toca 700 ms depois do início do passo, no momento em que o resultado aparece.
3. Reconstruir uma cena ao voltar um passo não toca som.
4. Na entrada de uma cena, o motor toca `trocaApresentador` se a pessoa mudou, ou `transicaoCapitulo` se só o capítulo mudou, nunca os dois.
5. Nas cenas de passagem (C03-S04, C05-S03, C08-S03), o último passo já bate o carimbo com o próximo nome, e a cena seguinte não repete o som.
6. Um nome de SFX inexistente faz a cena falhar, o que os testes detectam.

## Gravação em 1920×1080 a 60 fps

1. **Navegador:** Chrome ou Edge em tela cheia (`F11`), monitor em 1920×1080 ou maior, escala do sistema em 100% e zoom do navegador em 100%. Em monitores maiores, janela do Chromium com `--window-size=1920,1080`.
2. **Captura:** OBS Studio, base e saída em 1920×1080, 60 fps, gravação em MKV com CQP 16 a 18 (remuxar para MP4 ao final).
3. **Trilhas separadas:** microfone na trilha 1, som do sistema (SFX) na trilha 2. Permite corrigir o equilíbrio na edição sem refazer a voz.
4. **Voz:** microfone a cerca de 15 cm, em sala silenciosa. Nível com picos em torno de −6 dBFS.
5. **Dois fluxos possíveis:**
   - *Sessão única:* os quatro na mesma sala, revezando o microfone. Como o carimbo muda em C04-S01, C06-S01 e C09-S01, a passagem coincide com um corte natural.
   - *Sessões separadas:* cada um grava seu bloco com a animação rodando no próprio computador. A frase de passagem é dita no fim do bloco, e a edição emenda sobre `trocaApresentador`.
6. **Antes de gravar:** rodar `python scripts/check_timing.py`, `python scripts/capturar_previews.py` e `python scripts/testar_animacao.py`; fechar notificações; desativar suspensão de tela.
7. **Desempenho:** alvo de 60 fps. O motor anima só `transform`, `opacity`, `stroke-dashoffset` e `stroke-width`, com filtros SVG estáticos. Com `python scripts/medir_fps.py`, em Chrome sem janela e placa integrada AMD Radeon, as 40 cenas medidas tiveram média de 163 fps sem sincronia de tela e p95 de cerca de 6 ms por quadro, bem abaixo dos 16,7 ms de um quadro a 60 fps. O pior quadro isolado foi de 121 ms (C02-S03). A medição não inclui o custo do OBS: rode o script no computador que vai gravar e confira uma gravação de teste.

## Fallback se a demo ao vivo falhar

Regra de ouro: **o apresentador nunca depura ao vivo.** Se algo der errado, aperta `D` para trocar a demo pela imagem de contingência e segue a fala.

| Falha possível | Detecção | Fallback |
|---|---|---|
| Servidor local fora do ar | Página não abre | Reiniciar `python -m http.server 8000` antes da cena ou usar a gravação de contingência |
| `pesos.json` não carrega | `fetch` falha | A demo 04 entra sozinha no modo pré-gravado e mostra o aviso na tela |
| Mini-GPT gera texto constrangedor | Fala do apresentador | `Limpar` e gerar de novo; a semente é fixa, então o ensaio mostra o texto antes |
| Demo trava | Tela parada | `D` troca a demo pelo screenshot de `roteiro/previews/`, e a fala segue como previsto |
| Hover falha na captura | Tela sem reação | Setas `←` e `→` movem o foco nas demos 01 e 02; os dados são os mesmos |
| Áudio mudo | Medidor do OBS | Continuar: os SFX são reforço, não carregam informação essencial |

Antes da gravação, gravar também cada demo funcionando (cerca de 1 min cada), em `gravacoes/contingencia/`, para inserir na edição se necessário.

Toda demo funciona sem internet: `pesos.json`, fontes e KaTeX estão no repositório, e `scripts/capturar_previews.py` falha se a página fizer qualquer requisição externa.

## Verificações automáticas

| Comando | O que confere |
|---|---|
| `python scripts/check_timing.py` | Total, equilíbrio, timecodes, campos das cenas, referências cruzadas |
| `python scripts/gerar_mapa_tempo.py` | Regenera o mapa em Markdown e as fichas de ensaio, e aplica os nomes do config |
| `python scripts/capturar_previews.py` | Demos: console sem erros, sem rede externa, sem transbordo, screenshots, medição de SFX e varredura da lista proibida |
| `python scripts/testar_animacao.py` | Animação: todas as cenas e passos, área útil, sobreposição de textos, carimbo, voltar e avançar, teclado, clicker, contingência e ensaio |
| `python scripts/medir_fps.py` | Taxa de quadros por cena em Chrome sem janela, com uma página parada como controle |
| `python scripts/testar_animacao.py --tempo-real` | Reproduz com as durações reais (cerca de 5 min) e compara o estado final com o instantâneo |
| `python demos/00-tokenizacao-bpe/teste_referencia.py` | BPE em JS contra Python |
| `python demos/01-self-attention/teste_referencia.py` | Atenção contra NumPy e conta à mão |
| `python demos/02-codificacao-posicional/teste_referencia.py` | PE contra NumPy e propriedades do artigo |
| `node demos/03-mascara-causal/teste.mjs` | Sem vazamento do futuro |
| `python demos/04-mini-gpt/teste_gradiente.py` | Backprop contra diferenças finitas |
| `node demos/05-amostragem-kv-cache/teste.mjs` | Amostragem, JS contra NumPy, cache contra forward completo |

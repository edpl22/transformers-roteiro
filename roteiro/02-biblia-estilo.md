# 2. Bíblia de estilo

Prova do estilo: as demos em `demos/` e os screenshots em `roteiro/previews/`. Valores executáveis: `styles/tokens.css`.

## Direção: desenho técnico de engenharia sobre papel

**Por que esta direção:**

- o público é de Engenharia de Computação, e a prancha é uma linguagem que esse público reconhece;
- matrizes, vetores e setas viram os protagonistas sem esforço, porque uma prancha é feita de traços, números e anotações;
- a estrutura de prancha, zona e carimbo resolve requisitos do professor: o carimbo mostra o tempo todo quem apresenta;
- é o oposto visual do clichê de IA: papel em vez de tela escura, tinta em vez de brilho, informação em vez de decoração.

## Paleta

Cada cor tem **um único significado** em todo o vídeo. Contraste calculado sobre o papel (WCAG 2.x).

| Token CSS | Hex | Significado | Contraste |
|---|---|---|---:|
| `--papel` | `#F2EDE0` | Fundo | referência |
| `--papel-escuro` | `#E6DFCC` | Realce de fundo, estado de hover | n/a |
| `--regua` | `#CFC8B4` | Grade, linhas de apoio; nunca texto | 1,4:1 |
| `--grafite` | `#59616C` | Rótulos, texto secundário | 5,4:1 |
| `--tinta` | `#1B2430` | Texto, traços, mapa de calor | 13,4:1 |
| `--azul-prussia` | `#17507F` | **Q**, consulta, elemento em foco | 7,2:1 |
| `--vermelho-lapis` | `#B5332A` | **K**, corte, máscara, advertência | 5,2:1 |
| `--ocre` | `#94650A` | **V**, conteúdo transportado | 4,4:1 |
| `--verde-oliva` | `#2E6A4F` | **Z**, saída, resultado calculado | 5,5:1 |

- O ocre fica abaixo de 4,5:1 e por isso aparece só em corpo a partir de 22 px com peso 500, ou em traços.
- Mapa de calor de pesos: interpolação linear de `--papel` (0) a `--tinta` (1), como hachura de grafite. O texto da célula inverte para papel acima de 0,55.
- Valores com sinal (matriz PE): `--vermelho-lapis` para negativo, `--papel` para zero, `--azul-prussia` para positivo.

## Tipografia

| Uso | Fonte | Corpo em 1920×1080 | Licença |
|---|---|---|---|
| Títulos e carimbo | Barlow Condensed 600 | 64 px título, 36 px subtítulo, 27 px carimbo | SIL OFL 1.1 |
| Texto de apoio | Barlow 400 e 500 | 28 px | SIL OFL 1.1 |
| Matrizes, código, rótulos | IBM Plex Mono 500 | 26 px matriz, 22 px rótulo, mínimo de 17 px no carimbo | SIL OFL 1.1 |
| Equações | KaTeX (fontes próprias) | 30 px em destaque | MIT (KaTeX) e OFL (fontes) |

**Por que este par:** Barlow Condensed lembra a letra técnica de placas e carimbos. É uma grotesca estreita com personalidade, que cabe em linhas longas de título. IBM Plex Mono tem números tabulares e serifas discretas que mantêm as colunas das matrizes alinhadas. As fontes ficam em `assets/fonts/` e não há chamada de rede durante a gravação.

## Grid

- **Palco:** 1920×1080 fixo, escalado ao tamanho da janela por `demos/_comum/prancha.js`.
- **Moldura dupla:** traço de 1 px em `inset: 24 px` e de 2 px em `inset: 40 px`, com marcas de zona.
- **Zonas de referência:** colunas de 1 a 12 e linhas de A a F, como em uma prancha real. O roteiro localiza elementos por zona (por exemplo, "zona B1–D7").
- **Colunas de conteúdo:** 12 de 126 px, calha de 24 px, margem lateral de 72 px.
- **Base:** módulo de 8 px. Todo espaçamento vertical é múltiplo de 8.
- **Carimbo:** faixa inferior fixa de 72 px, na zona F. É o lower-third do vídeo, com cena, título, apresentador e papel, implementação e prancha.
- **Área livre:** de y = 64 a y = 952. Nada de conteúdo fora dela, o que `scripts/capturar_previews.py` confere.
- **Fundo:** papel com ruído fractal neutro e grade de 48 px a 10% de opacidade, sempre estática.

## Traço e imperfeição controlada

- Espessuras: 1 px (apoio), 2 px (estrutura), 3 px (ênfase).
- A moldura e os diagramas passam pelo filtro SVG `#traco-mao`: `feTurbulence baseFrequency=0.012 numOctaves=1` com `feDisplacementMap scale=3`. O desvio máximo fica perto de 1,5 px: percebe-se a mão, mas nada parece torto.
- O filtro não é aplicado a texto, números nem matrizes: dados continuam nítidos.
- Elementos sem filtro animado: o filtro é calculado uma vez e a camada fica estática, para manter 60 fps.

## Metáforas visuais obrigatórias

| Ideia | Representação |
|---|---|
| Peso de atenção | Linha de cota entre tokens. Espessura = 0,75 + 20·p (px) |
| Vetor | Fileira de células com colchetes desenhados. Cor pela função (Q, K, V, Z) |
| Dimensão do vetor | Células com posição fixa: a dimensão 3 está sempre no mesmo lugar |
| Máscara causal | Hachura vermelha a 45° sobre a célula cortada |
| Multiplicação de matrizes | A linha da primeira cruza a coluna da segunda, e o valor aparece na interseção |
| Conexão residual | Linha que contorna o bloco por fora, com cota em forma de desvio |
| Token | Peça retangular de traço reto, sem preenchimento |

## Regras de movimento

| Token | Valor | Uso |
|---|---|---|
| `--dur-micro` | 150 ms | Realce, mudança de foco |
| `--dur-curta` | 300 ms | Entrada de rótulo ou número |
| `--dur-media` | 600 ms | Entrada de matriz, traço curto |
| `--dur-longa` | 1200 ms | Traço longo, multiplicação completa |
| `--ease-entrada` | `cubic-bezier(0.16, 1, 0.3, 1)` | Tudo que entra |
| `--ease-saida` | `cubic-bezier(0.7, 0, 0.84, 0)` | Tudo que sai |
| `--ease-traco` | `cubic-bezier(0.65, 0, 0.35, 1)` | Traço sendo desenhado (`stroke-dashoffset`) |

Regras:

1. **Cada movimento revela uma ideia.** Se a animação puder ser removida sem perda de explicação, ela é removida.
2. **Nada se mexe em repouso:** sem flutuação nem pulsação. Quando o apresentador está falando, a tela fica parada, a não ser que o movimento seja o assunto da fala.
3. **Entrada por desenho:** traços são desenhados da origem ao destino, nunca aparecem por fade longo.
4. **Sem deslocamento de mais de 16 px em textos:** rótulos entram com translação de 8 px e opacidade.
5. **Causalidade:** o valor de saída só aparece depois que a seta chega nele, com pausa de pelo menos 150 ms.
6. **Avanço manual:** cada passo é disparado pelo apresentador. A animação nunca corre à frente da fala.
7. **Transição de prancha:** corte seco com a folha nova deslizando 40 px em 600 ms. Nada de zoom, giro nem dissolução longa.

## Diagramação de equações

- Toda equação usa KaTeX e confere com o artigo original (ver `09-armadilhas.md`).
- Uma equação principal por prancha, no canto superior direito (zona A9–A12), ou centralizada quando é o assunto da cena.
- Letras da equação seguem as cores de função: $Q$ azul, $K$ vermelho, $V$ ocre, saída verde. Operadores e constantes ficam em tinta.
- Ao explicar um termo, os demais caem para 40% de opacidade; o termo em foco não muda de tamanho, para a equação não pular.
- Decimais com vírgula nos números escritos em português (0,231); notação LaTeX e código mantêm o ponto.
- Equação nunca aparece sem que a fala a leia em palavras.

## Diagramação de código

- Monoespaçada de no mínimo 24 px, com no máximo 14 linhas e 72 colunas na tela.
- Sem tema escuro nem janela de editor com botões coloridos. O código fica sobre o papel, com uma linha vertical de 3 px à esquerda.
- Destaque sintático mínimo: palavras-chave em tinta 600, comentários em grafite, e as variáveis Q, K, V nas cores de função.
- O foco é indicado por um traço de marca-texto em `--papel-escuro` atrás da linha, não por zoom.
- Todo código exibido existe e foi executado em `demos/`.

## Diagramação de matrizes

- Colchetes desenhados, números alinhados à direita e tabulares, sempre com o mesmo número de casas na matriz.
- Rótulos de linha e coluna com os tokens, em 20 px, quando houver espaço.
- A dimensão da matriz fica logo abaixo em rótulo, por exemplo `3 × 4`.

## Lista proibida (verificada em cada revisão)

Gradientes roxo ou azul neon, brilhos, partículas; cérebros, robôs, circuitos, rede neural 3D; glassmorphism, cartões arredondados com sombra, ícones genéricos; Inter ou Poppins; emojis como ilustração; qualquer referência à franquia "Transformers". `scripts/capturar_previews.py` procura padrões na fonte (`box-shadow`, `backdrop-filter`, `border-radius`, `radial-gradient`, fontes e cores da lista, emojis), e os screenshots são inspecionados a olho.

# 5. Roteiro cena a cena

**Legenda de apresentadores** (nomes e papéis vêm de `config/apresentadores.json` e são aplicados por `python scripts/gerar_mapa_tempo.py`):

- <a id="a1"></a><a id="p1"></a>[Apresentador 1](#a1): [Contexto e representação](#p1)
- <a id="a2"></a><a id="p2"></a>[Apresentador 2](#a2): [Mecanismo de atenção](#p2)
- <a id="a3"></a><a id="p3"></a>[Apresentador 3](#a3): [Arquitetura e treinamento](#p3)
- <a id="a4"></a><a id="p4"></a>[Apresentador 4](#a4): [Inferência e aplicações](#p4)

**Como ler:**

- Timecodes conferidos por `scripts/check_timing.py` contra `mapa-tempo.json`.
- Posição pelas zonas da prancha: colunas 1–12, linhas A–F. A zona F é ocupada pelo carimbo, que serve de lower-third.
- Durações e easings com os nomes de `02-biblia-estilo.md`: `micro`, `curta`, `media`, `longa`; `entrada`, `saida`, `traco`.
- Cada item numerado da animação é um passo avançado pelo apresentador no clicker.
- A fala é um guia de tópicos, não um texto para decorar.
- Referências no formato de `10-referencias.md`.
- Implementação de cada capítulo: `app/cenas/cNN.js`. Abrir uma cena direto: `http://localhost:8000/app/#C04-S06`.
- Cenas que começam em silêncio têm um primeiro passo vazio: o apresentador fala e avança quando quiser.

---

## Capítulo C01. Abertura e integrantes (prancha 01/13)

### C01-S01 · 00:00–00:45 · Capa e frase-tese

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 01/13.
- **Objetivo:** apresentar o tema e a tese que guia os 35 minutos.
- **Composição:** folha vazia com a moldura. Título "Transformers" em Barlow Condensed de 160 px, zona B1–C8. Subtítulo com disciplina e curso, zona C1–C8. À direita, zona B9–E12, uma frase de exemplo com três tokens ligados por linhas de cota de espessuras diferentes. Frase-tese em 36 px, zona D1–E8. Hierarquia: título, cotas, tese.
- **Animação:**
  1. A moldura se desenha em sentido horário (`longa`, `traco`); o carimbo sobe 8 px (`media`, `entrada`).
  2. Título e subtítulo entram (`media`, `entrada`).
  3. As três cotas são desenhadas, da mais fina à mais grossa (`longa`, `traco`).
  4. A frase-tese entra linha a linha (`curta`, `entrada`). Saída: corte seco, a folha seguinte desliza 40 px.
- **Interação:** nenhuma.
- **SFX:** silêncio intencional nos primeiros 3 s; `transicaoCapitulo` no início da moldura; `tokenEntra` em cada token do exemplo.
- **Fala (45 s):**
  - (10 s) Saudação, disciplina e tema: a arquitetura por trás dos grandes modelos de linguagem atuais.
  - (15 s) Avisar o que o vídeo faz: construir o modelo do zero, peça por peça, com código executado na tela.
  - (15 s) Ler a tese em palavras próprias: a representação de um token depende do contexto; pesos aprendidos dizem quanto cada posição aproveita das outras.
  - (5 s) Avisar a metáfora: cada capítulo é uma prancha técnica, e a última reúne todas.
  - *Gancho:* "Antes, quem somos nós e quem cuida de cada prancha."
- **Rubrica:** Layout, Apresentação.
- **Referências:** Vaswani et al. (2017).

### C01-S02 · 00:45–01:25 · Quem apresenta o quê

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 01/13.
- **Objetivo:** deixar claro quem são os integrantes e qual parte cada um apresenta.
- **Composição:** tabela de responsáveis em tela cheia, zona B1–E12, como lista de revisão de projeto. Colunas: nome e papel (lidos do config), capítulos, intervalo de tempo. Abaixo, zona E1–E12, uma linha do tempo horizontal de 35 min com os quatro blocos separados por marcas.
- **Animação:**
  1. Cada linha da tabela é escrita de cima para baixo (`curta`, `entrada`, intervalo de 200 ms), e o bloco correspondente aparece na linha do tempo.
  2. Marcadores das 9 cenas com implementação surgem na linha do tempo (`micro`). Saída: a folha desliza.
- **Interação:** nenhuma. Dados lidos de `config/apresentadores.json` e `roteiro/mapa-tempo.json`.
- **SFX:** `trocaApresentador` em volume normal uma única vez, no primeiro nome; `tokenEntra` nos demais.
- **Fala (40 s):**
  - (25 s) Dizer o nome de cada integrante e sua parte: contexto e representação; mecanismo de atenção; arquitetura e treinamento; inferência e aplicações.
  - (10 s) Explicar que o carimbo no rodapé mostra sempre quem está falando e que as marcas na linha do tempo são implementações ao vivo.
  - (5 s) *Gancho:* "Começo pelo problema que motivou tudo isso."
- **Rubrica:** requisito 2 do professor (todos apresentam), Layout, Apresentação.
- **Referências:** não se aplica.

---

## Capítulo C02. Por que não bastavam as RNNs (prancha 02/13)

### C02-S01 · 01:25–02:20 · A leitura em série

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 02/13.
- **Objetivo:** mostrar que a RNN processa uma posição por vez e comprime o passado em um estado.
- **Composição:** corrente de seis células em linha, zona C2–C11, com as palavras de uma frase de seis tokens abaixo. Equação na zona A9–A12: $h_t = f(h_{t-1}, x_t)$. Na zona D2–E11, um relógio de operações: uma barra por passo, que não pode ser paralelizada.
- **Animação:**
  1. Token 1 entra e a célula 1 acende; a seta $h_1$ é desenhada até a célula 2 (`media`, `traco`). Repete até o token 6, com ritmo constante, para o espectador sentir a espera.
  2. O vetor $h_t$, sempre do mesmo tamanho, é mostrado sobre cada seta: a largura não cresce, embora o texto cresça.
  3. As barras se empilham em série; uma nota vermelha indica "passo $t$ depende de $t-1$".
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` a cada token. Silêncio após a nota vermelha, por 1 s.
- **Fala (55 s):**
  - (15 s) A RNN lê como nós: uma palavra depois da outra, atualizando uma memória.
  - (15 s) Ler a equação: o estado novo é função do estado anterior e da entrada atual.
  - (15 s) Consequência de engenharia: como cada passo depende do anterior, os cálculos dentro de uma sequência não podem correr em paralelo.
  - (10 s) Segunda consequência: tudo o que foi lido passa por um vetor de tamanho fixo.
  - *Gancho:* "E há um problema mais sério: treinar isso por muitos passos."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Cho et al. (2014); Sutskever et al. (2014).

### C02-S02 · 02:20–03:20 · Gradiente de longo alcance

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 02/13.
- **Objetivo:** explicar por que dependências longas são difíceis de aprender e o que a LSTM resolve de fato.
- **Composição:** a corrente da cena anterior sobe para a zona B. Equação centralizada na zona C: $\frac{\partial h_T}{\partial h_k}=\prod_{t=k+1}^{T}\frac{\partial h_t}{\partial h_{t-1}}$. Zona D1–E6: gráfico de $0{,}9^n$ e $1{,}1^n$ em escala logarítmica. Zona D7–E12: célula LSTM em esquema, com a linha do estado de célula passando quase reta.
- **Animação:**
  1. Uma seta de gradiente percorre a corrente da direita para a esquerda; sua espessura diminui a cada célula (`longa`, `traco`).
  2. As duas curvas são desenhadas. Rótulos aparecem nos pontos reais: $0{,}9^{50}\approx 0{,}005$ e $1{,}1^{50}\approx 117$.
  3. A célula LSTM entra e o caminho do estado de célula é destacado em azul.
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` quando a seta atravessa a corrente. Sem som nas curvas.
- **Fala (60 s):**
  - (20 s) O gradiente é um produto de muitas matrizes jacobianas; um produto longo tende a sumir ou a explodir.
  - (15 s) Exemplo: fatores de 0,9 repetidos 50 vezes dão cerca de 0,005; fatores de 1,1 dão cerca de 117.
  - (15 s) A LSTM cria um caminho quase aditivo com portas. Isso atenua bastante o problema.
  - (10 s) Deixar claro: atenua, não elimina, e não resolve a leitura em série.
  - *Gancho:* "O outro problema era o funil: uma frase inteira em um único vetor."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Bengio; Simard; Frasconi (1994); Hochreiter; Schmidhuber (1997); Pascanu; Mikolov; Bengio (2013).

### C02-S03 · 03:20–04:35 · O gargalo e a atenção de Bahdanau

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 02/13.
- **Objetivo:** mostrar a atenção como solução para o gargalo do seq2seq e como ponte para o Transformer.
- **Composição:** à esquerda, zona B1–E4, encoder com estados $h_1,\dots,h_n$ em coluna. À direita, zona B9–E12, decoder com $s_{i-1}$. No centro, zona B5–E8, primeiro um único vetor $c$ como funil; depois, linhas de cota de cada $h_j$ até o decoder. Equações na zona A e na zona E, entrando uma a uma.
- **Animação:**
  1. Todos os $h_j$ convergem para um único $c$; o funil é desenhado em vermelho (`media`, `traco`).
  2. O funil é apagado; linhas finas ligam cada $h_j$ ao decoder (`longa`, `traco`).
  3. A espessura das linhas muda conforme $\alpha_{ij}$, usando uma tradução curta como exemplo.
  4. Entram as equações, com $e_{ij}$, $\alpha_{ij}$ e $c_i$ destacados na ordem de uso.
- **Interação:** nenhuma.
- **SFX:** `softmaxNormaliza` quando os pesos $\alpha_{ij}$ se estabilizam. Silêncio de 1 s antes do passo 2.
- **Fala (75 s):**
  - (15 s) No seq2seq clássico, o decoder recebe tudo por um único vetor de contexto; frases longas sofrem.
  - (25 s) Em 2014, Bahdanau, Cho e Bengio propõem: a cada palavra gerada, calcule um contexto próprio.
  - (20 s) Ler as equações:
    - $e_{ij}=a(s_{i-1},h_j)$ é a pontuação de compatibilidade, com $a$ sendo uma pequena rede (atenção aditiva);
    - $\alpha_{ij}=\frac{\exp(e_{ij})}{\sum_k \exp(e_{ik})}$ transforma a pontuação em pesos;
    - $c_i=\sum_j \alpha_{ij}h_j$ é a média ponderada.
  - (15 s) Guardar essa receita: pontuar, normalizar, fazer média. Ela vai voltar.
  - *Gancho:* "Mas repare que os $h_j$ ainda vêm de uma RNN."
- **Rubrica:** Profundidade, Corretude, Referências.
- **Referências:** Bahdanau; Cho; Bengio (2014); Sutskever et al. (2014).

### C02-S04 · 04:35–05:00 · A pergunta-ponte

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 02/13.
- **Objetivo:** formular a pergunta que o Transformer responde.
- **Composição:** a prancha esvazia. No centro, zona C2–D11, em Barlow Condensed de 72 px: "E se retirarmos a recorrência?". Abaixo, a referência: Vaswani et al., 2017.
- **Animação:**
  1. A RNN da cena anterior é riscada com um traço vermelho (`media`, `traco`) e sai (`curta`, `saida`), ficando só as linhas de atenção.
  2. A pergunta entra (`media`, `entrada`) e permanece parada.
- **Interação:** nenhuma.
- **SFX:** `mascaraCorta` no risco vermelho; depois, silêncio intencional de 3 s sobre a pergunta.
- **Fala (25 s):**
  - (10 s) Se a atenção já decide o que importa, para que manter a recorrência?
  - (10 s) Em 2017, um grupo do Google responde com "Attention Is All You Need".
  - (5 s) *Gancho:* "Mas, para calcular atenção, o texto precisa virar números."
- **Rubrica:** Apresentação, Referências.
- **Referências:** Vaswani et al. (2017).

---

## Capítulo C03. Tokenização e embeddings (prancha 03/13)

### C03-S01 · 05:00–05:30 · Por que tokens

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 03/13.
- **Objetivo:** justificar a unidade intermediária entre caractere e palavra.
- **Composição:** três fileiras horizontais da mesma frase, zona B2–E11: por caracteres, por palavras, por subpalavras. À direita de cada uma, dois números: comprimento da sequência e tamanho típico do vocabulário, em ordem de grandeza.
- **Animação:**
  1. Cada fileira se divide em peças (`media`, `traco`).
  2. Os problemas de cada uma são marcados em vermelho: "sequência longa" e "palavra fora do vocabulário". A fileira de subpalavras recebe um traço azul.
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` a cada fileira dividida.
- **Fala (30 s):**
  - (10 s) Caracteres: vocabulário pequeno, sequências muito longas.
  - (10 s) Palavras: sequências curtas, vocabulário enorme, e palavras novas ficam sem representação.
  - (10 s) Subpalavras são o meio-termo. Token não é sinônimo de palavra.
  - *Gancho:* "Como escolher essas subpalavras? Vamos executar."
- **Rubrica:** Amplitude, Corretude.
- **Referências:** Sennrich; Haddow; Birch (2016).

### C03-S02 · 05:30–06:55 · BPE ao vivo e WordPiece

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 03/13, implementação `demos/00-tokenizacao-bpe`.
- **Objetivo:** mostrar, com código real, como o vocabulário surge de fusões frequentes.
- **Composição:** a demo em tela cheia. Zona B1–E5: corpus com segmentação atual. Zona B6–E8: pares mais frequentes. Zona B9–E12: lista de fusões e campo de palavra nova. Ao final, nota de WordPiece na zona E9–E12.
- **Animação:** a própria demo. Depois da demo, peças de "playing" entram como `play` e `##ing` (`curta`, `entrada`) para contrastar com o marcador `</w>`.
- **Interação:** `demos/00-tokenizacao-bpe`. Roteiro de cliques:
  1. Mostrar o corpus: gato 5×, gatos 3×, pato 6×, patos 2×, gatinho 2×, patinho 1×, mato 3×.
  2. Clicar em "Próxima fusão": a+t, com 22 ocorrências.
  3. Mais dois cliques: at+o (19) e ato+`</w>` (14).
  4. Mais dois cliques: p+ato`</w>` (6) e ato+s (5).
  5. No campo, deixar "ratos": a palavra nunca vista vira `r`, `atos`, `</w>`.
  - Contingência: `roteiro/previews/demo-00-bpe.png`.
- **SFX:** `abreDemo` na abertura; `tokenEntra` a cada fusão (a demo já chama).
- **Fala (85 s):**
  - (15 s) BPE começa com caracteres e um marcador de fim de palavra.
  - (25 s) Clicar e narrar: conta os pares vizinhos, ponderados pela frequência da palavra, e funde o mais frequente. Repete.
  - (20 s) Mostrar "ratos": mesmo sem aparecer no corpus, ela é coberta por `r` e `atos`. É assim que palavras raras ganham representação.
  - (15 s) A ordem das fusões é o próprio modelo do tokenizador; aplicada a texto novo, gera os tokens.
  - (10 s) WordPiece, usado no BERT, tem a mesma ideia de subpalavras, mas escolhe peças por outro critério e marca a continuação com `##`.
  - *Gancho:* "Agora temos inteiros. Rede neural precisa de vetores."
- **Rubrica:** requisito 4 (implementação), Profundidade, Corretude.
- **Referências:** Sennrich; Haddow; Birch (2016); Schuster; Nakajima (2012); Wu et al. (2016); Devlin et al. (2018).

### C03-S03 · 06:55–08:00 · Do token ao vetor

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 03/13.
- **Objetivo:** apresentar a matriz de embeddings como uma tabela aprendida.
- **Composição:** zona B1–E5: matriz $E\in\mathbb{R}^{|\mathcal{V}|\times d_{\text{model}}}$ desenhada como tabela alta, com uma linha por token. Zona B7–C12: token → id → linha → vetor. Zona D7–E12: plano com pontos de tokens próximos e distantes, rotulado como projeção 2D ilustrativa.
- **Animação:**
  1. O id do token aponta para a linha da matriz, e ela é copiada para a direita como vetor com células coloridas por dimensão (`media`, `entrada`).
  2. Repetir com um segundo token, mais rápido (`curta`).
  3. Os pontos aparecem no plano; linhas de cota mostram a proximidade de tokens de uso parecido.
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` na cópia de cada vetor.
- **Fala (65 s):**
  - (20 s) O embedding é uma tabela com uma linha por token. Consultá-la é só selecionar uma linha.
  - (15 s) No artigo original, $d_{\text{model}}=512$. Os valores começam aleatórios e são aprendidos no treino.
  - (15 s) Tokens usados de modo parecido tendem a ficar próximos, porque isso ajuda na tarefa de previsão.
  - (10 s) Cuidado: cada dimensão isolada não tem significado garantido; o que importa é a geometria do conjunto.
  - (5 s) *Gancho:* "Mas essa tabela tem um limite grave."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017); Jurafsky; Martin (2026).

### C03-S04 · 08:00–08:45 · O problema do banco

- **Apresentador:** [Apresentador 1](#a1). Carimbo: "[Apresentador 1](#a1) · [Contexto e representação](#p1)", prancha 03/13.
- **Objetivo:** mostrar que o embedding é igual em qualquer contexto e passar a palavra.
- **Composição:** duas frases, uma sobre a outra, zona B2–C11: "o banco aprovou o crédito" e "sentei no banco da praça". As duas ocorrências de "banco" são destacadas. Zona D3–E10: dois vetores idênticos, célula por célula, com um sinal de igual em vermelho.
- **Animação:**
  1. As frases entram.
  2. Da palavra "banco" de cada frase desce uma seta até um vetor (`media`, `traco`).
  3. O sinal de igual entra (`curta`), seguido da frase "A tabela não vê os vizinhos".
  4. O carimbo troca de nome como um carimbo real: desce, encosta, volta (`curta`).
- **Interação:** nenhuma.
- **SFX:** silêncio de 2 s sobre os vetores iguais; `trocaApresentador` no carimbo.
- **Fala (45 s):**
  - (15 s) Ler as duas frases: instituição financeira e assento.
  - (15 s) Pela tabela, o vetor de "banco" é idêntico nas duas. O significado está nos vizinhos, e a tabela não os vê.
  - (10 s) Precisamos de um mecanismo que recalcule o vetor em função do contexto.
  - (5 s) **Passagem:** "[Apresentador 2](#a2), como fazer um token olhar para os outros?"
- **Rubrica:** Apresentação, requisito 2.
- **Referências:** Vaswani et al. (2017).

---

## Capítulo C04. Self-attention (prancha 04/13)

### C04-S01 · 08:45–09:25 · Reponderar pelo contexto

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13.
- **Objetivo:** dar a ideia central antes da matemática e declarar os limites da metáfora.
- **Composição:** frase "o banco aprovou o crédito" em linha, zona C2–C11, como peças. Linhas de cota saem de "banco" para todas as peças, inclusive para ela mesma. Na zona E1–E12, a fórmula-resumo: $z_i=\sum_j \alpha_{ij}\,v_j$.
- **Animação:**
  1. Peças entram uma a uma (`curta`, `entrada`).
  2. Cotas finas são desenhadas de "banco" até todas (`longa`, `traco`).
  3. As cotas engrossam até os pesos finais. Um vetor novo, em verde, surge sob "banco".
  4. Texto "limites da metáfora" entra na zona D9–D12, em vermelho e em corpo pequeno.
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` nas peças; `softmaxNormaliza` quando as cotas se estabilizam.
- **Fala (40 s):**
  - (15 s) O vetor novo de cada token é uma média ponderada do que os outros têm a oferecer. É a mesma receita de Bahdanau, agora dentro da própria frase.
  - (15 s) Na metáfora da prancha, a atenção é a cota: relaciona peças, e a espessura indica o peso.
  - (10 s) Limite: aqui o vetor muda de verdade, e um peso alto não prova que o modelo "entendeu" alguma coisa.
  - *Gancho:* "Média ponderada de quê, e com quais pesos? Três matrizes respondem."
- **Rubrica:** Corretude, Profundidade.
- **Referências:** Vaswani et al. (2017); Jain; Wallace (2019).

### C04-S02 · 09:25–10:25 · Q, K e V

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13.
- **Objetivo:** definir consulta, chave e valor como projeções lineares aprendidas do mesmo $X$.
- **Composição:** matriz $X$ de $n\times d_{\text{model}}$ à esquerda, zona C1–D3. Três setas para $W^Q$, $W^K$, $W^V$ no centro, zona B5–E7. Três matrizes à direita, em azul, vermelho e ocre, zona B9–E12. Na parte de baixo, analogia em três palavras: pergunta, etiqueta, conteúdo.
- **Animação:**
  1. $X$ entra com rótulo de dimensão.
  2. Três setas são desenhadas, uma por vez, cada uma com a sua cor (`media`, `traco`).
  3. As matrizes $Q$, $K$, $V$ surgem por varredura de linha (`longa`, `entrada`).
  4. Um token em foco: sua linha acende nas três matrizes.
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` em cada projeção.
- **Fala (60 s):**
  - (15 s) Do mesmo vetor, três projeções. São só multiplicações por matrizes aprendidas: $Q=XW^Q$, $K=XW^K$, $V=XW^V$.
  - (20 s) Analogia de consulta a um arquivo: a consulta diz o que procuro, a chave diz o que cada ficha oferece, o valor é o conteúdo que será usado.
  - (15 s) Diferença crucial: em um arquivo comum, você pega uma ficha só; aqui, toma um pouco de todas.
  - (10 s) Em self-attention, as três vêm da mesma sequência. Por isso o nome.
  - *Gancho:* "Como medir o quanto uma consulta combina com uma chave?"
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017); Jurafsky; Martin (2026).

### C04-S03 · 10:25–11:05 · Produto escalar como compatibilidade

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13.
- **Objetivo:** justificar o produto escalar como pontuação e sua forma matricial.
- **Composição:** zona B1–E6: plano com um vetor $q$ azul e duas chaves vermelhas, uma alinhada e outra ortogonal, com o ângulo marcado. Zona B7–E12: cálculo por extenso de $q_{\text{gato}}\cdot k_{\text{dorme}}$ e, abaixo, a matriz $QK^\top$.
- **Animação:**
  1. Os vetores são desenhados; o arco do ângulo aparece.
  2. Os pares de componentes se multiplicam e somam: $0\cdot0+2\cdot2+1\cdot1+0\cdot0=5$ (`media`, `entrada`).
  3. A linha de $Q$ cruza a coluna de $K^\top$, e o 5 pousa em uma célula de $QK^\top$.
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` no cruzamento de linha e coluna.
- **Fala (40 s):**
  - (15 s) $q\cdot k=\sum_i q_ik_i=\lVert q\rVert\lVert k\rVert\cos\theta$. Grande quando os vetores apontam para o mesmo lado.
  - (10 s) Conta do exemplo: resultado 5.
  - (15 s) Matricialmente, $QK^\top$ calcula todos os pares de uma vez. Isso substitui a pequena rede de Bahdanau e pode usar código de matrizes muito otimizado.
  - *Gancho:* "Mas há uma armadilha quando os vetores são grandes."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017).

### C04-S04 · 11:05–12:10 · Por que dividir por raiz de d_k

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13, implementação `demos/01-self-attention`.
- **Objetivo:** explicar com dados que a escala controla a variância das pontuações e evita a saturação do softmax.
- **Composição:** demo aberta na aba 3. Curvas de maior peso em função de $d_k$, zona B1–E7. Barras de um sorteio, zona B8–E12. A equação em destaque na zona A: $\mathrm{Var}(q\cdot k)=d_k$.
- **Animação:** antes de abrir a demo, a dedução em três linhas (`media`, `entrada`):
  1. componentes independentes, média 0, variância 1;
  2. $q\cdot k$ tem média 0 e variância $d_k$;
  3. dividir por $\sqrt{d_k}$ devolve variância 1.
- **Interação:** `demos/01-self-attention/?aba=escala&cena=C04-S04`. Mover o controle de $d_k$ de 4 até 1024 e parar em 64. Contingência: `roteiro/previews/demo-01-escala.png`.
- **SFX:** `abreDemo` na abertura; `softmaxNormaliza` ao parar em 64; silêncio de 2 s enquanto a curva é lida.
- **Fala (65 s):**
  - (20 s) Hipótese do artigo: componentes independentes, média zero, variância um. Então a variância do produto escalar é $d_k$.
  - (20 s) Na demo, sem escala, o maior peso médio sobe em direção a 1: é o softmax saturando. Com escala, fica estável. Ler os valores na tela em $d_k=64$.
  - (15 s) Por que importa: a derivada de um peso em relação à sua pontuação é $p(1-p)$. Se $p\approx 1$, o gradiente quase some.
  - (10 s) Atenção: $\sqrt{d_k}$ não normaliza a saída nem faz os pesos somarem 1. Quem faz isso é o softmax.
  - *Gancho:* "Por falar nele."
- **Rubrica:** requisito 4, Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.2.1 e nota 4.

### C04-S05 · 12:10–12:40 · Softmax e média ponderada

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13.
- **Objetivo:** fechar a fórmula completa do artigo.
- **Composição:** equação central em 56 px, zona C2–D11: $\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$. Abaixo de cada termo, zona E, um rótulo: compatibilidade, escala, pesos por linha, média dos valores.
- **Animação:**
  1. A equação entra termo a termo, com os demais a 40% (`curta`, `entrada`).
  2. Rótulos ligados por cotas aos termos (`media`, `traco`).
- **Interação:** nenhuma.
- **SFX:** `softmaxNormaliza` no termo softmax; silêncio depois, enquanto a fórmula fica inteira na tela.
- **Fala (30 s):**
  - (10 s) Softmax transforma cada linha em pesos positivos que somam 1.
  - (10 s) Multiplicar por $V$ faz a média ponderada dos valores.
  - (10 s) Ler a fórmula inteira em palavras.
  - *Gancho:* "Vamos fazer essa conta à mão."
- **Rubrica:** Corretude, Profundidade.
- **Referências:** Vaswani et al. (2017), equação 1.

### C04-S06 · 12:40–14:20 · A conta à mão, passo a passo

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13.
- **Objetivo:** executar um exemplo pequeno que o espectador pode conferir com calculadora.
- **Composição:** entradas na zona B: tokens "o", "gato", "dorme", e as matrizes abaixo. Etapas em quatro colunas, zona C1–E12, como em `roteiro/previews/demo-01-mao.png`.

  $$Q=\begin{bmatrix}1&0&0&1\\0&2&1&0\\2&1&0&0\end{bmatrix},\quad K=\begin{bmatrix}1&0&0&0\\2&0&1&1\\0&2&1&0\end{bmatrix},\quad V=\begin{bmatrix}1&0\\0&1\\1&1\end{bmatrix},\quad d_k=4$$

- **Animação:** um passo por clique. Os valores são os mesmos conferidos em `demos/01-self-attention/teste_referencia.py`.
  1. Entram $Q$, $K$, $V$ (`media`, `entrada`), mostrando as dimensões.
  2. Produto: a linha de "gato" cruza as colunas (`longa`, `traco`), resultando em
     $QK^\top=\begin{bmatrix}1&3&0\\0&1&5\\2&4&2\end{bmatrix}$.
  3. Escala: cada número é dividido por $\sqrt{4}=2$, e os valores se transformam no lugar (`media`):
     $\begin{bmatrix}0{,}50&1{,}50&0{,}00\\0{,}00&0{,}50&2{,}50\\1{,}00&2{,}00&1{,}00\end{bmatrix}$.
  4. Softmax linha a linha, com a soma "= 1" aparecendo à direita de cada linha (`media`):
     $A=\begin{bmatrix}0{,}231&0{,}629&0{,}140\\0{,}067&0{,}111&0{,}821\\0{,}212&0{,}576&0{,}212\end{bmatrix}$.
  5. Média ponderada, com a linha de "gato" em foco: $z_{\text{gato}}=0{,}067\,(1,0)+0{,}111\,(0,1)+0{,}821\,(1,1)=(0{,}889;\,0{,}933)$. Resultado em verde:
     $Z=AV=\begin{bmatrix}0{,}371&0{,}769\\0{,}889&0{,}933\\0{,}424&0{,}788\end{bmatrix}$.
  6. Sobre a frase, as linhas de cota aparecem com as espessuras de $A$.
- **Interação:** a aba 1 de `demos/01-self-attention` tem a mesma conta. Pode substituir a animação em caso de falha: `?aba=mao`.
- **SFX:** `tokenEntra` no passo 1; `multiplicaMatriz` no passo 2; `softmaxNormaliza` no passo 4; silêncio de 2 s no resultado final.
- **Fala (100 s):**
  - (15 s) Três tokens, consultas e chaves com 4 dimensões, valores com 2. Números escolhidos para a conta caber na tela; não são pesos aprendidos.
  - (20 s) Primeira etapa: produto. Fazer em voz alta a linha de "gato": 0, 1 e 5.
  - (15 s) Segunda etapa: dividir tudo por 2.
  - (25 s) Terceira: softmax na linha de "gato". Exponenciais de 0, 0,5 e 2,5 valem cerca de 1; 1,65 e 12,18. A soma é cerca de 14,83. Dividindo, 0,067; 0,111; 0,821.
  - (15 s) Quarta: média dos valores. Resultado para "gato": 0,889 e 0,933.
  - (10 s) Conclusão: a saída de cada token agora mistura informação dos demais, e cada linha de pesos soma 1.
  - *Gancho:* "Agora, com o código rodando."
- **Rubrica:** Profundidade, Corretude, Layout.
- **Referências:** Vaswani et al. (2017), equação 1.

### C04-S07 · 14:20–15:45 · Mapa de calor ao vivo

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 04/13, implementação `demos/01-self-attention`.
- **Objetivo:** mostrar o código funcionando e resolver o problema do banco deixado por [Apresentador 1](#a1).
- **Composição:** demo na aba 2. Zona B1–E7: linhas de cota e mapa de calor. Zona B8–E12: tabela da consulta em foco, plano finanças por lugar e nota vermelha de que os vetores foram escritos à mão.
- **Animação:** a própria demo. Antes dela, o código de `atencao.js` sobre papel, destacando a linha do softmax; o passo seguinte abre a demo.
- **Interação:** `demos/01-self-attention/?aba=frase`.
  1. Passar o mouse por "banco" na frase "o banco aprovou o crédito": maior peso em "crédito", 0,421; saída $Z=(0{,}651;\,0{,}093)$, deslocada para finanças.
  2. Passar por outros tokens para mostrar que cada linha é uma distribuição.
  3. Clicar em "Trocar frase": em "sentei no banco da praça", a mesma consulta dá 0,412 para "praça", e $Z=(0{,}091;\,0{,}647)$, deslocada para lugar.
  4. Alternar "Dividir por √d_k" para ver as linhas ficarem mais concentradas.
  - Contingência: `roteiro/previews/demo-01-frase.png` e `demo-01-frase-praca.png`.
- **SFX:** `abreDemo` na abertura; `softmaxNormaliza` ao trocar de frase. Sem som no hover.
- **Fala (85 s):**
  - (15 s) Mostrar o código: poucas linhas de JavaScript puro, comparadas por teste com NumPy e com a conta à mão.
  - (25 s) Passar o mouse em "banco" e ler: o maior peso vai para "crédito", e a saída se desloca para finanças.
  - (25 s) Trocar a frase. Os vetores de "banco" são os mesmos do dicionário; só o contexto mudou, e a saída foi para lugar. É a resposta ao problema anterior.
  - (10 s) Ressalvar: vetores escritos à mão. Em um modelo real, $W^Q$, $W^K$ e $W^V$ são aprendidas.
  - (10 s) Lembrar: um conjunto de pesos só permite um padrão por vez.
  - *Gancho:* "E se quisermos vários padrões ao mesmo tempo?"
- **Rubrica:** requisito 4, Profundidade, Layout.
- **Referências:** Vaswani et al. (2017).

---

## Capítulo C05. Multi-head attention (prancha 05/13)

### C05-S01 · 15:45–16:40 · Várias projeções em paralelo

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 05/13.
- **Objetivo:** explicar a fórmula de multi-head e por que o custo não multiplica.
- **Composição:** uma barra de 512 dimensões na zona B1–B12, depois dividida em 8 segmentos de 64. Zona C1–D12: oito pequenos mapas de calor em fila. Zona E1–E12: concatenação e $W^O$. Equações na zona A:

  $$\mathrm{MultiHead}(Q,K,V)=\mathrm{Concat}(\mathrm{head}_1,\dots,\mathrm{head}_h)W^O$$
  $$\mathrm{head}_i=\mathrm{Attention}(QW_i^Q,KW_i^K,VW_i^V)$$

- **Animação:**
  1. A barra é cortada por 7 traços verticais (`media`, `traco`).
  2. Cada segmento desce e vira um mapa de calor, todos ao mesmo tempo (`longa`, `entrada`).
  3. As saídas se juntam em uma barra e passam por $W^O$.
- **Interação:** nenhuma. Os pequenos mapas são calculados com valores sorteados por semente fixa e rotulados como ilustração.
- **SFX:** `mascaraCorta` nos cortes; `multiplicaMatriz` na concatenação com $W^O$.
- **Fala (55 s):**
  - (15 s) Uma única média ponderada tende a borrar relações diferentes. Em vez disso, várias atenções em paralelo.
  - (20 s) Valores do artigo: $h=8$ e $d_k=d_v=d_{\text{model}}/h=64$. Ler as equações.
  - (10 s) Como cada cabeça tem dimensão reduzida, o custo total fica parecido com o de uma cabeça com dimensão completa.
  - (10 s) A concatenação e $W^O$ devolvem o tamanho original e misturam as cabeças.
  - *Gancho:* "O que cada cabeça aprende? Essa pergunta exige cuidado."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.2.2.

### C05-S02 · 16:40–17:10 · O que cada cabeça aprende

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 05/13.
- **Objetivo:** dar a intuição sem afirmar que as cabeças têm funções definidas de antemão.
- **Composição:** a mesma frase repetida em três vistas, zona B2–E11, como vistas ortogonais de uma peça: frontal, lateral, superior. Cada uma com linhas de cota diferentes. Nota vermelha na zona E9–E12: "padrões observados, não programados".
- **Animação:**
  1. As três vistas se desenham em sequência (`media`, `traco`).
  2. A nota entra por último.
- **Interação:** nenhuma. Padrões marcados como ilustrativos.
- **SFX:** nenhum. Silêncio intencional, para a ressalva ter peso.
- **Fala (30 s):**
  - (10 s) Como vistas de uma peça: cada projeção revela relações diferentes.
  - (10 s) Em modelos treinados, pesquisadores observam cabeças que tendem a seguir certos padrões sintáticos.
  - (10 s) Mas ninguém programa isso, e o padrão não é garantido. Peso de atenção não é explicação do modelo.
  - *Gancho:* "Temos a peça central. Falta um detalhe que ela perdeu."
- **Rubrica:** Corretude.
- **Referências:** Vaswani et al. (2017); Clark et al. (2019); Jain; Wallace (2019).

### C05-S03 · 17:10–17:30 · A peça está pronta, falta a ordem

- **Apresentador:** [Apresentador 2](#a2). Carimbo: "[Apresentador 2](#a2) · [Mecanismo de atenção](#p2)", prancha 05/13.
- **Objetivo:** sintetizar o bloco de atenção e passar a palavra.
- **Composição:** caixa desenhada "Multi-head attention" no centro, zona C4–D9, com entradas $Q,K,V$ e saída. Do lado esquerdo, uma mini-planta do modelo com essa peça preenchida e as demais tracejadas.
- **Animação:**
  1. A caixa se fecha em torno dos mapas de calor da cena anterior (`media`, `traco`).
  2. A mini-planta entra com a peça preenchida em azul e as demais tracejadas (`media`, `entrada`).
  3. Carimbo troca de nome (`curta`).
- **Interação:** nenhuma.
- **SFX:** `trocaApresentador` no carimbo.
- **Fala (20 s):**
  - (10 s) Recapitular: pontuar, escalar, normalizar, fazer média, em várias cabeças.
  - (5 s) Provocar: note que em nenhuma conta aparece a ordem das palavras.
  - (5 s) **Passagem:** "[Apresentador 3](#a3), como esse modelo sabe quem veio antes de quem?"
- **Rubrica:** Apresentação, requisito 2.
- **Referências:** Vaswani et al. (2017).

---

## Capítulo C06. Codificação posicional (prancha 06/13)

### C06-S01 · 17:30–18:05 · Atenção ignora a ordem

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 06/13.
- **Objetivo:** mostrar que a self-attention, sozinha, é equivariante à permutação.
- **Composição:** zona B1–D6: "o gato dorme" com sua matriz $A$. Zona B7–D12: "dorme gato o" com sua matriz. Zona E: a afirmação $f(PX)=Pf(X)$, onde $P$ é uma matriz de permutação.
- **Animação:**
  1. A matriz $A$ do exemplo à mão entra à esquerda.
  2. Os tokens trocam de lugar por um arco (`longa`, `traco`); linhas e colunas se reordenam junto.
  3. Linhas de ligação mostram que cada valor é o mesmo, só em outra posição.
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` em cada troca. Silêncio ao final, por 2 s.
- **Fala (35 s):**
  - (15 s) Embaralhe os tokens: as saídas são as mesmas, só que embaralhadas igualmente. Nada na fórmula sabe o que é "antes".
  - (10 s) Para o modelo, "o cachorro mordeu o homem" e "o homem mordeu o cachorro" teriam os mesmos ingredientes.
  - (10 s) A informação de posição precisa entrar pelos dados.
  - *Gancho:* "A solução do artigo original é somar uma régua de frequências."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.5.

### C06-S02 · 18:05–19:25 · Curvas senoidais ao vivo

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 06/13, implementação `demos/02-codificacao-posicional`.
- **Objetivo:** visualizar a fórmula e entender por que frequências diferentes dão uma assinatura para cada posição.
- **Composição:** a demo em tela cheia. Zona B1–E7: quatro curvas, com dimensão e comprimento de onda à esquerda. Zona B8–E12: equações, matriz PE e similaridade entre posições.
- **Animação:** antes da demo, uma linha: embedding + PE = entrada, com as duas barras se somando célula a célula (`media`, `entrada`).
- **Interação:** `demos/02-codificacao-posicional`.
  1. Curvas com $d_{\text{model}}=128$: as dimensões 0, 16, 32 e 48 têm $\lambda$ de cerca de 6,3; 19,9; 62,8 e 198,7 posições.
  2. Mover o mouse na matriz: a linha de posição percorre o mapa, e os pontos andam nas curvas.
  3. Mostrar a similaridade: posições vizinhas têm vetores mais parecidos.
  4. Mudar $d_{\text{model}}$ para mostrar o efeito na matriz.
  - Contingência: `roteiro/previews/demo-02-posicional.png`.
- **SFX:** `abreDemo` na abertura. Sem som durante a exploração, para a fala dominar.
- **Fala (80 s):**
  - (15 s) A codificação é somada ao embedding, não concatenada, e tem a mesma dimensão $d_{\text{model}}$.
  - (20 s) Ler as fórmulas: $PE_{(pos,2i)}=\sin(pos/10000^{2i/d_{\text{model}}})$ e $PE_{(pos,2i+1)}=\cos(pos/10000^{2i/d_{\text{model}}})$.
  - (20 s) Na demo: cada dimensão oscila em uma frequência; os comprimentos de onda vão de $2\pi$ a $10000\cdot 2\pi$, em progressão geométrica. Analogia: ponteiros de um relógio ou bits de um contador, em versão contínua.
  - (15 s) Vantagem citada no artigo: para um deslocamento fixo $k$, $PE_{pos+k}$ é função linear de $PE_{pos}$, o que pode facilitar aprender posições relativas. O teste da demo confere essa identidade.
  - (10 s) Não há parâmetro a treinar aqui.
  - *Gancho:* "Essa não é a única solução."
- **Rubrica:** requisito 4, Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.5.

### C06-S03 · 19:25–19:55 · Posições aprendidas e RoPE

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 06/13.
- **Objetivo:** mostrar as alternativas à versão senoidal, em nível de visão geral.
- **Composição:** três colunas iguais, zona B1–E12: senoidal (fixa, somada à entrada), aprendida (tabela de posições, somada à entrada), RoPE (rotação de $Q$ e $K$ na atenção). Cada coluna com um desenho pequeno e duas linhas de texto.
- **Animação:**
  1. As colunas entram da esquerda para a direita (`media`, `entrada`).
  2. Na coluna RoPE, dois vetores são redesenhados com o mesmo giro somado aos dois, e o ângulo entre eles permanece igual (`longa`, `traco`).
- **Interação:** nenhuma.
- **SFX:** nenhum, exceto `tokenEntra` na rotação.
- **Fala (30 s):**
  - (10 s) Posições aprendidas, usadas em BERT e GPT: uma tabela como a de embeddings, limitada ao tamanho máximo definido no treino.
  - (15 s) RoPE gira pares de dimensões de $Q$ e $K$ conforme a posição, de modo que o produto escalar passa a depender da distância relativa. É usada em vários modelos recentes.
  - (5 s) *Gancho:* "Com posição resolvida, podemos montar o bloco."
- **Rubrica:** Amplitude, Corretude.
- **Referências:** Gehring et al. (2017); Devlin et al. (2018); Radford et al. (2018); Su et al. (2024).

---

## Capítulo C07. O bloco completo (prancha 07/13)

### C07-S01 · 19:55–20:40 · Residuais e LayerNorm

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 07/13.
- **Objetivo:** explicar as duas peças que tornam possível treinar pilhas profundas.
- **Composição:** caixa de atenção no centro, zona B5–D8. A linha residual contorna a caixa por fora, como cota de desvio. Bloco "Add & Norm" depois da soma. Zona E1–E6: $\mathrm{LayerNorm}(x+\mathrm{Sublayer}(x))$. Zona E7–E12: uma barra de um vetor, antes e depois da normalização.
- **Animação:**
  1. O vetor atravessa a caixa (`media`, `traco`).
  2. A linha residual é desenhada por fora e se soma à saída (`media`, `traco`).
  3. As células do vetor se reajustam para média 0 e variância 1 na normalização (`media`, `entrada`).
  4. Entra a forma pre-norm, $x+\mathrm{Sublayer}(\mathrm{LayerNorm}(x))$, abaixo da forma original.
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` na soma residual.
- **Fala (45 s):**
  - (15 s) Conexão residual: o sinal tem um caminho direto, o que ajuda o gradiente a chegar às camadas iniciais.
  - (15 s) LayerNorm: normaliza cada posição ao longo das features, sem depender do lote.
  - (15 s) Detalhe que costuma ser confundido: o artigo aplica a norma depois da soma (post-norm); GPT-2 e muitos modelos posteriores a colocam antes (pre-norm). Nosso mini-GPT usa pre-norm.
  - *Gancho:* "A atenção só faz média. Onde está a não linearidade forte?"
- **Rubrica:** Profundidade, Corretude.
- **Referências:** He et al. (2016); Ba; Kiros; Hinton (2016); Vaswani et al. (2017); Radford et al. (2019).

### C07-S02 · 20:40–21:10 · FFN por posição

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 07/13.
- **Objetivo:** mostrar a rede aplicada igualmente a cada posição.
- **Composição:** coluna de vetores à esquerda, zona B1–E3. No centro, zona B5–E8, uma única FFN desenhada, ligada a todas as posições. À direita, a saída. Equação na zona A: $\mathrm{FFN}(x)=\max(0,xW_1+b_1)W_2+b_2$. Rótulo: $512\to 2048\to 512$.
- **Animação:**
  1. A FFN recebe a primeira posição; o vetor se expande e contrai (`media`, `entrada`).
  2. A mesma FFN processa as demais, com um mesmo traço ligando todas (`longa`, `traco`).
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` na expansão.
- **Fala (30 s):**
  - (15 s) Duas camadas lineares com ReLU entre elas. No artigo, $d_{ff}=2048$.
  - (10 s) Os pesos são os mesmos em todas as posições de uma camada, e mudam de uma camada para outra.
  - (5 s) *Gancho:* "Empilhando, temos a arquitetura completa."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.3.

### C07-S03 · 21:10–21:50 · Encoder e decoder

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 07/13.
- **Objetivo:** apresentar o diagrama completo e distinguir encoder, decoder, encoder-only e decoder-only.
- **Composição:** planta do modelo, zona B1–E8, desenhada como esquema: pilha de encoder à esquerda ($N=6$) e de decoder à direita. Zona B9–E12: tabela pequena com a arquitetura usada por família: Transformer original: encoder e decoder; BERT: só encoder; GPT: só decoder, sem cross-attention.
- **Animação:**
  1. As caixas já vistas entram na planta, uma por uma. A única nova é a cross-attention, ainda tracejada (`curta`, `entrada`).
  2. O multiplicador $\times N$ é cotado ao lado de cada pilha.
  3. As linhas da tabela entram, com cada uma destacando a parte da planta que usa.
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` em cada caixa, a intervalos curtos.
- **Fala (40 s):**
  - (15 s) Encoder: self-attention e FFN, com $N=6$ no artigo. Decoder: três subcamadas, atenção mascarada, cross-attention e FFN.
  - (15 s) Tarefa original: tradução. O encoder lê a frase de origem, e o decoder gera a de destino.
  - (10 s) Famílias usam partes da planta: BERT só o encoder; GPT é chamado de decoder-only porque tem a máscara causal, mas não a cross-attention.
  - *Gancho:* "Por que o decoder precisa de máscara? Vamos ver."
- **Rubrica:** Amplitude, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.1; Devlin et al. (2018); Radford et al. (2018).

### C07-S04 · 21:50–23:05 · Máscara causal ao vivo

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 07/13, implementação `demos/03-mascara-causal`.
- **Objetivo:** provar numericamente que a máscara impede o vazamento do futuro.
- **Composição:** a demo em tela cheia. Duas colunas: bidirecional, zona B1–E6, e causal, zona B7–E12. Cada uma com o mapa e, abaixo, as barras de quanto cada saída mudou.
- **Animação:** a própria demo; ao abrir, a hachura vermelha é desenhada célula a célula (`longa`, `traco`) sobre o mapa da direita.
- **Interação:** `demos/03-mascara-causal`.
  1. Mostrar os dois mapas: à direita, nada acima da diagonal.
  2. Passar o mouse em "subiu": só vê "o", "gato" e ela mesma.
  3. Clicar em "Trocar o token futuro" ("muro" → "telhado", posição 4).
  4. Ler as barras. Sem máscara, todas as saídas mudam: 0,187; 1,385; 0,925; 0,065; 2,090; 2,400. Com máscara: 0; 0; 0; 0; 2,367; 2,400.
  - Vetores pseudoaleatórios fixos: o padrão dos pesos não tem significado linguístico. O que importa é onde são nulos.
  - Contingência: `roteiro/previews/demo-03-mascara.png`.
- **SFX:** `abreDemo` na abertura; `mascaraCorta` na hachura e na troca do token. Silêncio de 2 s sobre os zeros.
- **Fala (75 s):**
  - (15 s) Ao treinar para prever o próximo token, a resposta está na própria sequência. Sem cuidado, o modelo copia do futuro.
  - (15 s) A solução: antes do softmax, somar $-\infty$ nas células com $j>i$. O softmax as torna exatamente zero e redistribui o peso.
  - (20 s) Clicar e ler: trocar um token futuro não altera nenhuma saída anterior.
  - (15 s) À esquerda, sem máscara, a mesma troca afeta todas as posições. É o comportamento desejado no encoder, que lê a frase inteira.
  - (10 s) Essa é a diferença entre a atenção bidirecional do BERT e a causal do GPT.
  - *Gancho:* "No decoder original, há ainda uma terceira forma de atenção."
- **Rubrica:** requisito 4, Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.2.3; Devlin et al. (2018).

### C07-S05 · 23:05–23:45 · Cross-attention

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 07/13.
- **Objetivo:** mostrar de onde vêm $Q$, $K$ e $V$ na cross-attention e fechar o arco com Bahdanau.
- **Composição:** frase de origem no topo, zona B2–B11; frase de destino embaixo, zona E2–E11. Entre elas, zona C–D, linhas de cota. À direita, mapa retangular de $m\times n$, zona C10–D12, e o rótulo: $Q$ do decoder, $K$ e $V$ do encoder.
- **Animação:**
  1. $K$ e $V$ descem da frase de origem, em vermelho e ocre (`media`, `traco`).
  2. $Q$ sobe da de destino, em azul.
  3. As cotas se formam; o mapa retangular é preenchido.
  4. A caixa vazia da planta é preenchida.
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` quando $Q$ e $K$ se encontram; `softmaxNormaliza` no mapa.
- **Fala (40 s):**
  - (15 s) A fórmula é a mesma; muda a origem: consultas do decoder, chaves e valores do encoder.
  - (10 s) A matriz de pesos é retangular: $m$ tokens de destino por $n$ de origem.
  - (10 s) Lembra algo? É a atenção de Bahdanau, com produto escalar e sem RNN. O arco se fecha.
  - (5 s) *Gancho:* "A máquina está montada. Como ajustar milhões de parâmetros?"
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017), seção 3.2.3; Bahdanau; Cho; Bengio (2014).

---

## Capítulo C08. Treinamento (prancha 08/13)

### C08-S01 · 23:45–24:35 · Próximo token e masked LM

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 08/13.
- **Objetivo:** contrastar os dois objetivos de treino e ligar cada um à máscara correspondente.
- **Composição:** duas metades. Zona B1–E6: GPT, com a sequência deslocada em uma posição. Zona B7–E12: BERT, com tokens substituídos por `[MASK]`. Equação na zona A: $\mathcal{L}=-\frac{1}{|T|}\sum_{t\in T}\log p_\theta(y_t\mid\text{entrada})$, com $T$ sendo as posições avaliadas.
- **Animação:**
  1. À esquerda, a sequência é copiada e deslocada; setas ligam cada entrada ao alvo seguinte (`media`, `traco`).
  2. À direita, alguns tokens são cobertos; setas partem dos vizinhos dos dois lados até o buraco.
  3. Valores do BERT entram: 15% mascarados; desses, 80% viram `[MASK]`, 10% um token aleatório e 10% ficam iguais.
- **Interação:** nenhuma.
- **SFX:** `mascaraCorta` nos tokens cobertos.
- **Fala (50 s):**
  - (15 s) Em ambos, a perda é entropia cruzada: o modelo é penalizado por dar pouca probabilidade ao token certo.
  - (15 s) Próximo token: cada posição prevê a seguinte. Exige máscara causal.
  - (15 s) Masked LM: esconde 15% dos tokens e prevê os escondidos. Como eles não estão na entrada, pode olhar para os dois lados.
  - (5 s) *Gancho:* "No caso do próximo token, o que entra como contexto?"
- **Rubrica:** Profundidade, Corretude, Amplitude.
- **Referências:** Radford et al. (2018); Devlin et al. (2018), seção 3.3.1.

### C08-S02 · 24:35–25:25 · Teacher forcing

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 08/13.
- **Objetivo:** explicar por que o treino é paralelo, embora a geração seja sequencial.
- **Composição:** zona B1–C12: "com teacher forcing", uma única passada com entrada verdadeira e todos os alvos. Zona D1–E12: "sem ele", uma cadeia em que cada saída vira a próxima entrada e um erro se propaga. Zona A9–A12: taxa de aprendizado do artigo.
- **Animação:**
  1. Na linha de cima, todas as posições calculam ao mesmo tempo (`media`, `entrada`).
  2. Na de baixo, uma por vez; um erro em vermelho contamina as seguintes (`longa`, `traco`).
  3. Entra a taxa: $lrate=d_{\text{model}}^{-0{,}5}\cdot\min(step^{-0{,}5},\,step\cdot warmup^{-1{,}5})$, com $warmup=4000$.
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` na passada única.
- **Fala (50 s):**
  - (20 s) Teacher forcing: durante o treino, a entrada de cada posição é o token verdadeiro anterior, não o que o modelo previu.
  - (15 s) Combinado com a máscara causal, isso permite calcular todas as posições em uma única passada, em paralelo. Essa é a grande vantagem sobre a RNN no treino.
  - (15 s) Do artigo: Adam, aquecimento de 4000 passos, label smoothing de 0,1 e dropout de 0,1.
  - *Gancho:* "Parece abstrato, então treinamos um de verdade."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Williams; Zipser (1989); Vaswani et al. (2017), seção 5.

### C08-S03 · 25:25–26:20 · Um treino real, em NumPy

- **Apresentador:** [Apresentador 3](#a3). Carimbo: "[Apresentador 3](#a3) · [Arquitetura e treinamento](#p3)", prancha 08/13, implementação `demos/04-mini-gpt`.
- **Objetivo:** mostrar que tudo o que foi descrito foi implementado e treinado, e quais números saíram.
- **Composição:** zona B1–E6: trecho do backprop de atenção em `modelo_numpy.py`. Zona B7–D12: curva real de perda de validação. Zona E7–E12: ficha técnica. Linha tracejada vermelha na perda dos bigramas.
- **Animação:**
  1. O código entra, com as linhas de `sbar`, `qbar` e `kbar` destacadas, uma a uma (`curta`, `entrada`).
  2. A curva é desenhada na ordem real dos passos (`longa`, `traco`).
  3. Valores são escritos nas posições corretas: início em 3,90, bigramas em 2,36, final em 1,49.
  4. O carimbo troca de nome (`curta`).
- **Interação:** curva e ficha vistas em `demos/04-mini-gpt/?cena=C08-S03&apresentador=a3`, que mantém o carimbo correto; os dados vêm de `dados/treino.log`. O treino não é executado ao vivo, porque levou 24 minutos.
- **SFX:** `abreDemo` na curva; `trocaApresentador` no carimbo. Silêncio enquanto a curva se desenha.
- **Fala (55 s):**
  - (15 s) Mini-GPT em NumPy puro, com o gradiente escrito à mão e conferido por diferenças finitas (pior erro relativo de cerca de $3\times10^{-6}$).
  - (15 s) Ficha: 158.656 parâmetros, 3 blocos, 4 cabeças, $d=64$, contexto de 64 caracteres. Corpus: 812 mil caracteres de Machado de Assis, de domínio público.
  - (15 s) Resultado: 6000 passos, cerca de 24 minutos de CPU. Entropia cruzada de validação de 1,49; um modelo de bigramas fica em 2,36. O ganho vem do contexto.
  - (10 s) **Passagem:** "[Apresentador 4](#a4), esse modelo está treinado. Faça-o escrever."
- **Rubrica:** requisito 4, Profundidade, Apresentação, requisito 2.
- **Referências:** Vaswani et al. (2017); Radford et al. (2018); Rush (2018).

---

## Capítulo C09. Inferência (prancha 09/13)

### C09-S01 · 26:20–26:55 · O laço autorregressivo

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 09/13.
- **Objetivo:** mostrar que gerar texto é um laço de previsão e amostragem.
- **Composição:** diagrama em ciclo na zona B3–E10: contexto → modelo → distribuição → amostra → de volta ao contexto. Código de 5 linhas na zona B11–E12 ou abaixo do ciclo.
- **Animação:**
  1. O ciclo se desenha uma vez (`longa`, `traco`).
  2. Três voltas rápidas, com o contexto ganhando um token a cada volta (`curta`, `entrada`).
- **Interação:** nenhuma.
- **SFX:** `amostraToken` a cada volta.
- **Fala (35 s):**
  - (15 s) No treino, tínhamos a resposta certa. Agora, cada novo token depende do anterior: a geração é sequencial, mesmo que o treino seja paralelo.
  - (10 s) Laço: calcular logits, transformar em probabilidades, escolher um token, anexar, repetir até um critério de parada.
  - (10 s) A saída do modelo é uma distribuição, não uma resposta pronta.
  - *Gancho:* "Vamos executar o modelo que acabamos de treinar."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Radford et al. (2019).

### C09-S02 · 26:55–28:05 · Mini-GPT ao vivo e temperatura

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 09/13, implementação `demos/04-mini-gpt`.
- **Objetivo:** ver a geração caractere a caractere e o efeito da temperatura.
- **Composição:** a demo em tela cheia. Zona B1–E7: início do texto, saída e controle de temperatura. Zona B8–E12: barras dos 10 caracteres mais prováveis, curva de treino e ficha. Equação na zona A: $p_i=\frac{\exp(z_i/T)}{\sum_j\exp(z_j/T)}$.
- **Animação:** a própria demo.
- **Interação:** `demos/04-mini-gpt` (funciona offline, inferência em JS puro).
  1. Com "o homem que ", $T=0{,}8$, clicar em "Gerar" e deixar correr cerca de 15 s; as barras mudam a cada caractere.
  2. Parar, baixar para $T=0{,}2$, gerar: repetição de trechos frequentes, como "a casa de".
  3. Parar, subir para $T=1{,}5$ ou $2{,}0$: caracteres improváveis e palavras inventadas.
  - Contingência: `?pregravado` carrega amostras gravadas no treino, para seis temperaturas; `demos/04-mini-gpt/dados/saida_pregravada.json`.
- **SFX:** `abreDemo` na abertura; `amostraToken` a cada caractere, limitado a 8 por segundo e abaixo da voz.
- **Fala (70 s):**
  - (15 s) Tudo roda no navegador, sem rede, com o modelo de 159 mil parâmetros.
  - (20 s) Olhar o resultado: parece português antigo, porque o corpus é Machado com ortografia da época. Forma palavras e pontuação sem ter nenhuma regra disso escrita.
  - (20 s) Temperatura divide os logits antes do softmax. Baixa: concentra e repete. Alta: achata e vira ruído. No limite $T\to 0$, sempre o mais provável.
  - (15 s) Atenção: o modelo não sabe o que está escrevendo. Ele reproduz regularidades estatísticas, e em escala tão pequena elas nem chegam ao sentido.
  - *Gancho:* "Temperatura é só um dos botões."
- **Rubrica:** requisito 4, Profundidade, Layout, Apresentação.
- **Referências:** Radford et al. (2019); Holtzman et al. (2020).

### C09-S03 · 28:05–28:50 · Top-k e top-p

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 09/13, implementação `demos/05-amostragem-kv-cache`.
- **Objetivo:** diferenciar corte por quantidade e corte por massa de probabilidade.
- **Composição:** a demo, zona B1–E7: barras dos 16 caracteres mais prováveis, com contorno antes do corte e preenchimento depois de renormalizar. Os cortados ganham hachura vermelha.
- **Animação:** a própria demo.
- **Interação:** `demos/05-amostragem-kv-cache`.
  1. Mostrar a distribuição sem cortes.
  2. Top-k = 5: só cinco barras seguem elegíveis; as outras recebem a hachura.
  3. Voltar top-k para desligado e pôr top-p = 0,50: o número de elegíveis varia conforme o contexto. Mudar o texto de início para mostrar.
  - Contingência: `roteiro/previews/demo-05-amostragem.png`.
- **SFX:** `abreDemo`, se vier de outra demo; `mascaraCorta` uma vez no primeiro corte.
- **Fala (45 s):**
  - (15 s) Top-k mantém os $k$ tokens mais prováveis, com $k$ fixo.
  - (15 s) Top-p, ou amostragem de núcleo: menor conjunto cuja probabilidade somada atinge $p$. O tamanho muda com a incerteza do modelo.
  - (10 s) Depois do corte, renormaliza e sorteia. Ordem desta demo: temperatura, top-k, top-p.
  - (5 s) *Gancho:* "Rodar esse laço tem um custo. Veja o que estamos desperdiçando."
- **Rubrica:** requisito 4, Profundidade, Corretude.
- **Referências:** Fan; Lewis; Dauphin (2018); Holtzman et al. (2020).

### C09-S04 · 28:50–29:35 · KV cache

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 09/13, implementação `demos/05-amostragem-kv-cache`.
- **Objetivo:** mostrar que guardar $K$ e $V$ evita recálculo sem mudar o resultado.
- **Composição:** a demo, zona B8–E12: esquema de passos, botão de comparação, dois quadros com multiplicações e tempo, e a linha de diferença entre logits.
- **Animação:** a própria demo.
- **Interação:** `demos/05-amostragem-kv-cache/?cena=C09-S04`. Clicar em "Gerar 64 tokens das duas formas". Resultado medido: 332,8 milhões de multiplicações sem cache e 10,4 milhões com cache, 32 vezes menos. Os tempos variam por máquina. Contingência: `roteiro/previews/demo-05-amostragem.png`.
- **SFX:** `multiplicaMatriz` ao clicar. Silêncio enquanto os números aparecem.
- **Fala (45 s):**
  - (15 s) Por causa da máscara causal, tokens antigos nunca mudam quando chega um novo: seus $K$ e $V$ continuam valendo.
  - (15 s) Guardamos essas matrizes e, a cada passo, calculamos só o token novo. Ler os números da tela; as duas rotas dão o mesmo logit, o que o teste confere.
  - (10 s) Atenção: o cache evita recálculo, mas a consulta nova ainda compara com todas as chaves. Cada passo continua $O(n)$, e o cache ocupa memória.
  - (5 s) *Gancho:* "O que nos leva ao custo que define esta arquitetura."
- **Rubrica:** requisito 4, Profundidade, Corretude.
- **Referências:** Pope et al. (2022).

---

## Capítulo C10. Custo e variantes eficientes (prancha 10/13)

### C10-S01 · 29:35–30:05 · O custo quadrático

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 10/13.
- **Objetivo:** explicar de onde vem $O(n^2)$ e quando ele pesa.
- **Composição:** três quadrados de mapa de atenção, com área proporcional, zona B1–E8: $n=512$, $n=1024$, $n=2048$. Zona B9–E12: tabela de pares: 262.144; 1.048.576; 4.194.304.
- **Animação:**
  1. O menor quadrado é preenchido (`media`, `entrada`).
  2. Dobrando $n$, a área quadruplica, e as cotas mostram isso (`longa`, `traco`).
- **Interação:** nenhuma.
- **SFX:** `multiplicaMatriz` a cada quadrado.
- **Fala (30 s):**
  - (15 s) Cada um dos $n$ tokens compara com $n$ chaves. A matriz de pontuações tem $n^2$ células, por cabeça e por camada.
  - (10 s) Dobrar o contexto quadruplica esse trabalho e, na implementação padrão, a memória. Em contraste, a FFN cresce linearmente.
  - (5 s) *Gancho:* "Duas respostas diferentes para esse problema."
- **Rubrica:** Profundidade, Corretude.
- **Referências:** Vaswani et al. (2017); Child et al. (2019).

### C10-S02 · 30:05–30:40 · FlashAttention e atenção esparsa

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 10/13.
- **Objetivo:** apresentar duas famílias e o que cada uma muda, em visão geral.
- **Composição:** duas colunas. Zona B1–E6: FlashAttention, uma matriz densa percorrida em blocos, com a memória rápida em destaque; rótulo "mesma atenção exata, menos acessos à memória". Zona B7–E12: atenção esparsa, com a matriz quase toda hachurada e poucos elementos calculados; rótulo "muda o padrão de atenção, $O(n\sqrt{n})$ em Child et al.".
- **Animação:**
  1. Janela de blocos varre a matriz densa (`longa`, `traco`).
  2. Hachura cobre as células ignoradas da segunda matriz (`media`, `traco`).
- **Interação:** nenhuma.
- **SFX:** `mascaraCorta` na hachura.
- **Fala (35 s):**
  - (15 s) FlashAttention calcula a atenção exata, com tiling, para reduzir acessos à memória de GPU. Não é aproximação nem elimina o custo aritmético quadrático.
  - (15 s) Abordagens esparsas calculam apenas parte dos pares, reduzindo a complexidade ao custo de mudar o padrão de atenção. Exemplos: Sparse Transformer, Longformer.
  - (5 s) *Gancho:* "Com essa base, por que essa arquitetura está em tantos lugares?"
- **Rubrica:** Amplitude, Corretude.
- **Referências:** Dao et al. (2022); Child et al. (2019); Beltagy; Peters; Cohan (2020).

---

## Capítulo C11. Famílias e aplicações (prancha 11/13)

### C11-S01 · 30:40–31:20 · BERT, GPT e T5

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 11/13.
- **Objetivo:** organizar as famílias de texto pela parte da planta que usam.
- **Composição:** três mini-plantas lado a lado, zona B1–D12, com a parte usada em tinta e o resto tracejado. Zona E1–E12: uma linha por modelo com tarefa de treino e ano.
- **Animação:**
  1. Cada mini-planta acende a parte usada (`media`, `traco`).
  2. Entra a linha de cada modelo (`curta`, `entrada`).
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` em cada família.
- **Fala (40 s):**
  - (13 s) BERT, 2018: só encoder, atenção bidirecional, masked LM. Bom para representar texto: busca, classificação, extração.
  - (14 s) GPT: só decoder com máscara causal. De GPT-1 a GPT-3, em 2020, com 175 bilhões de parâmetros, a estratégia foi escalar.
  - (13 s) T5, 2019: encoder e decoder, tudo como texto para texto: tradução, resumo, classificação, com o mesmo modelo e um prefixo na entrada.
  - *Gancho:* "E a palavra token não precisa significar texto."
- **Rubrica:** Amplitude, Corretude, Referências.
- **Referências:** Devlin et al. (2018); Radford et al. (2018); Radford et al. (2019); Brown et al. (2020); Raffel et al. (2020).

### C11-S02 · 31:20–32:05 · Visão, áudio e proteínas

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 11/13.
- **Objetivo:** mostrar a amplitude: o que vira token em cada domínio.
- **Composição:** três colunas com o mesmo formato "dado → tokens → modelo → saída", zona B1–E12:
  - ViT: imagem em quadrados de $16\times16$ → encoder → classe;
  - Whisper: espectrograma → encoder e decoder → texto;
  - AlphaFold 2: sequência e alinhamentos → Evoformer e módulo de estrutura → coordenadas 3D.

  Ilustrações em traço técnico: grade de pixels, espectrograma em hachura, cadeia de pontos. Sem imagens de moléculas brilhantes.
- **Animação:**
  1. Em cada coluna, o dado é cortado em tokens (`media`, `traco`).
  2. Os tokens entram na caixa do modelo, e a saída é desenhada (`media`, `entrada`).
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` nos cortes.
- **Fala (45 s):**
  - (15 s) ViT: cada quadrado de imagem é projetado linearmente e tratado como token, usando encoder padrão e um token de classificação.
  - (15 s) Whisper: reconhecimento de fala com Transformer encoder-decoder. A entrada é um espectrograma log-Mel de 80 canais, que passa por duas camadas convolucionais antes do encoder; o decoder gera o texto.
  - (15 s) AlphaFold 2: usa atenção em módulos próprios, como o Evoformer e a Invariant Point Attention. Não é um Transformer genérico aplicado a proteínas: o mérito inclui várias ideias específicas do domínio.
  - *Gancho:* "Isso também vale para código e para várias mídias de uma vez."
- **Rubrica:** Amplitude, Corretude, Referências.
- **Referências:** Dosovitskiy et al. (2020); Radford et al. (2022); Jumper et al. (2021).

### C11-S03 · 32:05–32:45 · Código, multimodais e leis de escala

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 11/13.
- **Objetivo:** fechar as aplicações e explicar a relação empírica entre recursos e desempenho.
- **Composição:** zona B1–C6: código de exemplo com a continuação sendo gerada (Codex). Zona D1–E6: imagem em traço e texto ligados a um mesmo espaço (CLIP, GPT-4). Zona B7–E12: gráfico log-log de perda por parâmetros: $L(N)\propto N^{-\alpha_N}$, com $\alpha_N\approx 0{,}076$.
- **Animação:**
  1. Linhas de código são completadas (`curta`, `entrada`).
  2. Imagem e texto são ligados por uma cota (`media`, `traco`).
  3. A reta do gráfico é desenhada; uma segunda anotação traz Chinchilla: dobrar o tamanho do modelo requer dobrar também os tokens de treino.
- **Interação:** nenhuma.
- **SFX:** `amostraToken` em cada linha de código; silêncio no gráfico.
- **Fala (40 s):**
  - (12 s) Modelos de código, como Codex: GPT treinado em repositórios públicos.
  - (10 s) Modelos multimodais: CLIP liga imagem e texto; o GPT-4 aceita imagens e texto como entrada.
  - (13 s) Leis de escala: Kaplan et al. mediram a perda caindo como lei de potência dos parâmetros, com expoente de cerca de 0,076. Hoffmann et al. refinam: parâmetros e tokens de treino devem crescer juntos.
  - (5 s) São relações empíricas, medidas em certos intervalos, não leis da natureza.
  - *Gancho:* "O que escala não resolve?"
- **Rubrica:** Amplitude, Corretude, Referências.
- **Referências:** Chen et al. (2021); Radford et al. (2021); OpenAI (2023); Kaplan et al. (2020); Hoffmann et al. (2022).

---

## Capítulo C12. Limitações e questões em aberto (prancha 12/13)

### C12-S01 · 32:45–33:20 · Alucinação e contexto finito

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 12/13.
- **Objetivo:** explicar duas limitações ligadas ao próprio mecanismo.
- **Composição:** prancha com aparência de notas de revisão: anotações em vermelho sobre as plantas anteriores. Zona B1–E6: frase falsa e bem formada, escrita pelo grupo e rotulada "exemplo fabricado para ilustração", já que o mini-GPT não chega a produzir frases coerentes. Zona B7–E12: janela de contexto como régua, com tokens saindo pela borda.
- **Animação:**
  1. A nota vermelha "plausível não é verdadeiro" é desenhada.
  2. A janela desliza e os tokens mais antigos somem (`longa`, `traco`).
- **Interação:** nenhuma.
- **SFX:** silêncio intencional no início da prancha; `mascaraCorta` quando um token sai da janela.
- **Fala (35 s):**
  - (15 s) Alucinação: o modelo foi otimizado para produzir continuações prováveis. Nada no objetivo garante a verdade.
  - (10 s) Mitigações existem, mas é uma questão em aberto.
  - (10 s) Contexto finito: o que sai da janela, o modelo não vê. Mesmo dentro dela, estudos mostram desempenho desigual conforme a posição da informação.
  - *Gancho:* "Há também custos fora do modelo."
- **Rubrica:** Amplitude, Corretude.
- **Referências:** Ji et al. (2023); Liu et al. (2024).

### C12-S02 · 33:20–33:55 · Custo energético e vieses

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 12/13.
- **Objetivo:** tratar impactos externos e encerrar as questões em aberto com rigor.
- **Composição:** zona B1–E6: tabela de materiais com a estimativa de Patterson et al. para o treino do GPT-3, 1.287 MWh e 552 tCO₂e, com a fonte visível. Zona B7–E12: distribuição de próximo token após uma frase com profissão e gênero, rotulada "ilustração, não medição"; lista de questões em aberto.
- **Animação:**
  1. Linhas da tabela entram (`curta`, `entrada`).
  2. Barras da distribuição crescem, e a nota vermelha "o corpus entra no modelo" é desenhada.
  3. Lista de questões em aberto entra.
- **Interação:** nenhuma.
- **SFX:** nenhum, para dar peso à fala.
- **Fala (35 s):**
  - (15 s) Treinar modelos grandes consome energia. Patterson et al. calcularam estimativas para vários modelos, incluindo GPT-3, e mostram que local e hardware importam muito.
  - (10 s) Vieses: modelos aprendem as regularidades do corpus, incluindo estereótipos e sub-representação.
  - (10 s) Questões em aberto: interpretabilidade, verificação, eficiência, avaliação dos danos.
  - *Gancho:* "Voltemos à prancha completa."
- **Rubrica:** Amplitude, Corretude, Referências.
- **Referências:** Strubell; Ganesh; McCallum (2019); Patterson et al. (2021); Bender et al. (2021).

---

## Capítulo C13. Encerramento (prancha 13/13)

### C13-S01 · 33:55–34:40 · Síntese: o desenho de conjunto

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 13/13.
- **Objetivo:** reunir tudo em um único diagrama e voltar à tese.
- **Composição:** a planta completa em tela cheia, zona B1–E12, com cada caixa numerada pela prancha em que foi explicada. Ao final, a frase-tese da abertura, zona E, em 36 px.
- **Animação:**
  1. Cada caixa da planta entra na sua posição, com o número da prancha em que foi explicada (`curta`, `entrada`), uma por uma, seguindo a fala.
  2. O fluxo de dados é desenhado da entrada à saída (`longa`, `traco`).
  3. A frase-tese entra.
- **Interação:** nenhuma.
- **SFX:** `tokenEntra` em cada detalhe; silêncio intencional de 3 s na frase-tese.
- **Fala (45 s):**
  - (20 s) Percorrer a planta: tokens e embeddings, posição, atenção com várias cabeças, residuais e FFN, máscara, treino com próximo token ou masked LM, geração por amostragem.
  - (15 s) Repetir a tese: a representação depende do contexto, os pesos são aprendidos prevendo tokens.
  - (10 s) Lembrar: tudo o que foi mostrado na tela tem código no repositório, com testes.
  - *Gancho:* "Estas são as fontes."
- **Rubrica:** Profundidade, Apresentação, Layout.
- **Referências:** Vaswani et al. (2017).

### C13-S02 · 34:40–35:10 · Referências e créditos

- **Apresentador:** [Apresentador 4](#a4). Carimbo: "[Apresentador 4](#a4) · [Inferência e aplicações](#p4)", prancha 13/13.
- **Objetivo:** dar visibilidade ao referencial teórico e aos integrantes.
- **Composição:** coluna esquerda, zona B1–E8: referências principais em ABNT, em 20 px, lidas de `10-referencias.md`. Coluna direita, zona B9–E12: nomes e papéis do config, licenças de fontes e o caminho do repositório.
- **Animação:**
  1. As referências entram em blocos por tema (`curta`, `entrada`); a lista permanece parada tempo suficiente para ser lida em pausa.
  2. Os nomes e papéis entram na coluna direita, seguidos de "Obrigado".
- **Interação:** nenhuma.
- **SFX:** `transicaoCapitulo` na entrada; silêncio até o fim.
- **Fala (30 s):**
  - (15 s) Dizer que a base é o artigo de 2017 e fontes primárias, com material didático de Jurafsky e Martin e do Annotated Transformer.
  - (10 s) Agradecer, em nome de todos os integrantes, dizendo os quatro nomes.
  - (5 s) Encerrar: "Obrigado."
- **Rubrica:** Referências, requisito 2, Apresentação.
- **Referências:** ver `10-referencias.md`.

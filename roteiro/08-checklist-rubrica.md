# 8. Checklist da rubrica

IDs conferidos por `scripts/check_timing.py`: um ID que não exista no mapa de tempo faz a verificação falhar.

## Requisitos obrigatórios do professor

| # | Requisito | Onde é atendido | Evidência |
|---:|---|---|---|
| 1 | Duração entre 30 e 40 min, alvo de 35 min | Todas as cenas | `check_timing.py`: 35:10 no total |
| 2 | Todos apresentam; a tela mostra quem são e quem fala | C01-S02 (lista), carimbo em todas as cenas; passagens em C03-S04, C05-S03, C08-S03; créditos em C13-S02 | Maior diferença entre apresentadores: 5 s |
| 3 | Atende aos critérios de avaliação | Ver tabela abaixo | |
| 4 | Conceitos ilustrados por implementações | C03-S02, C04-S04, C04-S07, C06-S02, C07-S04, C08-S03, C09-S02, C09-S03, C09-S04 | `demos/`, com testes executados e previews |

## Critérios de avaliação

| Critério | Onde é atendido | Como |
|---|---|---|
| **Amplitude** | C03-S01, C06-S03, C07-S03, C10-S02, C11-S01, C11-S02, C11-S03, C12-S01, C12-S02 | Variantes de posição, famílias de modelos, visão, áudio, proteínas, código, multimodais, limites |
| **Profundidade** | C02-S02, C04-S02, C04-S03, C04-S04, C04-S06, C05-S01, C07-S01, C07-S04, C08-S01, C08-S02, C09-S04, C10-S01 | Dedução de $\sqrt{d_k}$, conta à mão, fórmula completa, gradiente, custo |
| **Corretude** | C01-S01 a C13-S02, com destaque para C04-S01, C04-S04, C05-S02, C07-S01, C07-S04, C10-S02, C11-S02 | Ressalvas ditas em voz alta, `09-armadilhas.md`, testes contra referência, fórmulas conferidas com o artigo |
| **Layout** | Todas as cenas, com destaque para C01-S01, C04-S06, C09-S02, C13-S01 | `02-biblia-estilo.md`; screenshots revisados; sons discretos em `03-biblia-sonora.md` |
| **Apresentação** | C01-S01, C01-S02, C02-S04, C03-S04, C05-S03, C08-S03, C13-S01, C13-S02 | Guias de fala com tempos, frases de passagem, avanço manual, modo de ensaio em `07-arquitetura.md` |
| **Referências** | C02-S03, C02-S04, C11-S01, C11-S02, C11-S03, C12-S02, C13-S02, e campo próprio em cada cena | `10-referencias.md`, em ABNT, priorizando fontes primárias |

## Conteúdo mínimo

| Tópico pedido | Cenas |
|---|---|
| Limites de RNN e LSTM, Bahdanau como ponte | C02-S01, C02-S02, C02-S03, C02-S04 |
| Tokenização (BPE, WordPiece) e embeddings | C03-S01, C03-S02, C03-S03, C03-S04 |
| Self-attention: Q, K, V | C04-S01, C04-S02 |
| Produto escalar | C04-S03 |
| Escala por $\sqrt{d_k}$ e o porquê | C04-S04 |
| Softmax | C04-S05 |
| Exemplo numérico à mão, animado | C04-S06 |
| Multi-head e intuição das cabeças | C05-S01, C05-S02 |
| Posição senoidal, aprendida e RoPE | C06-S01, C06-S02, C06-S03 |
| Residuais, LayerNorm, FFN | C07-S01, C07-S02 |
| Encoder × decoder, máscara causal, cross-attention | C07-S03, C07-S04, C07-S05 |
| Próximo token × masked LM; teacher forcing | C08-S01, C08-S02, C08-S03 |
| Decodificação autorregressiva, temperatura, top-k, top-p, KV cache | C09-S01, C09-S02, C09-S03, C09-S04 |
| Custo $O(n^2)$, FlashAttention, atenção esparsa | C10-S01, C10-S02 |
| BERT, GPT, T5 | C11-S01 |
| ViT, Whisper, AlphaFold 2 | C11-S02 |
| Código, multimodais, leis de escala | C11-S03 |
| Alucinação, contexto finito | C12-S01 |
| Custo energético, vieses | C12-S02 |
| Síntese e referências | C13-S01, C13-S02 |

## Implementações pedidas

| Pedido | Atendido em |
|---|---|
| Self-attention do zero com mapa de calor interativo e teste de referência | `demos/01-self-attention` |
| Curvas da codificação senoidal | `demos/02-codificacao-posicional` |
| Mini-GPT com controle de temperatura e fallback offline | `demos/04-mini-gpt` |
| Máscara causal × atenção bidirecional | `demos/03-mascara-causal` |
| Demos adicionais | `demos/00-tokenizacao-bpe`, `demos/05-amostragem-kv-cache` |

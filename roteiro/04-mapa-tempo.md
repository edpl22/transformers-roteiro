# 4. Mapa de tempo

> Arquivo gerado por `scripts/gerar_mapa_tempo.py`. Edite `roteiro/mapa-tempo.json`, não este arquivo.

## Capítulos

| Capítulo | Título | Apresentador | Início | Fim | Duração |
|---|---|---|---:|---:|---:|
| C01 | Abertura e integrantes | Palos | 00:00 | 01:25 | 01:25 |
| C02 | Por que não bastavam as RNNs | Palos | 01:25 | 05:00 | 03:35 |
| C03 | Tokenização e embeddings | Palos | 05:00 | 08:45 | 03:45 |
| C04 | Self-attention | Davi | 08:45 | 15:45 | 07:00 |
| C05 | Multi-head attention | Davi | 15:45 | 17:30 | 01:45 |
| C06 | Codificação posicional | Mendes | 17:30 | 19:55 | 02:25 |
| C07 | O bloco completo | Mendes | 19:55 | 23:45 | 03:50 |
| C08 | Treinamento | Mendes | 23:45 | 26:20 | 02:35 |
| C09 | Inferência | Oliveira | 26:20 | 29:35 | 03:15 |
| C10 | Custo e variantes eficientes | Oliveira | 29:35 | 30:40 | 01:05 |
| C11 | Famílias e aplicações | Oliveira | 30:40 | 32:45 | 02:05 |
| C12 | Limitações e questões em aberto | Oliveira | 32:45 | 33:55 | 01:10 |
| C13 | Encerramento | Oliveira | 33:55 | 35:10 | 01:15 |
| **Total** | | | | | **35:10** |

## Divisão entre apresentadores

| Apresentador | Papel | Capítulos | Tempo |
|---|---|---|---:|
| Palos | Contexto e representação | C01, C02, C03 | 08:45 |
| Davi | Mecanismo de atenção | C04, C05 | 08:45 |
| Mendes | Arquitetura e treinamento | C06, C07, C08 | 08:50 |
| Oliveira | Inferência e aplicações | C09, C10, C11, C12, C13 | 08:50 |

## Cenas

| Cena | Título | Início | Fim | Duração | Demo |
|---|---|---:|---:|---:|---|
| C01-S01 | Capa e frase-tese | 00:00 | 00:45 | 00:45 |  |
| C01-S02 | Quem apresenta o quê | 00:45 | 01:25 | 00:40 |  |
| C02-S01 | A leitura em série | 01:25 | 02:20 | 00:55 |  |
| C02-S02 | Gradiente de longo alcance | 02:20 | 03:20 | 01:00 |  |
| C02-S03 | O gargalo e a atenção de Bahdanau | 03:20 | 04:35 | 01:15 |  |
| C02-S04 | A pergunta-ponte | 04:35 | 05:00 | 00:25 |  |
| C03-S01 | Por que tokens | 05:00 | 05:30 | 00:30 |  |
| C03-S02 | BPE ao vivo e WordPiece | 05:30 | 06:55 | 01:25 | `demos/00-tokenizacao-bpe` |
| C03-S03 | Do token ao vetor | 06:55 | 08:00 | 01:05 |  |
| C03-S04 | O problema do banco | 08:00 | 08:45 | 00:45 |  |
| C04-S01 | Reponderar pelo contexto | 08:45 | 09:25 | 00:40 |  |
| C04-S02 | Q, K e V | 09:25 | 10:25 | 01:00 |  |
| C04-S03 | Produto escalar como compatibilidade | 10:25 | 11:05 | 00:40 |  |
| C04-S04 | Por que dividir por raiz de d_k | 11:05 | 12:10 | 01:05 | `demos/01-self-attention` |
| C04-S05 | Softmax e média ponderada | 12:10 | 12:40 | 00:30 |  |
| C04-S06 | A conta à mão, passo a passo | 12:40 | 14:20 | 01:40 |  |
| C04-S07 | Mapa de calor ao vivo | 14:20 | 15:45 | 01:25 | `demos/01-self-attention` |
| C05-S01 | Várias projeções em paralelo | 15:45 | 16:40 | 00:55 |  |
| C05-S02 | O que cada cabeça aprende | 16:40 | 17:10 | 00:30 |  |
| C05-S03 | A peça está pronta, falta a ordem | 17:10 | 17:30 | 00:20 |  |
| C06-S01 | Atenção ignora a ordem | 17:30 | 18:05 | 00:35 |  |
| C06-S02 | Curvas senoidais ao vivo | 18:05 | 19:25 | 01:20 | `demos/02-codificacao-posicional` |
| C06-S03 | Posições aprendidas e RoPE | 19:25 | 19:55 | 00:30 |  |
| C07-S01 | Residuais e LayerNorm | 19:55 | 20:40 | 00:45 |  |
| C07-S02 | FFN por posição | 20:40 | 21:10 | 00:30 |  |
| C07-S03 | Encoder e decoder | 21:10 | 21:50 | 00:40 |  |
| C07-S04 | Máscara causal ao vivo | 21:50 | 23:05 | 01:15 | `demos/03-mascara-causal` |
| C07-S05 | Cross-attention | 23:05 | 23:45 | 00:40 |  |
| C08-S01 | Próximo token e masked LM | 23:45 | 24:35 | 00:50 |  |
| C08-S02 | Teacher forcing | 24:35 | 25:25 | 00:50 |  |
| C08-S03 | Um treino real, em NumPy | 25:25 | 26:20 | 00:55 | `demos/04-mini-gpt` |
| C09-S01 | O laço autorregressivo | 26:20 | 26:55 | 00:35 |  |
| C09-S02 | Mini-GPT ao vivo e temperatura | 26:55 | 28:05 | 01:10 | `demos/04-mini-gpt` |
| C09-S03 | Top-k e top-p | 28:05 | 28:50 | 00:45 | `demos/05-amostragem-kv-cache` |
| C09-S04 | KV cache | 28:50 | 29:35 | 00:45 | `demos/05-amostragem-kv-cache` |
| C10-S01 | O custo quadrático | 29:35 | 30:05 | 00:30 |  |
| C10-S02 | FlashAttention e atenção esparsa | 30:05 | 30:40 | 00:35 |  |
| C11-S01 | BERT, GPT e T5 | 30:40 | 31:20 | 00:40 |  |
| C11-S02 | Visão, áudio e proteínas | 31:20 | 32:05 | 00:45 |  |
| C11-S03 | Código, multimodais e leis de escala | 32:05 | 32:45 | 00:40 |  |
| C12-S01 | Alucinação e contexto finito | 32:45 | 33:20 | 00:35 |  |
| C12-S02 | Custo energético e vieses | 33:20 | 33:55 | 00:35 |  |
| C13-S01 | Síntese: o desenho de conjunto | 33:55 | 34:40 | 00:45 |  |
| C13-S02 | Referências e créditos | 34:40 | 35:10 | 00:30 |  |

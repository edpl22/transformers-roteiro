# 1. Conceito-guia

## Frase-tese

> A representação de um token depende do contexto: um Transformer calcula, em paralelo, quanto cada posição deve aproveitar de todas as outras, e aprende esses pesos otimizando a previsão de tokens.

A tese tem três afirmações verificáveis, e o vídeo é organizado para demonstrar cada uma:

| Afirmação | Onde é demonstrada |
|---|---|
| A representação depende do contexto | A consulta de "banco" muda de alvo conforme a frase (C03-S04, C04-S07) |
| O cálculo é feito em paralelo, sobre todas as posições | Contraste com a leitura em série da RNN (C02-S01) e a operação matricial (C04-S06) |
| Os pesos são aprendidos prevendo tokens | Treino real do mini-GPT (C08-S03) e geração ao vivo (C09-S02) |

## Metáfora central: a planta cotada

Em desenho técnico, uma peça só fica definida por suas **cotas**: as linhas que dizem como cada elemento se relaciona com os demais. Sem cotas, há um contorno sem medida. O vídeo trata o texto da mesma forma:

- cada **token** é uma peça sobre a prancha;
- cada **peso de atenção** é uma linha de cota entre duas peças, com espessura proporcional ao peso;
- cada **capítulo** é uma prancha de detalhe, numerada de 01 a 13 no carimbo;
- a **prancha final** é o desenho de conjunto, no qual os detalhes se encaixam no diagrama completo do modelo.

| Prancha | O que é desenhado | Papel na metáfora |
|---|---|---|
| 01 | Folha em branco com o carimbo e os quatro nomes | Abertura do projeto, com os responsáveis |
| 02 | RNN como corrente de elos | A máquina anterior, com o defeito marcado em vermelho |
| 03 | Tokens e vetores | As peças e suas medidas iniciais |
| 04 | Self-attention | A primeira cota: uma peça passa a depender das outras |
| 05 | Multi-head | Várias vistas da mesma peça, como em uma projeção ortogonal |
| 06 | Posição | A régua: marcas que dizem onde cada peça está |
| 07 | Bloco, encoder e decoder | A montagem das peças |
| 08 | Treinamento | O ajuste: as cotas são corrigidas contra o erro |
| 09 | Inferência | A máquina em operação |
| 10 | Custo | A tabela de materiais: quanto custa cada cota |
| 11 | Famílias | Modelos de uma mesma linha de projeto |
| 12 | Limitações | Notas de revisão, em vermelho |
| 13 | Conjunto | Todos os detalhes reunidos em uma folha |

## Limites declarados da metáfora

O roteiro diz em voz alta onde a metáfora para de valer (cena C04-S01), para que ela não vire erro conceitual:

- uma cota real é medida e exata; um peso de atenção é aprendido, contínuo e não garante uma relação verdadeira;
- a peça do desenho não muda quando é cotada; aqui, o vetor do token é de fato recalculado a cada camada;
- espessura de linha não é explicação: pesos altos não provam por que o modelo decidiu algo (Jain; Wallace, 2019).

## Arco narrativo

<a id="a1"></a><a id="a2"></a><a id="a3"></a><a id="a4"></a>

O vídeo é uma sequência de problemas, em que cada solução cria a pergunta seguinte:

1. **[Apresentador 1](#a1):** RNNs leem em série e esquecem. A atenção de Bahdanau ajuda, mas ainda se apoia na recorrência. Pergunta: *e se a atenção fosse tudo?*
2. **[Apresentador 2](#a2):** a self-attention responde com uma conta simples, verificável à mão. Pergunta: *se cada token olha para todos ao mesmo tempo, onde foi parar a ordem?*
3. **[Apresentador 3](#a3):** posição, bloco, máscara e treino constroem a máquina. Pergunta: *como ela gera texto depois de treinada?*
4. **[Apresentador 4](#a4):** inferência, custo, aplicações e limites. Fecha com o desenho de conjunto e volta à frase-tese.

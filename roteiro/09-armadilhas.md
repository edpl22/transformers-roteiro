# 9. Armadilhas de corretude

Erros comuns sobre Transformers, com a forma correta e o lugar em que o roteiro os evita. Serve como revisão para o ensaio: ninguém deve dizer nada da coluna "Errado".

## Conceito

| # | Errado | Correto | Cena |
|---:|---|---|---|
| 1 | "Atenção é compreensão." | Atenção é uma média ponderada calculada com álgebra linear. Não implica entendimento. | C04-S01, C09-S02 |
| 2 | "Os pesos de atenção explicam a decisão do modelo." | Pesos altos não provam causa. Essa interpretação é contestada na literatura (Jain; Wallace, 2019). | C04-S01, C05-S02 |
| 3 | "Cada cabeça foi feita para uma função, como sintaxe ou correferência." | Nenhuma função é programada. Padrões podem ser observados depois do treino, e não há garantia (Clark et al., 2019). | C05-S02 |
| 4 | "Token é o mesmo que palavra." | Token é a unidade do tokenizador: pode ser subpalavra, caractere ou até bloco de imagem. | C03-S01 |
| 5 | "Cada dimensão do embedding significa algo específico." | Dimensões isoladas não têm significado garantido. A geometria do conjunto é que é informativa. | C03-S03 |
| 6 | "O modelo sabe que a frase é verdadeira." | O objetivo de treino é prever tokens. Nada garante veracidade. | C12-S01 |
| 7 | "Alucinar é mentir." | Mentir supõe intenção. Alucinação é conteúdo gerado sem suporte factual. | C12-S01 |
| 8 | "Leis de escala são leis da natureza." | São relações empíricas medidas em certos intervalos e condições (Kaplan et al., 2020). | C11-S03 |

## Matemática

| # | Errado | Correto | Cena |
|---:|---|---|---|
| 9 | "$\sqrt{d_k}$ serve para normalizar a saída." | Com componentes independentes de média 0 e variância 1, $q\cdot k$ tem variância $d_k$. Dividir por $\sqrt{d_k}$ controla a escala das pontuações, para que o softmax não sature e o gradiente não fique muito pequeno. | C04-S04 |
| 10 | "$\sqrt{d_k}$ faz os pesos somarem 1." | Quem faz isso é o softmax. | C04-S04, C04-S05 |
| 11 | "O softmax é aplicado à matriz inteira ou por coluna." | É aplicado sobre as chaves, separadamente para cada consulta: cada **linha** de $A$ soma 1. | C04-S05, C04-S06 |
| 12 | "A máscara zera os pesos depois do softmax." | Somam-se $-\infty$ às pontuações antes do softmax, o que torna o peso exatamente 0 e mantém a soma da linha igual a 1. | C07-S04 |
| 13 | "A atenção de Bahdanau usa produto escalar." | É aditiva: uma pequena rede calcula $a(s_{i-1},h_j)$. | C02-S03 |
| 14 | "Multi-head multiplica o custo por $h$." | Com $d_k=d_{\text{model}}/h$, o custo total é similar ao de uma cabeça de dimensão completa. | C05-S01 |
| 15 | "A codificação posicional é concatenada." | No artigo, ela é somada ao embedding e tem a mesma dimensão. | C06-S02 |
| 16 | "Temperatura alta deixa o modelo mais criativo." | Dividir os logits por $T>1$ achata a distribuição. "Criativo" é interpretação, não propriedade matemática. | C09-S02 |
| 17 | "Top-p corta tudo abaixo da probabilidade $p$." | Top-p mantém o **menor conjunto** de tokens cuja probabilidade somada atinge $p$ (Holtzman et al., 2020). | C09-S03 |

## Arquitetura

| # | Errado | Correto | Cena |
|---:|---|---|---|
| 18 | "BERT e GPT são iguais ao Transformer original." | Original: encoder e decoder. BERT: encoder-only, atenção bidirecional. GPT: decoder-only, com máscara causal e sem cross-attention. | C07-S03, C11-S01 |
| 19 | "Decoder-only tem cross-attention." | Sem encoder, não há o que consultar. O nome indica o uso da máscara causal, não a cópia exata do decoder original. | C07-S03 |
| 20 | "Na cross-attention, Q, K e V vêm do encoder." | $Q$ vem do decoder; $K$ e $V$ vêm do encoder. | C07-S05 |
| 21 | "A FFN olha para vários tokens." | É aplicada a cada posição separadamente, com os mesmos pesos em uma camada. | C07-S02 |
| 22 | "O artigo original usa pre-norm." | O artigo usa $\mathrm{LayerNorm}(x+\mathrm{Sublayer}(x))$, ou post-norm. Pre-norm é posterior, usado por exemplo no GPT-2. | C07-S01 |
| 23 | "Self-attention entende ordem por natureza." | Sem informação de posição, é equivariante à permutação. | C06-S01 |
| 24 | "Sem RNN, tudo é paralelo." | O treino com teacher forcing é paralelo dentro da sequência; a geração segue sequencial. | C08-S02, C09-S01 |
| 25 | "LSTM eliminou o problema do gradiente." | Atenua muito, por causa do caminho quase aditivo, mas não o elimina e não resolve a leitura em série. | C02-S02 |

## Treino e inferência

| # | Errado | Correto | Cena |
|---:|---|---|---|
| 26 | "BERT mascara com a máscara causal." | São máscaras diferentes. Masked LM substitui tokens da entrada e usa atenção bidirecional. | C08-S01 |
| 27 | "BERT troca todo token selecionado por `[MASK]`." | Dos 15% selecionados: 80% viram `[MASK]`, 10% um token aleatório e 10% ficam iguais. | C08-S01 |
| 28 | "Teacher forcing é usado na geração." | É técnica de treino. Na geração, não há token verdadeiro para fornecer. | C08-S02, C09-S01 |
| 29 | "Com KV cache, a atenção vira $O(1)$." | Evita recalcular $K$ e $V$, mas a nova consulta compara com todas as chaves: cada passo segue $O(n)$, e o cache consome memória. | C09-S04 |
| 30 | "KV cache muda a resposta." | É só uma otimização: a demo mostra logits iguais. Com posição absoluta aprendida, porém, a janela deslizante invalida o cache. | C09-S04 |

## Eficiência e aplicações

| # | Errado | Correto | Cena |
|---:|---|---|---|
| 31 | "FlashAttention é uma aproximação." | Calcula atenção **exata**, reduzindo acessos à memória de GPU com tiling (Dao et al., 2022). | C10-S02 |
| 32 | "FlashAttention resolve o custo $O(n^2)$." | O número de operações aritméticas continua quadrático. Reduzir a complexidade exige mudar o padrão, como em atenção esparsa. | C10-S02 |
| 33 | "AlphaFold 2 é só um Transformer aplicado a proteínas." | Usa variantes de atenção dentro de uma arquitetura própria, com Evoformer e Invariant Point Attention. | C11-S02 |
| 34 | "ViT divide a imagem em pixels-token." | Os tokens são blocos da imagem, projetados linearmente. | C11-S02 |

## Sobre as demos

| # | Risco | Como o roteiro trata | Cena |
|---:|---|---|---|
| 35 | Tomar os vetores manuais por pesos aprendidos | Aviso na tela e na fala | C04-S06, C04-S07 |
| 36 | Ler sentido nos pesos da demo de máscara | Vetores pseudoaleatórios declarados; o foco está em quais células são nulas | C07-S04 |
| 37 | Tomar o mini-GPT por réplica do artigo | Diferenças listadas em `06-implementacoes.md` | C08-S03 |
| 38 | Achar que o texto antigo é erro de digitação | A ortografia vem do corpus, e isso é dito na fala | C09-S02 |

## Fórmulas conferidas com o artigo original

Conferidas em 1 nov. 2026 com a versão HTML de arXiv:1706.03762:

- $\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$
- $\mathrm{MultiHead}(Q,K,V)=\mathrm{Concat}(\mathrm{head}_1,\dots,\mathrm{head}_h)W^O$, com $\mathrm{head}_i=\mathrm{Attention}(QW_i^Q,KW_i^K,VW_i^V)$
- $\mathrm{FFN}(x)=\max(0,xW_1+b_1)W_2+b_2$
- $PE_{(pos,2i)}=\sin(pos/10000^{2i/d_{\text{model}}})$ e $PE_{(pos,2i+1)}=\cos(pos/10000^{2i/d_{\text{model}}})$
- $lrate=d_{\text{model}}^{-0.5}\cdot\min(step\_num^{-0.5},\,step\_num\cdot warmup\_steps^{-1.5})$
- $\mathrm{LayerNorm}(x+\mathrm{Sublayer}(x))$; $h=8$; $d_k=d_v=d_{\text{model}}/h=64$; $N=6$
- Nota 4 do artigo: $q\cdot k=\sum_{i=1}^{d_k}q_ik_i$ tem média 0 e variância $d_k$

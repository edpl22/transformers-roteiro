# 11. Falas palavra por palavra

O que cada integrante diz em cada cena, na ordem do vídeo. Os tópicos de [05-cenas.md](05-cenas.md) continuam valendo como resumo. Este texto é a versão para ler em voz alta e ensaiar.

**Como ler:**

- **[▶]** marca um avanço: clique, `Espaço`, `→` ou o clicker. Avance no ponto marcado, sem esperar o fim da frase. O primeiro passo de cada cena roda sozinho ao entrar nela, por isso não tem marca.
- *(Texto em itálico entre parênteses)* é uma ação ou pausa. Não se lê em voz alta.
- O ritmo de referência é de cerca de 140 palavras por minuto, com pausas. `python scripts/check_timing.py` confere se o texto de cada cena cabe no tempo dela.
- Números se leem como estão: "0,067" é "zero vírgula zero sessenta e sete".
- Para ensaiar com o texto na tela, sincronizado com os cliques, abra `http://localhost:8000/app/?ensaio`.

---

## Bloco 1: [Palos](#a1), [Contexto e representação](#p1)

### C01-S01 · 00:00–00:45 · Capa e frase-tese

*(Folha vazia. Esperar 3 s em silêncio.)*

[▶] Olá. Este trabalho é da disciplina de Inteligência Artificial, do curso de Engenharia de Computação.

[▶] O tema é o Transformer, a arquitetura por trás dos grandes modelos de linguagem atuais. Nos próximos trinta e cinco minutos, vamos construir esse modelo do zero, peça por peça, com código executado aqui na tela.

[▶] A ideia que guia tudo cabe numa frase.

[▶] A representação de uma palavra depende do contexto, e pesos aprendidos dizem quanto cada posição aproveita das outras. Cada capítulo é uma prancha técnica, como num projeto de engenharia, e a última reúne todas. Antes, quem somos nós e quem cuida de cada prancha.

### C01-S02 · 00:45–01:25 · Quem apresenta o quê

Somos quatro. Eu sou [Palos](#a1) e abro com o contexto e a representação: por que as redes recorrentes não bastavam e como o texto vira números. [Davi](#a2) apresenta o mecanismo de atenção, o coração do modelo. [Mendes](#a3) monta a arquitetura completa e mostra o treinamento. E [Oliveira](#a4) fecha com a inferência, as aplicações e as limitações.

[▶] O carimbo no rodapé mostra sempre quem está falando. E estas marcas na linha do tempo são os momentos em que um código roda ao vivo. Começo pelo problema que motivou tudo isso.

### C02-S01 · 01:25–02:20 · A leitura em série

Antes do Transformer, o padrão para texto eram as redes recorrentes, as RNNs. Uma RNN lê como nós: uma palavra depois da outra, atualizando uma memória. A equação diz isso: o estado h no instante t é uma função do estado anterior, h de t menos um, e da entrada atual, x de t.

[▶] Reparem que o vetor de estado tem sempre o mesmo tamanho. A frase cresce, mas a memória não. Tudo o que foi lido precisa caber num vetor fixo.

[▶] E há uma consequência de engenharia: como cada passo depende do anterior, os cálculos dentro de uma frase não podem rodar em paralelo. O passo t espera o passo t menos um. E há um problema mais sério: treinar isso por muitos passos.

### C02-S02 · 02:20–03:20 · Gradiente de longo alcance

Para treinar, o erro precisa voltar do fim da frase até o começo. Pela regra da cadeia, o gradiente é um produto de muitas matrizes jacobianas, uma por passo. E um produto longo tende a sumir ou a explodir.

[▶] Vejam com números simples. Um fator de 0,9 repetido cinquenta vezes dá cerca de 0,005: o sinal praticamente desaparece. Um fator de 1,1 repetido cinquenta vezes dá cerca de 117: o sinal explode. Por isso dependências longas são tão difíceis de aprender.

[▶] A LSTM ataca isso com portas e com um estado de célula que se atualiza de forma quase aditiva. Esse caminho, em azul, deixa o gradiente passar com bem menos perda. Mas atenção: a LSTM atenua o problema, não elimina. E continua lendo em série. O outro problema era o funil: uma frase inteira em um único vetor.

### C02-S03 · 03:20–04:35 · O gargalo e a atenção de Bahdanau

Na tradução com redes recorrentes, o chamado seq2seq, o encoder lê a frase de origem e entrega ao decoder um único vetor de contexto, c. Esse funil é o gargalo: quanto mais longa a frase, mais informação se perde.

*(Pausa de 1 s.)*

[▶] Em 2014, Bahdanau, Cho e Bengio propõem outra coisa: a cada palavra gerada, o decoder calcula um contexto próprio, olhando para todos os estados do encoder.

[▶] A espessura de cada linha é o peso que aquele estado recebe na palavra atual.

[▶] São três equações. Primeiro, e i j é a pontuação de compatibilidade entre o estado do decoder e cada estado h j. Ela é calculada por uma pequena rede: é a atenção aditiva. Depois, alfa i j aplica a exponencial e divide pela soma, transformando pontuações em pesos. Por fim, c i é a média dos h j ponderada por esses pesos. Guardem essa receita: pontuar, normalizar, fazer a média. Ela vai voltar. Mas reparem que os h j ainda vêm de uma RNN.

### C02-S04 · 04:35–05:00 · A pergunta-ponte

Se a atenção já decide o que importa em cada momento, para que manter a recorrência?

[▶] *(Deixar a pergunta 3 s na tela, em silêncio.)* Em 2017, um grupo do Google responde com o artigo "Attention Is All You Need". Mas, para calcular atenção, o texto precisa virar números.

### C03-S01 · 05:00–05:30 · Por que tokens

Primeira decisão: qual é a unidade do texto? Por caracteres, o vocabulário é pequeno, mas as sequências ficam muito longas. Por palavras, as sequências são curtas, mas o vocabulário é enorme, e uma palavra nova fica sem representação.

[▶] Subpalavras são o meio-termo. Por isso, token não é sinônimo de palavra. Como escolher essas subpalavras? Vamos executar.

### C03-S02 · 05:30–06:55 · BPE ao vivo e WordPiece

Este é o BPE, Byte Pair Encoding, implementado aqui. Ele começa com caracteres e um marcador de fim de palavra. O corpus tem "gato" cinco vezes, "pato" seis vezes, "mato" três vezes e algumas variações.

*(Clicar em "Próxima fusão".)* O algoritmo conta os pares de símbolos vizinhos, ponderados pela frequência de cada palavra, e funde o par mais frequente. Aqui, "a" com "t", com vinte e duas ocorrências.

*(Clicar mais duas vezes.)* Ele repete: "at" com "o", depois "ato" com o fim de palavra.

*(Clicar mais duas vezes.)* Agora "p" com "ato", e "ato" com "s".

*(Escrever "ratos" no campo e clicar fora dele.)* A palavra "ratos" nunca apareceu no corpus, e mesmo assim é coberta: "r", mais "atos", mais o fim de palavra. É assim que palavras raras ganham representação. A lista de fusões, na ordem em que foram feitas, é o próprio tokenizador. Aplicada a um texto novo, ela gera os tokens.

[▶] O WordPiece, usado no BERT, tem a mesma ideia de subpalavras, mas escolhe as peças por outro critério e marca a continuação com duas cerquilhas, como em "play" e "cerquilha cerquilha ing". Agora temos números inteiros. E uma rede neural precisa de vetores.

### C03-S03 · 06:55–08:00 · Do token ao vetor

Cada token tem um número, o id, e esse id aponta para uma linha de uma tabela: a matriz de embeddings, com uma linha por token do vocabulário. Consultar o embedding é só selecionar essa linha.

[▶] Com outro token, a mesma coisa: outra linha, outro vetor. No artigo original, cada vetor tem 512 dimensões, o chamado d model. Os valores começam aleatórios e são aprendidos durante o treino.

[▶] Com o treino, tokens usados de modo parecido tendem a ficar próximos, porque isso ajuda a prever o próximo token. Este plano é uma projeção em duas dimensões, só para ilustrar. E um cuidado: uma dimensão isolada não tem significado garantido. O que importa é a geometria do conjunto, as distâncias e as direções entre os vetores. Mas essa tabela tem um limite grave.

### C03-S04 · 08:00–08:45 · O problema do banco

Leiam estas duas frases: "o banco aprovou o crédito" e "sentei no banco da praça". Na primeira, banco é uma instituição financeira. Na segunda, é um assento.

[▶] Mas, pela tabela, o vetor de "banco" é o mesmo nas duas.

[▶] Idêntico, célula por célula. *(Pausa de 2 s.)* O significado está nos vizinhos, e a tabela não vê os vizinhos. Precisamos de um mecanismo que recalcule o vetor de cada token em função do contexto.

[▶] [Davi](#a2), como fazer um token olhar para os outros?

---

## Bloco 2: [Davi](#a2), [Mecanismo de atenção](#p2)

### C04-S01 · 08:45–09:25 · Reponderar pelo contexto

A ideia central é simples.

[▶] O token "banco" olha para todos os tokens da frase, inclusive para ele mesmo.

[▶] O vetor novo de "banco" é uma média ponderada do que os outros têm a oferecer. É a mesma receita de Bahdanau, agora dentro da própria frase. Na nossa prancha, a atenção é a cota: liga as peças, e a espessura indica o peso.

[▶] Mas a metáfora tem limites: aqui o vetor muda de verdade, e um peso alto não prova que o modelo entendeu alguma coisa. Média ponderada de quê, e com quais pesos? Três matrizes respondem.

### C04-S02 · 09:25–10:25 · Q, K e V

Partimos da matriz X: uma linha por token, e cada linha com d model dimensões.

[▶] Desse mesmo X saem três projeções. São só multiplicações por matrizes aprendidas: Q é X vezes W Q, K é X vezes W K, e V é X vezes W V.

[▶] Pensem numa consulta a um arquivo. A consulta, Q, diz o que eu procuro. A chave, K, diz o que cada ficha oferece. E o valor, V, é o conteúdo que vai ser usado.

[▶] Cada token tem a sua linha nas três matrizes. A diferença crucial: num arquivo comum, você pega uma ficha só. Aqui, você toma um pouco de todas, na proporção da compatibilidade. E, como as três vêm da mesma sequência, isso se chama self-attention. Como medir o quanto uma consulta combina com uma chave?

### C04-S03 · 10:25–11:05 · Produto escalar como compatibilidade

Com o produto escalar. Ele soma os produtos componente a componente, e é igual ao produto dos comprimentos vezes o cosseno do ângulo. É grande quando os vetores apontam para o mesmo lado, e zero quando são perpendiculares.

[▶] No exemplo: zero vezes zero, mais dois vezes dois, mais um vezes um, mais zero vezes zero. Dá cinco.

[▶] Na forma de matriz, Q vezes K transposta calcula todos os pares de uma vez. Isso substitui a pequena rede de Bahdanau e roda em código de matrizes muito otimizado. Mas há uma armadilha quando os vetores são grandes.

### C04-S04 · 11:05–12:10 · Por que dividir por raiz de d_k

O artigo supõe componentes independentes, com média zero e variância um.

[▶] Então o produto escalar de q e k tem média zero e variância d k. Quanto maior a dimensão, mais espalhadas ficam as pontuações.

[▶] Dividir por raiz de d k devolve a variância para um.

[▶] Na demo, eu vou de d k igual a 4 até 1024 e paro em 64. *(Mover o controle e parar em 64. Pausa de 2 s.)* Sem a escala, o maior peso médio sobe em direção a 1: o softmax satura, e quase todo o peso vai para um token só. Com a escala, fica estável. Por que isso importa? A derivada de um peso em relação à sua pontuação é p vezes um menos p. Se p é quase 1, o gradiente quase some, e o modelo para de aprender. Um cuidado: dividir por raiz de d k não faz os pesos somarem 1. Quem faz isso é o softmax. Por falar nele.

### C04-S05 · 12:10–12:40 · Softmax e média ponderada

O softmax aplica a exponencial a cada pontuação e divide pela soma da linha. Cada linha vira um conjunto de pesos positivos que somam 1. Multiplicar por V faz a média ponderada dos valores.

[▶] A fórmula inteira diz: compare consultas e chaves, divida pela raiz de d k, transforme em pesos e faça a média dos valores. Vamos fazer essa conta à mão.

### C04-S06 · 12:40–14:20 · A conta à mão, passo a passo

Três tokens: "o", "gato" e "dorme". Consultas e chaves com quatro dimensões, valores com duas. Os números foram escolhidos para a conta caber na tela. Não são pesos aprendidos.

[▶] Primeira etapa: o produto Q vezes K transposta. Acompanhem a linha de "gato". Com a chave de "o", dá zero. Com a de "gato", um. Com a de "dorme", dois vezes dois mais um vezes um: cinco.

[▶] Segunda etapa: dividir tudo pela raiz de 4, que é 2. A linha de "gato" fica 0; 0,5; e 2,5.

[▶] Terceira etapa: softmax, linha por linha. Na linha de "gato", as exponenciais de 0, 0,5 e 2,5 valem cerca de 1; 1,65; e 12,18. A soma é cerca de 14,83. Dividindo cada uma pela soma: 0,067; 0,111; e 0,821. E cada linha soma 1.

[▶] Quarta etapa: a média dos valores com esses pesos. Para "gato", o resultado é 0,889 e 0,933.

[▶] Sobre a frase, as cotas mostram os mesmos pesos. *(Pausa de 2 s.)* A saída de cada token agora mistura informação dos outros, e cada linha de pesos soma 1. Agora, com o código rodando.

### C04-S07 · 14:20–15:45 · Mapa de calor ao vivo

Este é o código da atenção, em JavaScript puro. São poucas linhas, e um teste compara o resultado com o NumPy e com a conta que acabamos de fazer à mão. A linha destacada é o softmax.

[▶] *(Passar o mouse sobre "banco".)* Na frase "o banco aprovou o crédito", quando "banco" é a consulta, o maior peso vai para "crédito": 0,421. E a saída se desloca para o lado de finanças.

*(Passar o mouse por outros tokens.)* Cada linha é uma distribuição de pesos que soma 1.

*(Clicar em "Trocar frase".)* Agora, "sentei no banco da praça". Os vetores de "banco" são exatamente os mesmos do dicionário. Só o contexto mudou. A mesma consulta dá 0,412 para "praça", e a saída vai para o lado de lugar. Essa é a resposta ao problema do banco que o [Palos](#a1) deixou.

*(Alternar "Dividir por √d_k".)* Sem a divisão, as linhas ficam mais concentradas. Uma ressalva: estes vetores foram escritos à mão. Num modelo real, W Q, W K e W V são aprendidas. E um conjunto de pesos só permite um padrão de atenção por vez. E se quisermos vários padrões ao mesmo tempo?

### C05-S01 · 15:45–16:40 · Várias projeções em paralelo

Uma única média ponderada tende a borrar relações diferentes. Em vez disso, o Transformer faz várias atenções em paralelo. No artigo, d model é 512 e há oito cabeças.

[▶] Cada cabeça trabalha com 64 dimensões: d k e d v são 512 dividido por 8. Cada uma tem as suas próprias matrizes W Q, W K e W V e calcula o seu próprio mapa de atenção. Estes mapas usam valores de ilustração. Como cada cabeça tem dimensão reduzida, o custo total fica parecido com o de uma única cabeça de dimensão completa.

[▶] As saídas das cabeças são concatenadas e passam por W O, que devolve o tamanho original e mistura as cabeças. O que cada cabeça aprende? Essa pergunta exige cuidado.

### C05-S02 · 16:40–17:10 · O que cada cabeça aprende

Pensem nas vistas de uma peça: frontal, lateral e superior. Cada projeção revela relações diferentes. Em modelos treinados, pesquisadores observam cabeças que tendem a seguir certos padrões, por exemplo sintáticos.

[▶] Mas ninguém programa isso, e o padrão não é garantido. Peso de atenção não é explicação do modelo. Temos a peça central. Falta um detalhe que ela perdeu.

### C05-S03 · 17:10–17:30 · A peça está pronta, falta a ordem

Recapitulando: pontuar, escalar, normalizar e fazer a média, em várias cabeças.

[▶] Agora reparem: em nenhuma dessas contas aparece a ordem das palavras.

[▶] [Mendes](#a3), como esse modelo sabe quem veio antes de quem?

---

## Bloco 3: [Mendes](#a3), [Arquitetura e treinamento](#p3)

### C06-S01 · 17:30–18:05 · Atenção ignora a ordem

Esta é a matriz de atenção de "o gato dorme", a mesma da conta à mão.

[▶] Agora eu embaralho os tokens: "dorme gato o". As linhas e as colunas trocam de lugar junto.

[▶] E cada valor é o mesmo, só em outra posição. Nada na fórmula sabe o que é "antes". Para o modelo, "o cachorro mordeu o homem" e "o homem mordeu o cachorro" teriam os mesmos ingredientes. A posição precisa entrar pelos dados. A solução do artigo original é somar uma régua de frequências.

### C06-S02 · 18:05–19:25 · Curvas senoidais ao vivo

Cada token recebe um vetor de posição, que é somado ao embedding, não concatenado. Por isso ele tem a mesma dimensão, d model.

[▶] As fórmulas: nas dimensões pares, o seno da posição dividida por dez mil elevado a dois i sobre d model. Nas ímpares, o cosseno da mesma expressão. Na demo, cada curva é uma dimensão, e cada uma oscila numa frequência. A dimensão zero se repete a cada 6,3 posições; a dimensão 48, só a cada 199. Os comprimentos de onda vão de dois pi a dez mil vezes dois pi, em progressão geométrica. É como os ponteiros de um relógio, ou os bits de um contador, só que contínuos.

*(Mover o mouse sobre a matriz.)* Cada posição ganha uma assinatura própria. E posições vizinhas têm vetores parecidos.

*(Mudar o d model.)* O artigo cita uma vantagem: para um deslocamento fixo k, a codificação da posição mais k é uma função linear da codificação da posição. Isso pode facilitar aprender posições relativas, e o teste da demo confere essa identidade. E aqui não há nenhum parâmetro para treinar. Mas essa não é a única solução.

### C06-S03 · 19:25–19:55 · Posições aprendidas e RoPE

Há duas alternativas comuns. Posições aprendidas, usadas no BERT e no GPT: uma tabela como a de embeddings, limitada ao tamanho máximo definido no treino.

[▶] E o RoPE, que gira pares de dimensões de Q e K conforme a posição. Assim, o produto escalar passa a depender da distância entre os tokens, e não da posição absoluta. Vários modelos recentes usam essa ideia. Com a posição resolvida, podemos montar o bloco.

### C07-S01 · 19:55–20:40 · Residuais e LayerNorm

O vetor atravessa a subcamada de atenção.

[▶] A conexão residual soma a entrada à saída. É um caminho direto, que ajuda o gradiente a chegar às camadas iniciais.

[▶] Depois vem a LayerNorm, que normaliza cada posição ao longo das suas features, para média zero e variância um, sem depender do lote.

[▶] Um detalhe que costuma ser confundido: o artigo aplica a normalização depois da soma, o post-norm. O GPT-2 e muitos modelos posteriores a colocam antes, o pre-norm. O nosso mini-GPT usa pre-norm. A atenção só faz média. Onde está a não linearidade forte?

### C07-S02 · 20:40–21:10 · FFN por posição

Na rede feed-forward, aplicada a cada posição. São duas camadas lineares com uma ReLU no meio. No artigo, o vetor vai de 512 para 2048 dimensões e volta para 512.

[▶] A mesma rede processa todas as posições: os pesos são iguais dentro de uma camada e mudam de uma camada para outra. Empilhando tudo, temos a arquitetura completa.

### C07-S03 · 21:10–21:50 · Encoder e decoder

Esta é a planta do Transformer original. O encoder tem self-attention e feed-forward. O decoder tem três subcamadas: atenção mascarada, cross-attention e feed-forward.

[▶] No artigo, cada pilha repete o bloco seis vezes. A tarefa original era tradução: o encoder lê a frase de origem, e o decoder gera a de destino.

[▶] As famílias usam partes dessa planta. O BERT usa só o encoder. O GPT é chamado de decoder-only porque tem a máscara causal, mas não tem a cross-attention. Por que o decoder precisa de máscara? Vamos ver.

### C07-S04 · 21:50–23:05 · Máscara causal ao vivo

Quando o modelo treina para prever o próximo token, a resposta está na própria sequência. Sem cuidado, ele simplesmente copia do futuro. A solução: antes do softmax, somar menos infinito nas células em que j é maior que i. O softmax transforma essas células em zero exato e redistribui o peso entre as anteriores. À direita, nada acima da diagonal.

*(Passar o mouse sobre "subiu".)* A palavra "subiu" só vê "o", "gato" e ela mesma.

*(Clicar em "Trocar o token futuro".)* Troco "muro" por "telhado", na posição 4. Olhem as barras da direita: zero, zero, zero, zero. *(Pausa de 2 s.)* Nenhuma saída anterior mudou. Só mudam a própria posição e a seguinte. À esquerda, sem máscara, a mesma troca altera todas as posições. Esse é o comportamento desejado no encoder, que lê a frase inteira. E essa é a diferença entre a atenção bidirecional do BERT e a causal do GPT. Os vetores aqui são pseudoaleatórios: o que importa é onde os pesos são zero. No decoder original, há ainda uma terceira forma de atenção.

### C07-S05 · 23:05–23:45 · Cross-attention

Na cross-attention, a fórmula é a mesma; o que muda é a origem. As chaves e os valores descem da frase de origem, vindos do encoder.

[▶] As consultas sobem da frase de destino, vindas do decoder.

[▶] Por isso a matriz de pesos é retangular: m tokens de destino por n tokens de origem.

[▶] Lembra alguma coisa? É a atenção de Bahdanau, agora com produto escalar e sem RNN. O arco se fecha. A máquina está montada. Como ajustar milhões de parâmetros?

### C08-S01 · 23:45–24:35 · Próximo token e masked LM

Há dois objetivos de treino principais. No estilo GPT, a sequência é deslocada em uma posição: cada token tem como alvo o seguinte. Por isso ele precisa da máscara causal.

[▶] No estilo BERT, o masked LM: alguns tokens são escondidos, e o modelo prevê os escondidos. Como eles não estão na entrada, o modelo pode olhar para os dois lados.

[▶] No BERT, 15% dos tokens são escolhidos. Desses, 80% viram MASK, 10% viram um token aleatório e 10% ficam iguais. Nos dois casos, a perda é a entropia cruzada: o modelo é penalizado quando dá pouca probabilidade ao token certo. No caso do próximo token, o que entra como contexto?

### C08-S02 · 24:35–25:25 · Teacher forcing

No treino, a entrada de cada posição é o token verdadeiro anterior, não o que o modelo previu. Isso se chama teacher forcing. Com a máscara causal, todas as posições são calculadas numa única passada, em paralelo.

[▶] Sem isso, seria uma posição por vez, e um erro contaminaria as seguintes. Essa é a grande vantagem sobre a RNN no treino.

[▶] Do artigo: otimizador Adam, taxa de aprendizado que sobe durante 4000 passos de aquecimento e depois cai, label smoothing de 0,1 e dropout de 0,1. Parece abstrato. Então treinamos um de verdade.

### C08-S03 · 25:25–26:20 · Um treino real, em NumPy

Implementamos um mini-GPT em NumPy puro, com o gradiente escrito à mão. Estas são as linhas do backprop da atenção. Conferimos tudo por diferenças finitas, e o pior erro relativo foi de cerca de três milionésimos.

[▶] A ficha: 158.656 parâmetros, três blocos, quatro cabeças, dimensão 64 e contexto de 64 caracteres. O corpus tem 812 mil caracteres de Machado de Assis, em domínio público.

[▶] Foram 6000 passos, cerca de 24 minutos de CPU. A perda de validação começa em 3,90 e termina em 1,49. Um modelo de bigramas fica em 2,36. O ganho vem do contexto.

[▶] Esta é a curva real, lida do registro do treino.

[▶] [Oliveira](#a4), esse modelo está treinado. Faça-o escrever.

---

## Bloco 4: [Oliveira](#a4), [Inferência e aplicações](#p4)

### C09-S01 · 26:20–26:55 · O laço autorregressivo

No treino, tínhamos a resposta certa. Agora não: cada novo token depende do anterior. A geração é sequencial, mesmo que o treino seja paralelo. O laço é este: calcular os logits, transformar em probabilidades, escolher um token, anexar ao contexto e repetir.

[▶] A cada volta, o contexto ganha um token, até um critério de parada. A saída do modelo é uma distribuição, não uma resposta pronta. Vamos executar o modelo que acabamos de treinar.

### C09-S02 · 26:55–28:05 · Mini-GPT ao vivo e temperatura

Tudo roda aqui no navegador, sem rede, com o modelo de 159 mil parâmetros.

*(Com "o homem que " e T = 0,8, clicar em "Gerar".)* Ele gera um caractere por vez, e as barras mostram os mais prováveis a cada passo. O resultado parece português antigo, porque o corpus é Machado com a ortografia da época. Ele forma palavras e pontuação sem nenhuma regra escrita sobre isso.

*(Parar, baixar para T = 0,2 e gerar.)* A temperatura divide os logits antes do softmax. Baixa, ela concentra a distribuição, e o texto repete trechos frequentes.

*(Parar, subir para T = 1,5 e gerar.)* Alta, ela achata a distribuição, e aparecem palavras inventadas. No limite de temperatura zero, sai sempre o mais provável. Um cuidado: o modelo não sabe o que está escrevendo. Ele reproduz regularidades estatísticas, e nesta escala elas nem chegam ao sentido. Temperatura é só um dos botões.

### C09-S03 · 28:05–28:50 · Top-k e top-p

Esta é a distribuição do próximo caractere, sem cortes.

*(Pôr top-k = 5.)* O top-k mantém os k mais prováveis, com k fixo. Aqui, só cinco seguem elegíveis; os outros ficam hachurados.

*(Desligar o top-k e pôr top-p = 0,50.)* O top-p, ou amostragem de núcleo, mantém o menor conjunto cuja probabilidade somada atinge p.

*(Mudar o texto de início e clicar fora do campo.)* Reparem que o número de elegíveis muda com o contexto: ele acompanha a incerteza do modelo. Depois do corte, as probabilidades são renormalizadas e o token é sorteado. Nesta demo, a ordem é temperatura, top-k e top-p. Rodar esse laço tem um custo. Vejam o que estamos desperdiçando.

### C09-S04 · 28:50–29:35 · KV cache

Por causa da máscara causal, os tokens antigos nunca mudam quando chega um novo. As suas chaves e valores continuam valendo. Então guardamos essas matrizes e, a cada passo, calculamos só o token novo. Isso é o KV cache.

*(Clicar em "Gerar 64 tokens das duas formas". Esperar os números.)* Sem cache, 332,8 milhões de multiplicações. Com cache, 10,4 milhões: trinta e duas vezes menos. E as duas rotas dão o mesmo logit, o que o teste confere. Mas atenção: a consulta nova ainda é comparada com todas as chaves. Cada passo continua proporcional ao tamanho do contexto, e o cache ocupa memória. O que nos leva ao custo que define esta arquitetura.

### C10-S01 · 29:35–30:05 · O custo quadrático

Cada um dos n tokens é comparado com n chaves. A matriz de pontuações tem n ao quadrado células, por cabeça e por camada. Com 512 tokens, são cerca de 262 mil pares.

[▶] Dobrando o contexto, o trabalho quadruplica e, na implementação padrão, a memória também. Já a feed-forward cresce de forma linear. Há duas respostas diferentes para esse problema.

### C10-S02 · 30:05–30:40 · FlashAttention e atenção esparsa

A primeira é o FlashAttention. Ele calcula a atenção exata, em blocos, para reduzir os acessos à memória da GPU. Não é uma aproximação e não elimina o custo quadrático das contas.

[▶] A segunda são as abordagens esparsas, como o Sparse Transformer e o Longformer. Elas calculam só parte dos pares, o que reduz a complexidade, mas muda o padrão de atenção. Com essa base, por que essa arquitetura está em tantos lugares?

### C11-S01 · 30:40–31:20 · BERT, GPT e T5

As famílias de modelos de texto se organizam pela parte da planta que usam. O BERT, de 2018, usa só o encoder, com atenção bidirecional e masked LM. É bom para representar texto: busca, classificação e extração.

[▶] O GPT usa só o decoder, com máscara causal. Do GPT-1 ao GPT-3, em 2020, com 175 bilhões de parâmetros, a estratégia foi escalar.

[▶] O T5, de 2019, usa encoder e decoder e trata tudo como texto para texto: tradução, resumo e classificação, com o mesmo modelo e um prefixo na entrada. E a palavra token não precisa significar texto.

### C11-S02 · 31:20–32:05 · Visão, áudio e proteínas

No ViT, a imagem é cortada em quadrados de 16 por 16 pixels. Cada quadrado é projetado linearmente e vira um token, com um encoder padrão e um token de classificação.

[▶] No Whisper, de reconhecimento de fala, a entrada é um espectrograma log-Mel de 80 canais. Ele passa por duas camadas convolucionais e entra no encoder, e o decoder gera o texto.

[▶] O AlphaFold 2 usa atenção em módulos próprios, como o Evoformer e a Invariant Point Attention. Não é um Transformer genérico aplicado a proteínas: o mérito inclui várias ideias específicas do domínio. Isso também vale para código e para várias mídias ao mesmo tempo.

### C11-S03 · 32:05–32:45 · Código, multimodais e leis de escala

Modelos de código, como o Codex, são GPTs treinados em repositórios públicos.

[▶] Modelos multimodais ligam imagem e texto: o CLIP faz isso num espaço comum, e o GPT-4 aceita imagens e texto como entrada.

[▶] E as leis de escala: Kaplan e colegas mediram a perda caindo como uma lei de potência do número de parâmetros, com expoente de cerca de 0,076. Hoffmann e colegas refinaram: parâmetros e tokens de treino devem crescer juntos. São relações empíricas, medidas em certos intervalos, não leis da natureza. O que a escala não resolve?

### C12-S01 · 32:45–33:20 · Alucinação e contexto finito

*(Prancha vazia. Pausa de 2 s.)*

[▶] Primeiro, a alucinação. Esta frase foi escrita por nós, só para ilustrar. O modelo é otimizado para produzir continuações prováveis, e nada nesse objetivo garante a verdade. Existem mitigações, mas é uma questão em aberto.

[▶] Segundo, o contexto é finito. O que sai da janela, o modelo não vê. E, mesmo dentro dela, estudos mostram desempenho desigual conforme a posição da informação. Há também custos fora do modelo.

### C12-S02 · 33:20–33:55 · Custo energético e vieses

Treinar modelos grandes consome energia. Patterson e colegas estimaram, para o treino do GPT-3, cerca de 1287 megawatts-hora e 552 toneladas de CO2 equivalente. E mostram que o local e o hardware importam muito.

[▶] Há também os vieses: o modelo aprende as regularidades do corpus, incluindo estereótipos e sub-representação.

[▶] Ficam questões em aberto: interpretabilidade, verificação, eficiência e avaliação de danos. Voltemos à prancha completa.

### C13-S01 · 33:55–34:40 · Síntese: o desenho de conjunto

Esta é a planta completa, e cada caixa tem o número da prancha em que foi explicada. Os tokens viram embeddings, que recebem a posição. Depois vêm a atenção com várias cabeças, as residuais e a feed-forward, e a máscara no decoder.

[▶] O treino é por próximo token ou por masked LM, e a geração é por amostragem.

[▶] *(Pausa de 3 s com a frase na tela.)* A tese da abertura: a representação de cada token depende do contexto, e os pesos que dizem quanto cada posição aproveita das outras são aprendidos prevendo tokens. Tudo o que mostramos na tela tem código no repositório, com testes. Estas são as fontes.

### C13-S02 · 34:40–35:10 · Referências e créditos

A base deste trabalho é o artigo de 2017, "Attention Is All You Need", e as fontes primárias de cada parte, com o material didático de Jurafsky e Martin e do Annotated Transformer.

[▶] Em nome do grupo, [Palos](#a1), [Davi](#a2), [Mendes](#a3) e eu, [Oliveira](#a4), obrigado pela atenção.

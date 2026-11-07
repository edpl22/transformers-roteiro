# 6. Implementações

- <a id="a1"></a>[Palos](#a1)
- <a id="a2"></a>[Davi](#a2)
- <a id="a3"></a>[Mendes](#a3)
- <a id="a4"></a>[Oliveira](#a4)

São seis demos, distribuídas de 05:30 a 29:35, e o código completo está em `demos/`. Todas usam os tokens de `styles/tokens.css`, rodam sem internet e não exigem build.

**Para abrir qualquer demo:**

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000/demos/<nome>/`.

| Demo | Cenas | Início | Apresenta | Teste |
|---|---|---:|---|---|
| `00-tokenizacao-bpe` | C03-S02 | 05:30 | [Palos](#a1) | JS × Python e fusões à mão |
| `01-self-attention` | C04-S04, C04-S07 | 11:05 | [Davi](#a2) | JS × NumPy × conta escalar × conta à mão |
| `02-codificacao-posicional` | C06-S02 | 18:05 | [Mendes](#a3) | JS × NumPy e identidade do artigo |
| `03-mascara-causal` | C07-S04 | 21:50 | [Mendes](#a3) | Sem vazamento do futuro |
| `04-mini-gpt` | C08-S03, C09-S02 | 25:25 | [Mendes](#a3), [Oliveira](#a4) | Gradiente por diferenças finitas |
| `05-amostragem-kv-cache` | C09-S03, C09-S04 | 28:05 | [Oliveira](#a4) | Filtros, JS × NumPy, cache × forward completo |

**Por que não há PyTorch:** NumPy basta para o tamanho do modelo. Escrever o gradiente à mão deixa cada etapa visível, e a inferência em JS roda no próprio navegador.

---

## 00. Tokenização BPE

**Objetivo:** mostrar o vocabulário surgindo de fusões frequentes.

**Na tela:** corpus segmentado, pares mais frequentes, lista de fusões e campo para palavra nova.

**Apresenta:** [Palos](#a1).

**Código essencial** (`bpe.js`):

```js
export function treinar(corpus, nFusoes) {
  let vocab = inicializar(corpus);                    // caracteres + "</w>"
  const fusoes = [];
  for (let k = 0; k < nFusoes; k++) {
    const m = melhorPar(contarPares(vocab));          // par mais frequente, ponderado pela palavra
    if (!m) break;
    fusoes.push(m);
    vocab = vocab.map((w) => ({ ...w, simbolos: fundir(w.simbolos, m.a, m.b) }));
  }
  return { fusoes, vocab };
}
```

**Teste:**

```bash
python demos/00-tokenizacao-bpe/teste_referencia.py
```

Saída obtida: a+t (22), at+o (19), ato+`</w>` (14), p+ato`</w>` (6). Com 12 fusões, "ratos" vira `r`, `atos</w>`; "gatas" vira `g`, `at`, `a`, `s`, `</w>`. JS e referência em Python coincidem nas 12 fusões.

---

## 01. Self-attention do zero

**Objetivo:** executar a fórmula do artigo e deixar o espectador inspecionar os pesos.

**Na tela:** três abas.

1. A conta à mão, em quatro etapas.
2. Mapa de calor interativo: passar o mouse sobre um token mostra as linhas de peso, a tabela de cálculo e o vetor de saída.
3. Por que dividir por $\sqrt{d_k}$: curva medida e barras de um sorteio.

**Apresenta:** [Davi](#a2).

**Código essencial** (`atencao.js`):

```js
export function atencao(Q, K, V, { mascara = null, escalar = true } = {}) {
  const dk = K[0].length;
  const pontuacao = matmul(Q, transposta(K));                        // Q K^T
  const escalada = pontuacao.map((l) => l.map((s) => (escalar ? s / Math.sqrt(dk) : s)));
  const mascarada = escalada.map((l, i) => l.map((s, j) => (mascara && !mascara[i][j] ? -Infinity : s)));
  const A = mascarada.map(softmax);                                  // cada linha soma 1
  return { dk, pontuacao, escalada, mascarada, A, Z: matmul(A, V) }; // Z = A V
}
```

**Vetores das frases:** escritos à mão em `frases.js`, com aviso na tela. A mesma consulta de "banco" muda de alvo porque as chaves disponíveis mudam.

**Teste:**

```bash
python demos/01-self-attention/teste_referencia.py
```

Saída obtida:

| Verificação | Resultado |
|---|---|
| JS × NumPy × conta escalar × conta à mão | Tolerância de $10^{-12}$ |
| $A$ do exemplo à mão | Linha de "gato": 0,0674; 0,1112; 0,8214 |
| $\mathrm{Var}(q\cdot k)$ em 200 mil amostras | 15,96 ($d_k=16$); 63,84 ($d_k=64$); 510,61 ($d_k=512$) |
| Variância depois de dividir por $\sqrt{d_k}$ | 0,998; 0,997; 0,997 |
| "banco" em "o banco aprovou o crédito" | Maior peso em "crédito" (0,421); $Z=(0{,}651;\,0{,}093)$ |
| "banco" em "sentei no banco da praça" | Maior peso em "praça" (0,412); $Z=(0{,}091;\,0{,}647)$ |

Curva da aba 3, com 500 sorteios e 8 chaves:

| $d_k$ | Maior peso, sem escala | Maior peso, com escala |
|---:|---:|---:|
| 4 | 0,531 | 0,347 |
| 64 | 0,875 | 0,362 |
| 512 | 0,957 | 0,368 |
| 1024 | 0,968 | 0,351 |

---

## 02. Codificação posicional

**Objetivo:** ver as curvas senoidais e a assinatura de cada posição.

**Na tela:** quatro curvas com comprimento de onda, matriz PE explorável com o mouse e similaridade entre posições.

**Apresenta:** [Mendes](#a3).

**Código essencial** (`pe.js`):

```js
export function codificacaoPosicional(nPos, dModel) {
  const pe = [];
  for (let pos = 0; pos < nPos; pos++) {
    const linha = new Array(dModel);
    for (let d = 0; d < dModel; d++) {
      const i = Math.floor(d / 2);
      const angulo = pos / 10000 ** ((2 * i) / dModel);
      linha[d] = d % 2 === 0 ? Math.sin(angulo) : Math.cos(angulo);
    }
    pe.push(linha);
  }
  return pe;
}
```

**Teste:**

```bash
python demos/02-codificacao-posicional/teste_referencia.py
```

Saída obtida: coincide com NumPy em $10^{-12}$; em `pos = 0`, senos valem 0 e cossenos valem 1; a relação linear entre $PE_{pos+k}$ e $PE_{pos}$ foi conferida; a menor distância entre 128 posições distintas é 1,472 ($d_{\text{model}}=64$), portanto sem colisão.

---

## 03. Máscara causal × bidirecional

**Objetivo:** provar numericamente que um token futuro não afeta saídas anteriores.

**Na tela:** dois mapas, lado a lado, com hachura nas células cortadas; botão que troca um token futuro; barras de quanto cada saída mudou.

**Apresenta:** [Mendes](#a3).

**Código essencial** (`mascara.js` e `atencao.js`):

```js
export function mascaraCausal(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j <= i));
}
// Em atencao(): células com j > i recebem -Infinity antes do softmax, logo peso exatamente 0.
const causal = atencao(Q, K, V, { mascara: mascaraCausal(tokens.length) });
```

**Teste:**

```bash
node demos/03-mascara-causal/teste.mjs
```

Saída obtida, trocando apenas a posição 4:

| Modo | o | gato | subiu | no | muro→telhado | alto |
|---|---:|---:|---:|---:|---:|---:|
| Causal | 0,000 | 0,000 | 0,000 | 0,000 | 2,367 | 2,400 |
| Bidirecional | 0,187 | 1,385 | 0,925 | 0,065 | 2,090 | 2,400 |

---

## 04. Mini-GPT de caracteres

**Objetivo:** treinar um decoder-only real e gerar texto ao vivo com controle de temperatura.

**Na tela:** texto gerado caractere a caractere, controle de temperatura, barras dos 10 caracteres mais prováveis, curva real de treino e ficha técnica.

**Apresenta:** [Mendes](#a3) (treino) e [Oliveira](#a4) (geração).

**Ficha:**

| Item | Valor |
|---|---|
| Arquitetura | Decoder-only, pre-norm, posição aprendida |
| Dimensões | $d=64$, 4 cabeças, 3 blocos, FFN de 256, contexto de 64 |
| Parâmetros | 158.656 |
| Corpus | 812.348 caracteres de Machado de Assis (*Memórias Póstumas de Brás Cubas* e *Quincas Borba*), domínio público, via Project Gutenberg; vocabulário de 41 símbolos |
| Treino | 6000 passos, lote de 24, Adam, 1442 s em CPU |
| Perda de validação | 1,486 (uniforme: 3,714; bigramas: 2,362) |
| Pesos | `pesos.json`, 848 KB |

O modelo difere do artigo original em posição aprendida, pre-norm e ausência de cross-attention, dropout e label smoothing, e o corpus usa a ortografia da época, que aparece no texto gerado.

**Código essencial** (`modelo_numpy.py`, atenção e seu gradiente):

```python
s = q @ k.transpose(0, 1, 3, 2) / np.sqrt(dh)
s = np.where(np.tri(T, dtype=bool), s, -np.inf)     # máscara causal
e = np.exp(s - s.max(-1, keepdims=True))
A = e / e.sum(-1, keepdims=True)
z = juntar(A @ v)
# Volta: derivadas da média ponderada, do softmax e do produto escalar
vbar = A.transpose(0, 1, 3, 2) @ zbar
Abar = zbar @ v.transpose(0, 1, 3, 2)
sbar = A * (Abar - (A * Abar).sum(-1, keepdims=True))
qbar = sbar @ k / np.sqrt(dh)
kbar = sbar.transpose(0, 1, 3, 2) @ q / np.sqrt(dh)
```

**Comandos:**

```bash
python demos/04-mini-gpt/teste_gradiente.py
```

Para retreinar (cerca de 24 minutos em CPU; sobrescreve `pesos.json`):

```bash
python demos/04-mini-gpt/treinar.py
```

Saída obtida no teste de gradiente: 29 grupos de parâmetros conferidos; pior erro relativo de $2{,}95\times10^{-6}$.

**Amostras reais** gravadas ao fim do treino, a partir de "o homem que " (quebras de linha trocadas por `/`):

| T | Início da saída |
|---:|---|
| 0,2 | o homem que elle a casa de mulher que era a mão de contar a casa de ser a menos / de uma continuo. |
| 0,8 | o homem que eu rubião de conhecina. / --mas não deixou-se estar com com o da incommoda, com outras. |
| 2,0 | o homem que era ia é, pela / su fammo ponguda; não-do nas inteão, acem vera?... |

**Fallback offline:**

1. Os pesos ficam no repositório, e não há download em nenhum momento.
2. Se `pesos.json` não carregar, a demo entra sozinha no modo pré-gravado, com aviso na tela.
3. Para forçar esse modo: `http://localhost:8000/demos/04-mini-gpt/?pregravado`. As amostras de seis temperaturas estão em `dados/saida_pregravada.json`.

---

## 05. Amostragem e KV cache

**Objetivo:** comparar estratégias de amostragem e medir o ganho do cache.

**Na tela:** barras de probabilidade antes e depois dos cortes, controles de temperatura, top-k e top-p, esquema dos passos, multiplicações e tempo com e sem cache.

**Apresenta:** [Oliveira](#a4).

**Código essencial** (`amostragem.js` e `modelo.js`):

```js
// Núcleo: menor conjunto, em ordem decrescente, cuja soma atinge pelo menos top_p.
export function filtroTopP(p, topP) {
  if (topP >= 1) return p.map(() => true);
  const ordem = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const manter = p.map(() => false);
  let soma = 0;
  for (const [v, i] of ordem) { manter[i] = true; soma += v; if (soma >= topP) break; }
  return manter;
}

// KV cache: só o token novo é projetado; K e V antigos vêm do cache.
cache.k.push(this.linear(hn, p[`b${i}.Wk`], d));
cache.v.push(this.linear(hn, p[`b${i}.Wv`], d));
```

`MiniGPT.completo()` e `MiniGPT.passo()` são rotas de cálculo independentes, de modo que a comparação entre elas é real.

**Teste:**

```bash
node demos/05-amostragem-kv-cache/teste.mjs
```

Saída obtida:

| Verificação | Resultado |
|---|---|
| Inferência JS × NumPy | Maior diferença em um logit: $8{,}07\times10^{-8}$ |
| KV cache × forward completo | Maior diferença: 0 |
| Multiplicações, gerando 64 tokens | 332.834.816 sem cache; 10.403.840 com cache (32 vezes menos) |
| Top-k, top-p e temperatura | Exemplos conferidos à mão |

Sobre a contagem: a rota sem cache calcula a linha inteira de $QK^\top$ antes de aplicar a máscara, como uma implementação matricial comum faria. Só as multiplicações são contadas, nas operações principais.

---

## Previews

Os screenshots ficam em `roteiro/previews/`. Para regenerá-los, depois de instalar `requirements-dev.txt`:

```bash
python scripts/capturar_previews.py
```

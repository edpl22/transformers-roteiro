# 3. Bíblia sonora

Implementação: `sfx/sfx.js`, com uma função por evento. Para ouvir e medir: abrir `sfx/preview.html` com o servidor local.

## Princípios

- **Sem trilha musical.** Só efeitos curtos, sempre associados a um evento visual.
- **Metáfora sonora:** o escritório de desenho, coerente com a metáfora visual: lápis, régua, folha, carimbo, estilete.
- **A voz manda.** Se um SFX coincidir com o começo de uma frase, ele é adiantado ou retirado, nunca a voz.
- **Sem amostras externas.** Tudo é sintetizado, com ruído determinístico, para que todo take soe igual. Não há banco de sons nem licença de terceiros a registrar.
- **Sem dependência de informação:** o vídeo funciona com os SFX mudos.

## Eventos

Duração declarada: fim programado do som. Pico e RMS medidos em renderização offline a 48 kHz (`medir()` em `sfx.js`, executado por `scripts/capturar_previews.py`), com ganho mestre de −18 dB.

| Evento | Função | Descrição | Duração | Pico (dBFS) | RMS (dBFS) | Rel. à voz (RMS) | Como é gerado |
|---|---|---|---:|---:|---:|---:|---|
| Token entrando | `tokenEntra` | Traço curto de lápis | 0,09 s | −23,0 | −42,0 | −22,0 dB | Ruído em passa-banda varrendo de 5,2 a 3,4 kHz |
| Multiplicação de matrizes | `multiplicaMatriz` | Três toques de régua, ascendentes | 0,22 s | −23,4 | −39,8 | −19,8 dB | Onda triangular em dó, mi e sol, a cada 75 ms |
| Softmax normalizando | `softmaxNormaliza` | Dois tons que convergem em um só | 0,42 s | −19,9 | −36,0 | −16,0 dB | Senoides de 392 e 587 Hz deslizando até 494 Hz |
| Transição de capítulo | `transicaoCapitulo` | Folha de papel virando | 0,72 s | −24,3 | −44,0 | −24,0 dB | Dois sopros de ruído, com filtro subindo e descendo |
| Troca de apresentador | `trocaApresentador` | Carimbo batendo na prancha | 0,20 s | −18,8 | −31,8 | −11,8 dB | Senoide de 170 a 70 Hz, com ataque de ruído |
| Máscara cortando | `mascaraCorta` | Dois cortes secos de estilete | 0,15 s | −25,4 | −46,2 | −26,2 dB | Dois sopros de ruído de 7 a 2,5 kHz |
| Token amostrado | `amostraToken` | Toque único de bloco | 0,05 s | −26,3 | −40,4 | −20,4 dB | Onda triangular em 880 Hz |
| Abertura de demo | `abreDemo` | Dois toques descendentes | 0,24 s | −23,4 | −39,8 | −19,8 dB | Onda triangular em 784 e 587 Hz |

Todos os eventos ficam abaixo do limite de 1,5 s.

## Nível relativo à voz

A referência de voz é uma **meta** para a gravação, a ser conferida no medidor do OBS:

| Grandeza | Voz (meta) | SFX (medido) | Margem mínima |
|---|---|---|---:|
| RMS | −20 dBFS | −31,8 a −46,2 dBFS | 11,8 dB abaixo da voz |
| Pico | −6 dBFS | −18,8 a −26,3 dBFS | 12,8 dB abaixo da voz |

**Regra de mixagem:** no vídeo final, todo SFX fica ao menos 10 dB abaixo do RMS da voz. Como som e voz estão em trilhas separadas, a margem pode ser ajustada na edição, baixando só a trilha 2.

## Regras de uso

- No máximo um evento a cada 150 ms, exceto `multiplicaMatriz`, que contém seus próprios toques.
- `amostraToken` é limitado a 8 toques por segundo na demo 04.
- Quando capítulo e apresentador mudam ao mesmo tempo, toca só `trocaApresentador`.
- O som acompanha o instante em que o resultado aparece, não o início da animação.
- Nenhum som durante hover ou movimento de controles deslizantes.

## Silêncios intencionais

Silêncio aqui significa nenhum SFX; a pausa de fala está indicada quando existir.

| Cena | Momento | Duração | Por quê |
|---|---|---|---|
| C01-S01 | Abertura, antes da moldura | 3 s | Dá início limpo à apresentação |
| C02-S01 | Depois da nota vermelha | 1 s | Deixa a dependência em série ser lida |
| C02-S03 | Antes de o funil ser apagado | 1 s | Marca a virada para a atenção |
| C02-S04 | Sobre a pergunta "E se retirarmos a recorrência?" | 3 s | Pausa dramática da tese do artigo |
| C03-S04 | Sobre os dois vetores iguais | 2 s | O problema precisa ser visto |
| C04-S04 | Enquanto a curva é lida | 2 s | A leitura dos dados pede atenção |
| C04-S05 | Fórmula inteira na tela | Até o fim da cena | Momento de consolidação |
| C04-S06 | Depois do resultado final | 2 s | O espectador confere a conta |
| C05-S02 | Cena inteira | 30 s | Dá peso à ressalva sobre o que as cabeças aprendem |
| C06-S01 | Depois da permutação | 2 s | Deixa a igualdade ser notada |
| C07-S04 | Sobre os zeros da saída causal | 2 s | É a prova numérica da cena |
| C08-S03 | Enquanto a curva se desenha | Durante o traço | Os dados reais são o foco |
| C09-S04 | Quando os números aparecem | 2 s | Comparação entre os dois quadros |
| C11-S03 | Sobre o gráfico de escala | Durante o traço | Evita tom de propaganda |
| C12-S01 | Início da prancha de limitações | 2 s | Muda o tom do vídeo |
| C12-S02 | Cena inteira | 35 s | Assunto sério, sem reforço sonoro |
| C13-S01 | Sobre a frase-tese | 3 s | Fechamento |
| C13-S02 | Depois da transição | Até o fim | Encerramento limpo |

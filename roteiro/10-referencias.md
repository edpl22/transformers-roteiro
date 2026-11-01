# 10. Referências

Formato baseado na ABNT NBR 6023. Fontes primárias, seguidas de material didático. Acesso em todos os links: 1 nov. 2026.

## Como foram conferidas

| Conferência | Método | Alcance |
|---|---|---|
| Título, autores e data | API do arXiv | Todas as referências com identificador arXiv |
| Título, autores, periódico, volume e páginas | API do Crossref | Todas as referências com DOI |
| Links de relatórios e materiais | Requisição HTTP com resposta 200 | Radford (2018, 2019); Jurafsky e Martin; The Annotated Transformer |
| Dados citados nas cenas | Texto do próprio artigo | Vaswani (fórmulas e constantes); Kaplan ($\alpha_N\approx 0{,}076$); Devlin (15%, 80/10/10); Brown (175 bilhões); Dao (exata, tiling, HBM); Holtzman (definição de top-p) |
| Dados conferidos no resumo do arXiv | API do arXiv | Child ($O(n\sqrt{n})$); Hoffmann (parâmetros e tokens crescem juntos) |
| Dados conferidos no PDF do arXiv | Extração de texto | Radford 2022 (log-Mel de 80 canais, duas camadas convolucionais, encoder-decoder); Patterson (GPT-3: 1.287 MWh, 552 tCO₂e) |
| Local de publicação de Pope et al. | Página dos anais do MLSys 2023 | Pope et al. |

Os locais indicados como "Publicado em" vêm de conhecimento prévio, exceto onde há DOI ou nota na tabela acima.

## Transformer e atenção

BAHDANAU, D.; CHO, K.; BENGIO, Y. Neural machine translation by jointly learning to align and translate. **arXiv**, 2014. Publicado em: International Conference on Learning Representations (ICLR), 2015. Disponível em: https://arxiv.org/abs/1409.0473.

DAO, T. et al. FlashAttention: fast and memory-efficient exact attention with IO-awareness. **arXiv**, 2022. Publicado em: Advances in Neural Information Processing Systems (NeurIPS), 2022. Disponível em: https://arxiv.org/abs/2205.14135.

VASWANI, A. et al. Attention is all you need. **arXiv**, 2017. Publicado em: Advances in Neural Information Processing Systems (NeurIPS), 2017. Disponível em: https://arxiv.org/abs/1706.03762.

## Modelos sequenciais anteriores

BENGIO, Y.; SIMARD, P.; FRASCONI, P. Learning long-term dependencies with gradient descent is difficult. **IEEE Transactions on Neural Networks**, v. 5, n. 2, p. 157-166, 1994. DOI: 10.1109/72.279181.

CHO, K. et al. Learning phrase representations using RNN encoder-decoder for statistical machine translation. **arXiv**, 2014. Publicado em: Conference on Empirical Methods in Natural Language Processing (EMNLP), 2014. Disponível em: https://arxiv.org/abs/1406.1078.

GEHRING, J. et al. Convolutional sequence to sequence learning. **arXiv**, 2017. Publicado em: International Conference on Machine Learning (ICML), 2017. Disponível em: https://arxiv.org/abs/1705.03122.

HOCHREITER, S.; SCHMIDHUBER, J. Long short-term memory. **Neural Computation**, v. 9, n. 8, p. 1735-1780, 1997. DOI: 10.1162/neco.1997.9.8.1735.

PASCANU, R.; MIKOLOV, T.; BENGIO, Y. On the difficulty of training recurrent neural networks. **arXiv**, 2012. Publicado em: International Conference on Machine Learning (ICML), 2013. Disponível em: https://arxiv.org/abs/1211.5063.

SUTSKEVER, I.; VINYALS, O.; LE, Q. V. Sequence to sequence learning with neural networks. **arXiv**, 2014. Publicado em: Advances in Neural Information Processing Systems (NeurIPS), 2014. Disponível em: https://arxiv.org/abs/1409.3215.

WILLIAMS, R. J.; ZIPSER, D. A learning algorithm for continually running fully recurrent neural networks. **Neural Computation**, v. 1, n. 2, p. 270-280, 1989. DOI: 10.1162/neco.1989.1.2.270.

## Tokenização, normalização e posição

BA, J. L.; KIROS, J. R.; HINTON, G. E. Layer normalization. **arXiv**, 2016. Disponível em: https://arxiv.org/abs/1607.06450.

HE, K. et al. Deep residual learning for image recognition. In: IEEE CONFERENCE ON COMPUTER VISION AND PATTERN RECOGNITION (CVPR), 2016. **Proceedings** [...]. 2016. p. 770-778. DOI: 10.1109/CVPR.2016.90.

SCHUSTER, M.; NAKAJIMA, K. Japanese and Korean voice search. In: IEEE INTERNATIONAL CONFERENCE ON ACOUSTICS, SPEECH AND SIGNAL PROCESSING (ICASSP), 2012. **Proceedings** [...]. 2012. p. 5149-5152. DOI: 10.1109/ICASSP.2012.6289079.

SENNRICH, R.; HADDOW, B.; BIRCH, A. Neural machine translation of rare words with subword units. **arXiv**, 2015. Publicado em: Annual Meeting of the Association for Computational Linguistics (ACL), 2016. Disponível em: https://arxiv.org/abs/1508.07909.

SU, J. et al. RoFormer: enhanced transformer with rotary position embedding. **Neurocomputing**, v. 568, artigo 127063, 2024. DOI: 10.1016/j.neucom.2023.127063.

WU, Y. et al. Google's neural machine translation system: bridging the gap between human and machine translation. **arXiv**, 2016. Disponível em: https://arxiv.org/abs/1609.08144.

## Famílias de modelos

BROWN, T. B. et al. Language models are few-shot learners. **arXiv**, 2020. Publicado em: Advances in Neural Information Processing Systems (NeurIPS), 2020. Disponível em: https://arxiv.org/abs/2005.14165.

CHEN, M. et al. Evaluating large language models trained on code. **arXiv**, 2021. Disponível em: https://arxiv.org/abs/2107.03374.

DEVLIN, J. et al. BERT: pre-training of deep bidirectional transformers for language understanding. **arXiv**, 2018. Publicado em: Conference of the North American Chapter of the Association for Computational Linguistics (NAACL), 2019. Disponível em: https://arxiv.org/abs/1810.04805.

DOSOVITSKIY, A. et al. An image is worth 16x16 words: transformers for image recognition at scale. **arXiv**, 2020. Publicado em: International Conference on Learning Representations (ICLR), 2021. Disponível em: https://arxiv.org/abs/2010.11929.

JUMPER, J. et al. Highly accurate protein structure prediction with AlphaFold. **Nature**, v. 596, n. 7873, p. 583-589, 2021. DOI: 10.1038/s41586-021-03819-2.

OPENAI. GPT-4 technical report. **arXiv**, 2023. Disponível em: https://arxiv.org/abs/2303.08774.

RADFORD, A. et al. **Improving language understanding by generative pre-training**. OpenAI, 2018. Relatório técnico. Disponível em: https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf.

RADFORD, A. et al. **Language models are unsupervised multitask learners**. OpenAI, 2019. Relatório técnico. Disponível em: https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf.

RADFORD, A. et al. Learning transferable visual models from natural language supervision. **arXiv**, 2021. Publicado em: International Conference on Machine Learning (ICML), 2021. Disponível em: https://arxiv.org/abs/2103.00020.

RADFORD, A. et al. Robust speech recognition via large-scale weak supervision. **arXiv**, 2022. Publicado em: International Conference on Machine Learning (ICML), 2023. Disponível em: https://arxiv.org/abs/2212.04356.

RAFFEL, C. et al. Exploring the limits of transfer learning with a unified text-to-text transformer. **arXiv**, 2019. Publicado em: Journal of Machine Learning Research, 2020. Disponível em: https://arxiv.org/abs/1910.10683.

## Escala, eficiência e amostragem

BELTAGY, I.; PETERS, M. E.; COHAN, A. Longformer: the long-document transformer. **arXiv**, 2020. Disponível em: https://arxiv.org/abs/2004.05150.

CHILD, R. et al. Generating long sequences with sparse transformers. **arXiv**, 2019. Disponível em: https://arxiv.org/abs/1904.10509.

FAN, A.; LEWIS, M.; DAUPHIN, Y. Hierarchical neural story generation. **arXiv**, 2018. Publicado em: Annual Meeting of the Association for Computational Linguistics (ACL), 2018. Disponível em: https://arxiv.org/abs/1805.04833.

HOFFMANN, J. et al. Training compute-optimal large language models. **arXiv**, 2022. Publicado em: Advances in Neural Information Processing Systems (NeurIPS), 2022. Disponível em: https://arxiv.org/abs/2203.15556.

HOLTZMAN, A. et al. The curious case of neural text degeneration. **arXiv**, 2019. Publicado em: International Conference on Learning Representations (ICLR), 2020. Disponível em: https://arxiv.org/abs/1904.09751.

KAPLAN, J. et al. Scaling laws for neural language models. **arXiv**, 2020. Disponível em: https://arxiv.org/abs/2001.08361.

POPE, R. et al. Efficiently scaling transformer inference. **arXiv**, 2022. Publicado em: Proceedings of Machine Learning and Systems (MLSys), 2023. Disponível em: https://arxiv.org/abs/2211.05102.

## Limitações, interpretação e impacto

BENDER, E. M. et al. On the dangers of stochastic parrots: can language models be too big? In: ACM CONFERENCE ON FAIRNESS, ACCOUNTABILITY, AND TRANSPARENCY, 2021. **Proceedings** [...]. 2021. p. 610-623. DOI: 10.1145/3442188.3445922.

CLARK, K. et al. What does BERT look at? An analysis of BERT's attention. **arXiv**, 2019. Disponível em: https://arxiv.org/abs/1906.04341.

JAIN, S.; WALLACE, B. C. Attention is not explanation. **arXiv**, 2019. Publicado em: Conference of the North American Chapter of the Association for Computational Linguistics (NAACL), 2019. Disponível em: https://arxiv.org/abs/1902.10186.

JI, Z. et al. Survey of hallucination in natural language generation. **ACM Computing Surveys**, v. 55, n. 12, p. 1-38, 2023. DOI: 10.1145/3571730.

LIU, N. F. et al. Lost in the middle: how language models use long contexts. **Transactions of the Association for Computational Linguistics**, v. 12, p. 157-173, 2024. DOI: 10.1162/tacl_a_00638.

PATTERSON, D. et al. Carbon emissions and large neural network training. **arXiv**, 2021. Disponível em: https://arxiv.org/abs/2104.10350.

STRUBELL, E.; GANESH, A.; MCCALLUM, A. Energy and policy considerations for deep learning in NLP. **arXiv**, 2019. Publicado em: Annual Meeting of the Association for Computational Linguistics (ACL), 2019. Disponível em: https://arxiv.org/abs/1906.02243.

## Material didático

JURAFSKY, D.; MARTIN, J. H. **Speech and language processing**. 3. ed. Rascunho, versão de 19 ago. 2026. Disponível em: https://web.stanford.edu/~jurafsky/slp3/.

RUSH, A. The annotated transformer. In: WORKSHOP FOR NLP OPEN SOURCE SOFTWARE (NLP-OSS), 2018. **Proceedings** [...]. 2018. p. 52-60. DOI: 10.18653/v1/W18-2509. Versão atualizada disponível em: https://nlp.seas.harvard.edu/annotated-transformer/.

## Dados e recursos usados nas demos

ASSIS, M. de. **Memorias posthumas de Braz Cubas**. Project Gutenberg, ebook 54829. Domínio público. Disponível em: https://www.gutenberg.org/ebooks/54829.

ASSIS, M. de. **Quincas Borba**. Project Gutenberg, ebook 55682. Domínio público. Disponível em: https://www.gutenberg.org/ebooks/55682.

Fontes: Barlow, Barlow Condensed e IBM Plex Mono (SIL Open Font License 1.1), licenças em `assets/fonts/`. KaTeX 0.16.11 (licença MIT), em `assets/vendor/katex/`.

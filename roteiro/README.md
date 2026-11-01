# Roteiro de produção: Transformers

Vídeo-apresentação de 35:10 para a disciplina de Inteligência Artificial (Engenharia de Computação). Animação no navegador, narração ao vivo por quatro integrantes.

## Documentos

1. [Conceito-guia](01-conceito.md): frase-tese e metáfora central
2. [Bíblia de estilo](02-biblia-estilo.md): direção, paleta, tipos, grid e movimento
3. [Bíblia sonora](03-biblia-sonora.md): eventos, níveis e silêncios
4. [Mapa de tempo](04-mapa-tempo.md), gerado a partir de [mapa-tempo.json](mapa-tempo.json)
5. [Roteiro cena a cena](05-cenas.md): 44 cenas em 13 capítulos
6. [Implementações](06-implementacoes.md): 6 demos com código e resultados
7. [Arquitetura técnica](07-arquitetura.md): motor, teclado, sincronia, gravação e fallback
8. [Checklist da rubrica](08-checklist-rubrica.md)
9. [Armadilhas de corretude](09-armadilhas.md)
10. [Referências](10-referencias.md): em ABNT, com as pendências marcadas

Screenshots das demos: [previews/](previews/).

## Como usar

**Trocar os nomes:** edite `config/apresentadores.json` e rode o comando abaixo, que atualiza todos os documentos. As demos leem o config diretamente.

```bash
python scripts/gerar_mapa_tempo.py
```

**Ver as demos e os SFX:** na raiz do repositório, rode o servidor e abra `http://localhost:8000/demos/01-self-attention/` ou `http://localhost:8000/sfx/preview.html`.

```bash
python -m http.server 8000
```

**Validar tudo:**

```bash
python scripts/check_timing.py
```

```bash
python scripts/capturar_previews.py
```

O segundo comando exige as dependências de `requirements-dev.txt`.

## Estrutura

```text
config/apresentadores.json   nomes e papéis (fonte única)
styles/tokens.css            paleta, tipografia, grid e movimento
assets/                      fontes e KaTeX, sem dependência de rede
sfx/                         sfx.js e preview.html
demos/                       00 a 05, mais _comum/ com o molde de prancha
scripts/                     check_timing, gerar_mapa_tempo, capturar_previews
roteiro/                     este índice, documentos e previews
```

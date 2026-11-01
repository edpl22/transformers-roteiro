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
10. [Referências](10-referencias.md): em ABNT, com a forma de conferência de cada uma

Fichas de ensaio, geradas do roteiro: [a1](fichas/a1.md), [a2](fichas/a2.md), [a3](fichas/a3.md), [a4](fichas/a4.md), na ordem do config.

Screenshots das demos: [previews/](previews/).

## Como usar

**Trocar os nomes:** edite `config/apresentadores.json` e rode o comando abaixo, que atualiza os documentos e as fichas. A animação e as demos leem o config diretamente.

```bash
python scripts/gerar_mapa_tempo.py
```

**Ver a animação:** com o servidor abaixo no ar, abra `http://localhost:8000/app/`. Avance com `→`, `Espaço` ou clicker; para ensaiar, use `http://localhost:8000/app/?ensaio`. Atalhos em [07-arquitetura.md](07-arquitetura.md).

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

```bash
python scripts/testar_animacao.py
```

```bash
python scripts/medir_fps.py
```

Os três últimos exigem as dependências de `requirements-dev.txt`.

## Estrutura

```text
config/apresentadores.json   nomes e papéis (fonte única)
styles/tokens.css            paleta, tipografia, grid e movimento
assets/                      fontes e KaTeX, sem dependência de rede
app/                         a animação: motor e 44 cenas
sfx/                         sfx.js e preview.html
demos/                       00 a 05, mais _comum/ com o molde de prancha
scripts/                     check_timing, gerar_mapa_tempo, capturar_previews, testar_animacao, medir_fps
roteiro/                     este índice, documentos, fichas de ensaio e previews
```

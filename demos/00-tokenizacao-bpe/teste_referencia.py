"""Compara o BPE em JS com a referência em Python e com fusões conferidas à mão."""
import json
import pathlib
import subprocess

from referencia_bpe import tokenizar, treinar

AQUI = pathlib.Path(__file__).parent
CORPUS = {"gato": 5, "gatos": 3, "pato": 6, "patos": 2, "gatinho": 2, "patinho": 1, "mato": 3}

JS = """
import { treinar, tokenizar } from './bpe.js';
const corpus = %s;
const { fusoes, vocab } = treinar(corpus, 12);
const novas = ['ratos', 'matinho', 'gatas'].map((p) => tokenizar(p, fusoes));
console.log(JSON.stringify({ fusoes, vocab: vocab.map((w) => w.simbolos), novas }));
""" % json.dumps(CORPUS)

saida = subprocess.run(["node", "--input-type=module", "-e", JS], cwd=AQUI, capture_output=True, text=True, encoding="utf8", check=True)
js = json.loads(saida.stdout)

fusoes, vocab = treinar(CORPUS, 12)
assert js["fusoes"] == fusoes, (js["fusoes"], fusoes)
assert js["vocab"] == list(vocab.values())
assert js["novas"] == [tokenizar(p, fusoes) for p in ["ratos", "matinho", "gatas"]]

# Conferência à mão: "a"+"t" aparece em todas as palavras (5+3+6+2+2+1+3 = 22 vezes).
assert fusoes[0] == {"a": "a", "b": "t", "contagem": 22}
assert (fusoes[1]["a"], fusoes[1]["b"], fusoes[1]["contagem"]) == ("at", "o", 19)

print("Fusões aprendidas:")
for i, f in enumerate(fusoes, 1):
    print(f"  {i:2d}. {f['a']} + {f['b']}  ({f['contagem']})")
print("Palavras novas:", {p: tokenizar(p, fusoes) for p in ["ratos", "matinho", "gatas"]})
print("OK: JS e referência Python coincidem em", len(fusoes), "fusões")

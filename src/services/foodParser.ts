import { normalizeFoodName } from "@/domain/food";

/**
 * Quebra a entrada livre do usuário em nomes de alimentos (PRD §6.1).
 *
 * Separadores fortes: vírgula, ponto e vírgula, quebra de linha, bullets e barra.
 * A conjunção " e " também separa ("banana, manga, pão e crepioca"), mas só
 * quando o trecho inteiro não é um alimento conhecido — do contrário nomes como
 * "sorvete de açaí com leite em pó e fruta" seriam partidos ao meio.
 */
const STRONG_SEPARATORS = /[,;\n\r]+|\s*[•*]\s*|\s*\/\s*/g;
const CONJUNCTIONS = /\s+e\s+|\s+ou\s+/gi;

/** Palavras que o usuário costuma escrever mas não são alimentos. */
const NOISE = new Set(["", "e", "ou", "tambem", "tem", "temos", "so", "apenas", "mais", "de", "com"]);

export interface ParsedFood {
  /** Texto exibível, como o usuário digitou (apenas aparado). */
  raw: string;
  /** Chave normalizada para comparação. */
  key: string;
}

function clean(value: string): string {
  return value.replace(/^[\s\-–—.]+|[\s\-–—.]+$/g, "").replace(/\s+/g, " ");
}

/**
 * @param isKnown permite ao chamador informar quais trechos já são alimentos
 *   conhecidos, evitando que a conjunção " e " quebre um nome composto.
 */
export function parseFoodInput(
  input: string,
  isKnown: (key: string) => boolean = () => false,
): ParsedFood[] {
  const parsed: ParsedFood[] = [];
  const seen = new Set<string>();

  const add = (value: string) => {
    const raw = clean(value);
    if (!raw) return;

    const key = normalizeFoodName(raw);
    if (!key || NOISE.has(key) || seen.has(key)) return;

    seen.add(key);
    parsed.push({ raw, key });
  };

  for (const chunk of input.split(STRONG_SEPARATORS)) {
    const raw = clean(chunk);
    if (!raw) continue;

    if (isKnown(normalizeFoodName(raw)) || !CONJUNCTIONS.test(raw)) {
      CONJUNCTIONS.lastIndex = 0;
      add(raw);
      continue;
    }
    CONJUNCTIONS.lastIndex = 0;

    for (const part of raw.split(CONJUNCTIONS)) add(part);
  }

  return parsed;
}

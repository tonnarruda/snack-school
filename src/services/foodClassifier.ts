import {
  normalizeFoodName,
  toDisplayName,
  type Food,
  type FoodCategory,
} from "@/domain/food";
import { FOOD_CATALOG, FOOD_COMBOS, type CatalogEntry } from "@/data/foods";
import { parseFoodInput, type ParsedFood } from "./foodParser";

/** Índice do catálogo: nome canônico e apelidos apontam para a mesma entrada. */
const CATALOG_INDEX: Map<string, CatalogEntry> = (() => {
  const index = new Map<string, CatalogEntry>();

  for (const entry of FOOD_CATALOG) {
    for (const name of [entry.name, ...(entry.aliases ?? [])]) {
      index.set(normalizeFoodName(name), entry);
    }
  }

  // Combinações também são reconhecidas quando digitadas por extenso
  // ("pão com queijo"), aí valendo como um único acompanhamento.
  for (const combo of FOOD_COMBOS) {
    const key = normalizeFoodName(combo.name);
    if (!index.has(key)) {
      index.set(key, {
        name: combo.name,
        category: combo.category,
        emoji: combo.emoji,
        refrigerationRecommended: combo.parts.some(
          (part) => catalogEntryByName(part)?.refrigerationRecommended,
        ),
      });
    }
  }

  return index;
})();

function catalogEntryByName(name: string): CatalogEntry | undefined {
  return FOOD_CATALOG.find((entry) => normalizeFoodName(entry.name) === normalizeFoodName(name));
}

export function findInCatalog(name: string): CatalogEntry | undefined {
  return CATALOG_INDEX.get(normalizeFoodName(name));
}

function toFood(parsed: ParsedFood, entry: CatalogEntry): Food {
  return {
    id: parsed.key,
    name: entry.name,
    category: entry.category,
    refrigerationRecommended: entry.refrigerationRecommended,
    emoji: entry.emoji,
  };
}

export interface ClassificationResult {
  /** Alimentos já classificados, prontos para o planejamento. */
  foods: Food[];
  /** Nomes que o catálogo não reconheceu e precisam de escolha manual (PRD §8). */
  unknown: string[];
}

/**
 * Classifica os alimentos informados (PRD §7 e §8).
 *
 * Nada é adivinhado: o que não está no catálogo volta em `unknown` para o
 * usuário escolher a categoria. `manual` guarda escolhas feitas nesta execução.
 */
export function classifyFoods(
  input: string,
  manual: Record<string, FoodCategory> = {},
): ClassificationResult {
  const foods: Food[] = [];
  const unknown: string[] = [];

  for (const parsed of parseFoodInput(input, (key) => CATALOG_INDEX.has(key))) {
    const entry = findInCatalog(parsed.key);

    if (entry) {
      foods.push(toFood(parsed, entry));
      continue;
    }

    const manualCategory = manual[parsed.key];
    if (manualCategory) {
      foods.push({
        id: parsed.key,
        name: toDisplayName(parsed.raw),
        category: manualCategory,
      });
      continue;
    }

    if (!unknown.includes(parsed.raw)) unknown.push(parsed.raw);
  }

  return { foods, unknown };
}

/** Junta listas de alimentos sem duplicar (usado ao complementar a lista). */
export function mergeFoods(current: Food[], incoming: Food[]): Food[] {
  const merged = new Map(current.map((food) => [food.id, food]));
  for (const food of incoming) {
    if (!merged.has(food.id)) merged.set(food.id, food);
  }
  return [...merged.values()];
}

/** Cria um alimento a partir de uma classificação manual (PRD §8). */
export function createManualFood(rawName: string, category: FoodCategory): Food {
  return {
    id: normalizeFoodName(rawName),
    name: toDisplayName(rawName),
    category,
  };
}

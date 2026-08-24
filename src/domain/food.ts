/**
 * Domínio de alimentos.
 *
 * O MVP trabalha com quatro categorias. Idade e localização ainda não são
 * configuráveis (ver PRD §5), mas o domínio é intencionalmente agnóstico a elas:
 * nada aqui depende de "5 anos" ou "Fortaleza".
 */

export type FoodCategory = "fruit" | "savory" | "sweet" | "drink";

/** Categorias que podem ocupar o lugar do acompanhamento do dia. */
export const ACCOMPANIMENT_CATEGORIES: FoodCategory[] = ["savory", "sweet"];

/** Ordem canônica das categorias na UI, nas contagens e nas listas. */
export const FOOD_CATEGORIES: FoodCategory[] = ["fruit", "savory", "sweet", "drink"];

export interface Food {
  /** Chave normalizada (sem acento, minúscula) usada para comparar e deduplicar. */
  id: string;
  /** Nome exibido ao usuário. */
  name: string;
  category: FoodCategory;
  /** Sugere transporte em lancheira térmica (PRD §17). */
  refrigerationRecommended?: boolean;
  emoji?: string;
  /**
   * Ids dos alimentos que compõem o item, quando ele é uma combinação
   * (ex.: "Pão com queijo" = pão + queijo).
   */
  parts?: string[];
}

export const CATEGORY_LABEL: Record<FoodCategory, string> = {
  fruit: "Fruta",
  savory: "Salgado",
  sweet: "Doce",
  drink: "Bebida",
};

export const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  fruit: "🍎",
  savory: "🥪",
  sweet: "🧁",
  drink: "🥤",
};

/** Remove acentos, pontuação de borda e espaços extras para comparação. */
export function normalizeFoodName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "pao de queijo" -> "Pão de queijo" (apenas a primeira letra em maiúscula). */
export function toDisplayName(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function isFruit(food: Food): boolean {
  return food.category === "fruit";
}

export function isAccompaniment(food: Food): boolean {
  return food.category === "savory" || food.category === "sweet";
}

export function isDrink(food: Food): boolean {
  return food.category === "drink";
}

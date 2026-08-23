import { normalizeFoodName, type Food } from "@/domain/food";
import { SUGGESTIONS, type Suggestion } from "@/data/suggestions";
import { FRUITS_PER_DAY } from "@/domain/snack";

/**
 * Seleciona até cinco sugestões para as próximas semanas (PRD §15).
 *
 * Sugestões nunca entram no planejamento: são só um empurrão para variar.
 * Regras: não repetir o que o usuário já tem, priorizar o que está faltando
 * (frutas antes de tudo) e favorecer alimentos regionais e frescos.
 */
export const MAX_SUGGESTIONS = 5;

function alreadyAvailable(suggestion: Suggestion, owned: Set<string>): boolean {
  if (owned.has(normalizeFoodName(suggestion.name))) return true;

  // "Cuscuz com queijo" não é sugerido para quem já tem cuscuz e queijo.
  const related = suggestion.relatedFoods ?? [];
  return related.length > 0 && related.every((part) => owned.has(normalizeFoodName(part)));
}

export function buildSuggestions(foods: Food[], limit = MAX_SUGGESTIONS): Suggestion[] {
  const owned = new Set(foods.map((food) => food.id));
  const fruitCount = foods.filter((food) => food.category === "fruit").length;
  const savoryCount = foods.filter((food) => food.category === "savory").length;
  const sweetCount = foods.filter((food) => food.category === "sweet").length;

  const scarcity: Record<Suggestion["category"], number> = {
    // Frutas são o gargalo do planejamento: 2 por dia, todos os dias.
    fruit: fruitCount <= FRUITS_PER_DAY ? 0 : fruitCount <= 3 ? 1 : 2,
    savory: savoryCount === 0 ? 0 : savoryCount <= 2 ? 1 : 2,
    sweet: sweetCount === 0 ? 0 : sweetCount <= 2 ? 1 : 2,
  };

  return SUGGESTIONS.filter((suggestion) => !alreadyAvailable(suggestion, owned))
    .map((suggestion, index) => ({
      suggestion,
      rank: [
        scarcity[suggestion.category],
        suggestion.region === "northeast" ? 0 : 1,
        index,
      ] as const,
    }))
    .sort((left, right) => {
      for (let i = 0; i < left.rank.length; i += 1) {
        if (left.rank[i] !== right.rank[i]) return left.rank[i] - right.rank[i];
      }
      return 0;
    })
    .slice(0, limit)
    .map((entry) => entry.suggestion);
}

import { isAccompaniment, isDrink, isFruit, type Food, type FoodCategory } from "@/domain/food";
import { FOOD_COMBOS } from "@/data/foods";
import { normalizeFoodName } from "@/domain/food";
import {
  FRUITS_PER_DAY,
  WEEKDAYS,
  daySnackFoods,
  type DaySnack,
  type PlanIssue,
  type WeeklyPlan,
} from "@/domain/snack";

/**
 * Monta o planejamento da semana (PRD §10 e §11).
 *
 * O algoritmo é determinístico: a mesma lista de alimentos sempre gera o mesmo
 * planejamento. Nada aqui depende de aleatoriedade nem de serviços externos.
 */

/** Valida a lista antes de gerar qualquer coisa (PRD §12). */
export function validateFoods(foods: Food[]): PlanIssue[] {
  const issues: PlanIssue[] = [];
  const fruits = foods.filter(isFruit);

  if (fruits.length < FRUITS_PER_DAY) {
    issues.push({ kind: "insufficient-fruits", fruits });
  }

  if (buildAccompanimentPool(foods).length === 0) {
    issues.push({ kind: "missing-accompaniment" });
  }

  return issues;
}

/**
 * Opções de acompanhamento disponíveis.
 *
 * Quando duas partes de uma combinação conhecida estão presentes (pão + queijo),
 * elas viram um único item ("Pão com queijo") e deixam de ser oferecidas
 * separadamente — continua valendo a regra de 1 acompanhamento por dia.
 */
export function buildAccompanimentPool(foods: Food[]): Food[] {
  const available = new Map(foods.map((food) => [food.id, food]));
  const pool: Food[] = [];
  const consumed = new Set<string>();

  for (const combo of FOOD_COMBOS) {
    const parts = combo.parts.map((part) => available.get(normalizeFoodName(part)));
    if (parts.some((part) => !part)) continue;

    const partFoods = parts as Food[];
    // Frutas nunca são consumidas por combinações: elas têm lugar próprio no dia.
    if (partFoods.some((part) => !isAccompaniment(part))) continue;
    // Uma parte só pode alimentar uma combinação, para não gerar repetição.
    if (partFoods.some((part) => consumed.has(part.id))) continue;

    partFoods.forEach((part) => consumed.add(part.id));
    pool.push({
      id: normalizeFoodName(combo.name),
      name: combo.name,
      category: combo.category,
      emoji: combo.emoji,
      refrigerationRecommended: partFoods.some((part) => part.refrigerationRecommended),
      parts: partFoods.map((part) => part.id),
    });
  }

  for (const food of foods) {
    if (!isAccompaniment(food) || consumed.has(food.id)) continue;
    pool.push(food);
  }

  // Se as combinações consumiram tudo e sobrou nada, volta aos itens simples.
  if (pool.length === 0) return foods.filter(isAccompaniment);

  return pool;
}

interface FruitPair {
  fruits: [Food, Food];
  key: string;
  order: number;
}

function buildFruitPairs(fruits: Food[]): FruitPair[] {
  const pairs: FruitPair[] = [];

  for (let i = 0; i < fruits.length; i += 1) {
    for (let j = i + 1; j < fruits.length; j += 1) {
      pairs.push({
        fruits: [fruits[i], fruits[j]],
        key: `${fruits[i].id}+${fruits[j].id}`,
        order: pairs.length,
      });
    }
  }

  return pairs;
}

/**
 * Escolhe as duplas de frutas dos cinco dias.
 *
 * Critérios, em ordem: nunca repetir uma dupla antes de esgotar as demais,
 * equilibrar o uso de cada fruta e evitar repetir frutas do dia anterior.
 */
function pickFruitPairs(fruits: Food[], days: number): FruitPair[] {
  const pairs = buildFruitPairs(fruits);
  const pairUse = new Map<string, number>();
  const fruitUse = new Map<string, number>();
  const chosen: FruitPair[] = [];

  for (let day = 0; day < days; day += 1) {
    const previous = chosen[chosen.length - 1];

    const best = pairs.reduce((left, right) =>
      score(right) < score(left) ? right : left,
    );

    chosen.push(best);
    pairUse.set(best.key, (pairUse.get(best.key) ?? 0) + 1);
    best.fruits.forEach((fruit) => fruitUse.set(fruit.id, (fruitUse.get(fruit.id) ?? 0) + 1));

    function score(pair: FruitPair): string {
      const repeatedPair = pairUse.get(pair.key) ?? 0;
      const balance = pair.fruits.reduce((sum, fruit) => sum + (fruitUse.get(fruit.id) ?? 0), 0);
      const overlap = previous
        ? pair.fruits.filter((fruit) => previous.fruits.some((prev) => prev.id === fruit.id)).length
        : 0;

      // Chave lexicográfica com campos de largura fixa: menor é melhor.
      return [repeatedPair, balance, overlap, pair.order]
        .map((value) => String(value).padStart(4, "0"))
        .join("-");
    }
  }

  return chosen;
}

function otherCategory(category: FoodCategory): FoodCategory {
  return category === "savory" ? "sweet" : "savory";
}

/**
 * Escolhe o acompanhamento de cada dia alternando salgado e doce quando possível
 * (PRD §11) e evitando o mesmo item em dias consecutivos.
 */
function pickAccompaniments(pool: Food[], days: number): Food[] {
  const use = new Map<string, number>();
  const chosen: Food[] = [];

  const hasSavory = pool.some((food) => food.category === "savory");
  let desired: FoodCategory = hasSavory ? "savory" : "sweet";

  for (let day = 0; day < days; day += 1) {
    const previous = chosen[chosen.length - 1];
    const unused = (category: FoodCategory) =>
      pool.filter((food) => food.category === category && !use.has(food.id));

    const preferred = unused(desired);
    const alternative = unused(otherCategory(desired));

    let candidates: Food[];
    if (preferred.length > 0) {
      candidates = preferred;
    } else if (alternative.length > 0) {
      // Variedade vence a alternância quando a categoria da vez já se repetiu.
      candidates = alternative;
    } else {
      const sameCategory = pool.filter((food) => food.category === desired);
      candidates = sameCategory.length > 0 ? sameCategory : pool;
    }

    const withoutPrevious = candidates.filter((food) => food.id !== previous?.id);
    const finalists = withoutPrevious.length > 0 ? withoutPrevious : candidates;

    const pick = finalists.reduce((left, right) =>
      (use.get(right.id) ?? 0) < (use.get(left.id) ?? 0) ? right : left,
    );

    chosen.push(pick);
    use.set(pick.id, (use.get(pick.id) ?? 0) + 1);
    desired = otherCategory(pick.category);
  }

  return chosen;
}

/**
 * Escolhe a bebida de cada dia: usa todas as informadas antes de repetir
 * qualquer uma e evita a mesma bebida em dias consecutivos quando há
 * alternativa. Sem bebidas na lista, os dias ficam sem bebida.
 */
function pickDrinks(pool: Food[], days: number): (Food | undefined)[] {
  if (pool.length === 0) return Array.from({ length: days }, () => undefined);

  const use = new Map<string, number>();
  const chosen: Food[] = [];

  for (let day = 0; day < days; day += 1) {
    const previous = chosen[chosen.length - 1];
    const withoutPrevious = pool.filter((drink) => drink.id !== previous?.id);
    const candidates = withoutPrevious.length > 0 ? withoutPrevious : pool;

    const pick = candidates.reduce((left, right) =>
      (use.get(right.id) ?? 0) < (use.get(left.id) ?? 0) ? right : left,
    );

    chosen.push(pick);
    use.set(pick.id, (use.get(pick.id) ?? 0) + 1);
  }

  return chosen;
}

export interface PlanResult {
  plan?: WeeklyPlan;
  issues: PlanIssue[];
}

export function generateWeeklyPlan(foods: Food[]): PlanResult {
  const issues = validateFoods(foods);
  if (issues.length > 0) return { issues };

  const fruits = foods.filter(isFruit);
  const pool = buildAccompanimentPool(foods);

  const fruitPairs = pickFruitPairs(fruits, WEEKDAYS.length);
  const accompaniments = pickAccompaniments(pool, WEEKDAYS.length);
  const drinks = pickDrinks(foods.filter(isDrink), WEEKDAYS.length);

  const days: DaySnack[] = WEEKDAYS.map((weekday, index) => ({
    day: weekday.key,
    label: weekday.label,
    longLabel: weekday.longLabel,
    fruits: fruitPairs[index].fruits,
    accompaniment: accompaniments[index],
    drink: drinks[index],
  }));

  const requiresCoolerBag = days.some((day) =>
    daySnackFoods(day).some((food) => food.refrigerationRecommended),
  );

  return { plan: { days, requiresCoolerBag }, issues: [] };
}

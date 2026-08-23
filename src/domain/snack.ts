import type { Food } from "./food";

/** Dias úteis atendidos pelo MVP (PRD §10). */
export const WEEKDAYS = [
  { key: "monday", label: "Segunda", longLabel: "Segunda-feira" },
  { key: "tuesday", label: "Terça", longLabel: "Terça-feira" },
  { key: "wednesday", label: "Quarta", longLabel: "Quarta-feira" },
  { key: "thursday", label: "Quinta", longLabel: "Quinta-feira" },
  { key: "friday", label: "Sexta", longLabel: "Sexta-feira" },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]["key"];

/** Regra principal: 2 frutas diferentes + 1 salgado OU doce (PRD §9). */
export const FRUITS_PER_DAY = 2;
export const ACCOMPANIMENTS_PER_DAY = 1;

export interface DaySnack {
  day: WeekdayKey;
  label: string;
  longLabel: string;
  /** Sempre duas frutas distintas. */
  fruits: [Food, Food];
  /** Sempre um único acompanhamento (salgado ou doce). */
  accompaniment: Food;
}

export interface WeeklyPlan {
  days: DaySnack[];
  /** Algum item do plano pede lancheira térmica (PRD §17). */
  requiresCoolerBag: boolean;
}

/** Motivos que impedem a geração do planejamento (PRD §12). */
export type PlanIssue =
  | { kind: "insufficient-fruits"; fruits: Food[] }
  | { kind: "missing-accompaniment" };

export function planFoods(plan: WeeklyPlan): Food[] {
  const seen = new Map<string, Food>();
  for (const day of plan.days) {
    for (const food of [...day.fruits, day.accompaniment]) {
      if (!seen.has(food.id)) seen.set(food.id, food);
    }
  }
  return [...seen.values()];
}

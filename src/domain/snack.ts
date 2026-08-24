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
/**
 * A bebida completa a lancheira, mas é opcional: quem não informar nenhuma
 * continua recebendo o planejamento normalmente (a regra do PRD §9 não muda).
 */
export const DRINKS_PER_DAY = 1;

export interface DaySnack {
  day: WeekdayKey;
  label: string;
  longLabel: string;
  /** Sempre duas frutas distintas. */
  fruits: [Food, Food];
  /** Sempre um único acompanhamento (salgado ou doce). */
  accompaniment: Food;
  /** Uma bebida, quando o usuário informou alguma. */
  drink?: Food;
}

/** Todos os alimentos de um dia, na ordem em que aparecem no card. */
export function daySnackFoods(day: DaySnack): Food[] {
  return day.drink
    ? [...day.fruits, day.accompaniment, day.drink]
    : [...day.fruits, day.accompaniment];
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
    for (const food of daySnackFoods(day)) {
      if (!seen.has(food.id)) seen.set(food.id, food);
    }
  }
  return [...seen.values()];
}

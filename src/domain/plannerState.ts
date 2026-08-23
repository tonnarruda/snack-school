import { CATEGORY_LABEL, type Food, type FoodCategory } from "./food";
import {
  INITIAL_HINT,
  INITIAL_QUESTION,
  INSUFFICIENT_FRUITS_ACTION,
  INSUFFICIENT_FRUITS_TITLE,
  MISSING_ACCOMPANIMENT_ACTION,
  MISSING_ACCOMPANIMENT_TITLE,
} from "./messages";
import type { PlanIssue, WeeklyPlan } from "./snack";
import type { Suggestion } from "@/data/suggestions";
import { classifyFoods, createManualFood, mergeFoods } from "@/services/foodClassifier";
import { generateWeeklyPlan } from "@/services/snackPlanner";
import { buildSuggestions } from "@/services/suggestionEngine";

/**
 * Estado da aplicação (PRD §20) como uma máquina de estados pura.
 *
 * Fica no domínio de propósito: os componentes React só despacham ações e
 * desenham o resultado. Sem persistência — recarregar a página zera tudo.
 */
export type PlannerStage =
  /** Aguardando a lista de alimentos. */
  | "asking"
  /** Há alimentos desconhecidos aguardando classificação manual. */
  | "clarifying"
  /** Alimentos insuficientes: o usuário pode complementar sem reiniciar. */
  | "blocked"
  /** Planejamento pronto. */
  | "ready";

export interface ChatMessage {
  id: string;
  author: "assistant" | "user";
  text: string;
  hint?: string;
}

export interface PlannerState {
  stage: PlannerStage;
  messages: ChatMessage[];
  foods: Food[];
  /** Nomes crus que o catálogo não reconheceu (PRD §8). */
  unknownFoods: string[];
  /** Classificações manuais válidas apenas nesta execução. */
  manualCategories: Record<string, FoodCategory>;
  issues: PlanIssue[];
  weeklyPlan?: WeeklyPlan;
  suggestions: Suggestion[];
  messageSeq: number;
}

export type PlannerAction =
  | { type: "submit-foods"; input: string }
  | { type: "classify-unknown"; name: string; category: FoodCategory }
  | { type: "reset" };

export function createInitialState(): PlannerState {
  return {
    stage: "asking",
    messages: [
      { id: "m0", author: "assistant", text: `👋 ${INITIAL_QUESTION}`, hint: INITIAL_HINT },
    ],
    foods: [],
    unknownFoods: [],
    manualCategories: {},
    issues: [],
    suggestions: [],
    messageSeq: 1,
  };
}

function withMessage(
  state: PlannerState,
  message: Omit<ChatMessage, "id">,
): PlannerState {
  return {
    ...state,
    messages: [...state.messages, { ...message, id: `m${state.messageSeq}` }],
    messageSeq: state.messageSeq + 1,
  };
}

const PLURAL: Record<FoodCategory, [string, string]> = {
  fruit: ["fruta", "frutas"],
  savory: ["salgado", "salgados"],
  sweet: ["doce", "doces"],
};

/** "3 frutas, 2 salgados e 1 doce" */
export function describeFoods(foods: Food[]): string {
  const parts = (["fruit", "savory", "sweet"] as FoodCategory[])
    .map((category) => {
      const count = foods.filter((food) => food.category === category).length;
      if (count === 0) return null;
      const [singular, plural] = PLURAL[category];
      return `${count} ${count === 1 ? singular : plural}`;
    })
    .filter((part): part is string => part !== null);

  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

export function issueMessage(issue: PlanIssue): ChatMessage[] {
  if (issue.kind === "insufficient-fruits") {
    const list = issue.fruits.map((fruit) => `• ${fruit.name}`).join("\n");
    return [
      {
        id: "issue-fruits",
        author: "assistant",
        text: `🍎 ${INSUFFICIENT_FRUITS_TITLE}`,
        hint: issue.fruits.length > 0
          ? `Você informou:\n${list}\n\n${INSUFFICIENT_FRUITS_ACTION}`
          : INSUFFICIENT_FRUITS_ACTION,
      },
    ];
  }

  return [
    {
      id: "issue-accompaniment",
      author: "assistant",
      text: `🥪 ${MISSING_ACCOMPANIMENT_TITLE}`,
      hint: MISSING_ACCOMPANIMENT_ACTION,
    },
  ];
}

/**
 * Decide o próximo passo depois de qualquer mudança na lista de alimentos:
 * classificar desconhecidos, pedir mais opções ou montar a semana.
 */
function advance(state: PlannerState): PlannerState {
  if (state.unknownFoods.length > 0) {
    return { ...state, stage: "clarifying", issues: [], weeklyPlan: undefined };
  }

  const { plan, issues } = generateWeeklyPlan(state.foods);

  if (!plan) {
    return { ...state, stage: "blocked", issues, weeklyPlan: undefined, suggestions: [] };
  }

  const next = withMessage(
    { ...state, stage: "ready", issues: [], weeklyPlan: plan, suggestions: buildSuggestions(state.foods) },
    {
      author: "assistant",
      text: "🍎 Prontinho! Este é o lanche da semana.",
      hint: "Dá para exportar em PDF ou montar uma nova semana quando quiser.",
    },
  );

  return next;
}

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case "submit-foods": {
      const input = action.input.trim();
      if (!input) return state;

      const { foods, unknown } = classifyFoods(input, state.manualCategories);
      const knownNew = foods.filter(
        (food) => !state.foods.some((existing) => existing.id === food.id),
      );
      const pendingNew = unknown.filter((name) => !state.unknownFoods.includes(name));

      let next = withMessage(state, { author: "user", text: input });

      if (knownNew.length === 0 && pendingNew.length === 0) {
        return withMessage(next, {
          author: "assistant",
          text: "🤔 Não consegui identificar nenhum alimento novo aí.",
          hint: "Tente separar por vírgula, por exemplo: banana, laranja, pão, queijo.",
        });
      }

      if (knownNew.length > 0) {
        next = withMessage(next, {
          author: "assistant",
          text: `✅ Anotei ${describeFoods(knownNew)}.`,
          hint: knownNew.map((food) => food.name).join(", "),
        });
      }

      next = {
        ...next,
        foods: mergeFoods(next.foods, foods),
        unknownFoods: [...next.unknownFoods, ...pendingNew],
      };

      return advance(next);
    }

    case "classify-unknown": {
      const food = createManualFood(action.name, action.category);

      const next = withMessage(state, {
        author: "user",
        text: `${action.name} → ${CATEGORY_LABEL[action.category]}`,
      });

      return advance({
        ...next,
        foods: mergeFoods(next.foods, [food]),
        unknownFoods: next.unknownFoods.filter((name) => name !== action.name),
        manualCategories: { ...next.manualCategories, [food.id]: action.category },
      });
    }

    case "reset":
      // PRD §19: nada da execução anterior é reaproveitado.
      return createInitialState();

    default:
      return state;
  }
}

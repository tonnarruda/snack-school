"use client";

import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  FOOD_CATEGORIES,
  type FoodCategory,
} from "@/domain/food";

interface UnknownFoodProps {
  name: string;
  /** Quantos ainda faltam depois deste. */
  remaining: number;
  onClassify: (name: string, category: FoodCategory) => void;
}

const OPTION_STYLE: Record<FoodCategory, string> = {
  fruit: "border-lime-200 bg-lime-50 hover:border-lime-400",
  savory: "border-amber-200 bg-amber-50 hover:border-amber-400",
  sweet: "border-rose-200 bg-rose-50 hover:border-rose-400",
  drink: "border-sky-200 bg-sky-50 hover:border-sky-400",
};

/** Pergunta a categoria de um alimento fora do catálogo (PRD §8). */
export function UnknownFood({ name, remaining, onClassify }: UnknownFoodProps) {
  return (
    <section
      aria-live="polite"
      className="no-print rounded-3xl border-2 border-line bg-surface p-4"
    >
      <p className="font-display text-lg font-bold text-ink">
        🤔 Não reconheci “{name}”
      </p>
      <p className="mt-0.5 text-sm text-muted">Como devemos classificar?</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FOOD_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onClassify(name, category)}
            className={`pressable flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${OPTION_STYLE[category]}`}
          >
            <span aria-hidden className="text-3xl leading-none">
              {CATEGORY_EMOJI[category]}
            </span>
            <span className="font-display text-sm font-bold text-ink">
              {CATEGORY_LABEL[category]}
            </span>
          </button>
        ))}
      </div>

      {remaining > 0 && (
        <p className="mt-3 text-xs text-muted">
          Depois deste, {remaining === 1 ? "falta 1 alimento" : `faltam ${remaining} alimentos`} para
          classificar.
        </p>
      )}
    </section>
  );
}

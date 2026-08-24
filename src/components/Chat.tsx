"use client";

import { useEffect, useReducer, useRef } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { CATEGORY_EMOJI } from "@/domain/food";
import { TAGLINE } from "@/domain/messages";
import {
  createInitialState,
  issueMessage,
  plannerReducer,
  type ChatMessage,
} from "@/domain/plannerState";
import { FoodInput } from "./FoodInput";
import { UnknownFood } from "./UnknownFood";
import { WeeklyPlan } from "./WeeklyPlan";

/**
 * O letreiro da marca, letra a letra nas cores da logomarca.
 *
 * É texto, não imagem: fica nítido em qualquer tamanho, acompanha o zoom e o
 * leitor de tela anuncia "Lanchô" de uma vez só.
 */
const WORDMARK = [
  ["L", "text-lancho-red"],
  ["a", "text-lancho-orange"],
  ["n", "text-lancho-green"],
  ["c", "text-lancho-blue"],
  ["h", "text-lancho-purple"],
  ["ô", "text-lancho-pink"],
] as const;

function Wordmark() {
  return (
    <span aria-label="Lanchô">
      {WORDMARK.map(([letter, color], index) => (
        <span key={index} className={color} aria-hidden>
          {letter}
        </span>
      ))}
    </span>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.author === "assistant";

  return (
    <div className={isAssistant ? "flex" : "flex justify-end"}>
      <div
        className={[
          "max-w-[88%] rounded-3xl px-4 py-3 text-[15px]",
          isAssistant
            ? "rounded-bl-lg border-2 border-line bg-surface text-ink"
            : "rounded-br-lg bg-brand text-on-brand",
        ].join(" ")}
      >
        <p className="whitespace-pre-line font-semibold">{message.text}</p>
        {message.hint && (
          <p
            className={[
              "mt-1 whitespace-pre-line text-xs",
              isAssistant ? "text-muted" : "text-on-brand/80",
            ].join(" ")}
          >
            {message.hint}
          </p>
        )}
      </div>
    </div>
  );
}

export function Chat() {
  const [state, dispatch] = useReducer(plannerReducer, undefined, createInitialState);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.messages.length, state.stage]);

  const pendingUnknown = state.unknownFoods[0];
  const showInput = state.stage === "asking" || state.stage === "blocked";
  // Na tela inicial não há nada para limpar.
  const canReset = state.foods.length > 0 || state.messages.length > 1;

  return (
    <>
      <header className="no-print sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b-2 border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/lancho-mark.png"
            alt=""
            width={512}
            height={512}
            priority
            className="size-10 shrink-0 sm:size-11"
          />
          <div className="min-w-0">
            <h1 className="font-display text-xl leading-none font-extrabold sm:text-2xl">
              <Wordmark />
            </h1>
            <p className="truncate text-xs text-muted">{TAGLINE}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "reset" })}
          disabled={!canReset}
          title="Montar nova semana"
          className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-2 font-display text-sm font-bold text-ink transition hover:border-brand disabled:opacity-40 disabled:shadow-none"
        >
          <RotateCcw className="size-4" aria-hidden />
          Nova semana
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-4 pt-4">
        <div className="no-print space-y-3" aria-live="polite">
          {state.messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
          {state.issues.flatMap(issueMessage).map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
        </div>

        {pendingUnknown && (
          <UnknownFood
            name={pendingUnknown}
            remaining={state.unknownFoods.length - 1}
            onClassify={(name, category) =>
              dispatch({ type: "classify-unknown", name, category })
            }
          />
        )}

        {state.stage !== "ready" && state.foods.length > 0 && (
          <ul className="no-print flex flex-wrap gap-1.5" aria-label="Alimentos informados">
            {state.foods.map((food) => (
              <li
                key={food.id}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 text-xs font-semibold text-muted"
              >
                <span aria-hidden>{food.emoji ?? CATEGORY_EMOJI[food.category]}</span>
                {food.name}
              </li>
            ))}
          </ul>
        )}

        {showInput && (
          <FoodInput
            mode={state.foods.length > 0 ? "append" : "create"}
            onSubmit={(input) => dispatch({ type: "submit-foods", input })}
          />
        )}

        {state.stage === "ready" && state.weeklyPlan && (
          <WeeklyPlan
            plan={state.weeklyPlan}
            suggestions={state.suggestions}
            onReset={() => dispatch({ type: "reset" })}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </>
  );
}

"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Plus, Sparkles } from "lucide-react";

interface FoodInputProps {
  onSubmit: (input: string) => void;
  /** Complementando uma lista existente (PRD §12) muda o rótulo do botão. */
  mode?: "create" | "append";
  disabled?: boolean;
}

export function FoodInput({ onSubmit, mode = "create", disabled }: FoodInputProps) {
  const [value, setValue] = useState("");
  const canSubmit = value.trim().length > 0 && !disabled;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return;
    onSubmit(value);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia; Shift+Enter continua a lista na linha de baixo.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="no-print space-y-3">
      <label className="sr-only" htmlFor="foods">
        Alimentos disponíveis
      </label>
      <textarea
        id="foods"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        autoFocus
        disabled={disabled}
        placeholder="Banana, laranja, pão, queijo..."
        className="w-full resize-y rounded-3xl border-2 border-line bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-brand disabled:opacity-60"
      />

      <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Separe por vírgula, ponto e vírgula ou quebra de linha.
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="pressable inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-display text-base font-bold text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mode === "append" ? (
            <>
              <Plus className="size-5" aria-hidden />
              Adicionar alimentos
            </>
          ) : (
            <>
              <Sparkles className="size-5" aria-hidden />
              Montar semana
            </>
          )}
        </button>
      </div>
    </form>
  );
}

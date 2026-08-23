import type { Suggestion } from "@/data/suggestions";

/** Sugestões para próximas semanas — nunca entram no planejamento (PRD §15). */
export function Suggestions({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <section className="rounded-3xl border-2 border-dashed border-line bg-surface-muted p-4">
      <h2 className="font-display text-lg font-bold text-ink">
        💡 Para as próximas semanas
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        Ideias para variar — não entram no planejamento desta semana.
      </p>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.name}
            className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2.5"
          >
            <span aria-hidden className="text-3xl leading-none">
              {suggestion.emoji}
            </span>
            <div>
              <p className="text-sm leading-tight font-bold text-ink">{suggestion.name}</p>
              <p className="text-xs leading-snug text-muted">{suggestion.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

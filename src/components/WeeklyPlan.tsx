"use client";

import { useState } from "react";
import { FileDown, RotateCcw, Snowflake, Table2 } from "lucide-react";
import type { Suggestion } from "@/data/suggestions";
import { COOLER_BAG_NOTICE } from "@/domain/messages";
import type { WeeklyPlan as WeeklyPlanModel } from "@/domain/snack";
import { exportPlanToPdf } from "@/services/pdfGenerator";
import { SnackCard } from "./SnackCard";
import { Suggestions } from "./Suggestions";

interface WeeklyPlanProps {
  plan: WeeklyPlanModel;
  suggestions: Suggestion[];
  onReset: () => void;
}

export function WeeklyPlan({ plan, suggestions, onReset }: WeeklyPlanProps) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await exportPlanToPdf(plan, suggestions);
    } catch {
      setExportError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold text-ink">🍎 Lanche da semana</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {plan.days.map((day) => (
          <SnackCard key={day.day} day={day} />
        ))}
      </div>

      {plan.requiresCoolerBag && (
        <p className="flex items-start gap-2 rounded-3xl bg-cold-soft px-4 py-3 text-xs text-muted">
          <Snowflake className="mt-0.5 size-4 shrink-0 text-cold" aria-hidden />
          {COOLER_BAG_NOTICE}
        </p>
      )}

      <details className="no-print rounded-3xl border-2 border-line bg-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-display text-sm font-bold text-ink">
          <Table2 className="size-4 text-muted" aria-hidden />
          Ver como tabela
        </summary>
        <div className="overflow-x-auto border-t-2 border-line">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-surface-muted text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-2 font-bold">Dia</th>
                <th scope="col" className="px-4 py-2 font-bold">Fruta 1</th>
                <th scope="col" className="px-4 py-2 font-bold">Fruta 2</th>
                <th scope="col" className="px-4 py-2 font-bold">Salgado/Doce</th>
              </tr>
            </thead>
            <tbody>
              {plan.days.map((day) => (
                <tr key={day.day} className="border-t border-line">
                  <th scope="row" className="px-4 py-2 font-bold text-ink">{day.label}</th>
                  <td className="px-4 py-2 text-ink">{day.fruits[0].name}</td>
                  <td className="px-4 py-2 text-ink">{day.fruits[1].name}</td>
                  <td className="px-4 py-2 text-ink">{day.accompaniment.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <Suggestions suggestions={suggestions} />

      <div className="no-print flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-display text-base font-bold text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          <FileDown className="size-5" aria-hidden />
          {exporting ? "Gerando PDF..." : "Exportar PDF"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-line bg-surface px-6 py-3 font-display text-base font-bold text-ink transition hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <RotateCcw className="size-5" aria-hidden />
          Montar nova semana
        </button>
      </div>

      {exportError && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {exportError}
        </p>
      )}
    </section>
  );
}

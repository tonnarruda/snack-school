import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { classifyFoods } from "../foodClassifier";
import { generateWeeklyPlan } from "../snackPlanner";
import { buildSuggestions } from "../suggestionEngine";
import { exportPlanToPdf } from "../pdfGenerator";

/**
 * Smoke test do PDF. Sem DOM os emojis são ignorados (o renderer já trata isso)
 * e `doc.save()` grava um arquivo em vez de baixar. O que importa aqui é o
 * layout não lançar nem transbordar — em especial o card mais alto, o que tem a
 * linha da bebida.
 */
async function exportFor(input: string, name: string): Promise<string> {
  const { foods, unknown } = classifyFoods(input);
  expect(unknown).toEqual([]);

  const { plan } = generateWeeklyPlan(foods);
  const file = join(tmpdir(), `${name}-${process.pid}.pdf`);

  await exportPlanToPdf(plan!, buildSuggestions(foods), {
    fileName: file,
    generatedAt: new Date("2026-08-23T12:00:00Z"),
  });

  const content = readFileSync(file, "latin1");
  rmSync(file, { force: true });
  return content;
}

function pageCount(pdf: string): number {
  return pdf.match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
}

describe("PDF do planejamento", () => {
  it("cabe em uma folha quando não há bebidas", async () => {
    const pdf = await exportFor("banana, laranja, kiwi, cuscuz, tapioca, cocada", "sem-bebida");

    expect(pageCount(pdf)).toBe(1);
  });

  it("desenha a semana com bebida sem quebrar os cards entre páginas", async () => {
    const pdf = await exportFor(
      "banana, laranja, kiwi, cuscuz, tapioca, cocada, suco de uva, água de coco",
      "com-bebida",
    );

    // Os cards mais altos ainda cabem na primeira folha; só as sugestões podem
    // transbordar para a segunda.
    expect(pageCount(pdf)).toBeLessThanOrEqual(2);
  });
});

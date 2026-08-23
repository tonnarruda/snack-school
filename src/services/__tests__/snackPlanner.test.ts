import { describe, expect, it } from "vitest";
import { classifyFoods } from "../foodClassifier";
import { buildAccompanimentPool, generateWeeklyPlan, validateFoods } from "../snackPlanner";
import { isAccompaniment, isFruit } from "@/domain/food";
import { WEEKDAYS } from "@/domain/snack";

function plan(input: string) {
  const { foods, unknown } = classifyFoods(input);
  expect(unknown).toEqual([]);
  return generateWeeklyPlan(foods);
}

describe("regra principal do lanche (RF06, RF07)", () => {
  it("gera cinco dias com duas frutas diferentes e um acompanhamento", () => {
    const { plan: weekly } = plan(
      "banana, laranja, kiwi, tangerina, pão, queijo, mini pizza, bolinho de cenoura, bolinho de banana, panqueca de banana",
    );

    expect(weekly?.days).toHaveLength(WEEKDAYS.length);

    for (const day of weekly!.days) {
      expect(day.fruits).toHaveLength(2);
      expect(day.fruits[0].id).not.toBe(day.fruits[1].id);
      expect(day.fruits.every(isFruit)).toBe(true);
      expect(isAccompaniment(day.accompaniment)).toBe(true);
    }
  });

  it("respeita a regra com o mínimo possível: duas frutas e um acompanhamento", () => {
    const { plan: weekly, issues } = plan("banana, maçã, cuscuz");

    expect(issues).toEqual([]);
    expect(weekly?.days).toHaveLength(5);
    for (const day of weekly!.days) {
      expect(day.fruits.map((fruit) => fruit.name).sort()).toEqual(["Banana", "Maçã"]);
      expect(day.accompaniment.name).toBe("Cuscuz");
    }
  });
});

describe("variedade das frutas (RF08)", () => {
  it("reproduz a distribuição esperada do PRD para quatro frutas", () => {
    const { plan: weekly } = plan("banana, laranja, kiwi, tangerina, cuscuz");

    expect(weekly!.days.map((day) => day.fruits.map((fruit) => fruit.name))).toEqual([
      ["Banana", "Laranja"],
      ["Kiwi", "Tangerina"],
      ["Banana", "Kiwi"],
      ["Laranja", "Tangerina"],
      ["Banana", "Tangerina"],
    ]);
  });

  it("não repete uma dupla antes de esgotar as outras", () => {
    const { plan: weekly } = plan("banana, laranja, kiwi, tangerina, manga, cuscuz");
    const pairs = weekly!.days.map((day) => day.fruits.map((fruit) => fruit.id).sort().join("+"));

    expect(new Set(pairs).size).toBe(5);
  });

  it("distribui as frutas de forma equilibrada", () => {
    const { plan: weekly } = plan("banana, laranja, kiwi, tangerina, cuscuz");
    const uses = new Map<string, number>();
    for (const day of weekly!.days) {
      for (const fruit of day.fruits) uses.set(fruit.id, (uses.get(fruit.id) ?? 0) + 1);
    }

    const counts = [...uses.values()];
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });
});

describe("acompanhamentos (RF09, RF10)", () => {
  it("alterna salgado e doce quando há opções", () => {
    const { plan: weekly } = plan(
      "banana, laranja, kiwi, cuscuz, tapioca, milho cozido, bolinho de cenoura, bolo de milho, cocada",
    );

    expect(weekly!.days.map((day) => day.accompaniment.category)).toEqual([
      "savory",
      "sweet",
      "savory",
      "sweet",
      "savory",
    ]);
  });

  it("nunca repete o mesmo acompanhamento em dias consecutivos quando há alternativa", () => {
    const { plan: weekly } = plan("banana, laranja, cuscuz, bolinho de cenoura");
    const names = weekly!.days.map((day) => day.accompaniment.name);

    for (let i = 1; i < names.length; i += 1) {
      expect(names[i]).not.toBe(names[i - 1]);
    }
  });

  it("reproduz o exemplo de acompanhamentos do PRD", () => {
    const { plan: weekly } = plan(
      "banana, laranja, kiwi, tangerina, pão, queijo, bolinho de cenoura, mini pizza, bolinho de banana, panqueca de banana",
    );

    expect(weekly!.days.map((day) => day.accompaniment.name)).toEqual([
      "Pão com queijo",
      "Bolinho de cenoura",
      "Mini pizza",
      "Bolinho de banana",
      "Panqueca de banana",
    ]);
  });

  it("combina pão e queijo em um único acompanhamento", () => {
    const { foods } = classifyFoods("pão, queijo");
    const pool = buildAccompanimentPool(foods);

    expect(pool.map((item) => item.name)).toEqual(["Pão com queijo"]);
    expect(pool[0].refrigerationRecommended).toBe(true);
  });

  it("não deixa uma fruta ser consumida por uma combinação", () => {
    const { foods } = classifyFoods("açaí, leite em pó, banana");
    const pool = buildAccompanimentPool(foods);

    expect(pool.some((item) => item.parts?.includes("acai"))).toBe(false);
  });
});

describe("validação de quantidade (RF11)", () => {
  it("recusa uma única fruta", () => {
    const { foods } = classifyFoods("banana, cuscuz");
    expect(validateFoods(foods)).toEqual([
      { kind: "insufficient-fruits", fruits: [expect.objectContaining({ name: "Banana" })] },
    ]);
  });

  it("recusa a falta de acompanhamento", () => {
    const { foods } = classifyFoods("banana, laranja");
    expect(validateFoods(foods)).toEqual([{ kind: "missing-accompaniment" }]);
  });

  it("acumula os dois problemas", () => {
    const { foods } = classifyFoods("banana");
    expect(validateFoods(foods)).toHaveLength(2);
  });

  it("não gera planejamento quando há problemas", () => {
    const { foods } = classifyFoods("banana");
    expect(generateWeeklyPlan(foods).plan).toBeUndefined();
  });
});

describe("conservação (RF13)", () => {
  it("sinaliza lancheira térmica quando há alimento refrigerado", () => {
    const { plan: weekly } = plan("banana, laranja, pão, queijo");
    expect(weekly!.requiresCoolerBag).toBe(true);
  });

  it("não sinaliza quando nada precisa de frio", () => {
    const { plan: weekly } = plan("banana, laranja, cuscuz, cocada");
    expect(weekly!.requiresCoolerBag).toBe(false);
  });
});

describe("determinismo e desempenho (RNF)", () => {
  it("gera sempre o mesmo planejamento para a mesma lista", () => {
    const input = "banana, laranja, kiwi, tangerina, manga, cuscuz, tapioca, cocada";
    expect(JSON.stringify(plan(input))).toBe(JSON.stringify(plan(input)));
  });

  it("planeja em menos de 100 ms", () => {
    const { foods } = classifyFoods(
      "banana, laranja, kiwi, tangerina, manga, caju, maçã, uva, cuscuz, tapioca, queijo, pão, cocada, bolo de milho",
    );

    const started = performance.now();
    generateWeeklyPlan(foods);
    expect(performance.now() - started).toBeLessThan(100);
  });
});

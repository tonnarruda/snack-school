import { describe, expect, it } from "vitest";
import {
  createInitialState,
  describeFoods,
  plannerReducer,
  type PlannerState,
} from "../plannerState";
import { INITIAL_QUESTION } from "../messages";

function run(state: PlannerState, ...inputs: string[]): PlannerState {
  return inputs.reduce(
    (current, input) => plannerReducer(current, { type: "submit-foods", input }),
    state,
  );
}

describe("fluxo completo (PRD §26)", () => {
  it("começa perguntando os alimentos disponíveis", () => {
    const state = createInitialState();

    expect(state.stage).toBe("asking");
    expect(state.messages[0].text).toContain(INITIAL_QUESTION);
  });

  it("vai de uma lista completa direto ao planejamento", () => {
    const state = run(
      createInitialState(),
      "banana, laranja, kiwi, tangerina, cuscuz, queijo, bolo de milho",
    );

    expect(state.stage).toBe("ready");
    expect(state.weeklyPlan?.days).toHaveLength(5);
    expect(state.suggestions.length).toBeGreaterThan(0);
    expect(state.unknownFoods).toEqual([]);
  });

  it("pede a classificação de um item desconhecido antes de planejar", () => {
    const pending = run(createInitialState(), "banana, laranja, crepioca");

    expect(pending.stage).toBe("clarifying");
    expect(pending.unknownFoods).toEqual(["crepioca"]);
    expect(pending.weeklyPlan).toBeUndefined();

    const done = plannerReducer(pending, {
      type: "classify-unknown",
      name: "crepioca",
      category: "savory",
    });

    expect(done.stage).toBe("ready");
    expect(done.manualCategories).toEqual({ crepioca: "savory" });
    expect(done.weeklyPlan?.days[0].accompaniment.name).toBe("Crepioca");
  });

  it("bloqueia com poucas frutas e libera quando o usuário complementa", () => {
    const blocked = run(createInitialState(), "banana, cuscuz");

    expect(blocked.stage).toBe("blocked");
    expect(blocked.issues).toEqual([
      { kind: "insufficient-fruits", fruits: [expect.objectContaining({ name: "Banana" })] },
    ]);

    const unblocked = run(blocked, "laranja");

    expect(unblocked.stage).toBe("ready");
    expect(unblocked.issues).toEqual([]);
    // A lista anterior foi preservada, sem reiniciar a conversa.
    expect(unblocked.foods.map((food) => food.name)).toEqual(["Banana", "Cuscuz", "Laranja"]);
  });

  it("avisa quando falta acompanhamento", () => {
    const state = run(createInitialState(), "banana, laranja");

    expect(state.stage).toBe("blocked");
    expect(state.issues).toEqual([{ kind: "missing-accompaniment" }]);
  });

  it("responde quando nada é reconhecido como alimento novo", () => {
    const state = run(createInitialState(), "banana, laranja, cuscuz", "banana");
    const last = state.messages[state.messages.length - 1];

    expect(last.author).toBe("assistant");
    expect(last.text).toContain("Não consegui identificar");
  });

  it("limpa tudo ao montar uma nova semana (PRD §19)", () => {
    const ready = run(createInitialState(), "banana, laranja, crepioca");
    const classified = plannerReducer(ready, {
      type: "classify-unknown",
      name: "crepioca",
      category: "sweet",
    });

    const reset = plannerReducer(classified, { type: "reset" });

    expect(reset).toEqual(createInitialState());
    expect(reset.foods).toEqual([]);
    expect(reset.manualCategories).toEqual({});
    expect(reset.weeklyPlan).toBeUndefined();
  });
});

describe("resumo dos alimentos", () => {
  it("descreve as categorias em português", () => {
    const state = run(createInitialState(), "banana, laranja, cuscuz, tapioca, cocada");
    expect(describeFoods(state.foods)).toBe("2 frutas, 2 salgados e 1 doce");
  });
});

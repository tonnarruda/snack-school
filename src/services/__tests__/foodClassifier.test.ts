import { describe, expect, it } from "vitest";
import { classifyFoods, findInCatalog, mergeFoods } from "../foodClassifier";
import { FOOD_CATALOG, FOOD_COMBOS } from "@/data/foods";
import { normalizeFoodName } from "@/domain/food";
import { parseFoodInput } from "../foodParser";
import { buildSuggestions } from "../suggestionEngine";
import { generateWeeklyPlan } from "../snackPlanner";

describe("parser de entrada (RF02)", () => {
  it("aceita vírgula, ponto e vírgula e quebra de linha", () => {
    expect(parseFoodInput("banana, laranja; kiwi\nmanga").map((item) => item.raw)).toEqual([
      "banana",
      "laranja",
      "kiwi",
      "manga",
    ]);
  });

  it("separa pela conjunção e, como no exemplo do PRD", () => {
    expect(parseFoodInput("banana, manga, pão e crepioca").map((item) => item.raw)).toEqual([
      "banana",
      "manga",
      "pão",
      "crepioca",
    ]);
  });

  it("não parte nomes conhecidos que contêm a conjunção", () => {
    const known = (key: string) => key === "sorvete de acai com leite em po e fruta";
    expect(
      parseFoodInput("banana, sorvete de açaí com leite em pó e fruta", known).map((item) => item.raw),
    ).toEqual(["banana", "sorvete de açaí com leite em pó e fruta"]);
  });

  it("ignora duplicatas e diferenças de acento e caixa", () => {
    expect(parseFoodInput("Banana, banana, BANÂNA").map((item) => item.raw)).toEqual(["Banana"]);
  });
});

describe("catálogo", () => {
  it("não tem o mesmo apelido em duas entradas diferentes", () => {
    // O índice é um Map: um apelido repetido faz a última entrada esconder a
    // primeira, e um alimento vira inalcançável sem nenhum aviso.
    const owner = new Map<string, string>();
    const collisions: string[] = [];

    for (const entry of [...FOOD_CATALOG, ...FOOD_COMBOS]) {
      const aliases = "aliases" in entry ? (entry.aliases ?? []) : [];
      for (const name of [entry.name, ...aliases]) {
        const key = normalizeFoodName(name);
        const previous = owner.get(key);
        if (previous && previous !== entry.name) {
          collisions.push(`${key}: ${previous} vs ${entry.name}`);
        }
        owner.set(key, entry.name);
      }
    }

    expect(collisions).toEqual([]);
  });

  it("mantém cada iogurte alcançável pelo próprio nome", () => {
    expect(findInCatalog("iogurte de frutas")?.name).toBe("Iogurte de morango");
    expect(findInCatalog("iogurte de ameixa")?.name).toBe("Iogurte de ameixa");
    expect(findInCatalog("iogurte")?.name).toBe("Iogurte natural");
  });
});

describe("bebidas no catálogo", () => {
  it("reconhece sucos, iogurtes e água de coco como bebida", () => {
    const { foods, unknown } = classifyFoods("suco de uva, iogurte, água de coco, agua");

    expect(unknown).toEqual([]);
    expect(foods.map((food) => [food.name, food.category])).toEqual([
      ["Suco de uva", "drink"],
      ["Iogurte natural", "drink"],
      ["Água de coco", "drink"],
      ["Água", "drink"],
    ]);
  });

  it("não confunde água de coco com a fruta coco", () => {
    const { foods } = classifyFoods("coco, água de coco");

    expect(foods.map((food) => food.category)).toEqual(["fruit", "drink"]);
  });
});

describe("classificação (RF03, RF04)", () => {
  it("reconhece alimentos do catálogo com apelidos e erros de digitação", () => {
    const { foods, unknown } = classifyFoods("pao de queixo, mexerica, sanduiche de queijo, maça");

    expect(unknown).toEqual([]);
    expect(foods.map((food) => food.name)).toEqual([
      "Pão de queijo",
      "Tangerina",
      "Sanduíche de queijo",
      "Maçã",
    ]);
  });

  it("reconhece um nome composto com a conjunção no meio", () => {
    const { foods, unknown } = classifyFoods("sorvete de açaí com leite em pó e fruta");

    expect(unknown).toEqual([]);
    expect(foods).toEqual([
      expect.objectContaining({
        name: "Sorvete de açaí com leite em pó e fruta",
        category: "sweet",
        refrigerationRecommended: true,
      }),
    ]);
  });

  it("nunca adivinha a categoria de um alimento desconhecido", () => {
    const { foods, unknown } = classifyFoods("banana, manga, pão e crepioca");

    expect(unknown).toEqual(["crepioca"]);
    expect(foods.map((food) => food.name)).toEqual(["Banana", "Manga", "Pão"]);
  });

  it("usa a classificação manual informada nesta execução", () => {
    const { foods, unknown } = classifyFoods("crepioca", { crepioca: "savory" });

    expect(unknown).toEqual([]);
    expect(foods).toEqual([
      expect.objectContaining({ id: "crepioca", name: "Crepioca", category: "savory" }),
    ]);
  });

  it("não duplica ao complementar a lista", () => {
    const first = classifyFoods("banana, laranja").foods;
    const second = classifyFoods("laranja, kiwi").foods;

    expect(mergeFoods(first, second).map((food) => food.name)).toEqual([
      "Banana",
      "Laranja",
      "Kiwi",
    ]);
  });
});

describe("sugestões (RF12)", () => {
  it("devolve no máximo cinco sugestões", () => {
    const { foods } = classifyFoods("banana, laranja, cuscuz");
    expect(buildSuggestions(foods).length).toBeLessThanOrEqual(5);
  });

  it("não sugere o que o usuário já informou", () => {
    const { foods } = classifyFoods("banana, manga, melancia, cuscuz, queijo, bolinho de cenoura");
    const names = buildSuggestions(foods).map((suggestion) => suggestion.name);

    expect(names).not.toContain("Manga");
    expect(names).not.toContain("Melancia");
    expect(names).not.toContain("Bolinho de cenoura");
    // "Cuscuz com queijo" já é possível com o que ele tem.
    expect(names).not.toContain("Cuscuz com queijo");
  });

  it("prioriza frutas quando há poucas", () => {
    const { foods } = classifyFoods("banana, laranja, cuscuz, tapioca, cocada, bolo de milho");
    expect(buildSuggestions(foods)[0].category).toBe("fruit");
  });
});

describe("listas reais informadas por responsáveis", () => {
  const FRUITS = "banana, tangerina, kiwi, maça, aça verde, uva roxa, uva verde";
  const SWEET = "sorvete de açaí com leite em pó e fruta";
  const ACCOMPANIMENTS =
    "pao de queixo, sanduiche de queijo, bisnaguinha com geleia, mini pizza, bolinho banana, bolinho cenoura, bolinho de limão";

  it("reconhece a lista de frutas, inclusive com erros de digitação", () => {
    const { foods, unknown } = classifyFoods(FRUITS);

    expect(unknown).toEqual([]);
    expect(foods.map((food) => food.name)).toEqual([
      "Banana",
      "Tangerina",
      "Kiwi",
      "Maçã",
      "Maçã verde",
      "Uva roxa",
      "Uva verde",
    ]);
    expect(foods.every((food) => food.category === "fruit")).toBe(true);
  });

  it("reconhece a lista de acompanhamentos", () => {
    const { foods, unknown } = classifyFoods(`${SWEET}, ${ACCOMPANIMENTS}`);

    expect(unknown).toEqual([]);
    expect(foods.map((food) => [food.name, food.category])).toEqual([
      ["Sorvete de açaí com leite em pó e fruta", "sweet"],
      ["Pão de queijo", "savory"],
      ["Sanduíche de queijo", "savory"],
      ["Bisnaguinha com geleia", "sweet"],
      ["Mini pizza", "savory"],
      ["Bolinho de banana", "sweet"],
      ["Bolinho de cenoura", "sweet"],
      ["Bolinho de limão", "sweet"],
    ]);
  });

  it("monta a semana com as três listas juntas", () => {
    const { foods, unknown } = classifyFoods([FRUITS, SWEET, ACCOMPANIMENTS].join("\n"));
    const { plan, issues } = generateWeeklyPlan(foods);

    expect(unknown).toEqual([]);
    expect(issues).toEqual([]);
    expect(plan?.days).toHaveLength(5);
    expect(plan?.days.map((day) => day.accompaniment.category)).toEqual([
      "savory",
      "sweet",
      "savory",
      "sweet",
      "savory",
    ]);
  });
});

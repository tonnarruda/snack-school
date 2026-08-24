import type { FoodCategory } from "@/domain/food";

/**
 * Catálogo local de alimentos reconhecidos (PRD §7).
 *
 * Para expandir, basta adicionar uma linha. `aliases` cobre variações regionais
 * e erros comuns de escrita; a busca já ignora acentos e maiúsculas.
 */
export interface CatalogEntry {
  name: string;
  category: FoodCategory;
  /** Deve viajar em lancheira térmica (PRD §17). */
  refrigerationRecommended?: boolean;
  emoji?: string;
  aliases?: string[];
}

export const FOOD_CATALOG: CatalogEntry[] = [
  // ---------- Frutas ----------
  { name: "Banana", category: "fruit", emoji: "🍌", aliases: ["banana prata", "banana nanica"] },
  { name: "Laranja", category: "fruit", emoji: "🍊", aliases: ["laranja lima"] },
  { name: "Tangerina", category: "fruit", emoji: "🍊", aliases: ["mexerica", "bergamota", "ponkan"] },
  { name: "Kiwi", category: "fruit", emoji: "🥝" },
  { name: "Manga", category: "fruit", emoji: "🥭", aliases: ["manga espada", "manga tommy"] },
  { name: "Caju", category: "fruit", emoji: "🍐" },
  { name: "Maçã", category: "fruit", emoji: "🍎", aliases: ["maca", "maça", "maçã gala"] },
  { name: "Maçã verde", category: "fruit", emoji: "🍏", aliases: ["maca verde", "aça verde", "aca verde"] },
  { name: "Pera", category: "fruit", emoji: "🍐" },
  { name: "Uva", category: "fruit", emoji: "🍇", aliases: ["uvas"] },
  { name: "Uva roxa", category: "fruit", emoji: "🍇" },
  { name: "Uva verde", category: "fruit", emoji: "🍇", aliases: ["uva itália", "uva italia"] },
  { name: "Melancia", category: "fruit", emoji: "🍉" },
  { name: "Melão", category: "fruit", emoji: "🍈" },
  { name: "Mamão", category: "fruit", emoji: "🍈", aliases: ["papaia"] },
  { name: "Abacaxi", category: "fruit", emoji: "🍍" },
  { name: "Goiaba", category: "fruit", emoji: "🍐" },
  { name: "Morango", category: "fruit", emoji: "🍓", aliases: ["morangos"] },
  { name: "Acerola", category: "fruit", emoji: "🍒" },
  { name: "Ameixa", category: "fruit", emoji: "🍑" },
  { name: "Pêssego", category: "fruit", emoji: "🍑" },
  { name: "Graviola", category: "fruit", emoji: "🍏" },
  { name: "Pitaya", category: "fruit", emoji: "🍈" },
  { name: "Coco", category: "fruit", emoji: "🥥" },
  { name: "Açaí", category: "fruit", refrigerationRecommended: true, emoji: "🫐", aliases: ["acai", "polpa de açaí"] },
  { name: "Tâmara", category: "fruit", emoji: "🌰", aliases: ["tamaras"] },
  { name: "Salada de frutas", category: "fruit", refrigerationRecommended: true, emoji: "🥗" },

  // ---------- Salgados ----------
  { name: "Pão", category: "savory", emoji: "🍞", aliases: ["pao frances", "pão francês", "paozinho", "pãozinho", "pão de forma", "pao integral"] },
  { name: "Pão de queijo", category: "savory", emoji: "🧆", aliases: ["pao de queixo", "pão de queixo", "pao d queijo"] },
  { name: "Bisnaguinha", category: "savory", emoji: "🍞", aliases: ["bisnaga", "bisnaguinhas"] },
  { name: "Queijo", category: "savory", refrigerationRecommended: true, emoji: "🧀", aliases: ["queijo minas", "queijo branco", "mussarela", "muçarela"] },
  { name: "Queijo coalho", category: "savory", refrigerationRecommended: true, emoji: "🧀" },
  { name: "Requeijão", category: "savory", refrigerationRecommended: true, emoji: "🧀" },
  { name: "Presunto", category: "savory", refrigerationRecommended: true, emoji: "🥓" },
  { name: "Peito de peru", category: "savory", refrigerationRecommended: true, emoji: "🍗" },
  { name: "Tapioca", category: "savory", emoji: "🫓" },
  { name: "Cuscuz", category: "savory", emoji: "🌽" },
  { name: "Milho cozido", category: "savory", emoji: "🌽", aliases: ["milho"] },
  { name: "Macaxeira", category: "savory", emoji: "🥔", aliases: ["mandioca", "aipim"] },
  { name: "Batata doce", category: "savory", emoji: "🍠" },
  { name: "Ovo cozido", category: "savory", refrigerationRecommended: true, emoji: "🥚", aliases: ["ovo"] },
  { name: "Mini pizza", category: "savory", refrigerationRecommended: true, emoji: "🍕", aliases: ["pizza"] },
  { name: "Sanduíche", category: "savory", refrigerationRecommended: true, emoji: "🥪", aliases: ["sanduba", "misto quente", "misto-quente"] },
  { name: "Sanduíche de queijo", category: "savory", refrigerationRecommended: true, emoji: "🥪", aliases: ["sanduiche de queijo", "sanduba de queijo"] },
  { name: "Wrap", category: "savory", refrigerationRecommended: true, emoji: "🌯" },
  { name: "Panqueca salgada", category: "savory", emoji: "🥞" },
  { name: "Omelete", category: "savory", refrigerationRecommended: true, emoji: "🍳" },
  { name: "Biscoito de polvilho", category: "savory", emoji: "🍘" },
  { name: "Torrada", category: "savory", emoji: "🍞" },
  { name: "Pipoca", category: "savory", emoji: "🍿" },
  { name: "Castanha de caju", category: "savory", emoji: "🥜", aliases: ["castanha"] },
  { name: "Amendoim", category: "savory", emoji: "🥜" },
  { name: "Bolinho de macaxeira", category: "savory", emoji: "🧆" },
  { name: "Empadinha", category: "savory", refrigerationRecommended: true, emoji: "🥟", aliases: ["empada"] },
  { name: "Coxinha", category: "savory", refrigerationRecommended: true, emoji: "🍗" },
  { name: "Pastel", category: "savory", refrigerationRecommended: true, emoji: "🥟" },
  { name: "Esfiha", category: "savory", refrigerationRecommended: true, emoji: "🥟", aliases: ["esfirra"] },

  // ---------- Doces ----------
  { name: "Bolinho de cenoura", category: "sweet", emoji: "🧁", aliases: ["bolinho cenoura"] },
  { name: "Bolinho de limão", category: "sweet", emoji: "🧁", aliases: ["bolinho limao", "bolo de limão"] },
  { name: "Bolinho de banana", category: "sweet", emoji: "🧁", aliases: ["bolinho banana", "bolo de banana"] },
  { name: "Panqueca de banana", category: "sweet", emoji: "🥞" },
  { name: "Bolo de milho", category: "sweet", emoji: "🍰" },
  { name: "Bolo de laranja", category: "sweet", emoji: "🍰" },
  { name: "Bolo de cenoura", category: "sweet", emoji: "🍰" },
  { name: "Muffin de banana", category: "sweet", emoji: "🧁" },
  { name: "Biscoito de maisena", category: "sweet", emoji: "🍪", aliases: ["biscoito", "bolacha"] },
  { name: "Cookie de aveia", category: "sweet", emoji: "🍪", aliases: ["cookie"] },
  { name: "Barra de cereal", category: "sweet", emoji: "🍫" },
  { name: "Cocada", category: "sweet", emoji: "🥥" },
  { name: "Paçoca", category: "sweet", emoji: "🍬", aliases: ["pacoquinha", "paçoquinha"] },
  { name: "Rapadura", category: "sweet", emoji: "🍬" },
  { name: "Doce de leite", category: "sweet", emoji: "🍮" },
  { name: "Brigadeiro", category: "sweet", emoji: "🍫" },
  { name: "Pudim", category: "sweet", refrigerationRecommended: true, emoji: "🍮" },
  { name: "Gelatina", category: "sweet", refrigerationRecommended: true, emoji: "🍮" },
  { name: "Granola", category: "sweet", emoji: "🥣" },
  { name: "Leite em pó", category: "sweet", emoji: "🥛", aliases: ["leite em po"] },
  { name: "Bisnaguinha com geleia", category: "sweet", emoji: "🍓", aliases: ["bisnaguinha com geleia de frutas"] },
  { name: "Sorvete de açaí com leite em pó e fruta", category: "sweet", refrigerationRecommended: true, emoji: "🍨",
    aliases: ["sorvete de acai com leite em po e fruta", "sorvete de açaí com leite em pó e frutas", "açaí com leite em pó e fruta", "acai com leite em po e fruta", "sorvete de açaí"] },
  { name: "Mel", category: "sweet", emoji: "🍯" },
  { name: "Geleia de frutas", category: "sweet", emoji: "🍓", aliases: ["geleia"] },

  // ---------- Bebidas ----------
  { name: "Água", category: "drink", emoji: "💧", aliases: ["agua", "garrafinha de água", "garrafinha de agua"] },
  { name: "Água de coco", category: "drink", emoji: "🥥", aliases: ["agua de coco", "água-de-coco"] },
  { name: "Iogurte natural", category: "drink", refrigerationRecommended: true, emoji: "🥛", aliases: ["iogurte", "iogurte de beber", "iogurte liquido", "iogurte líquido"] },
  { name: "Iogurte de morango", category: "drink", refrigerationRecommended: true, emoji: "🥛", aliases: ["iogurte de frutas", "iogurte de fruta"] },
  { name: "Iogurte de ameixa", category: "drink", refrigerationRecommended: true, emoji: "🥛" },
  { name: "Iogurte grego", category: "drink", refrigerationRecommended: true, emoji: "🥛" },
  { name: "Suco de laranja", category: "drink", refrigerationRecommended: true, emoji: "🧃", aliases: ["suco de laranja natural"] },
  { name: "Suco de uva", category: "drink", emoji: "🧃", aliases: ["suco de uva integral"] },
  { name: "Suco de caju", category: "drink", refrigerationRecommended: true, emoji: "🧃" },
  { name: "Suco de acerola", category: "drink", refrigerationRecommended: true, emoji: "🧃" },
  { name: "Suco de goiaba", category: "drink", refrigerationRecommended: true, emoji: "🧃" },
  { name: "Suco de manga", category: "drink", refrigerationRecommended: true, emoji: "🧃" },
  { name: "Suco de maracujá", category: "drink", refrigerationRecommended: true, emoji: "🧃", aliases: ["suco de maracuja"] },
  { name: "Suco de abacaxi", category: "drink", refrigerationRecommended: true, emoji: "🧃" },
  { name: "Suco natural", category: "drink", refrigerationRecommended: true, emoji: "🧃", aliases: ["suco", "suco de fruta", "suco de frutas"] },
  { name: "Limonada", category: "drink", refrigerationRecommended: true, emoji: "🍋" },
  { name: "Leite", category: "drink", refrigerationRecommended: true, emoji: "🥛" },
  { name: "Achocolatado", category: "drink", refrigerationRecommended: true, emoji: "🥛", aliases: ["leite com achocolatado", "chocolate quente", "leite achocolatado"] },
  { name: "Vitamina de banana", category: "drink", refrigerationRecommended: true, emoji: "🥤", aliases: ["vitamina", "vitamina de frutas"] },
  { name: "Chá gelado", category: "drink", emoji: "🧊", aliases: ["cha gelado", "chá"] },
];

/**
 * Combinações reconhecidas: quando os dois itens estão disponíveis, valem como
 * UM único acompanhamento (PRD §9 e exemplo do §13, "Pão com queijo").
 */
export interface ComboRecipe {
  name: string;
  category: FoodCategory;
  /** Nomes do catálogo que precisam estar disponíveis. */
  parts: [string, string];
  emoji?: string;
}

export const FOOD_COMBOS: ComboRecipe[] = [
  { name: "Pão com queijo", category: "savory", parts: ["Pão", "Queijo"], emoji: "🥪" },
  { name: "Pão com requeijão", category: "savory", parts: ["Pão", "Requeijão"], emoji: "🥪" },
  { name: "Pão com presunto", category: "savory", parts: ["Pão", "Presunto"], emoji: "🥪" },
  { name: "Pão com peito de peru", category: "savory", parts: ["Pão", "Peito de peru"], emoji: "🥪" },
  { name: "Pão com ovo", category: "savory", parts: ["Pão", "Ovo cozido"], emoji: "🥪" },
  { name: "Tapioca com queijo", category: "savory", parts: ["Tapioca", "Queijo"], emoji: "🫓" },
  { name: "Tapioca com requeijão", category: "savory", parts: ["Tapioca", "Requeijão"], emoji: "🫓" },
  { name: "Cuscuz com queijo", category: "savory", parts: ["Cuscuz", "Queijo"], emoji: "🌽" },
  { name: "Cuscuz com ovo", category: "savory", parts: ["Cuscuz", "Ovo cozido"], emoji: "🌽" },
  { name: "Torrada com requeijão", category: "savory", parts: ["Torrada", "Requeijão"], emoji: "🍞" },
  { name: "Macaxeira com queijo coalho", category: "savory", parts: ["Macaxeira", "Queijo coalho"], emoji: "🥔" },
  { name: "Pão com geleia", category: "sweet", parts: ["Pão", "Geleia de frutas"], emoji: "🍓" },
  { name: "Bisnaguinha com geleia", category: "sweet", parts: ["Bisnaguinha", "Geleia de frutas"], emoji: "🍓" },
  { name: "Bisnaguinha com queijo", category: "savory", parts: ["Bisnaguinha", "Queijo"], emoji: "🥪" },
];

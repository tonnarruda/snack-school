import type { FoodCategory } from "@/domain/food";

/**
 * Base local de sugestões (PRD §15 e §16).
 *
 * Prioriza alimentos frescos, regionais ou minimamente processados. As sugestões
 * nunca entram automaticamente no planejamento.
 */
export type SuggestionRegion = "northeast" | "brazil";

export interface Suggestion {
  name: string;
  category: FoodCategory;
  region: SuggestionRegion;
  reason: string;
  emoji: string;
  /** Ids/nomes do catálogo que a sugestão pressupõe (evita repetir o que já existe). */
  relatedFoods?: string[];
}

export const SUGGESTIONS: Suggestion[] = [
  {
    name: "Caju",
    category: "fruit",
    region: "northeast",
    reason: "Fruta regional e uma boa opção para variar o cardápio.",
    emoji: "🍐",
  },
  {
    name: "Manga",
    category: "fruit",
    region: "brazil",
    reason: "Fácil de encontrar e ajuda a variar as frutas da semana.",
    emoji: "🥭",
  },
  {
    name: "Melancia",
    category: "fruit",
    region: "brazil",
    reason: "Fruta refrescante, boa para o clima quente.",
    emoji: "🍉",
  },
  {
    name: "Acerola",
    category: "fruit",
    region: "northeast",
    reason: "Rica em vitamina C e comum nas feiras do Nordeste.",
    emoji: "🍒",
  },
  {
    name: "Mamão",
    category: "fruit",
    region: "brazil",
    reason: "Fruta macia, fácil de comer na lancheira.",
    emoji: "🍈",
  },
  {
    name: "Goiaba",
    category: "fruit",
    region: "brazil",
    reason: "Resistente ao transporte e cheia de fibras.",
    emoji: "🍐",
  },
  {
    name: "Banana",
    category: "fruit",
    region: "brazil",
    reason: "Prática, acessível e bem aceita por crianças pequenas.",
    emoji: "🍌",
  },
  {
    name: "Uva",
    category: "fruit",
    region: "brazil",
    reason: "Fácil de porcionar em potinhos, sem precisar de faca.",
    emoji: "🍇",
  },
  {
    name: "Cuscuz com queijo",
    category: "savory",
    region: "northeast",
    reason: "Alternativa regional para os acompanhamentos.",
    emoji: "🌽",
    relatedFoods: ["Cuscuz", "Queijo"],
  },
  {
    name: "Tapioca com queijo",
    category: "savory",
    region: "northeast",
    reason: "Opção simples, prática e sem conservantes.",
    emoji: "🫓",
    relatedFoods: ["Tapioca", "Queijo"],
  },
  {
    name: "Pão de queijo",
    category: "savory",
    region: "brazil",
    reason: "Rende bem e agrada quase toda criança.",
    emoji: "🧆",
  },
  {
    name: "Milho cozido",
    category: "savory",
    region: "northeast",
    reason: "Salgado natural, barato e fácil de preparar na véspera.",
    emoji: "🌽",
  },
  {
    name: "Ovo cozido",
    category: "savory",
    region: "brazil",
    reason: "Boa fonte de proteína para o intervalo da manhã.",
    emoji: "🥚",
  },
  {
    name: "Batata doce",
    category: "savory",
    region: "brazil",
    reason: "Energia de digestão lenta, ótima antes do recreio.",
    emoji: "🍠",
  },
  {
    name: "Bolinho de cenoura",
    category: "sweet",
    region: "brazil",
    reason: "Doce caseiro que ainda leva legume na massa.",
    emoji: "🧁",
  },
  {
    name: "Panqueca de banana",
    category: "sweet",
    region: "brazil",
    reason: "Feita com dois ingredientes e sem açúcar adicionado.",
    emoji: "🥞",
  },
  {
    name: "Bolo de milho",
    category: "sweet",
    region: "northeast",
    reason: "Doce regional que aguenta bem a lancheira.",
    emoji: "🍰",
  },
  {
    name: "Cocada",
    category: "sweet",
    region: "northeast",
    reason: "Doce típico do Ceará para variar o fim da semana.",
    emoji: "🥥",
  },
  {
    name: "Água de coco",
    category: "drink",
    region: "northeast",
    reason: "Hidrata sem açúcar adicionado e é fácil de achar na região.",
    emoji: "🥥",
  },
  {
    name: "Suco de acerola",
    category: "drink",
    region: "northeast",
    reason: "Feito com a fruta congelada, rende a semana toda.",
    emoji: "🧃",
  },
  {
    name: "Iogurte natural",
    category: "drink",
    region: "brazil",
    reason: "Bebida com cálcio; leve em lancheira térmica.",
    emoji: "🥛",
  },
  {
    name: "Água",
    category: "drink",
    region: "brazil",
    reason: "A garrafinha de água acompanha bem qualquer lanche do dia.",
    emoji: "💧",
  },
];

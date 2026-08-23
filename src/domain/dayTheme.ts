import type { WeekdayKey } from "./snack";

/**
 * Uma cor por dia da semana — o responsável reconhece o dia pela cor antes de
 * ler o nome. Fonte única para a tela (classes do Tailwind) e para o PDF (RGB),
 * para os dois nunca saírem de sincronia.
 */
export type Rgb = [number, number, number];

export interface DayTheme {
  card: string;
  badge: string;
  tile: string;
  accent: string;
  pdf: { bg: Rgb; border: Rgb; badge: Rgb };
}

export const DAY_THEME: Record<WeekdayKey, DayTheme> = {
  monday: {
    card: "border-lime-200 bg-lime-50",
    badge: "bg-lime-500",
    tile: "border-lime-200/70",
    accent: "text-lime-700",
    pdf: { bg: [247, 254, 231], border: [217, 249, 157], badge: [132, 204, 22] },
  },
  tuesday: {
    card: "border-amber-200 bg-amber-50",
    badge: "bg-amber-500",
    tile: "border-amber-200/70",
    accent: "text-amber-700",
    pdf: { bg: [255, 251, 235], border: [253, 230, 138], badge: [245, 158, 11] },
  },
  wednesday: {
    card: "border-sky-200 bg-sky-50",
    badge: "bg-sky-500",
    tile: "border-sky-200/70",
    accent: "text-sky-700",
    pdf: { bg: [240, 249, 255], border: [186, 230, 253], badge: [14, 165, 233] },
  },
  thursday: {
    card: "border-violet-200 bg-violet-50",
    badge: "bg-violet-500",
    tile: "border-violet-200/70",
    accent: "text-violet-700",
    pdf: { bg: [245, 243, 255], border: [221, 214, 254], badge: [139, 92, 246] },
  },
  friday: {
    card: "border-rose-200 bg-rose-50",
    badge: "bg-rose-500",
    tile: "border-rose-200/70",
    accent: "text-rose-700",
    pdf: { bg: [255, 241, 242], border: [254, 205, 211], badge: [244, 63, 94] },
  },
};

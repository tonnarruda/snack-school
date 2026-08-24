import type { Suggestion } from "@/data/suggestions";
import { DAY_THEME, type Rgb } from "@/domain/dayTheme";
import { CATEGORY_EMOJI, type Food } from "@/domain/food";
import { APP_NAME, COOLER_BAG_NOTICE, TAGLINE } from "@/domain/messages";
import { daySnackFoods, type DaySnack, type WeeklyPlan } from "@/domain/snack";

/**
 * Gera o PDF do planejamento inteiramente no navegador (PRD §18).
 *
 * O layout é o mesmo da tela: cards coloridos por dia, uma cor por dia vinda de
 * DAY_THEME, dois quadros de frutas e um de acompanhamento. Nada é enviado para
 * servidor.
 *
 * Emoji: as fontes padrão do jsPDF não têm glifos de emoji, então cada emoji é
 * desenhado num <canvas> (que usa a fonte de emoji do sistema) e entra no PDF
 * como imagem.
 */
const PAGE = { width: 210, height: 297, margin: 12 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const CARD_GAP = 4;
const CARD_WIDTH = (CONTENT_WIDTH - CARD_GAP) / 2;
const BOTTOM_LIMIT = PAGE.height - PAGE.margin;

interface CardLayout {
  height: number;
  pillY: number;
  fruits: { y: number; height: number };
  accompaniment: { y: number; height: number };
  drink?: { y: number; height: number };
}

/**
 * Dois layouts de card. O de bebida é mais apertado de propósito: com a linha
 * extra ele ainda precisa caber, com as cinco sugestões, em uma única folha —
 * o plano é feito para imprimir e colar na geladeira.
 */
const CARD_LAYOUT: CardLayout = {
  height: 52,
  pillY: 4,
  fruits: { y: 13, height: 20 },
  accompaniment: { y: 36, height: 12 },
};

const CARD_LAYOUT_WITH_DRINK: CardLayout = {
  height: 58,
  pillY: 3.5,
  fruits: { y: 11, height: 20 },
  accompaniment: { y: 33, height: 11 },
  drink: { y: 46, height: 11 },
};

const INK: Rgb = [43, 35, 32];
const MUTED: Rgb = [123, 106, 93];
const LINE: Rgb = [240, 227, 207];
const WHITE: Rgb = [255, 255, 255];
const COLD: Rgb = [47, 111, 237];
const COLD_SOFT: Rgb = [233, 240, 255];
const CANVAS: Rgb = [253, 244, 231];

type Doc = import("jspdf").jsPDF;

/** Rasteriza um emoji usando a fonte de emoji do sistema. */
function createEmojiRenderer() {
  const cache = new Map<string, string | null>();

  return function render(emoji: string): string | null {
    const cached = cache.get(emoji);
    if (cached !== undefined) return cached;

    let result: string | null = null;
    try {
      // 64px cobre com folga os 8mm impressos (~200 DPI) sem inflar o arquivo.
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.font = `${Math.round(size * 0.78)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
        result = canvas.toDataURL("image/png");
      }
    } catch {
      result = null;
    }

    cache.set(emoji, result);
    return result;
  };
}

type EmojiRenderer = ReturnType<typeof createEmojiRenderer>;

function drawEmoji(doc: Doc, png: string | null, x: number, y: number, size: number) {
  if (png) doc.addImage(png, "PNG", x, y, size, size);
}

/** Quebra o texto na largura disponível, com "…" se passar de maxLines. */
function fitLines(doc: Doc, text: string, width: number, maxLines: number): string[] {
  const lines = doc.splitTextToSize(text, width) as string[];
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s.]+$/, "")}…`;
  return kept;
}

function foodEmoji(food: Food): string {
  return food.emoji ?? CATEGORY_EMOJI[food.category];
}

/** Quadro branco de um alimento — o equivalente do FoodTile da tela. */
function drawFoodTile(
  doc: Doc,
  food: Food,
  emoji: EmojiRenderer,
  border: Rgb,
  box: { x: number; y: number; width: number; height: number },
  layout: "stacked" | "wide",
) {
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...border);
  doc.setLineWidth(0.4);
  doc.roundedRect(box.x, box.y, box.width, box.height, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);

  if (layout === "stacked") {
    drawEmoji(doc, emoji(foodEmoji(food)), box.x + box.width / 2 - 4, box.y + 2, 8);
    const lines = fitLines(doc, food.name, box.width - 4, 2);
    lines.forEach((line, index) => {
      doc.text(line, box.x + box.width / 2, box.y + 14 + index * 3.2, { align: "center" });
    });
    return;
  }

  drawEmoji(doc, emoji(foodEmoji(food)), box.x + 3, box.y + box.height / 2 - 4, 8);
  const lines = fitLines(doc, food.name, box.width - 17, 2);
  const firstBaseline = box.y + box.height / 2 + (lines.length === 1 ? 1.2 : -0.4);
  lines.forEach((line, index) => {
    doc.text(line, box.x + 14, firstBaseline + index * 3.2);
  });
}

/** Abre uma página nova quando o bloco não cabe no que resta da atual. */
function ensureSpace(doc: Doc, y: number, needed: number): number {
  if (y + needed <= BOTTOM_LIMIT) return y;
  doc.addPage();
  return PAGE.margin;
}

function drawDayCard(
  doc: Doc,
  day: DaySnack,
  emoji: EmojiRenderer,
  x: number,
  y: number,
  layout: CardLayout,
) {
  const theme = DAY_THEME[day.day];

  doc.setFillColor(...theme.pdf.bg);
  doc.setDrawColor(...theme.pdf.border);
  doc.setLineWidth(0.7);
  doc.roundedRect(x, y, CARD_WIDTH, layout.height, 4.5, 4.5, "FD");

  // Pílula colorida com o dia.
  const label = day.label.toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const pillWidth = doc.getTextWidth(label) + 8;
  doc.setFillColor(...theme.pdf.badge);
  doc.roundedRect(x + 4, y + layout.pillY, pillWidth, 6.2, 3.1, 3.1, "F");
  doc.setTextColor(...WHITE);
  doc.text(label, x + 4 + pillWidth / 2, y + layout.pillY + 4.4, { align: "center" });

  const needsCooler = daySnackFoods(day).some((food) => food.refrigerationRecommended);
  if (needsCooler) {
    doc.setFontSize(6.5);
    const badge = "térmica";
    const badgeWidth = doc.getTextWidth(badge) + 9;
    doc.setFillColor(...WHITE);
    doc.roundedRect(
      x + CARD_WIDTH - 4 - badgeWidth, y + layout.pillY, badgeWidth, 6.2, 3.1, 3.1, "F",
    );
    drawEmoji(doc, emoji("❄️"), x + CARD_WIDTH - 4 - badgeWidth + 1.6, y + layout.pillY + 1.2, 4);
    doc.setTextColor(...COLD);
    doc.text(badge, x + CARD_WIDTH - 4 - badgeWidth + 6.4, y + layout.pillY + 4.3);
  }

  const tileWidth = (CARD_WIDTH - 8 - 3) / 2;
  day.fruits.forEach((fruit, index) => {
    drawFoodTile(doc, fruit, emoji, theme.pdf.border, {
      x: x + 4 + index * (tileWidth + 3),
      y: y + layout.fruits.y,
      width: tileWidth,
      height: layout.fruits.height,
    }, "stacked");
  });

  drawFoodTile(doc, day.accompaniment, emoji, theme.pdf.border, {
    x: x + 4,
    y: y + layout.accompaniment.y,
    width: CARD_WIDTH - 8,
    height: layout.accompaniment.height,
  }, "wide");

  if (day.drink && layout.drink) {
    drawFoodTile(doc, day.drink, emoji, theme.pdf.border, {
      x: x + 4,
      y: y + layout.drink.y,
      width: CARD_WIDTH - 8,
      height: layout.drink.height,
    }, "wide");
  }
}

function drawSuggestions(
  doc: Doc,
  suggestions: Suggestion[],
  emoji: EmojiRenderer,
  y: number,
): number {
  const rows = Math.ceil(suggestions.length / 2);
  const height = 14 + rows * 13;

  doc.setFillColor(...CANVAS);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.7);
  doc.setLineDashPattern([1.5, 1.2], 0);
  doc.roundedRect(PAGE.margin, y, CONTENT_WIDTH, height, 4.5, 4.5, "FD");
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  drawEmoji(doc, emoji("💡"), PAGE.margin + 4, y + 3.6, 5);
  doc.text("Para as próximas semanas", PAGE.margin + 10.5, y + 7.6);

  const columnWidth = (CONTENT_WIDTH - 8 - 3) / 2;
  suggestions.forEach((suggestion, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = PAGE.margin + 4 + column * (columnWidth + 3);
    const top = y + 13 + row * 13;

    drawEmoji(doc, emoji(suggestion.emoji), x, top + 1, 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text(suggestion.name, x + 9.5, top + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    fitLines(doc, suggestion.reason, columnWidth - 11, 2).forEach((line, lineIndex) => {
      doc.text(line, x + 9.5, top + 8 + lineIndex * 2.8);
    });
  });

  return y + height;
}

/** Caminho da lancheira da logomarca, embutida no cabeçalho do PDF. */
const MARK_URL = "/lancho-mark.png";

/**
 * Carrega a marca como data URI. Volta `null` fora do navegador ou se o arquivo
 * não vier — nesse caso o cabeçalho cai no emoji, como antes.
 */
async function loadMark(): Promise<string | null> {
  try {
    const response = await fetch(MARK_URL);
    if (!response.ok) return null;

    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface PdfOptions {
  fileName?: string;
  generatedAt?: Date;
}

export async function exportPlanToPdf(
  plan: WeeklyPlan,
  suggestions: Suggestion[],
  options: PdfOptions = {},
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const emoji = createEmojiRenderer();

  // Cabeçalho, no mesmo tom da tela: a logomarca e o título.
  const mark = await loadMark();
  if (mark) {
    doc.addImage(mark, "PNG", PAGE.margin - 1, PAGE.margin - 2.5, 15, 15);
  } else {
    drawEmoji(doc, emoji("🍎"), PAGE.margin, PAGE.margin, 9);
  }

  const titleX = PAGE.margin + (mark ? 16 : 11.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK);
  doc.text("Lanche da semana", titleX, PAGE.margin + 7.4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const generatedAt = options.generatedAt ?? new Date();
  doc.text(
    `Plano de segunda a sexta · gerado em ${generatedAt.toLocaleDateString("pt-BR")}`,
    titleX,
    PAGE.margin + 12.4,
  );

  let y = PAGE.margin + 18;

  // Todos os cards seguem o mesmo layout, mesmo que só alguns dias tenham bebida.
  const layout = plan.days.some((day) => day.drink)
    ? CARD_LAYOUT_WITH_DRINK
    : CARD_LAYOUT;

  // Duas colunas por linha; o quinto card fica sozinho na última.
  for (let index = 0; index < plan.days.length; index += 2) {
    y = ensureSpace(doc, y, layout.height);

    plan.days.slice(index, index + 2).forEach((day, column) => {
      drawDayCard(doc, day, emoji, PAGE.margin + column * (CARD_WIDTH + CARD_GAP), y, layout);
    });

    y += layout.height + CARD_GAP;
  }

  if (plan.requiresCoolerBag) {
    y = ensureSpace(doc, y, 11);
    doc.setFillColor(...COLD_SOFT);
    doc.setDrawColor(...COLD_SOFT);
    const noticeHeight = 11;
    doc.roundedRect(PAGE.margin, y, CONTENT_WIDTH, noticeHeight, 4, 4, "F");
    drawEmoji(doc, emoji("❄️"), PAGE.margin + 4, y + 3.4, 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    fitLines(doc, COOLER_BAG_NOTICE, CONTENT_WIDTH - 15, 2).forEach((line, index) => {
      doc.text(line, PAGE.margin + 10.5, y + 4.8 + index * 3.2);
    });
    y += noticeHeight + CARD_GAP;
  }

  if (suggestions.length > 0) {
    y = ensureSpace(doc, y, 14 + Math.ceil(suggestions.length / 2) * 13);
    y = drawSuggestions(doc, suggestions, emoji, y) + CARD_GAP;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    doc.text(`${APP_NAME} · ${TAGLINE}`, PAGE.width / 2, PAGE.height - 8, { align: "center" });
  }

  doc.save(options.fileName ?? "lanche-da-semana.pdf");
}

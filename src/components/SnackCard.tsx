import { Snowflake } from "lucide-react";
import { CATEGORY_EMOJI, type Food } from "@/domain/food";
import { daySnackFoods, type DaySnack } from "@/domain/snack";
import { DAY_THEME, type DayTheme } from "@/domain/dayTheme";

function FoodTile({
  food,
  theme,
  wide,
}: {
  food: Food;
  theme: DayTheme;
  wide?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border bg-white/80 px-3 py-2.5",
        theme.tile,
        wide ? "" : "flex-col gap-1 px-2 py-3 text-center",
      ].join(" ")}
    >
      <span aria-hidden className={wide ? "text-3xl leading-none" : "text-4xl leading-none"}>
        {food.emoji ?? CATEGORY_EMOJI[food.category]}
      </span>
      <span className="text-sm leading-tight font-semibold text-ink">{food.name}</span>
    </div>
  );
}

/** Card de um dia: 2 frutas + 1 acompanhamento + a bebida, quando houver (PRD §14). */
export function SnackCard({ day }: { day: DaySnack }) {
  const theme = DAY_THEME[day.day];
  const needsCooler = daySnackFoods(day).some((food) => food.refrigerationRecommended);

  return (
    <article className={`rounded-3xl border-2 p-4 ${theme.card}`}>
      <header className="flex items-center justify-between gap-2">
        <h3
          className={`rounded-full px-3 py-1 font-display text-xs font-bold tracking-widest text-white uppercase ${theme.badge}`}
        >
          {day.label}
        </h3>
        {needsCooler && (
          <span
            className="flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-cold"
            title="Leve em lancheira térmica"
          >
            <Snowflake className="size-3.5" aria-hidden />
            térmica
          </span>
        )}
      </header>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {day.fruits.map((fruit) => (
          <FoodTile key={fruit.id} food={fruit} theme={theme} />
        ))}
      </div>

      <div className="mt-2">
        <FoodTile food={day.accompaniment} theme={theme} wide />
      </div>

      {day.drink && (
        <div className="mt-2">
          <FoodTile food={day.drink} theme={theme} wide />
        </div>
      )}
    </article>
  );
}

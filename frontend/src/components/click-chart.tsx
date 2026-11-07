import { AreaChart, Area } from "./charts/area-chart";
import { Grid } from "./charts/grid";
import { XAxis } from "./charts/x-axis";
import { ChartTooltip } from "./charts/tooltip";
export default function ClickChart({
  data,
}: {
  data: { date: Date; count: number }[];
}) {
  return (
    <div
      className="click-chart"
      role="img"
      aria-label={`Daily clicks over the last seven days: ${data.map((d) => `${d.date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}: ${d.count}`).join(", ")}`}
    >
      <AreaChart
        data={data}
        style={{ height: 270, aspectRatio: "auto" }}
        margin={{ left: 24, right: 24, top: 30, bottom: 40 }}
        animationDuration={600}
      >
        <Grid strokeDasharray="" numTicksRows={4} />
        <Area
          dataKey="count"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.16}
          strokeWidth={2.3}
          showValue
        />
        <XAxis
          numTicks={7}
          labels={data.map((d) =>
            d.date.toLocaleDateString("en", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            }),
          )}
        />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}

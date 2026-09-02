/**
 * Spark — inline-SVG sparkline. <Spark values={[12, 40, 33]} label="utilization" />
 * Reuse this for any small trend/utilization visual; do not add chart libraries.
 */
export function Spark({ values, label }: { values: number[]; label?: string }) {
  const w = 240;
  const h = 34;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [
    Math.round((i / Math.max(values.length - 1, 1)) * w),
    Math.round(h - (v / max) * (h - 3))
  ]);
  const line = "M" + pts.map(([x, y]) => `${x},${y}`).join(" L");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img"
      aria-label={label ?? `trend of ${values.length} samples`}>
      <path className="spark__fill" d={`${line} L${w},${h} L0,${h} Z`} />
      <path className="spark__line" d={line} />
    </svg>
  );
}

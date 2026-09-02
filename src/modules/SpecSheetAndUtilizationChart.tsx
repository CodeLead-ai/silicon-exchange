/**
 * Spec sheet and utilization chart — owned by increment inc-11.
 *
 * Renders the listing spec card and a 24-hour inline-SVG utilization
 * line chart with hover tooltip and a visible text summary.
 */
import { useRef, useState } from "react";
import { UTILIZATION, type Listing } from "../data";

// ─── Chart constants ─────────────────────────────────────────────────────────

const W = 480;
const H = 120;
const PAD_X = 24;
const PAD_Y = 12;
const PLOT_W = W - PAD_X * 2;
const PLOT_H = H - PAD_Y * 2;

// ─── Component ───────────────────────────────────────────────────────────────

export function SpecSheetAndUtilizationChart({ listing }: { listing: Listing }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const samples = (UTILIZATION[listing.id] ?? []).slice(0, 24);

  // Compute chart points
  const points = samples.map((v, i) => ({
    x: PAD_X + (i / Math.max(samples.length - 1, 1)) * PLOT_W,
    y: PAD_Y + PLOT_H - (v / 100) * PLOT_H,
    hour: i,
    value: v,
  }));

  const linePath =
    points.length > 0
      ? "M" + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")
      : "";

  // Summary stats
  const avg =
    samples.length > 0
      ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
      : 0;
  const peakIdx = samples.indexOf(Math.max(...samples, 0));
  const lowIdx = samples.indexOf(Math.min(...samples, 100));

  // Mouse → nearest point
  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - x);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    }
    setHoverIdx(closest);
  }

  // Tooltip position (clamped inside SVG)
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipBelow = false;
  if (hoverIdx !== null && points[hoverIdx]) {
    const p = points[hoverIdx];
    tooltipX = Math.max(30, Math.min(W - 30, p.x));
    tooltipBelow = p.y < 32;
    tooltipY = tooltipBelow ? p.y + 14 : p.y - 14;
  }

  return (
    <section>
      {/* Spec card */}
      <div className="card">
        <div className="card__head">
          <span className="card__id mono">{listing.id}</span>
          <span className={`status status--${listing.status}`}>
            <span className="dot" />
            {listing.status}
          </span>
        </div>
        <h3 className="card__name">{listing.name}</h3>
        <div className="metrics">
          <div className="metric">
            <span className="microlabel">Chip</span>
            <b className="num">{listing.chip}</b>
          </div>
          <div className="metric">
            <span className="microlabel">Memory</span>
            <b className="num">{listing.memoryGb} GB</b>
          </div>
          <div className="metric">
            <span className="microlabel">TFLOPS</span>
            <b className="num">{listing.tflops}</b>
          </div>
          <div className="metric">
            <span className="microlabel">Rate</span>
            <b className="num">${(listing.rateCentsPerHour / 100).toFixed(2)}/hr</b>
          </div>
        </div>
        <div className="card__foot">
          <span className="price">
            ${(listing.rateCentsPerHour / 100).toFixed(2)}
            <small>/hr</small>
          </span>
        </div>
      </div>

      {/* 24-hour utilization chart */}
      <div className="panel panel--pad">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`24-hour utilization: average ${avg}%, peak ${samples[peakIdx] ?? 0}% at ${String(peakIdx).padStart(2, "0")}:00, low ${samples[lowIdx] ?? 0}% at ${String(lowIdx).padStart(2, "0")}:00`}
          style={{ width: "100%", height: "120px", display: "block" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Baseline grid */}
          <line x1={PAD_X} y1={PAD_Y} x2={W - PAD_X} y2={PAD_Y} stroke="var(--border)" strokeWidth="0.5" />
          <line x1={PAD_X} y1={H - PAD_Y} x2={W - PAD_X} y2={H - PAD_Y} stroke="var(--border)" strokeWidth="0.5" />
          <line x1={PAD_X} y1={PAD_Y + PLOT_H / 2} x2={W - PAD_X} y2={PAD_Y + PLOT_H / 2} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="4,4" />

          {/* Utilization line */}
          {linePath && (
            <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.85" />
          )}

          {/* Hover crosshair + dot + tooltip */}
          {hoverIdx !== null && points[hoverIdx] && (
            <g>
              <line
                x1={points[hoverIdx].x}
                y1={PAD_Y}
                x2={points[hoverIdx].x}
                y2={H - PAD_Y}
                stroke="var(--muted)"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
              <circle
                cx={points[hoverIdx].x}
                cy={points[hoverIdx].y}
                r="3.5"
                fill="var(--primary)"
                stroke="var(--bg)"
                strokeWidth="1"
              />
              <rect
                x={tooltipX - 32}
                y={tooltipBelow ? tooltipY - 4 : tooltipY - 14}
                width="64"
                height="18"
                rx="3"
                fill="var(--surface-2)"
                stroke="var(--border)"
                strokeWidth="0.5"
              />
              <text
                x={tooltipX}
                y={tooltipBelow ? tooltipY + 9 : tooltipY - 1}
                textAnchor="middle"
                fill="var(--text)"
                fontSize="9"
                fontFamily="var(--mono)"
              >
                {String(points[hoverIdx].hour).padStart(2, "0")}:00 · {points[hoverIdx].value}%
              </text>
            </g>
          )}
        </svg>

        {/* Visible text summary (a11y + visual) */}
        <p className="muted" style={{ fontSize: "var(--text-sm)", marginTop: "var(--space-2)", marginBottom: 0 }}>
          Avg <span className="num">{avg}%</span>
          {" · "}Peak <span className="num">{samples[peakIdx] ?? 0}%</span> at{" "}
          <span className="num">{String(peakIdx).padStart(2, "0")}:00</span>
          {" · "}Low <span className="num">{samples[lowIdx] ?? 0}%</span> at{" "}
          <span className="num">{String(lowIdx).padStart(2, "0")}:00</span>
        </p>
      </div>
    </section>
  );
}

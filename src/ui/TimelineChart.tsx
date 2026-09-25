// =============================================================================
// src/ui/TimelineChart.tsx
// The 1-year progress timeline. A change-over-time chart:
//   - ACTUAL cumulative lessons  -> solid series-1 (blue) line + area
//   - PLANNED trajectory         -> recessive muted dashed reference line
//   - END-OF-LEVEL milestones    -> markers on the planned curve (good = done)
//   - a "today" rule, gridlines, monthly x-ticks, and a hover crosshair+tooltip
//
// Per the data-viz method: one axis, one data hue (actual) against a recessive
// reference (planned) rather than a competing second hue, a legend is always
// present, and a table view is provided for accessibility.
// =============================================================================

import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { TimelinePoint } from "../progress/timeline.js";
import { daysBetween, formatShort } from "../util/date.js";

export interface ChartMilestone {
  label: string;
  date: Date;
  plannedLessons: number;
  achieved: boolean;
}

interface Props {
  points: TimelinePoint[];
  milestones: ChartMilestone[];
  maxLessons: number;
  today: Date;
}

const W = 720;
const H = 320;
const PAD = { left: 44, right: 16, top: 16, bottom: 40 };
const PX0 = PAD.left;
const PX1 = W - PAD.right;
const PY0 = PAD.top;
const PY1 = H - PAD.bottom;

export function TimelineChart({ points, milestones, maxLessons, today }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const overlayRef = useRef<SVGRectElement>(null);

  if (points.length < 2) {
    return <p className="muted">Not enough plan data to draw a timeline yet.</p>;
  }

  const start = points[0]!.date;
  const end = points[points.length - 1]!.date;
  const totalDays = Math.max(daysBetween(start, end), 1);
  const yMax = Math.max(maxLessons, 1);

  const xFor = (date: Date) => PX0 + (daysBetween(start, date) / totalDays) * (PX1 - PX0);
  const yFor = (lessons: number) => PY1 - (lessons / yMax) * (PY1 - PY0);

  // --- Paths ---
  const plannedPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.date)},${yFor(p.planned)}`).join(" ");
  const actualPts = points.filter((p) => p.actual !== null);
  const actualPath = actualPts.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.date)},${yFor(p.actual ?? 0)}`).join(" ");
  const actualArea =
    actualPts.length > 0
      ? `${actualPath} L${xFor(actualPts[actualPts.length - 1]!.date)},${PY1} L${xFor(actualPts[0]!.date)},${PY1} Z`
      : "";

  // --- Y gridlines / labels (0,25,50,75,100%) ---
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ value: Math.round(yMax * f), y: yFor(yMax * f) }));

  // --- X ticks at month boundaries ---
  const xTicks: { x: number; label: string }[] = [];
  let prevMonth = -1;
  for (const p of points) {
    const m = p.date.getMonth();
    if (m !== prevMonth) {
      xTicks.push({ x: xFor(p.date), label: p.date.toLocaleDateString(undefined, { month: "short" }) });
      prevMonth = m;
    }
  }

  const todayX = xFor(today);
  const hoverPoint = hover !== null ? points[hover] : undefined;

  const onMove = (e: ReactMouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(frac * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const ariaLabel = `Progress timeline: ${actualPts[actualPts.length - 1]?.actual ?? 0} of ${yMax} lessons completed against a plan ending ${formatShort(end)}.`;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {/* Gridlines + Y labels */}
        {yTicks.map((t) => (
          <g key={t.value}>
            <line x1={PX0} y1={t.y} x2={PX1} y2={t.y} stroke="var(--grid)" strokeWidth={1} />
            <text x={PX0 - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
              {t.value}
            </text>
          </g>
        ))}

        {/* X axis + month ticks */}
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="var(--axis)" strokeWidth={1} />
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={PY1 + 18} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
            {t.label}
          </text>
        ))}

        {/* Today rule */}
        <line x1={todayX} y1={PY0} x2={todayX} y2={PY1} stroke="var(--axis)" strokeWidth={1} strokeDasharray="2 3" />
        <text x={todayX} y={PY0 - 2} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
          today
        </text>

        {/* Actual area + line */}
        {actualArea && <path d={actualArea} fill="var(--series-1-soft)" opacity={0.5} />}
        <path d={plannedPath} fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeDasharray="5 4" />
        {actualPath && <path d={actualPath} fill="none" stroke="var(--series-1)" strokeWidth={2.5} strokeLinejoin="round" />}

        {/* Milestone markers on the planned curve */}
        {milestones.map((m) => {
          const mx = xFor(m.date);
          const my = yFor(m.plannedLessons);
          return (
            <g key={m.label}>
              <rect
                x={mx - 5}
                y={my - 5}
                width={10}
                height={10}
                transform={`rotate(45 ${mx} ${my})`}
                fill={m.achieved ? "var(--good)" : "var(--surface-1)"}
                stroke={m.achieved ? "var(--good)" : "var(--axis)"}
                strokeWidth={2}
              />
              <text x={mx} y={my - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text-secondary)">
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Hover crosshair + dots */}
        {hoverPoint && (
          <g pointerEvents="none">
            <line x1={xFor(hoverPoint.date)} y1={PY0} x2={xFor(hoverPoint.date)} y2={PY1} stroke="var(--axis)" strokeWidth={1} />
            <circle cx={xFor(hoverPoint.date)} cy={yFor(hoverPoint.planned)} r={4} fill="var(--text-muted)" />
            {hoverPoint.actual !== null && (
              <circle cx={xFor(hoverPoint.date)} cy={yFor(hoverPoint.actual)} r={4.5} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={2} />
            )}
          </g>
        )}

        {/* Interaction overlay */}
        <rect
          ref={overlayRef}
          x={PX0}
          y={PY0}
          width={PX1 - PX0}
          height={PY1 - PY0}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {/* Tooltip (positioned as a % of the container, which scales with the SVG) */}
      {hoverPoint && (
        <div
          className="tooltip"
          style={{ left: `${(xFor(hoverPoint.date) / W) * 100}%`, top: `${(yFor(Math.max(hoverPoint.actual ?? 0, hoverPoint.planned)) / H) * 100}%` }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{formatShort(hoverPoint.date)}</div>
          <div className="tooltip__row">
            <span className="legend-swatch" style={{ background: "var(--series-1)" }} />
            Completed: <strong>{hoverPoint.actual ?? "—"}</strong>
          </div>
          <div className="tooltip__row">
            <span className="legend-swatch legend-swatch--dashed" />
            Planned: <strong>{hoverPoint.planned}</strong>
          </div>
        </div>
      )}

      {/* Legend (always present for ≥2 series) */}
      <div className="chart__legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--series-1)" }} /> Completed
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-swatch--dashed" /> Planned
        </span>
        <span className="legend-item">
          <span style={{ width: 10, height: 10, background: "var(--good)", transform: "rotate(45deg)", display: "inline-block" }} /> Milestone reached
        </span>
      </div>

      {/* Accessible table alternative */}
      <details style={{ marginTop: 12 }}>
        <summary className="muted" style={{ cursor: "pointer", fontSize: "0.82rem" }}>
          View data as a table
        </summary>
        <table style={{ width: "100%", marginTop: 8, fontSize: "0.82rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Week</th>
              <th style={{ textAlign: "left" }}>Date</th>
              <th style={{ textAlign: "right" }}>Planned</th>
              <th style={{ textAlign: "right" }}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.weekIndex}>
                <td>{p.weekIndex}</td>
                <td>{formatShort(p.date)}</td>
                <td style={{ textAlign: "right" }}>{p.planned}</td>
                <td style={{ textAlign: "right" }}>{p.actual ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

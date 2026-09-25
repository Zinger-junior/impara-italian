// =============================================================================
// src/pages/Timeline.tsx
// The full 1-year plan view: the timeline chart at full width, an editable
// target exam date (which reshapes the plan), plan status, milestone table,
// and a reset control for the demo data.
// =============================================================================

import { Badge, Button, Card, ErrorState, PageHead, Spinner, Stat } from "../ui/components.js";
import { TimelineChart } from "../ui/TimelineChart.js";
import type { ChartMilestone } from "../ui/TimelineChart.js";
import { useAsync } from "../hooks/useAsync.js";
import {
  getMilestones,
  getProgressMap,
  getUser,
  resetAll,
  setTargetExamDate,
} from "../db/repositories.js";
import { buildTimeline, lessonsPerLevel, planStatus, totalLessonCount } from "../progress/timeline.js";
import { daysUntilExam } from "../progress/selectors.js";
import { formatShort, fromISODate, today } from "../util/date.js";
import type { LessonProgressRecord, MilestoneRecord, UserRecord } from "../db/store.js";

interface Bundle {
  user: UserRecord;
  progress: Map<string, LessonProgressRecord>;
  milestones: MilestoneRecord[];
}

function cumulativeLessonsByLevel(): Map<string, number> {
  const map = new Map<string, number>();
  let running = 0;
  for (const { level, count } of lessonsPerLevel()) {
    running += count;
    map.set(level, running);
  }
  return map;
}

export function Timeline() {
  const { loading, error, value, reload } = useAsync<Bundle>(async () => {
    const [user, progress, milestones] = await Promise.all([
      getUser(),
      getProgressMap(),
      getMilestones(),
    ]);
    return { user, progress, milestones };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!value) return null;

  const { user, progress, milestones } = value;
  const points = buildTimeline(user, [...progress.values()]);
  const status = planStatus(points);
  const cumByLevel = cumulativeLessonsByLevel();

  const chartMilestones: ChartMilestone[] = milestones.map((m) => ({
    label: m.targetLevel,
    date: fromISODate(m.targetDate),
    plannedLessons: cumByLevel.get(m.targetLevel) ?? 0,
    achieved: Boolean(m.achievedAt),
  }));

  const onChangeDate = async (iso: string) => {
    if (!iso) return;
    await setTargetExamDate(iso);
    reload();
  };

  const onReset = async () => {
    if (!confirm("Reset all progress and demo data back to the initial seed?")) return;
    await resetAll();
    reload();
  };

  return (
    <>
      <PageHead
        title="1-year timeline"
        badge={<Badge variant={status.label === "behind" ? "default" : "good"} dot>{status.label}</Badge>}
        sub="Your planned trajectory from today to the exam, and how your actual progress compares."
      />

      <div className="grid grid--stats" style={{ marginBottom: 24 }}>
        <Card>
          <Stat label="Exam date" value={formatShort(fromISODate(user.targetExamDate))} meta={`${daysUntilExam(user.targetExamDate)} days away`} />
        </Card>
        <Card>
          <Stat label="Plan length" value={`${points.length - 1} wks`} meta={`${totalLessonCount()} lessons total`} />
        </Card>
        <Card>
          <Stat
            label="Plan status"
            value={status.label}
            meta={status.deltaLessons === 0 ? "matching the plan" : `${Math.abs(status.deltaLessons)} lessons ${status.label}`}
          />
        </Card>
      </div>

      <Card
        title="Progress vs. plan"
        hint="Cumulative lessons over the year"
        actions={
          <label className="row" style={{ gap: 8, fontSize: "0.85rem" }}>
            <span className="muted">Exam date</span>
            <input
              type="date"
              defaultValue={user.targetExamDate}
              onChange={(e) => onChangeDate(e.target.value)}
              style={{ font: "inherit", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-1)", color: "var(--text-primary)" }}
            />
          </label>
        }
      >
        <TimelineChart points={points} milestones={chartMilestones} maxLessons={totalLessonCount()} today={today()} />
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card title="Milestones" hint="End-of-level checkpoints across the plan">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 0" }}>Level</th>
                <th style={{ textAlign: "left" }}>Target date</th>
                <th style={{ textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m) => (
                <tr key={m.id ?? m.label} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 0" }}>
                    <Badge variant="accent">{m.targetLevel}</Badge>
                  </td>
                  <td>{formatShort(fromISODate(m.targetDate))}</td>
                  <td>
                    {m.achievedAt ? (
                      <Badge variant="good" dot>Reached {formatShort(fromISODate(m.achievedAt))}</Badge>
                    ) : (
                      <span className="muted">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Button variant="ghost" onClick={onReset}>Reset demo data</Button>
      </div>
    </>
  );
}

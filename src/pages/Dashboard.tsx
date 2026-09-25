// =============================================================================
// src/pages/Dashboard.tsx
// The progress dashboard: headline stats, per-level mastery, the 1-year
// timeline chart, and upcoming milestones. All data comes from IndexedDB.
// =============================================================================

import { Card, ErrorState, PageHead, ProgressRow, Spinner, Stat, Badge } from "../ui/components.js";
import { TimelineChart } from "../ui/TimelineChart.js";
import type { ChartMilestone } from "../ui/TimelineChart.js";
import { useAsync } from "../hooks/useAsync.js";
import {
  getMilestones,
  getProgressMap,
  getStudySessions,
  getUser,
} from "../db/repositories.js";
import { levelProgress, overallStats, daysUntilExam } from "../progress/selectors.js";
import { buildTimeline, lessonsPerLevel, planStatus, totalLessonCount } from "../progress/timeline.js";
import { fromISODate, formatShort, today } from "../util/date.js";
import type { LessonProgressRecord, MilestoneRecord, StudySessionRecord, UserRecord } from "../db/store.js";

interface Bundle {
  user: UserRecord;
  progress: Map<string, LessonProgressRecord>;
  sessions: StudySessionRecord[];
  milestones: MilestoneRecord[];
}

/** Cumulative lesson count through the end of each level. */
function cumulativeLessonsByLevel(): Map<string, number> {
  const map = new Map<string, number>();
  let running = 0;
  for (const { level, count } of lessonsPerLevel()) {
    running += count;
    map.set(level, running);
  }
  return map;
}

export function Dashboard() {
  const { loading, error, value, reload } = useAsync<Bundle>(async () => {
    const [user, progress, sessions, milestones] = await Promise.all([
      getUser(),
      getProgressMap(),
      getStudySessions(),
      getMilestones(),
    ]);
    return { user, progress, sessions, milestones };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!value) return null;

  const { user, progress, sessions, milestones } = value;

  const stats = overallStats(progress, sessions);
  const levels = levelProgress(progress);
  const points = buildTimeline(user, [...progress.values()]);
  const status = planStatus(points);
  const daysLeft = daysUntilExam(user.targetExamDate);
  const cumByLevel = cumulativeLessonsByLevel();

  const chartMilestones: ChartMilestone[] = milestones.map((m) => ({
    label: m.targetLevel,
    date: fromISODate(m.targetDate),
    plannedLessons: cumByLevel.get(m.targetLevel) ?? 0,
    achieved: Boolean(m.achievedAt),
  }));

  const upcoming = milestones
    .filter((m) => !m.achievedAt)
    .slice(0, 4);

  const statusVariant = status.label === "behind" ? "default" : "good";
  const statusText =
    status.label === "on track"
      ? "On track"
      : status.label === "ahead"
        ? `${status.deltaLessons} lesson${status.deltaLessons === 1 ? "" : "s"} ahead`
        : `${Math.abs(status.deltaLessons)} lesson${status.deltaLessons === -1 ? "" : "s"} behind`;

  return (
    <>
      <PageHead
        title={`Ciao, ${user.displayName}`}
        badge={<Badge variant={statusVariant} dot>{statusText}</Badge>}
        sub={`Targeting CLI Pisa on ${formatShort(fromISODate(user.targetExamDate))} — ${daysLeft} days to go.`}
      />

      <div className="grid grid--stats" style={{ marginBottom: 24 }}>
        <Card>
          <Stat label="Overall mastery" value={`${stats.masteryPct}%`} meta={`${stats.lessonsCompleted} of ${stats.lessonsTotal} lessons`} />
        </Card>
        <Card>
          <Stat label="Study streak" value={`${stats.streakDays}🔥`} meta="consecutive days" />
        </Card>
        <Card>
          <Stat label="Time invested" value={`${Math.round(stats.totalMinutes / 60)}h`} meta={`${stats.totalMinutes} minutes total`} />
        </Card>
        <Card>
          <Stat label="XP earned" value={stats.totalXp.toLocaleString()} meta="+3 XP per minute" />
        </Card>
      </div>

      <div className="grid grid--2" style={{ marginBottom: 24 }}>
        <Card title="Level mastery" hint="Lessons completed per CEFR level">
          <div className="stack">
            {levels.map((l) => (
              <ProgressRow key={l.code} label={l.code} pct={l.pct} meta={`${l.completed}/${l.total}`} />
            ))}
          </div>
        </Card>

        <Card title="Upcoming milestones" hint="Your next checkpoints on the plan">
          {upcoming.length === 0 ? (
            <p className="muted">All milestones reached. In gamba! 🎉</p>
          ) : (
            <div className="milestone-list">
              {upcoming.map((m) => (
                <div className="milestone" key={m.id ?? m.label}>
                  <Badge variant="accent">{m.targetLevel}</Badge>
                  <span style={{ flex: 1 }}>{m.label}</span>
                  <span className="milestone__date">{formatShort(fromISODate(m.targetDate))}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="1-year timeline" hint="Cumulative lessons: completed vs. planned trajectory">
        <TimelineChart points={points} milestones={chartMilestones} maxLessons={totalLessonCount()} today={today()} />
      </Card>
    </>
  );
}

// =============================================================================
// src/pages/Dashboard.tsx
// The progress dashboard: headline stats, per-level mastery, the 1-year
// timeline chart, and upcoming milestones. All data comes from IndexedDB.
// =============================================================================

import { Card, ErrorState, PageHead, ProgressRow, Spinner, Stat, Badge } from "../ui/components.js";
import { Link } from "react-router-dom";
import { TimelineChart } from "../ui/TimelineChart.js";
import type { ChartMilestone } from "../ui/TimelineChart.js";
import { useAsync } from "../hooks/useAsync.js";
import {
  getMilestones,
  getMistakes,
  getProgressMap,
  getStudySessions,
  getUser,
  getVocab,
} from "../db/repositories.js";
import { levelProgress, overallStats, daysUntilExam } from "../progress/selectors.js";
import { nextLesson } from "../progress/gating.js";
import { dueReviews } from "../progress/review.js";
import { computeAchievements, earnedCount } from "../data/achievements.js";
import { buildTimeline, lessonsPerLevel, planStatus, totalLessonCount } from "../progress/timeline.js";
import { fromISODate, formatShort, today } from "../util/date.js";
import type { LessonProgressRecord, MilestoneRecord, MistakeRecord, StudySessionRecord, UserRecord, VocabRecord } from "../db/store.js";

interface Bundle {
  user: UserRecord;
  progress: Map<string, LessonProgressRecord>;
  sessions: StudySessionRecord[];
  milestones: MilestoneRecord[];
  vocab: VocabRecord[];
  mistakes: MistakeRecord[];
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
    const [user, progress, sessions, milestones, vocab, mistakes] = await Promise.all([
      getUser(),
      getProgressMap(),
      getStudySessions(),
      getMilestones(),
      getVocab(),
      getMistakes(),
    ]);
    return { user, progress, sessions, milestones, vocab, mistakes };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!value) return null;

  const { user, progress, sessions, milestones, vocab, mistakes } = value;

  const stats = overallStats(progress, sessions);
  const levels = levelProgress(progress);
  const points = buildTimeline(user, [...progress.values()]);
  const status = planStatus(points);
  const daysLeft = daysUntilExam(user.targetExamDate);
  const cumByLevel = cumulativeLessonsByLevel();
  const next = nextLesson(progress);
  const due = dueReviews(progress);

  const achievementCtx = {
    lessonsPassed: stats.lessonsCompleted,
    levelsCompleted: levels.filter((l) => l.total > 0 && l.pct === 100).length,
    streakDays: stats.streakDays,
    vocabCount: vocab.length,
    vocabMastered: vocab.filter((v) => (v.box || 1) >= 5).length,
    mistakesLogged: mistakes.length,
    totalMinutes: stats.totalMinutes,
  };
  const achievements = computeAchievements(achievementCtx);
  const achCount = earnedCount(achievementCtx);

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

      <div style={{ marginBottom: 24 }}>
        {next ? (
          <Link to="/curriculum" className="continue" aria-label={`Continue: ${next.title}`}>
            <span className="next-up__label">Continue learning</span>
            <Badge variant="accent">{next.level}</Badge>
            <strong style={{ flex: 1 }}>{next.title}</strong>
            <span className="continue__cta">Go to lesson →</span>
          </Link>
        ) : (
          <div className="next-up next-up--done">
            <strong>🎉 You've passed every lesson.</strong>
            <span className="muted"> Keep them sharp with the drill and mock exam.</span>
          </div>
        )}
      </div>

      <div className="grid grid--2" style={{ marginBottom: 24 }}>
        <Card title="Level mastery" hint="Lessons completed per CEFR level">
          <div className="stack">
            {levels.map((l) => (
              <ProgressRow key={l.code} label={l.code} pct={l.pct} meta={`${l.completed}/${l.total}`} />
            ))}
          </div>
        </Card>

        <Card title="Due for review" hint="Passed lessons ready for a spaced refresh">
          {due.length === 0 ? (
            <p className="muted">Nothing due right now. Passed lessons resurface here on an expanding schedule (1, 3, 7, 16, 35, 90 days).</p>
          ) : (
            <div className="milestone-list">
              {due.slice(0, 5).map((d) => (
                <Link className="milestone milestone--link" key={d.slug} to="/curriculum">
                  <Badge variant="accent">{d.level}</Badge>
                  <span style={{ flex: 1 }}>{d.title}</span>
                  <span className="milestone__date">{d.daysOverdue === 0 ? "today" : `${d.daysOverdue}d overdue`}</span>
                </Link>
              ))}
            </div>
          )}
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

      <div style={{ marginTop: 24 }}>
        <Card title="Achievements" hint={`${achCount.earned} of ${achCount.total} unlocked`}>
          <div className="ach-grid">
            {achievements.map((a) => (
              <div className={`ach${a.earned ? " ach--earned" : ""}`} key={a.id} title={a.description}>
                <div className="ach__icon">{a.icon}</div>
                <div>
                  <div className="ach__title">{a.title}</div>
                  <div className="ach__desc">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

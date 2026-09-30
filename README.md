# Impara — Italian A0→B2 Web App (CLI Pisa track)

A production-grade Italian learning platform for students targeting **CLI Pisa** proficiency,
covering the full CEFR span **A0 → B2**.

This repository is being built in four sequential phases:

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Database schema, A0–B2 curriculum data model, verb conjugation engine | ✅ Delivered |
| 2 | Core UI system, responsive layout, progress dashboard (1-year timeline) | ✅ Delivered |
| 3 | Interactive quiz engine + Web Speech API (TTS/STT pronunciation) | ✅ Delivered |
| 4 | CLI-Pisa-style standardized exam module + error-handling stress test | ✅ Delivered |
| 5 | Depth pack: grammar cheat-sheets, conjugation drill, Leitner vocabulary, phrasebook, free-only toolkit, culture/missions/can-do guide, expandable lessons | ✅ Delivered |

## Tech stack

- **Language:** TypeScript (strict mode) — pure, isomorphic (browser + Node).
- **UI:** React 18 + Vite. Client-only SPA (HashRouter), no backend required.
- **Data (client):** IndexedDB via a small typed wrapper (`src/db`), mirroring the SQL schema's shape.
- **Database (server-ready):** SQL schema authored SQLite-first, Postgres-compatible (see `db/schema.sql`).
- **Conjugation engine:** zero-dependency, deterministic, unit-tested.
- **Charts:** hand-built SVG (no chart library), validated data-viz palette, light + dark.

## Layout (Phase 1)

```
italian-app/
├── db/
│   └── schema.sql            # Full relational schema for all four phases
├── src/
│   ├── types/
│   │   └── index.ts          # Domain types (curriculum, verbs, morphology)
│   ├── data/
│   │   ├── curriculum.ts     # A0–B2 curriculum tree (levels → units → lessons)
│   │   ├── irregulars.ts     # Irregular verb paradigms (16 high-frequency verbs)
│   │   └── verbs.ts          # Verb lexicon with CEFR tagging + aux selection
│   └── engine/
│       ├── conjugator.ts     # The conjugation engine
│       └── conjugator.test.ts# Golden-value test suite
├── package.json
├── tsconfig.json
└── README.md
```

## Getting started

```bash
cd italian-app
npm install
npm run dev            # start the Vite dev server (opens the app)
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run build          # typecheck + production build to dist/
```

The app is client-only: on first load it seeds a demo learner (a 1-year plan
with three weeks of sample progress) into IndexedDB, so the dashboard and
timeline render with data immediately. Use **Reset demo data** on the Timeline
page to wipe it and re-seed.

### Phase 2 layout (UI + data)

```
src/
├── main.tsx                  # React entry
├── app/App.tsx               # routes + shell (HashRouter)
├── ui/
│   ├── theme.css             # design tokens (light/dark) + all component styles
│   ├── components.tsx        # Card, Stat, ProgressBar, Badge, Button, Segmented…
│   ├── AppShell.tsx          # responsive sidebar/drawer + theme toggle
│   └── TimelineChart.tsx     # SVG planned-vs-actual timeline (hover + a11y table)
├── db/
│   ├── idb.ts                # promise-based IndexedDB wrapper
│   ├── store.ts              # object stores, open, first-run seeding
│   └── repositories.ts       # app-facing data access (user/progress/sessions…)
├── progress/
│   ├── timeline.ts           # 1-year plan + planned/actual series
│   └── selectors.ts          # level mastery, streaks, headline stats
├── hooks/useAsync.ts         # async data hook with reload
├── util/date.ts              # ISO-date helpers
└── pages/
    ├── Dashboard.tsx         # stats + level mastery + timeline + milestones
    ├── CurriculumBrowser.tsx # A0→B2 tree, mark lessons complete
    └── Timeline.tsx          # full plan view, editable exam date, milestones
```

### Phase 3 layout (quiz + speech)

```
src/
├── quiz/
│   ├── types.ts              # question union + responses + result summary
│   ├── text.ts               # normalise / Levenshtein / similarity / matchAnswer
│   ├── rng.ts                # seedable PRNG (reproducible quizzes)
│   ├── generator.ts          # builds a CEFR-gated mix of all 5 question types
│   ├── grader.ts             # grades each type; pronunciation similarity scoring
│   └── quiz.test.ts          # generation + grading + text tests
├── speech/speech.ts          # Web Speech API: TTS + STT, feature-detected
├── hooks/useSpeech.ts        # React bindings for speak()/listen() with state
├── ui/quiz/QuizRunner.tsx    # runs a quiz, per-type rendering + inline feedback
└── pages/Quiz.tsx            # setup → runner → results (persists to IndexedDB)
```

Question types: **multiple choice**, **conjugation** (typed, graded via the
Phase 1 engine), **fill-the-blank**, **pronunciation** (speak → STT scoring),
and **listening** (TTS playback → choose). Typed answers accept minor typos and
flag missing accents. Speech features degrade gracefully where the browser
lacks support (Firefox has no STT; the UI says so and still shows targets).

### Phase 4 layout (exam + stress test)

```
src/
├── exam/
│   ├── types.ts              # weighted-section exam model
│   ├── content.ts            # authored passages / listening scripts / prompts
│   ├── builder.ts            # assembles Ascolto/Lettura/Strutture/Produzione
│   ├── grader.ts             # objective key + heuristic production scoring
│   └── exam.test.ts          # build + grade tests
├── stress/
│   ├── harness.ts            # 7-suite fuzz/edge/malformed stress test (pure)
│   └── harness.test.ts       # asserts the app passes its own harness
├── ui/exam/ExamRunner.tsx    # timed, section-aware runner
└── pages/
    ├── Exam.tsx              # setup → timed exam → weighted results + self-assess
    └── Diagnostics.tsx       # runs the stress harness, renders the report
```

**Exam module** — a CLI-Pisa-style test weighted like the real thing (Ascolto 25,
Lettura 25, Strutture 25, Produzione scritta 15, Produzione orale 10), under a
global countdown, 60% pass mark. Objective sections auto-grade against a key;
production sections are scored by a length/engagement heuristic (a proxy, not an
examiner's judgement) with a self-assessment slider to override. Strutture items
are generated by the Phase 1/3 engine so answers are always correct.

**Stress test** — `runStressTest()` fuzzes seven subsystems (full conjugation
coverage over every verb, malformed-verb handling, bulk quiz generation, grader
robustness against garbage/huge/emoji input, text-matching edge cases, exam
build+grade, degenerate timeline windows) and returns a structured report. It's
pure, so it runs both in the **Diagnostics** page and under Vitest — where the
suite asserts zero failures.

> **Note on persistence scope:** exam attempts are graded and shown in-session;
> the SQL schema (`db/schema.sql`) has full `exams` / `exam_sessions` /
> `exam_answers` tables for the server-backed deployment. Quiz results and
> pronunciation attempts *are* persisted client-side (IndexedDB v2).

### Phase 5 layout (depth pack)

Everything in Phase 5 is **additive** — new data files, new pages, new routes, and
new IndexedDB stores (bumped to **v3**), with no changes to the Phase 1 domain
types or curriculum. That keeps build risk low and the earlier phases untouched.

```
src/
├── data/
│   ├── grammar.ts            # 15 cheat-sheet topics A0→B2 (tables, traps, tips)
│   ├── coreVocab.ts          # ~140 themed, CEFR-tagged seed words
│   ├── phrasebook.ts         # 10 situational phrase groups (bar, renting, doctor…)
│   ├── resources.ts          # free-only toolkit, each with an honest cost flag
│   ├── culture.ts            # daily-life & culture notes (the unwritten rules)
│   ├── missions.ts           # real-world things to go and do, by CEFR level
│   ├── canDo.ts              # CEFR "I can…" self-assessment statements
│   ├── lessonChecks.ts       # graded per-lesson check questions (gate the next lesson)
│   ├── achievements.ts       # badge definitions + pure earned-state computation
│   └── lessonDetail.ts       # per-lesson grammar/trap/examples/mission/culture/proof
├── vocab/srs.ts              # Leitner spaced-repetition (boxes 1–5, weighted picks)
├── quiz/drill.ts             # conjugation drill prompts + strict diagnosis engine
├── progress/gating.ts        # sequential grade-gated unlock (pure)
├── progress/review.ts        # spaced-review scheduler for passed lessons (pure)
├── ui/LessonCheckRunner.tsx  # the graded check UI that unlocks the next lesson
└── pages/
    ├── Grammar.tsx           # expandable cheat-sheets, level filter, → drill links
    ├── Listening.tsx         # listening lab: dictation + comprehension (TTS)
    ├── Drill.tsx             # tense-filtered conjugation drill with diagnosis + TTS
    ├── Vocabulary.tsx        # Leitner vocab: add, seed core pack, quiz, CSV export
    ├── Review.tsx            # practise the mistakes logged in the drill (flashcards + list)
    ├── Writing.tsx           # composition workshop: prompts, rubric, model answers
    ├── Verbs.tsx             # full conjugation tables for any verb (engine-generated)
    ├── Phrasebook.tsx        # searchable situational phrases, TTS on every line
    ├── Resources.tsx         # grouped free toolkit with Free / Sign-up / Free-tier flags
    ├── Guide.tsx             # culture + can-do checklist + missions (localStorage state)
    └── Settings.tsx          # display name, exam date, reset-all danger zone
```

**Free-only toolkit** — resources are curated to be genuinely usable for free.
Each carries an honest cost flag: **Free**, **Free · sign-up**, or **Free tier**
(freemium — flagged so nothing is mis-sold, with a note on the catch).

**Leitner vocabulary** — words move through five boxes as you recall them; quizzes
are weighted toward your weak words, and you can export to CSV for Anki. Persisted
in the new `vocab` store. The conjugation drill logs misses to a `mistakes` store.

**Expandable lessons** — every lesson in the Curriculum now opens to reveal a
grammar note, worked examples (with audio), the trap to avoid, a real-world
mission, a culture note, a "say it from memory" line, and links to the matching
cheat-sheet and free resources.

**Grade-gated unlocking** — every lesson ends in a short **lesson check** (3–5
questions, mixing multiple-choice with typed conjugation/translation, graded
leniently on case and accents). Lessons unlock in order: the next one opens only
once you pass the current check at **≥ 70%**, which also gates levels (clearing
A0's last lesson unlocks A1). Passing marks the lesson completed and stores your
score; a below-mark attempt is kept as *in progress* and keeps the next lesson
locked. Retaking never re-locks — your best score is kept. A "Next up" banner
points at the first lesson you still owe. Gating logic lives in
`src/progress/gating.ts` (pure); check content in `src/data/lessonChecks.ts`; the
new `recordLessonCheck` repository call persists attempts.

**Navigation** is grouped into **Learn / Practise / Reference / Plan** sections.

**Review (mistakes practice)** — the conjugation drill's "Log to my mistakes"
writes to a `mistakes` store; the Review page turns those into flashcards (recall
the correct form, then remove it once it sticks) and a searchable list, both with
audio. `src/pages/Review.tsx`.

**Listening questions** — lesson checks can include a listen-and-type question
(`listen: true`): the app speaks the Italian and you type what you hear, with a
graceful text fallback where the browser has no speech synthesis.

**Achievements** — 15 badges (lessons passed, levels finished, study streaks,
vocabulary logged and mastered, hours invested) shown on the Dashboard. Purely
derived from existing numbers in `src/data/achievements.ts`, so they never need
their own storage and can't drift out of sync.

**Listening lab** — a dedicated page (Learn → Listening) with two exercise types:
**dictation** (hear a sentence, type it back, graded leniently) and
**comprehension** (hear a short passage, answer a question). Audio is generated
with the Web Speech API — no audio files ship — and falls back to on-screen text
where a browser lacks speech synthesis. Content in `src/data/listening.ts`.

**Spaced-review scheduler** — passing a lesson stamps `lastReviewedAt` and bumps a
`reviewCount`; `src/progress/review.ts` turns those into an expanding interval
(1 → 3 → 7 → 16 → 35 → 90 days) and surfaces lessons that are due for a refresh,
both as a "Due for review" card on the Dashboard and a "↻ Review" chip in the
curriculum. Retaking a due lesson's check resets its clock. These are optional
record fields — no database version bump.

**Deeper grammar** — the cheat-sheet library gains nine more topics: articles,
plurals, adjective agreement, prepositions (simple + articulated), direct-object
pronouns, ci/ne, comparatives/superlatives, the imperative, and passato prossimo
vs imperfetto.

**Verb tables** — a reference page (Reference → Verb tables) that generates the
full paradigm of any verb in the lexicon with the Phase 1 engine: every indicative,
subjunctive, conditional and imperative tense, plus non-finite forms. Search by
Italian or English; tap any form to hear it.

**Writing workshop** — a composition page (Practise → Writing) with level-graded
prompts, a "make sure you include" rubric, a live word count against a target, and
a model answer to reveal and compare. Your drafts are saved locally as you type.
Content in `src/data/writingPrompts.ts`.

**Settings** — a settings page (Plan → Settings) to edit your display name and
target exam date, and a danger zone to reset all progress back to a clean start.

**Cloud accounts (optional)** — with Supabase configured, the app requires sign-up /
sign-in and stores each user's progress privately in the cloud, synced across
devices; without it, the app runs local-only (no login, one browser). The whole
local dataset is snapshotted to a per-user row (row-level security keeps it
private) on login-pull / background-push. Auth lives in `src/auth/`, the client and
sync in `src/cloud/`. Includes **forgot-password / reset** via email. **Setup: see
[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).**

**Onboarding survey** — on first run / right after sign-up, a short survey collects
name, current level, goal, daily time, and target test date (`src/pages/Onboarding.tsx`,
gated by `src/auth/OnboardingGate.tsx`). It's saved to the user record and shown once.

**Start from any level** — the chosen entry level drives unlocking: lessons in levels
below it are "placed out" (open for review, not required, and they don't block the
first lesson of your level). Nothing is faked as completed — placed-out lessons
don't count toward mastery. You can change your level anytime in Settings.

### Initialise the database (SQLite)

```bash
sqlite3 impara.db < db/schema.sql
```

For Postgres, the schema is compatible after swapping the storage note lines flagged
`-- [PG]` in `db/schema.sql` (documented inline).

## The conjugation engine

`src/engine/conjugator.ts` conjugates any Italian verb across:

- **Moods:** indicative, subjunctive, conditional, imperative + non-finite (infinitive, gerund, participle).
- **Simple tenses:** presente, imperfetto, passato remoto, futuro semplice, congiuntivo presente/imperfetto, condizionale presente.
- **Compound tenses:** passato prossimo, trapassato prossimo, trapassato remoto, futuro anteriore, congiuntivo passato/trapassato, condizionale passato — auto-built from the correct auxiliary (`essere`/`avere`) + past participle, with optional gender/number agreement.

It handles the three regular conjugation classes (`-are`, `-ere`, `-ire`), the `-isc-`
infix class (`capire`), `-care/-gare/-ciare/-giare/-iare` orthographic rules, and a
16-verb irregular override table. Unknown irregulars degrade gracefully to regular
generation and are flagged via the `isRegular` field on the result.

```ts
import { conjugate, conjugateAll } from "./src/engine/conjugator";
import { VERBS } from "./src/data/verbs";

conjugate(VERBS.essere, { mood: "indicativo", tense: "presente" });
// → ["sono", "sei", "è", "siamo", "siete", "sono"]

conjugateAll(VERBS.parlare); // full paradigm object
```

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

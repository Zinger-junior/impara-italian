-- =============================================================================
-- Impara — Italian A0→B2 Web App :: Relational Schema
-- Target: CLI Pisa proficiency track
--
-- Authored SQLite-first, PostgreSQL-compatible.
-- Portability notes are flagged inline with `-- [PG]`.
--   * SQLite: leave as-is. Uses INTEGER PRIMARY KEY AUTOINCREMENT + TEXT timestamps.
--   * Postgres: replace `INTEGER PRIMARY KEY AUTOINCREMENT` with `BIGSERIAL PRIMARY KEY`,
--     `TEXT` CHECK-enum columns are portable, and `datetime('now')` with `now()`.
--
-- Covers: curriculum (Phase 1), progress/timeline (Phase 2),
--         quizzes/pronunciation (Phase 3), standardized exams (Phase 4).
-- =============================================================================

PRAGMA foreign_keys = ON;                              -- [PG] omit (FKs enforced by default)

-- -----------------------------------------------------------------------------
-- 1. IDENTITY & ACCOUNTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT, -- [PG] BIGSERIAL PRIMARY KEY
    email              TEXT NOT NULL UNIQUE,
    display_name       TEXT NOT NULL,
    password_hash      TEXT NOT NULL,
    native_language    TEXT NOT NULL DEFAULT 'en',
    -- CEFR entry level the learner self-declared or was placement-tested into.
    entry_cefr_level   TEXT NOT NULL DEFAULT 'A0'
                         CHECK (entry_cefr_level IN ('A0','A1','A2','B1','B2')),
    -- Target exam date; drives the 1-year timeline in Phase 2.
    target_exam_date   TEXT,
    timezone           TEXT NOT NULL DEFAULT 'Europe/Rome',
    created_at         TEXT NOT NULL DEFAULT (datetime('now')), -- [PG] now()
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- -----------------------------------------------------------------------------
-- 2. CURRICULUM STRUCTURE  (Phase 1)
--    cefr_levels → units → lessons → {vocabulary, grammar_topics, exercises}
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cefr_levels (
    code               TEXT PRIMARY KEY
                         CHECK (code IN ('A0','A1','A2','B1','B2')),
    title              TEXT NOT NULL,
    description        TEXT NOT NULL,
    -- Ordinal position for sequencing (A0=0 … B2=4).
    sort_order         INTEGER NOT NULL UNIQUE,
    -- Recommended study hours to complete this level (CLI Pisa pacing guidance).
    recommended_hours  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS units (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    level_code         TEXT NOT NULL REFERENCES cefr_levels(code) ON DELETE CASCADE,
    slug               TEXT NOT NULL,                     -- URL-safe, unique within level
    title              TEXT NOT NULL,
    summary            TEXT NOT NULL DEFAULT '',
    sort_order         INTEGER NOT NULL,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (level_code, slug),
    UNIQUE (level_code, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_units_level ON units(level_code, sort_order);

CREATE TABLE IF NOT EXISTS lessons (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id            INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    slug               TEXT NOT NULL,
    title              TEXT NOT NULL,
    objective          TEXT NOT NULL DEFAULT '',          -- "Can-do" statement
    -- Estimated minutes to complete; feeds the timeline planner in Phase 2.
    estimated_minutes  INTEGER NOT NULL DEFAULT 15,
    sort_order         INTEGER NOT NULL,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (unit_id, slug),
    UNIQUE (unit_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id, sort_order);

-- -----------------------------------------------------------------------------
-- 3. LEXICON: VOCABULARY & VERBS  (Phase 1)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vocabulary (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    lemma              TEXT NOT NULL,                     -- Italian headword
    translation        TEXT NOT NULL,                     -- Learner-language gloss
    part_of_speech     TEXT NOT NULL
                         CHECK (part_of_speech IN
                           ('noun','verb','adjective','adverb','pronoun',
                            'preposition','conjunction','article','interjection',
                            'numeral','phrase')),
    gender             TEXT CHECK (gender IN ('m','f','mf',NULL)),   -- nouns/adjectives
    -- Example sentence + gloss for context.
    example_it         TEXT,
    example_gloss      TEXT,
    ipa                TEXT,                              -- phonetic hint for TTS/STT (Phase 3)
    cefr_level         TEXT NOT NULL
                         CHECK (cefr_level IN ('A0','A1','A2','B1','B2')),
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (lemma, part_of_speech, cefr_level)
);

CREATE INDEX IF NOT EXISTS idx_vocab_level ON vocabulary(cefr_level);
CREATE INDEX IF NOT EXISTS idx_vocab_lemma ON vocabulary(lemma);

-- Verb lexicon. The conjugation engine can generate paradigms on the fly, so this
-- table stores lexical metadata, not every inflected form.
CREATE TABLE IF NOT EXISTS verbs (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    infinitive         TEXT NOT NULL UNIQUE,
    translation        TEXT NOT NULL,
    conjugation_class  TEXT NOT NULL
                         CHECK (conjugation_class IN ('are','ere','ire','ire-isc')),
    -- Auxiliary used in compound tenses.
    auxiliary          TEXT NOT NULL DEFAULT 'avere'
                         CHECK (auxiliary IN ('avere','essere','both')),
    is_irregular       INTEGER NOT NULL DEFAULT 0 CHECK (is_irregular IN (0,1)),
    is_reflexive       INTEGER NOT NULL DEFAULT 0 CHECK (is_reflexive IN (0,1)),
    is_transitive      INTEGER NOT NULL DEFAULT 1 CHECK (is_transitive IN (0,1)),
    frequency_rank     INTEGER,                           -- corpus rank; NULL if unknown
    cefr_level         TEXT NOT NULL
                         CHECK (cefr_level IN ('A0','A1','A2','B1','B2')),
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_verbs_level ON verbs(cefr_level);
CREATE INDEX IF NOT EXISTS idx_verbs_class ON verbs(conjugation_class);

-- Optional persisted cache of generated conjugations. The engine is the source of
-- truth; this table exists for performance (avoiding recomputation) and for the
-- exam module, which must pin exact expected answers at authoring time.
CREATE TABLE IF NOT EXISTS conjugations (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    verb_id            INTEGER NOT NULL REFERENCES verbs(id) ON DELETE CASCADE,
    mood               TEXT NOT NULL
                         CHECK (mood IN ('indicativo','congiuntivo','condizionale',
                                         'imperativo','infinito','participio','gerundio')),
    tense              TEXT NOT NULL,                     -- e.g. 'presente','passatoProssimo'
    person             INTEGER CHECK (person BETWEEN 1 AND 6), -- 1..6; NULL for non-finite
    form               TEXT NOT NULL,                     -- the inflected string
    is_regular         INTEGER NOT NULL DEFAULT 1 CHECK (is_regular IN (0,1)),
    UNIQUE (verb_id, mood, tense, person)
);

CREATE INDEX IF NOT EXISTS idx_conj_verb ON conjugations(verb_id, mood, tense);

-- -----------------------------------------------------------------------------
-- 4. GRAMMAR TOPICS  (Phase 1)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS grammar_topics (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id          INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    slug               TEXT NOT NULL UNIQUE,
    title              TEXT NOT NULL,
    explanation_md     TEXT NOT NULL,                     -- Markdown body
    cefr_level         TEXT NOT NULL
                         CHECK (cefr_level IN ('A0','A1','A2','B1','B2')),
    -- For verb-tense topics, link the grammatical mood/tense the topic teaches.
    related_mood       TEXT,
    related_tense      TEXT,
    sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar_topics(cefr_level);

-- Many-to-many join: which vocabulary/verbs a lesson introduces.
CREATE TABLE IF NOT EXISTS lesson_vocabulary (
    lesson_id          INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    vocabulary_id      INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS lesson_verbs (
    lesson_id          INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    verb_id            INTEGER NOT NULL REFERENCES verbs(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, verb_id)
);

-- -----------------------------------------------------------------------------
-- 5. EXERCISES & QUIZZES  (Phase 3)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exercises (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id          INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    kind               TEXT NOT NULL
                         CHECK (kind IN ('multiple_choice','fill_blank','conjugation',
                                         'translation','listening','pronunciation',
                                         'matching','ordering')),
    prompt             TEXT NOT NULL,
    -- JSON payload: options, blanks, expected answers, tolerances.
    payload_json       TEXT NOT NULL DEFAULT '{}',
    correct_answer     TEXT NOT NULL,
    explanation        TEXT,
    difficulty         INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    cefr_level         TEXT NOT NULL
                         CHECK (cefr_level IN ('A0','A1','A2','B1','B2')),
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exercises_kind ON exercises(kind);

CREATE TABLE IF NOT EXISTS quizzes (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id          INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    title              TEXT NOT NULL,
    -- Passing threshold as a percentage (0-100).
    pass_threshold     INTEGER NOT NULL DEFAULT 70 CHECK (pass_threshold BETWEEN 0 AND 100),
    time_limit_seconds INTEGER,                           -- NULL = untimed
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    quiz_id            INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    exercise_id        INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sort_order         INTEGER NOT NULL,
    points             INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (quiz_id, exercise_id)
);

-- -----------------------------------------------------------------------------
-- 6. PROGRESS TRACKING & TIMELINE  (Phase 2)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_lesson_progress (
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id          INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status             TEXT NOT NULL DEFAULT 'not_started'
                         CHECK (status IN ('not_started','in_progress','completed')),
    score_pct          INTEGER CHECK (score_pct BETWEEN 0 AND 100),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    started_at         TEXT,
    completed_at       TEXT,
    updated_at         TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_lesson_progress(user_id, status);

-- Denormalised per-level rollup for fast dashboard rendering.
CREATE TABLE IF NOT EXISTS user_level_progress (
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_code         TEXT NOT NULL REFERENCES cefr_levels(code) ON DELETE CASCADE,
    lessons_completed  INTEGER NOT NULL DEFAULT 0,
    lessons_total      INTEGER NOT NULL DEFAULT 0,
    mastery_pct        INTEGER NOT NULL DEFAULT 0 CHECK (mastery_pct BETWEEN 0 AND 100),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, level_code)
);

-- Daily study log; powers streaks and the 1-year timeline chart.
CREATE TABLE IF NOT EXISTS study_sessions (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    study_date         TEXT NOT NULL,                     -- ISO date (YYYY-MM-DD)
    minutes            INTEGER NOT NULL DEFAULT 0,
    xp_earned          INTEGER NOT NULL DEFAULT 0,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, study_date)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, study_date);

-- Milestones on the 1-year plan (e.g. "Finish A2 by month 6").
CREATE TABLE IF NOT EXISTS timeline_milestones (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label              TEXT NOT NULL,
    target_level       TEXT REFERENCES cefr_levels(code),
    target_date        TEXT NOT NULL,                     -- ISO date
    achieved_at        TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_milestones_user ON timeline_milestones(user_id, target_date);

-- Spaced-repetition scheduling (SM-2 style) for vocab/verb review.
CREATE TABLE IF NOT EXISTS srs_reviews (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type          TEXT NOT NULL CHECK (item_type IN ('vocabulary','verb')),
    item_id            INTEGER NOT NULL,                  -- FK enforced in application layer (polymorphic)
    ease_factor        REAL NOT NULL DEFAULT 2.5,
    interval_days      INTEGER NOT NULL DEFAULT 0,
    repetitions        INTEGER NOT NULL DEFAULT 0,
    due_date           TEXT NOT NULL,                     -- ISO date
    last_reviewed_at   TEXT,
    UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_reviews(user_id, due_date);

-- -----------------------------------------------------------------------------
-- 7. PRONUNCIATION ATTEMPTS  (Phase 3 — Web Speech API)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pronunciation_attempts (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id      INTEGER REFERENCES vocabulary(id) ON DELETE SET NULL,
    target_text        TEXT NOT NULL,                     -- what the learner should say
    recognized_text    TEXT,                              -- STT transcript
    -- 0-100 similarity of recognized vs target (computed app-side).
    accuracy_pct       INTEGER CHECK (accuracy_pct BETWEEN 0 AND 100),
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pron_user ON pronunciation_attempts(user_id);

-- -----------------------------------------------------------------------------
-- 8. STANDARDIZED EXAM MODULE  (Phase 4 — CLI Pisa style)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exams (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    title              TEXT NOT NULL,
    cefr_level         TEXT NOT NULL
                         CHECK (cefr_level IN ('A0','A1','A2','B1','B2')),
    -- CLI Pisa exams are structured into skill sections.
    total_minutes      INTEGER NOT NULL DEFAULT 90,
    pass_threshold     INTEGER NOT NULL DEFAULT 60 CHECK (pass_threshold BETWEEN 0 AND 100),
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exam_sections (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id            INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    skill              TEXT NOT NULL
                         CHECK (skill IN ('ascolto','lettura','strutture',
                                          'produzione_scritta','produzione_orale')),
    title              TEXT NOT NULL,
    weight_pct         INTEGER NOT NULL CHECK (weight_pct BETWEEN 0 AND 100),
    time_minutes       INTEGER NOT NULL DEFAULT 20,
    sort_order         INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_questions (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id         INTEGER NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
    exercise_id        INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
    sort_order         INTEGER NOT NULL,
    points             INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS exam_sessions (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id            INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    status             TEXT NOT NULL DEFAULT 'in_progress'
                         CHECK (status IN ('in_progress','submitted','graded','abandoned')),
    started_at         TEXT NOT NULL DEFAULT (datetime('now')),
    submitted_at       TEXT,
    total_score_pct    INTEGER CHECK (total_score_pct BETWEEN 0 AND 100),
    passed             INTEGER CHECK (passed IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON exam_sessions(user_id, exam_id);

CREATE TABLE IF NOT EXISTS exam_answers (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id         INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id        INTEGER NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    given_answer       TEXT,
    is_correct         INTEGER CHECK (is_correct IN (0,1)),
    points_awarded     REAL NOT NULL DEFAULT 0,
    answered_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (session_id, question_id)
);

-- -----------------------------------------------------------------------------
-- 9. ERROR / EVENT LOG  (Phase 4 — stress-test observability)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS error_log (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL,
    context            TEXT NOT NULL,                     -- subsystem: 'conjugator','quiz','exam','speech'
    severity           TEXT NOT NULL DEFAULT 'error'
                         CHECK (severity IN ('info','warning','error','critical')),
    message            TEXT NOT NULL,
    payload_json       TEXT,                              -- serialized input that triggered it
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_errorlog_context ON error_log(context, severity);

-- -----------------------------------------------------------------------------
-- 10. SEED: CEFR LEVELS (static reference data)
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO cefr_levels (code, title, description, sort_order, recommended_hours) VALUES
  ('A0','Principiante assoluto','Alfabeto, suoni, saluti e sopravvivenza linguistica di base.',0,40),
  ('A1','Contatto','Frasi quotidiane, presentazioni, presente indicativo dei verbi regolari.',1,90),
  ('A2','Sopravvivenza','Passato prossimo, futuro, routine e bisogni immediati.',2,120),
  ('B1','Soglia','Congiuntivo, condizionale, opinioni ed esperienze articolate.',3,180),
  ('B2','Progresso','Discorso complesso, ipotetiche, registro formale e argomentazione.',4,220);
-- [PG] Replace `INSERT OR IGNORE` with `INSERT ... ON CONFLICT (code) DO NOTHING`.

-- =============================================================================
-- End of schema.
-- =============================================================================

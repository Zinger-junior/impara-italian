// =============================================================================
// src/app/App.tsx
// App composition:
//   AuthProvider → Gate → (onboarding) → HashRouter → AppShell → routes
// Auth (Netlify Identity) wraps everything; the Gate decides between the login
// screen and the app and hydrates the signed-in user's saved progress. A small
// SyncManager inside the router pushes progress back to the user's profile as
// they move around the app. HashRouter keeps the whole thing client-side.
// =============================================================================

import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "../ui/AppShell.js";
import { AuthProvider } from "../auth/AuthContext.js";
import { Gate } from "../auth/Gate.js";
import { scheduleSync, flushSync } from "../cloud/sync.js";
import { Dashboard } from "../pages/Dashboard.js";
import { CurriculumBrowser } from "../pages/CurriculumBrowser.js";
import { Timeline } from "../pages/Timeline.js";
import { Quiz } from "../pages/Quiz.js";
import { ExamPage } from "../pages/Exam.js";
import { Diagnostics } from "../pages/Diagnostics.js";
import { Grammar } from "../pages/Grammar.js";
import { Listening } from "../pages/Listening.js";
import { Vocabulary } from "../pages/Vocabulary.js";
import { Drill } from "../pages/Drill.js";
import { Review } from "../pages/Review.js";
import { Phrasebook } from "../pages/Phrasebook.js";
import { Resources } from "../pages/Resources.js";
import { Guide } from "../pages/Guide.js";
import { Verbs } from "../pages/Verbs.js";
import { Writing } from "../pages/Writing.js";
import { Settings } from "../pages/Settings.js";

/** Pushes progress to the signed-in profile on navigation and when hiding the tab. */
function SyncManager() {
  const location = useLocation();
  useEffect(() => {
    scheduleSync();
  }, [location.pathname]);
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flushSync();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);
  return null;
}

export function App() {
  return (
    <AuthProvider>
      <Gate>
        <HashRouter>
          <SyncManager />
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/curriculum" element={<CurriculumBrowser />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/listening" element={<Listening />} />
              <Route path="/drill" element={<Drill />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/review" element={<Review />} />
              <Route path="/writing" element={<Writing />} />
              <Route path="/exam" element={<ExamPage />} />
              <Route path="/phrasebook" element={<Phrasebook />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/verbs" element={<Verbs />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </Gate>
    </AuthProvider>
  );
}

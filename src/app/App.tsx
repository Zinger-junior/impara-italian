// =============================================================================
// src/app/App.tsx
// Route table wrapped in the responsive AppShell. HashRouter keeps the app fully
// client-side. When cloud accounts are configured, the whole app sits behind the
// auth Gate, and SyncManager keeps the signed-in user's progress backed up.
// =============================================================================

import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "../ui/AppShell.js";
import { AuthProvider } from "../auth/AuthContext.js";
import { Gate } from "../auth/Gate.js";
import { pushSnapshot, scheduleSync } from "../cloud/sync.js";
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

/** Backs up the signed-in user's data on navigation, tab-hide, and a timer. */
function SyncManager() {
  const loc = useLocation();
  useEffect(() => {
    scheduleSync();
  }, [loc.pathname]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) void pushSnapshot();
    };
    const onHide = () => void pushSnapshot();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    const iv = window.setInterval(() => void pushSnapshot(), 30000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      window.clearInterval(iv);
    };
  }, []);
  return null;
}

function AppRoutes() {
  return (
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
  );
}

export function App() {
  return (
    <AuthProvider>
      <Gate>
        <AppRoutes />
      </Gate>
    </AuthProvider>
  );
}

// =============================================================================
// src/app/App.tsx
// Route table wrapped in the responsive AppShell. HashRouter keeps the app
// fully client-side (no server rewrite rules needed for static hosting).
// =============================================================================

import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "../ui/AppShell.js";
import { Dashboard } from "../pages/Dashboard.js";
import { CurriculumBrowser } from "../pages/CurriculumBrowser.js";
import { Timeline } from "../pages/Timeline.js";
import { Quiz } from "../pages/Quiz.js";
import { ExamPage } from "../pages/Exam.js";
import { Diagnostics } from "../pages/Diagnostics.js";

export function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/curriculum" element={<CurriculumBrowser />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}

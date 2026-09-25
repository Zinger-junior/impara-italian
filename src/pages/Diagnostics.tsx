// =============================================================================
// src/pages/Diagnostics.tsx
// In-app error-handling stress test. Runs the harness against every subsystem
// and renders a pass/fail report with per-suite detail and any failing cases.
// =============================================================================

import { useState } from "react";
import { Badge, Button, Card, PageHead } from "../ui/components.js";
import { runStressTest } from "../stress/harness.js";
import type { StressReport } from "../stress/harness.js";

export function Diagnostics() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<StressReport | null>(null);

  const run = () => {
    setRunning(true);
    setReport(null);
    // Defer so the "Running…" state paints before the (synchronous) harness runs.
    setTimeout(() => {
      const result = runStressTest();
      setReport(result);
      setRunning(false);
    }, 30);
  };

  const allPass = report ? report.totalFailed === 0 : false;

  return (
    <>
      <PageHead
        title="Diagnostics"
        badge={
          report ? (
            <Badge variant={allPass ? "good" : "default"} dot>
              {allPass ? "All checks passed" : `${report.totalFailed} failed`}
            </Badge>
          ) : undefined
        }
        sub="Stress-test the engine, quiz, grader, exam, and timeline with bulk, edge, and malformed inputs."
      />

      <div style={{ marginBottom: 24 }}>
        <Button variant="primary" onClick={run} disabled={running}>
          {running ? "Running…" : report ? "Run again" : "Run stress test"}
        </Button>
      </div>

      {report && (
        <>
          <div className="grid grid--stats" style={{ marginBottom: 24 }}>
            <Card>
              <div className="stat">
                <div className="stat__label">Total checks</div>
                <div className="stat__value">{report.totalChecks.toLocaleString()}</div>
              </div>
            </Card>
            <Card>
              <div className="stat">
                <div className="stat__label">Failures</div>
                <div className="stat__value" style={{ color: allPass ? "var(--good-text)" : "var(--critical)" }}>
                  {report.totalFailed}
                </div>
              </div>
            </Card>
            <Card>
              <div className="stat">
                <div className="stat__label">Duration</div>
                <div className="stat__value">{report.durationMs} ms</div>
              </div>
            </Card>
          </div>

          <div className="stack">
            {report.suites.map((s) => {
              const ok = s.failed === 0;
              return (
                <Card key={s.name}>
                  <div className="row row--between">
                    <div className="row" style={{ gap: 10 }}>
                      <span className={`review-mark ${ok ? "review-mark--ok" : "review-mark--no"}`}>{ok ? "✓" : "✗"}</span>
                      <strong>{s.name}</strong>
                    </div>
                    <span className="muted">
                      {s.passed}/{s.total} passed · {s.durationMs} ms
                    </span>
                  </div>
                  {!ok && (
                    <ul style={{ margin: "12px 0 0", paddingLeft: 20 }}>
                      {s.failures.map((f, i) => (
                        <li key={i} className="review-given">
                          <code>{f.case}</code> — {f.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

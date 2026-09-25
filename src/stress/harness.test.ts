// =============================================================================
// src/stress/harness.test.ts
// The stress test, run under Vitest. The app must pass its own harness: zero
// failed checks across every subsystem.
// =============================================================================

import { describe, it, expect } from "vitest";
import { runStressTest } from "./harness.js";

describe("stress harness", () => {
  const report = runStressTest(1234);

  it("runs a non-trivial number of checks", () => {
    expect(report.totalChecks).toBeGreaterThan(100);
  });

  it("reports zero failures across all suites", () => {
    // If this fails, `report.suites` pinpoints the subsystem + failing cases.
    const offenders = report.suites.filter((s) => s.failed > 0);
    expect(offenders.map((s) => ({ suite: s.name, failures: s.failures }))).toEqual([]);
    expect(report.totalFailed).toBe(0);
  });

  it("covers every subsystem suite", () => {
    expect(report.suites.map((s) => s.name)).toEqual([
      "Conjugation coverage",
      "Malformed verbs",
      "Quiz generation fuzz",
      "Grader robustness",
      "Text matching",
      "Exam build & grade",
      "Timeline edge cases",
    ]);
  });
});

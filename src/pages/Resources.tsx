// =============================================================================
// src/pages/Resources.tsx
// The free-only toolkit, grouped by what you'd open it for. Each item shows an
// honest cost flag (Free / Free · sign-up / Free tier).
// =============================================================================

import { Card, PageHead } from "../ui/components.js";
import { COST_LABEL, RESOURCE_GROUPS } from "../data/resources.js";
import type { ResourceCost } from "../data/resources.js";

function costClass(cost: ResourceCost): string {
  return cost === "free" ? "cost cost--free" : cost === "free-account" ? "cost cost--account" : "cost cost--tier";
}

export function Resources() {
  return (
    <>
      <PageHead
        title="Toolkit"
        sub="Everything here is usable for free. A few are freemium — those are flagged 'Free tier' so nothing's mis-sold. Grouped by what you'd open it for."
      />

      <div className="stack">
        {RESOURCE_GROUPS.map((group) => (
          <Card key={group.title} title={group.title} hint={group.blurb}>
            <div className="res-grid">
              {group.items.map((r) => (
                <a key={r.id} className="res-card" href={r.url} target="_blank" rel="noopener noreferrer">
                  <div className="row row--between" style={{ alignItems: "flex-start", gap: 8 }}>
                    <span className="res-card__name">{r.name}</span>
                    <span className={costClass(r.cost)}>{COST_LABEL[r.cost]}</span>
                  </div>
                  <div className="res-card__what">{r.what}</div>
                  {r.note && <div className="res-card__note">{r.note}</div>}
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 20, fontSize: "0.85rem" }}>
        Links open on the provider's own site. Availability and free tiers can change — if something now asks for payment, tell me and I'll swap it out.
      </p>
    </>
  );
}

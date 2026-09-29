// =============================================================================
// src/pages/Grammar.tsx
// Grammar cheat-sheets: expandable cards with tables, traps and tips, filtered
// by level. Each verb-tense card links to the drill.
// =============================================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, PageHead, RichText, Segmented } from "../ui/components.js";
import { GRAMMAR_TOPICS } from "../data/grammar.js";
import type { GrammarBlock, GrammarTopic } from "../data/grammar.js";
import type { CefrLevel } from "../types/index.js";

type Filter = "all" | CefrLevel;

export function Grammar() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const topics = GRAMMAR_TOPICS.filter((t) => filter === "all" || t.level === filter);

  return (
    <>
      <PageHead
        title="Grammar"
        sub="The structures the course covers, each with the trap that catches English speakers. Open one, then drill it."
      />

      <div style={{ marginBottom: 20 }}>
        <Segmented<Filter>
          ariaLabel="Filter grammar by level"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "A0", label: "A0" },
            { value: "A1", label: "A1" },
            { value: "A2", label: "A2" },
            { value: "B1", label: "B1" },
            { value: "B2", label: "B2" },
          ]}
        />
      </div>

      <div className="stack">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} open={!!open[topic.id]} onToggle={() => setOpen((o) => ({ ...o, [topic.id]: !o[topic.id] }))} />
        ))}
      </div>
    </>
  );
}

function TopicCard(props: { topic: GrammarTopic; open: boolean; onToggle: () => void }) {
  const { topic, open } = props;
  return (
    <Card>
      <button className="disclosure" onClick={props.onToggle} aria-expanded={open}>
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 8 }}>
            <Badge>{topic.level}</Badge>
            <strong>{topic.title}</strong>
          </div>
          <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>{topic.summary}</div>
        </div>
        <span className={`chev${open ? " chev--open" : ""}`}>▸</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          {topic.blocks.map((b, i) => (
            <GrammarBlockView key={i} block={b} />
          ))}
          {topic.drillTense && (
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn--primary btn--sm" to="/drill">Drill this tense →</Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function GrammarBlockView({ block }: { block: GrammarBlock }) {
  switch (block.kind) {
    case "p":
      return <p style={{ margin: "8px 0" }}><RichText text={block.text} /></p>;
    case "list":
      return (
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          {block.items.map((it, i) => <li key={i} style={{ margin: "3px 0" }}><RichText text={it} /></li>)}
        </ul>
      );
    case "table":
      return (
        <div style={{ overflowX: "auto", margin: "10px 0" }}>
          <table className="gtable">
            <thead>
              <tr>{block.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (ci === 0 ? <th key={ci}>{cell}</th> : <td key={ci}>{cell}</td>))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "trap":
      return <div className="callout callout--trap"><RichText text={block.text} /></div>;
    case "tip":
      return <div className="callout callout--tip"><RichText text={block.text} /></div>;
  }
}

// =============================================================================
// src/ui/components.tsx
// The core UI component library. Presentational, prop-driven, class-based
// (styles live in theme.css). These are the primitives every page composes.
// =============================================================================

import type { CSSProperties, ReactNode } from "react";

// ---- Card -------------------------------------------------------------------

export function Card(props: {
  title?: ReactNode;
  hint?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card${props.className ? ` ${props.className}` : ""}`}>
      {(props.title || props.actions) && (
        <header className="card__head row row--between">
          <div>
            {props.title && <div className="card__title">{props.title}</div>}
            {props.hint && <div className="card__hint">{props.hint}</div>}
          </div>
          {props.actions}
        </header>
      )}
      {props.children}
    </section>
  );
}

// ---- Stat tile --------------------------------------------------------------

export function Stat(props: { label: ReactNode; value: ReactNode; meta?: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat__label">{props.label}</div>
      <div className="stat__value">{props.value}</div>
      {props.meta && <div className="stat__meta">{props.meta}</div>}
    </div>
  );
}

// ---- Progress bar -----------------------------------------------------------

export function ProgressBar(props: { pct: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, props.pct));
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={props.label}
    >
      <div className="bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** A labelled row: level code, bar, percentage. */
export function ProgressRow(props: { label: string; pct: number; meta?: string }) {
  return (
    <div className="bar-row">
      <span className="bar-row__label">{props.label}</span>
      <ProgressBar pct={props.pct} label={`${props.label} progress`} />
      <span className="bar-row__pct">{props.meta ?? `${props.pct}%`}</span>
    </div>
  );
}

// ---- Badge ------------------------------------------------------------------

export function Badge(props: {
  children: ReactNode;
  variant?: "default" | "good" | "accent";
  dot?: boolean;
}) {
  const variant = props.variant ?? "default";
  const cls = variant === "default" ? "badge" : `badge badge--${variant}`;
  return (
    <span className={cls}>
      {props.dot && <span className="badge__dot" />}
      {props.children}
    </span>
  );
}

// ---- Button -----------------------------------------------------------------

export function Button(props: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
  size?: "md" | "sm";
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  const classes = ["btn"];
  if (props.variant && props.variant !== "default") classes.push(`btn--${props.variant}`);
  if (props.size === "sm") classes.push("btn--sm");
  return (
    <button
      type={props.type ?? "button"}
      className={classes.join(" ")}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </button>
  );
}

// ---- Segmented control ------------------------------------------------------

export function Segmented<T extends string>(props: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="segmented" role="tablist" aria-label={props.ariaLabel}>
      {props.options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={opt.value === props.value}
          className={`segmented__opt${opt.value === props.value ? " segmented__opt--active" : ""}`}
          onClick={() => props.onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---- Loading / error states -------------------------------------------------

export function Spinner() {
  return (
    <div className="center-min">
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}

export function ErrorState(props: { error: Error; onRetry?: () => void }) {
  return (
    <div className="center-min">
      <Card title="Something went wrong">
        <p className="muted">{props.error.message}</p>
        {props.onRetry && (
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={props.onRetry}>
              Try again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ---- Page header ------------------------------------------------------------

export function PageHead(props: { title: ReactNode; badge?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="page-head__title">
        <h1>{props.title}</h1>
        {props.badge}
      </div>
      {props.sub && <p className="page-head__sub">{props.sub}</p>}
    </div>
  );
}

// ---- Inline style passthrough (rarely needed) -------------------------------

export function Box(props: { style?: CSSProperties; className?: string; children: ReactNode }) {
  return (
    <div className={props.className} style={props.style}>
      {props.children}
    </div>
  );
}

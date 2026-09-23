import React from "react";

const levelText = {
  low: "text-low",
  moderate: "text-moderate",
  high: "text-high",
  critical: "text-critical",
};
const levelBg = {
  low: "bg-low",
  moderate: "bg-moderate",
  high: "bg-high",
  critical: "bg-critical",
};
const levelLabel = { low: "Low", moderate: "Moderate", high: "High", critical: "Critical" };

export function RiskDot({ level, className = "" }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${levelBg[level] || "bg-muted"} ${className}`} />;
}

export function RiskPill({ level, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold ${
        levelText[level] || "text-muted"
      }`}
    >
      <RiskDot level={level} />
      {children || levelLabel[level] || "Unknown"}
    </span>
  );
}

export function Card({ title, subtitle, right, children, className = "", padded = true }) {
  return (
    <div className={`paper shadow-card ${padded ? "p-4 sm:p-5" : ""} ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-[15px] font-semibold leading-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", size = "md", className = "", ...rest }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-[15px]" };
  const variants = {
    primary: "bg-accent text-accent-ink hover:opacity-90",
    outline: "border border-line text-ink hover:bg-surface2",
    ghost: "text-ink hover:bg-surface2",
    subtle: "bg-surface2 text-ink hover:opacity-90",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function StatCard({ label, value, hint, level, onClick }) {
  const color = level ? `rgb(var(--${level}))` : "rgb(var(--teal))";
  return (
    <button
      onClick={onClick}
      className="paper shadow-card relative overflow-hidden p-4 text-left transition-transform active:scale-[0.98]"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-[28px] font-semibold leading-none" style={{ color }}>
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
    </button>
  );
}

export function Notice({ children }) {
  return (
    <p className="mb-4 flex gap-2 rounded-xl border border-teal/30 bg-teal/10 px-3 py-2.5 text-xs leading-relaxed text-ink">
      <span className="mt-0.5 text-teal">ⓘ</span>
      <span>{children}</span>
    </p>
  );
}

export function Chip({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-accent/60 bg-accent/15 text-accent" : "border-line text-muted hover:bg-surface2"
      }`}
    >
      {children}
    </button>
  );
}

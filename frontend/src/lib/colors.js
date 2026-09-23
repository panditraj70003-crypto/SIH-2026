// Our palette lives in src/index.css as "R G B" triplets (see tailwind.config.js
// for why). Inline SVG/style code can't use Tailwind classes, so this turns a
// variable name into a real color string, e.g. cssVar("high") -> "rgb(var(--high))".
export function cssVar(name) {
  return `rgb(var(--${name}))`;
}

export const levelColor = {
  low: cssVar("low"),
  moderate: cssVar("moderate"),
  high: cssVar("high"),
  critical: cssVar("critical"),
};

export function levelOf(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "moderate";
  return "low";
}

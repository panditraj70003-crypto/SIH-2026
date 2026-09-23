import React from "react";

const AX = "rgb(var(--muted))";
const GRID = "rgb(var(--line))";

function Frame({ w, h, children }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 200 }}>
      {children}
    </svg>
  );
}

function yGrid(w, h, pad, max, unit = "") {
  const lines = [];
  for (let i = 0; i <= 3; i++) {
    const v = (max / 3) * i;
    const y = h - pad.b - (h - pad.t - pad.b) * (i / 3);
    lines.push(
      <g key={i}>
        <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke={GRID} />
        <text x={pad.l - 6} y={y + 4} textAnchor="end" fill={AX} fontSize="10">
          {Math.round(v)}
          {unit}
        </text>
      </g>
    );
  }
  return lines;
}

export function AreaChart({ data, xKey, yKey, color, max }) {
  const w = 480,
    h = 200,
    pad = { l: 30, r: 10, t: 10, b: 22 };
  const m = max || Math.ceil((Math.max(...data.map((d) => d[yKey])) * 1.25) / 5) * 5;
  const step = (w - pad.l - pad.r) / (data.length - 1);
  const pts = data.map((d, i) => [pad.l + step * i, h - pad.b - (h - pad.t - pad.b) * (d[yKey] / m)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0]} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`;
  const gid = "g" + yKey;
  return (
    <Frame w={w} h={h}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yGrid(w, h, pad, m)}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill={color} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pad.l + step * i} y={h - pad.b + 15} textAnchor="middle" fill={AX} fontSize="10">
          {d[xKey]}
        </text>
      ))}
    </Frame>
  );
}

export function BarChart({ data, xKey, yKey, colorKey, defaultColor, max }) {
  const w = 480,
    h = 200,
    pad = { l: 30, r: 10, t: 10, b: 22 };
  const m = max || Math.ceil((Math.max(...data.map((d) => d[yKey])) * 1.2) / 5) * 5;
  const step = (w - pad.l - pad.r) / data.length;
  return (
    <Frame w={w} h={h}>
      {yGrid(w, h, pad, m)}
      {data.map((d, i) => {
        const bh = (h - pad.t - pad.b) * (d[yKey] / m);
        const x = pad.l + step * i + step * 0.22;
        return (
          <rect
            key={i}
            x={x}
            y={h - pad.b - bh}
            width={step * 0.56}
            height={bh}
            rx="4"
            fill={colorKey ? `rgb(var(--${d[colorKey]}))` : defaultColor}
          />
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={pad.l + step * i + step / 2} y={h - pad.b + 15} textAnchor="middle" fill={AX} fontSize="10">
          {d[xKey]}
        </text>
      ))}
    </Frame>
  );
}

export function HBarChart({ data, labelKey, valueKey, max, color }) {
  const w = 480,
    h = Math.max(160, data.length * 30),
    pad = { l: 96, r: 24, t: 6, b: 6 };
  const m = max || Math.ceil((Math.max(...data.map((d) => d[valueKey])) * 1.15) / 5) * 5;
  const step = (h - pad.t - pad.b) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h }}>
      {data.map((d, i) => {
        const bw = (w - pad.l - pad.r) * (d[valueKey] / m);
        const y = pad.t + step * i + step * 0.25;
        return (
          <g key={i}>
            <rect x={pad.l} y={y} width={bw} height={step * 0.5} rx="4" fill={color} />
            <text x={pad.l - 8} y={y + step * 0.35} textAnchor="end" fill={AX} fontSize="11">
              {d[labelKey]}
            </text>
            <text x={pad.l + bw + 8} y={y + step * 0.35} fill="rgb(var(--ink))" fontSize="11">
              {d[valueKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// bars (e.g. rainfall) + an overlaid line (e.g. predicted risk) sharing one
// chart, like the reference file's "Rainfall vs predicted risk" card
export function ComboChart({ data, xKey, barKey, lineKey, barColor, lineColor, barMax = 160, lineMax = 100 }) {
  const w = 480,
    h = 200,
    pad = { l: 30, r: 26, t: 10, b: 22 };
  const step = (w - pad.l - pad.r) / data.length;
  const bars = data.map((d, i) => {
    const bh = (h - pad.t - pad.b) * (d[barKey] / barMax);
    const x = pad.l + step * i + step * 0.28;
    return <rect key={i} x={x} y={h - pad.b - bh} width={step * 0.44} height={bh} rx="3" fill={barColor} />;
  });
  const pts = data.map((d, i) => [pad.l + step * (i + 0.5), h - pad.b - (h - pad.t - pad.b) * (d[lineKey] / lineMax)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <Frame w={w} h={h}>
      {yGrid(w, h, pad, barMax)}
      {bars}
      <path d={line} fill="none" stroke={lineColor} strokeWidth="2.4" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={lineColor} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pad.l + step * (i + 0.5)} y={h - pad.b + 15} textAnchor="middle" fill={AX} fontSize="10">
          {d[xKey]}
        </text>
      ))}
    </Frame>
  );
}

// two overlaid area/line series on one chart, like the reference file's
// "Soil moisture trend" card (surface vs deep sensor readings)
export function TwoAreaChart({ data, xKey, key1, key2, color1, color2, max = 100, unit = "%" }) {
  const w = 480,
    h = 200,
    pad = { l: 30, r: 10, t: 10, b: 22 };
  const step = (w - pad.l - pad.r) / (data.length - 1);

  function series(key, color, id) {
    const pts = data.map((d, i) => [pad.l + step * i, h - pad.b - (h - pad.t - pad.b) * (d[key] / max)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = `${line} L ${pts[pts.length - 1][0]} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`;
    return (
      <g key={key}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.4" />
      </g>
    );
  }

  return (
    <Frame w={w} h={h}>
      {yGrid(w, h, pad, max, unit)}
      {series(key1, color1, "ta1")}
      {series(key2, color2, "ta2")}
      {data.map((d, i) => (
        <text key={i} x={pad.l + step * i} y={h - pad.b + 15} textAnchor="middle" fill={AX} fontSize="10">
          {d[xKey]}
        </text>
      ))}
    </Frame>
  );
}

// a single line with no area fill - for a simpler trend like
// "Landslide risk through the year"
export function LineChart({ data, xKey, yKey, color, max }) {
  const w = 480,
    h = 200,
    pad = { l: 30, r: 10, t: 10, b: 22 };
  const m = max || Math.ceil((Math.max(...data.map((d) => d[yKey])) * 1.2) / 5) * 5;
  const step = (w - pad.l - pad.r) / (data.length - 1);
  const pts = data.map((d, i) => [pad.l + step * i, h - pad.b - (h - pad.t - pad.b) * (d[yKey] / m)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <Frame w={w} h={h}>
      {yGrid(w, h, pad, m)}
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pad.l + step * i} y={h - pad.b + 15} textAnchor="middle" fill={AX} fontSize="10">
          {d[xKey]}
        </text>
      ))}
    </Frame>
  );
}

// small centered "● label   ● label" row under a chart, matching the
// reference file's chartKey() helper
export function ChartLegend({ items }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted">
      {items.map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function Donut({ data, size = 140, thickness = 16 }) {
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const frac = d.v / total;
            const dash = `${frac * c} ${c}`;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={`rgb(var(--${d.level}))`}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += frac * c;
            return el;
          })}
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-xl font-semibold leading-none">{total}</p>
          <p className="mt-1 text-[10px] uppercase text-muted">Alerts</p>
        </div>
      </div>
    </div>
  );
}

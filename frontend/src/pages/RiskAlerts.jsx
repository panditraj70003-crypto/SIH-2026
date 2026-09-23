import React, { useMemo, useState } from "react";
import { useNotify } from "../context/NotifyContext.jsx";
import { Card, RiskPill, Notice, Button } from "../components/ui.jsx";
import { ComboChart, TwoAreaChart, LineChart, BarChart, HBarChart, Donut, ChartLegend } from "../components/charts.jsx";
import { levelOf } from "../lib/colors.js";
import { riskByState, alertsBySeverity, riskTrendYear, rainVsRisk, soilMoisture } from "../data/mockData.js";
import places from "../data/places.js";
import { districtNameById } from "../lib/places-helpers.js";

const ORDER = ["critical", "high", "moderate", "low"];
const ORDER_LABEL = { critical: "Critical", high: "High", moderate: "Moderate", low: "Low" };

export default function RiskAlerts({ onViewOnMap }) {
  const { alerts } = useNotify();
  const [severity, setSeverity] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");

  const filtered = useMemo(
    () =>
      alerts.filter(
        (a) => (severity === "All" || levelOf(a.risk) === severity.toLowerCase()) && (stateFilter === "All" || a.state === stateFilter)
      ),
    [alerts, severity, stateFilter]
  );
  const active = filtered.filter((a) => a.status === "active");
  const resolved = filtered.filter((a) => a.status === "resolved");
  const groups = ORDER.map((k) => ({
    key: k,
    items: active.filter((a) => levelOf(a.risk) === k).sort((a, b) => b.risk - a.risk),
  })).filter((g) => g.items.length);

  function clearFilters() {
    setSeverity("All");
    setStateFilter("All");
  }

  return (
    <div className="space-y-4">
      <Notice>Warnings raised by the sample risk model, most severe first. SMS dispatch is not connected yet.</Notice>

      <Card title="Filter warnings">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Severity</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {["All", "Critical", "High", "Moderate", "Low"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">State</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option>All</option>
              {places.states.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Time</span>
            <select className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent">
              <option>All time</option>
              <option>Last 6 hours</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
            </select>
          </label>
        </div>
      </Card>

      {active.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <p className="text-sm font-medium">No warnings match these filters</p>
            <p className="mt-1.5 text-xs text-muted">Widen the time range or choose a different state.</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        groups.map((g) => (
          <section key={g.key}>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: `rgb(var(--${g.key}))` }} />
              <h3 className="text-[13px] font-semibold">{ORDER_LABEL[g.key]} alerts</h3>
              <span className="text-xs text-muted">{g.items.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.items.map((a) => (
                <AlertCard key={a.id} alert={a} onViewOnMap={onViewOnMap} />
              ))}
            </div>
          </section>
        ))
      )}

      {resolved.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-muted">✓</span>
            <h3 className="text-[13px] font-semibold">Resolved</h3>
            <span className="text-xs text-muted">{resolved.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {resolved.map((a) => (
              <AlertCard key={a.id} alert={a} compact />
            ))}
          </div>
        </section>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold">Analytics</h2>
        <p className="mt-1 text-xs text-muted">How rainfall, soil moisture and predicted risk have moved together.</p>
      </div>
      <Notice>Charts use sample data. They will read from the model database once the backend is live.</Notice>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Rainfall vs predicted risk" subtitle="Last 7 days · bars are rainfall, the line is risk">
          <ComboChart data={rainVsRisk} xKey="d" barKey="rain" lineKey="risk" barColor="#38BDF8" lineColor="#EF4444" />
          <ChartLegend items={[["#38BDF8", "Rainfall (mm)"], ["#EF4444", "Risk (%)"]]} />
        </Card>
        <Card title="Soil moisture trend" subtitle="Surface and deep sensors, last 7 days">
          <TwoAreaChart data={soilMoisture} xKey="d" key1="s" key2="p" color1="#38BDF8" color2="#22C55E" />
          <ChartLegend items={[["#38BDF8", "Surface (%)"], ["#22C55E", "Deep (%)"]]} />
        </Card>
        <Card title="Landslide risk through the year" subtitle="Average predicted risk per month">
          <LineChart data={riskTrendYear} xKey="m" yKey="v" color="#F97316" max={100} />
        </Card>
        <Card title="Warnings raised this month" subtitle="Grouped by severity">
          <BarChart data={alertsBySeverity} xKey="k" yKey="v" colorKey="level" />
        </Card>
      </div>
      <Card title="Field reports by state" subtitle="Total received this monsoon season">
        <HBarChart data={riskByState} labelKey="k" valueKey="v" color="#38BDF8" />
      </Card>

      <Card title="Active alerts by severity">
        <div className="flex flex-wrap items-center gap-6">
          <Donut data={alertsBySeverity} />
          <div className="flex flex-col gap-2">
            {alertsBySeverity.map((d) => (
              <span key={d.k} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: `rgb(var(--${d.level}))` }} />
                {d.k} · {d.v}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function AlertCard({ alert, compact, onViewOnMap }) {
  const lvl = levelOf(alert.risk);
  const resolved = alert.status === "resolved";

  function viewOnMap() {
    if (!onViewOnMap) return;
    const districtName = districtNameById(alert.district) || alert.place;
    onViewOnMap({ state: alert.state, district: districtName });
  }

  return (
    <div
      className="rounded-2xl border-l-4 bg-surface p-4 shadow-card"
      style={{
        borderLeftColor: resolved ? "rgb(var(--line))" : `rgb(var(--${lvl}))`,
        borderTop: "1px solid rgb(var(--line))",
        borderRight: "1px solid rgb(var(--line))",
        borderBottom: "1px solid rgb(var(--line))",
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {resolved ? <span className="text-xs font-semibold text-muted">✓ Resolved</span> : <RiskPill level={lvl} />}
        <span className="text-[11px] text-muted">{alert.id}</span>
        <span className="ml-auto text-[11px] text-muted">{alert.time}</span>
      </div>
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-[15px] font-semibold leading-tight">{alert.place}</h4>
          <p className="text-xs text-muted">{alert.state}</p>
        </div>
        <p className="font-display text-2xl font-semibold" style={{ color: `rgb(var(--${lvl}))` }}>
          {alert.risk}%
        </p>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-ink/80">{alert.reason}</p>
      {!compact && (
        <>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-surface2 px-2.5 py-1">🌧 {alert.rainfall} mm rain</span>
            <span className="rounded-full bg-surface2 px-2.5 py-1">💧 {alert.soil}% soil moisture</span>
          </div>
          <div className="mt-3 border-t border-line pt-3 text-xs">
            <p className="text-[10px] font-semibold uppercase text-muted">Prediction</p>
            <p className="mt-0.5">{alert.prediction}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase text-muted">Recommended action</p>
            <p className="mt-0.5">{alert.action}</p>
          </div>
        </>
      )}
      {onViewOnMap && (
        <button onClick={viewOnMap} className="mt-3 text-xs font-semibold text-accent">
          View on map →
        </button>
      )}
    </div>
  );
}

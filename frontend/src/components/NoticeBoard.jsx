import React, { useMemo, useState } from "react";
import { useNotify } from "../context/NotifyContext.jsx";
import { Chip, RiskPill, Card } from "./ui.jsx";
import { SearchIcon, PinIcon } from "./icons.jsx";
import places from "../data/places.js";

const categories = [
  { id: "all", label: "All" },
  { id: "weather", label: "Weather" },
  { id: "road", label: "Roads" },
  { id: "advisory", label: "Advisory" },
  { id: "tourist", label: "Tourist spots" },
  { id: "sports", label: "Sports & picnic" },
];

export default function NoticeBoard() {
  const { notices } = useNotify();
  const [category, setCategory] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notices.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (stateFilter !== "all" && n.state !== stateFilter) return false;
      if (q && !(n.title + n.place + n.state).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notices, category, stateFilter, query]);

  return (
    <Card title="Notice board" subtitle="Recent alerts, road status and advisories">
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-line bg-surface2 px-3 py-2">
        <SearchIcon size={15} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a place, state or title…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <select
        value={stateFilter}
        onChange={(e) => setStateFilter(e.target.value)}
        className="mb-4 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="all">All states</option>
        {places.states.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Nothing matches these filters yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-snug">{n.title}</p>
                <RiskPill level={n.level} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{n.message}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <PinIcon size={12} />
                  {n.place}, {n.state}
                </span>
                <span>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

import React, { useState } from "react";
import { Card } from "./ui.jsx";
import { PhoneIcon } from "./icons.jsx";
import places from "../data/places.js";
import { nationalEmergencyNumbers, districtControlRooms } from "../data/mockData.js";

export default function EmergencyNumbers() {
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const state = places.states.find((s) => s.id === stateId);
  const districtNumber = districtId ? districtControlRooms[districtId] : null;

  return (
    <Card title="Emergency numbers" subtitle="Standard all-India helplines">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <select
          value={stateId}
          onChange={(e) => {
            setStateId(e.target.value);
            setDistrictId("");
          }}
          className="rounded-xl border border-line bg-surface px-2.5 py-2 text-xs outline-none focus:border-accent"
        >
          <option value="">State (optional)</option>
          {places.states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          disabled={!state}
          className="rounded-xl border border-line bg-surface px-2.5 py-2 text-xs outline-none focus:border-accent disabled:opacity-50"
        >
          <option value="">District (optional)</option>
          {state?.districts.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {districtId && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-accent/10 px-3.5 py-2.5">
          <span className="text-xs font-medium">District control room</span>
          <a
            href={`tel:${districtNumber || "1077"}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent"
          >
            <PhoneIcon size={14} />
            {districtNumber || "1077"}
          </a>
          {!districtNumber && <span className="sr-only">Standard district helpline (not district-specific yet)</span>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {nationalEmergencyNumbers.map((n) => (
          <a
            key={n.number}
            href={`tel:${n.number}`}
            className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 hover:bg-surface2"
          >
            <span className="text-[11px] leading-tight text-muted">{n.label}</span>
            <span className="ml-2 shrink-0 font-display text-sm font-semibold text-accent">{n.number}</span>
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Numbers shown are standard nationwide helplines. Add your district's real control-room number in{" "}
        <code>src/data/mockData.js</code> once your team has it.
      </p>
    </Card>
  );
}

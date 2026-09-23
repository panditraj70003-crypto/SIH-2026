import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./NerLeafletMap.css";
import { Card, RiskPill, Button } from "./ui.jsx";
import { playChime } from "../lib/sound.js";

// ---- same deterministic sample-risk formula as the team's reference map file ----
function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function keyOf(p) {
  return p.state + "|" + p.district;
}

// Simulated live risk feed - swap this for a real fetch('/api/risk') call and
// keep the same return shape ({ "State|District": {level, rainfall} }); every
// consumer below (map colors, glow, roadblocks, ticker, HUD) already reacts
// to whatever this returns.
function fetchRiskData(districts, tick) {
  const out = {};
  districts.features.forEach((f) => {
    const p = f.properties;
    const k = keyOf(p);
    const a = hash01(k);
    const b = hash01(k + "r");
    const wob = Math.sin(tick / 4 + a * 9) * 0.5 + 0.5;
    const score = clamp(a * 0.55 + wob * 0.45 + (b - 0.5) * 0.12, 0, 1);
    let level;
    if (b < 0.055) level = null;
    else if (score > 0.72) level = "high";
    else if (score > 0.45) level = "moderate";
    else level = "low";
    const rainfall =
      level === null
        ? null
        : Math.round(clamp((level === "high" ? 90 : level === "moderate" ? 35 : 8) + b * 70 + wob * 30, 0, 260));
    out[k] = { level, rainfall };
  });
  return out;
}

const RISK_COLOR = { high: "#ef4444", moderate: "#f59e0b", low: "#10b981", none: "#4b5568" };
const RISK_CLASS = { high: "nsmap-risk-high", moderate: "nsmap-risk-moderate", low: "", none: "" };
function levelKey(level) {
  return level === null || level === undefined ? "none" : level;
}
function tooltipHtml(p, d) {
  const lvl = d && d.level ? d.level[0].toUpperCase() + d.level.slice(1) : "No data";
  const rain = d && d.rainfall != null ? d.rainfall + " mm" : "—";
  const color = RISK_COLOR[levelKey(d && d.level)];
  return (
    `<div class="d-name">${p.district}</div>` +
    `<div class="d-state">${p.state}</div>` +
    `<div class="d-row"><span>Risk</span><span class="d-lvl" style="color:${color}">${lvl}</span></div>` +
    `<div class="d-row"><span>Rainfall</span><span>${rain}</span></div>`
  );
}

export default function NerLeafletMap({ height = 460, focusLocation, onFocusHandled }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const districtLayerRef = useRef(null);
  const roadblockLayerRef = useRef(null);
  const selectedLayerRef = useRef(null);
  const liveDataRef = useRef({});
  const dataRef = useRef(null); // { DISTRICTS, STATE_BORDERS }
  const tickRef = useRef(0);
  const prevActiveHighRef = useRef(new Set());

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [hud, setHud] = useState({ red: 0, orange: 0, yellow: 0 });
  const [banner, setBanner] = useState("No active red alerts right now — all districts under routine monitoring.");
  const [selected, setSelected] = useState(null); // { properties, risk }
  const [reloadTick, setReloadTick] = useState(0);

  // -------------------------------------------------- load geojson + init map
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    Promise.all([fetch("/data/districts.json").then((r) => r.json()), fetch("/data/state-borders.json").then((r) => r.json())])
      .then(([DISTRICTS, STATE_BORDERS]) => {
        if (cancelled) return;
        dataRef.current = { DISTRICTS, STATE_BORDERS };
        initMap(DISTRICTS, STATE_BORDERS);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      teardownMap();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTick]);

  function teardownMap() {
    if (mapRef.current) {
      if (mapRef.current._nsmapCleanup) mapRef.current._nsmapCleanup();
      mapRef.current.remove();
      mapRef.current = null;
    }
    districtLayerRef.current = null;
    roadblockLayerRef.current = null;
    selectedLayerRef.current = null;
  }

  function initMap(DISTRICTS, STATE_BORDERS) {
    if (!elRef.current || mapRef.current) return;

    const map = L.map(elRef.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 5,
      maxZoom: 11,
      worldCopyJump: false,
      preferCanvas: false, // SVG renderer so the CSS glow filters apply
    }).setView([25.9, 93.4], 6);
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        "&copy; OpenStreetMap contributors &copy; CARTO · District boundaries: Census of India via datta07/INDIAN-SHAPEFILES",
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    L.geoJSON(STATE_BORDERS, {
      style: { color: "#c7d2e0", weight: 2.6, opacity: 0.85, fill: false, interactive: false },
    }).addTo(map);

    roadblockLayerRef.current = L.layerGroup().addTo(map);

    function styleFor(feature) {
      const k = keyOf(feature.properties);
      const d = liveDataRef.current[k] || { level: null };
      const lvl = levelKey(d.level);
      return {
        color: "#0b1220",
        weight: 1,
        opacity: 0.9,
        fillColor: RISK_COLOR[lvl],
        fillOpacity: lvl === "none" ? 0.35 : 0.55,
        className: RISK_CLASS[d.level] || "",
      };
    }

    function selectFeature(layer, feature) {
      if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
        districtLayerRef.current.resetStyle(selectedLayerRef.current);
      }
      selectedLayerRef.current = layer;
      layer.setStyle({ weight: 3, opacity: 1 });
      const path = layer.getElement && layer.getElement();
      if (path) path.classList.add("nsmap-risk-selected");
      const k = keyOf(feature.properties);
      setSelected({ properties: feature.properties, risk: liveDataRef.current[k] });
      try {
        map.flyToBounds(layer.getBounds(), { maxZoom: 9, duration: 0.6 });
      } catch (e) {
        /* bounds unavailable for a malformed feature - selection still shows */
      }
    }

    const districtLayer = L.geoJSON(DISTRICTS, {
      style: styleFor,
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip("", { sticky: true, className: "nersafe-tip", direction: "top", opacity: 1 });
        layer.on("mouseover", () => {
          const d = liveDataRef.current[keyOf(p)];
          layer.setTooltipContent(tooltipHtml(p, d));
          if (layer !== selectedLayerRef.current) layer.setStyle({ weight: 2.2, opacity: 1 });
        });
        layer.on("mouseout", () => {
          if (layer !== selectedLayerRef.current) districtLayerRef.current.resetStyle(layer);
        });
        layer.on("click", () => selectFeature(layer, feature));
      },
    }).addTo(map);
    districtLayerRef.current = districtLayer;

    function buildRoadblocks() {
      roadblockLayerRef.current.clearLayers();
      DISTRICTS.features.forEach((f) => {
        const p = f.properties;
        const d = liveDataRef.current[keyOf(p)];
        if (!d || d.level !== "high") return;
        const icon = L.divIcon({
          className: "",
          html: '<div class="rb-pulse"><div class="ring"></div><div class="core"></div></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([p.lat, p.lon], { icon, interactive: false }).addTo(roadblockLayerRef.current);
      });
    }

    function computeBannerAndHud() {
      let red = 0,
        orange = 0,
        yellow = 0;
      const reds = [];
      DISTRICTS.features.forEach((f) => {
        const d = liveDataRef.current[keyOf(f.properties)];
        if (!d) return;
        if (d.level === "high") {
          red++;
          reds.push({ p: f.properties, d });
        } else if (d.level === "moderate") orange++;
        else if (d.level === "low") yellow++;
      });
      setHud({ red, orange, yellow });

      if (!reds.length) {
        setBanner("No active red alerts right now — all districts under routine monitoring.");
      } else {
        reds.sort((a, b) => (b.d.rainfall || 0) - (a.d.rainfall || 0));
        setBanner(
          reds
            .slice(0, 6)
            .map((x) => `${x.p.district}, ${x.p.state} — very heavy rain (${x.d.rainfall} mm) — high landslide risk`)
            .join("     •     ")
        );
      }

      // sound cue only for districts that just newly crossed into "high"
      const nowHigh = new Set(reds.map((x) => keyOf(x.p)));
      let isNew = false;
      nowHigh.forEach((k) => {
        if (!prevActiveHighRef.current.has(k)) isNew = true;
      });
      if (isNew && prevActiveHighRef.current.size > 0) playChime();
      prevActiveHighRef.current = nowHigh;
    }

    function refresh() {
      liveDataRef.current = fetchRiskData(DISTRICTS, tickRef.current++);
      if (districtLayerRef.current) districtLayerRef.current.setStyle(styleFor);
      buildRoadblocks();
      computeBannerAndHud();
      if (selectedLayerRef.current) {
        const f = selectedLayerRef.current.feature;
        setSelected({ properties: f.properties, risk: liveDataRef.current[keyOf(f.properties)] });
      }
    }

    refresh();
    const interval = setInterval(refresh, 30000);

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    setTimeout(() => map.invalidateSize(), 300);
    map._nsmapCleanup = () => {
      clearInterval(interval);
      window.removeEventListener("resize", onResize);
    };
  }

  // -------------------------------------------------- respond to "view on map"
  useEffect(() => {
    if (!focusLocation || status !== "ready" || !dataRef.current || !districtLayerRef.current) return;
    const { DISTRICTS } = dataRef.current;
    const match = DISTRICTS.features.find(
      (f) =>
        f.properties.state.toLowerCase() === focusLocation.state.toLowerCase() &&
        f.properties.district.toLowerCase() === focusLocation.district.toLowerCase()
    );
    if (match) {
      districtLayerRef.current.eachLayer((layer) => {
        if (layer.feature === match) {
          layer.fire("click");
        }
      });
    }
    onFocusHandled && onFocusHandled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusLocation, status]);

  return (
    <div>
      <div className="nsmap" style={{ height }}>
        <div className="nsmap-alertbar">
          <span className="tag">RED ALERT</span>
          <div className="nsmap-alerttrack">
            <span>{banner}</span>
          </div>
        </div>

        <div className="nsmap-mapwrap" style={{ height: "calc(100% - 30px - 86px)" }}>
          <div ref={elRef} className="nsmap-mapel" style={{ height: "100%" }} />

          {status === "loading" && (
            <div className="absolute inset-0 grid place-items-center bg-[#04070d] text-xs text-[#8b9bb0]">
              Loading district map…
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 grid place-items-center gap-2 bg-[#04070d] px-6 text-center text-xs text-[#8b9bb0]">
              <p>Couldn't load the map data — check your connection.</p>
              <Button size="sm" variant="outline" onClick={() => setReloadTick((t) => t + 1)}>
                Retry
              </Button>
            </div>
          )}

          {status === "ready" && (
            <div className="nsmap-legend">
              <b>Risk:</b>
              <span className="sw">
                <i style={{ background: "#ef4444", boxShadow: "0 0 5px #ef4444" }} />
                High
              </span>
              <span className="sw">
                <i style={{ background: "#f59e0b" }} />
                Moderate
              </span>
              <span className="sw">
                <i style={{ background: "#10b981" }} />
                Low
              </span>
              <span className="sw">
                <i style={{ background: "#4b5568" }} />
                No data
              </span>
            </div>
          )}
        </div>

        <div className="nsmap-hud">
          <div className="nsmap-hudgrid">
            <div className="nsmap-hudcard nsmap-hud-red">
              <div className="n">{hud.red}</div>
              <div className="l">Red districts</div>
            </div>
            <div className="nsmap-hudcard nsmap-hud-orange">
              <div className="n">{hud.orange}</div>
              <div className="l">Orange districts</div>
            </div>
            <div className="nsmap-hudcard nsmap-hud-yellow">
              <div className="n">{hud.yellow}</div>
              <div className="l">Yellow districts</div>
            </div>
          </div>
          <div className="nsmap-hudfoot">
            <span>Tap any district for details</span>
            <span>121 districts · 8 states · simulated live feed</span>
          </div>
        </div>
      </div>

      {selected && <SelectedDistrictCard properties={selected.properties} risk={selected.risk} />}
    </div>
  );
}

function SelectedDistrictCard({ properties, risk }) {
  const lvl = risk?.level || "none";
  const label = lvl === "none" ? "No data" : lvl[0].toUpperCase() + lvl.slice(1);
  return (
    <Card className="mt-3" padded={true}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold leading-tight">{properties.district}</h4>
          <p className="text-xs text-muted">{properties.state}</p>
        </div>
        {lvl === "none" ? (
          <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-muted">{label}</span>
        ) : (
          <RiskPill level={lvl}>{label}</RiskPill>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-surface2 py-2">
          <p className="text-sm font-semibold">{risk?.rainfall != null ? `${risk.rainfall} mm` : "—"}</p>
          <p className="text-[10px] text-muted">Rainfall (24h)</p>
        </div>
        <div className="rounded-lg bg-surface2 py-2">
          <p className="text-sm font-semibold">{Math.round(properties.area_km2 || 0).toLocaleString()} km²</p>
          <p className="text-[10px] text-muted">District area</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Sample data from the simulated live feed — a no-prediction or low reading here never means the area is confirmed
        safe. Connect a real risk API to replace this feed (see the comment above <code>fetchRiskData</code> in{" "}
        <code>NerLeafletMap.jsx</code>).
      </p>
    </Card>
  );
}

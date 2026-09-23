import places from "../data/places.js";
import { nationalEmergencyNumbers, districtControlRooms, rainfallTrend } from "../data/mockData.js";
import { levelOf } from "./colors.js";
import { districtNameById } from "./places-helpers.js";

// Every place name the bot can recognise, longest-first so "East Khasi Hills"
// matches before a shorter partial like "Khasi".
const ALL_PLACES = [];
places.states.forEach((s) => {
  ALL_PLACES.push({ name: s.name, kind: "state" });
  s.districts.forEach(([id, name]) => ALL_PLACES.push({ name, kind: "district", id, state: s.name }));
});
ALL_PLACES.sort((a, b) => b.name.length - a.name.length);

function findPlace(text) {
  const low = text.toLowerCase();
  return ALL_PLACES.find((p) => low.includes(p.name.toLowerCase()));
}

function has(text, ...words) {
  return words.some((w) => text.includes(w));
}

export function answerQuery(raw, ctx) {
  const text = raw.trim().toLowerCase();
  const { alerts, notices } = ctx;

  if (!text) {
    return { text: "Ask me about alerts, emergency numbers, how to report something, or risk in a specific place.", actions: [] };
  }

  if (has(text, "hi", "hello", "hey", "namaste")) {
    return {
      text: "Hi! I can look up active alerts, emergency numbers, notices, or the risk in a specific state or district — all from what's already on this site.",
      actions: [
        { label: "Active alerts", query: "show active alerts" },
        { label: "Emergency numbers", query: "emergency numbers" },
        { label: "How do I report?", query: "how do I report an incident" },
      ],
    };
  }

  if (has(text, "what can you do", "help", "capabilities")) {
    return {
      text: "I can answer things like: \"risk in Gangtok\", \"emergency number for Aizawl\", \"active alerts\", \"latest notices\", \"how do I report an incident\", and \"rainfall today\". I only use data already on this site — no outside lookups.",
      actions: [],
    };
  }

  // ---- emergency numbers, optionally for a specific district ----
  if (has(text, "emergency", "helpline", "ambulance", "fire brigade", "police number")) {
    const place = findPlace(text);
    if (place && place.kind === "district") {
      const num = districtControlRooms[place.id];
      return {
        text: num
          ? `${place.name} district control room: ${num}. All-India emergency (police/fire/ambulance): 112.`
          : `No district-specific number is on file yet for ${place.name} — use the standard district control room number 1077, or 112 for immediate police/fire/ambulance help.`,
        actions: [],
      };
    }
    const lines = nationalEmergencyNumbers.map((n) => `${n.label}: ${n.number}`).join("\n");
    return { text: `Standard nationwide helplines:\n${lines}`, actions: [] };
  }

  // ---- risk / alert lookup for a named place ----
  const place = findPlace(text);
  if (place && has(text, "risk", "alert", "warning", "landslide", "flood", "safe")) {
    const matches = alerts.filter(
      (a) => a.status === "active" && (a.state.toLowerCase() === place.name.toLowerCase() || a.place.toLowerCase().includes(place.name.toLowerCase()))
    );
    if (matches.length) {
      const top = matches.sort((a, b) => b.risk - a.risk)[0];
      const districtName = place.kind === "district" ? place.name : districtNameById(top.district);
      const actions = [{ label: "Open Alerts page", navigate: "alerts" }];
      if (districtName) actions.unshift({ label: `View ${top.place} on the map`, onMap: { state: top.state, district: districtName } });
      return {
        text: `${matches.length} active warning${matches.length > 1 ? "s" : ""} touching ${place.name}. Highest: ${top.place} at ${top.risk}% (${levelOf(top.risk)}) — ${top.prediction.toLowerCase()}.`,
        actions,
      };
    }
    return {
      text: `No active warning currently lists ${place.name} by name, but the live map runs its own per-district reading — worth checking there directly.`,
      actions: [{ label: `Open the map`, navigate: "home" }],
    };
  }

  if (has(text, "active alert", "current alert", "show alert", "warning")) {
    const active = alerts.filter((a) => a.status === "active").sort((a, b) => b.risk - a.risk);
    if (!active.length) return { text: "No active warnings right now.", actions: [] };
    const top3 = active.slice(0, 3).map((a) => `${a.place}, ${a.state} — ${a.risk}% (${levelOf(a.risk)})`).join("\n");
    return {
      text: `${active.length} active warning${active.length > 1 ? "s" : ""}, most severe first:\n${top3}${active.length > 3 ? "\n…and more on the Alerts page." : ""}`,
      actions: [{ label: "Open Alerts page", navigate: "alerts" }],
    };
  }

  if (has(text, "notice", "advisory", "road", "tourist", "picnic")) {
    if (!notices.length) return { text: "No notices posted yet.", actions: [] };
    const top3 = notices.slice(0, 3).map((n) => `${n.title} — ${n.place}, ${n.state}`).join("\n");
    return { text: `Latest notices:\n${top3}`, actions: [{ label: "Open Home for the full board", navigate: "home" }] };
  }

  if (has(text, "report", "post an incident", "submit", "upload photo", "upload video")) {
    return {
      text: "Go to the Post tab to send a photo, video or written note about what you're seeing — you can send any one of the three, or all together. It also works offline and sends automatically once you're back online.",
      actions: [{ label: "Open Post page", navigate: "post" }],
    };
  }

  if (has(text, "rain", "rainfall", "weather")) {
    const today = rainfallTrend[rainfallTrend.length - 1];
    return {
      text: `Sample 7-day rainfall trend shows ${today.v} mm on ${today.t}, the most recent day in the chart. The Alerts page has the full week, and the live map shows a simulated per-district reading.`,
      actions: [{ label: "Open Alerts analytics", navigate: "alerts" }],
    };
  }

  if (has(text, "profile", "settings", "account", "language", "notification")) {
    return { text: "Your profile, notification preferences and alert language are on the Profile tab.", actions: [{ label: "Open Profile", navigate: "profile" }] };
  }

  if (place) {
    return {
      text: `${place.name} is in ${place.kind === "district" ? place.state : "the North Eastern Region"}. Try asking "risk in ${place.name}" or "emergency number for ${place.name}" for specifics.`,
      actions: [],
    };
  }

  return {
    text: "I couldn't match that to anything on this site yet. Try asking about active alerts, emergency numbers, a specific district's risk, or how to report an incident.",
    actions: [
      { label: "Active alerts", query: "show active alerts" },
      { label: "Emergency numbers", query: "emergency numbers" },
    ],
  };
}

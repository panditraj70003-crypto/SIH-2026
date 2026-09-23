import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { initialNotices, initialAlerts, incomingPool } from "../data/mockData.js";
import { playChime } from "../lib/sound.js";

const NotifyContext = createContext(null);

// how often a new sample event "arrives" - this is what makes the pop-up
// show up no matter which page the person is on. Point a real feed
// (WebSocket / polling /api/alerts) at pushIncoming() to replace it.
const SIMULATED_FEED_MS = 45000;

export function NotifyProvider({ children }) {
  const [notices, setNotices] = useState(initialNotices);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [toast, setToast] = useState(null);
  const poolIndex = useRef(0);
  const toastTimer = useRef(null);

  function showToast(t) {
    clearTimeout(toastTimer.current);
    setToast(t);
    playChime();
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }

  function pushIncoming() {
    const item = incomingPool[poolIndex.current % incomingPool.length];
    poolIndex.current += 1;
    const id = (item.kind === "alert" ? "ALT-" : "NB-") + Math.floor(1000 + Math.random() * 9000);

    if (item.kind === "alert") {
      const alert = { ...item, id, status: "active", time: "just now" };
      setAlerts((prev) => [alert, ...prev]);
      showToast({
        id,
        level: alert.risk >= 80 ? "critical" : alert.risk >= 60 ? "high" : alert.risk >= 30 ? "moderate" : "low",
        title: `New warning — ${alert.place}`,
        message: alert.prediction,
      });
    } else {
      const notice = { ...item, id, time: "just now" };
      setNotices((prev) => [notice, ...prev]);
      showToast({ id, level: notice.level, title: notice.title, message: notice.place + ", " + notice.state });
    }
  }

  function addUserReport(report) {
    const id = "NB-" + Math.floor(1000 + Math.random() * 9000);
    const notice = {
      id,
      title: `Citizen report — ${report.type}`,
      message: report.description || "New report submitted from the field.",
      level: report.severityLevel || "moderate",
      state: report.state,
      district: report.district,
      place: report.place || report.district,
      category: "advisory",
      time: "just now",
    };
    setNotices((prev) => [notice, ...prev]);
  }

  useEffect(() => {
    const id = setInterval(pushIncoming, SIMULATED_FEED_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotifyContext.Provider value={{ notices, alerts, toast, dismissToast: () => setToast(null), addUserReport }}>
      {children}
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotifyContext);
}

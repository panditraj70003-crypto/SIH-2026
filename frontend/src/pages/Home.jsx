import React from "react";
import NerLeafletMap from "../components/NerLeafletMap.jsx";
import NoticeBoard from "../components/NoticeBoard.jsx";
import EmergencyNumbers from "../components/EmergencyNumbers.jsx";
import { Card, StatCard, Notice } from "../components/ui.jsx";
import { useNotify } from "../context/NotifyContext.jsx";

export default function Home({ onOpenAlerts, focusLocation, onFocusHandled }) {
  const { alerts, notices } = useNotify();
  const active = alerts.filter((a) => a.status === "active");
  const critical = active.filter((a) => a.risk >= 80).length;
  const high = active.filter((a) => a.risk >= 60 && a.risk < 80).length;

  return (
    <div className="space-y-4">
      <Notice>Sample data for this SIH prototype — no live sensors are connected yet.</Notice>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Critical zones" value={String(critical).padStart(2, "0")} hint="Act within 12 hours" level="critical" onClick={onOpenAlerts} />
        <StatCard label="High-risk zones" value={String(high).padStart(2, "0")} hint="Watch closely" level="high" onClick={onOpenAlerts} />
        <StatCard label="Active warnings" value={String(active.length).padStart(2, "0")} hint="Sent to control rooms" level="moderate" onClick={onOpenAlerts} />
        <StatCard label="Notices today" value={String(notices.length).padStart(2, "0")} hint="From all sources" />
      </div>

      <Card title="Risk map" subtitle="Hover a district for its reading, tap it for details">
        <NerLeafletMap focusLocation={focusLocation} onFocusHandled={onFocusHandled} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <NoticeBoard />
        <EmergencyNumbers />
      </div>
    </div>
  );
}

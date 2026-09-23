import { useCallback, useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus.js";

const KEY = "nersafe-report-queue";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    /* storage full or unavailable - the report still lives in memory for this session */
  }
}
function clientId() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : "r" + Date.now() + Math.random().toString(16).slice(2);
}

// Simulates POST /api/reports (multipart/form-data per the brief). Swap the
// body of trySend() for a real fetch() once the backend endpoint exists -
// the queue/state machine (pending_sync -> syncing -> synced/failed) stays the same.
function trySend(report) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() < 0.92 ? resolve() : reject(new Error("network"))), 900 + Math.random() * 600);
  });
}

export function useReportQueue(onSynced) {
  const [queue, setQueue] = useState(load);
  const online = useOnlineStatus();

  useEffect(() => save(queue), [queue]);

  const update = useCallback((id, patch) => {
    setQueue((prev) => prev.map((r) => (r.clientId === id ? { ...r, ...patch } : r)));
  }, []);

  const syncOne = useCallback(
    async (report) => {
      update(report.clientId, { status: "syncing" });
      try {
        await trySend(report);
        update(report.clientId, { status: "synced" });
        onSynced && onSynced(report);
      } catch (e) {
        update(report.clientId, { status: "failed" });
      }
    },
    [update, onSynced]
  );

  useEffect(() => {
    if (!online) return;
    queue.filter((r) => r.status === "pending_sync" || r.status === "failed").forEach(syncOne);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  function addReport(data) {
    const report = { ...data, clientId: clientId(), createdAt: Date.now(), status: online ? "pending_sync" : "pending_sync" };
    setQueue((prev) => [report, ...prev]);
    if (online) syncOne(report);
    return report;
  }

  function retry(clientIdToRetry) {
    const r = queue.find((x) => x.clientId === clientIdToRetry);
    if (r) syncOne(r);
  }

  function clearSynced() {
    setQueue((prev) => prev.filter((r) => r.status !== "synced"));
  }

  return { queue, addReport, retry, clearSynced, online };
}

import React, { useState } from "react";
import { Card, Button, Chip, Notice } from "../components/ui.jsx";
import { CameraIcon, VideoIcon, TextIcon, PinIcon, CheckIcon, WifiOffIcon } from "../components/icons.jsx";
import places from "../data/places.js";
import { reportTypes } from "../data/mockData.js";
import { useReportQueue } from "../lib/useReportQueue.js";
import { useNotify } from "../context/NotifyContext.jsx";

const severities = ["Low", "Moderate", "High", "Critical"];
const severityLevel = { Low: "low", Moderate: "moderate", High: "high", Critical: "critical" };

const statusLabel = {
  pending_sync: "Waiting to send",
  syncing: "Sending…",
  synced: "Sent",
  failed: "Couldn't send — will retry",
};

function readAsDataUrl(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) return reject(new Error("too-large"));
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Post() {
  const { addUserReport } = useNotify();
  const { queue, addReport, retry, online } = useReportQueue((r) =>
    addUserReport({ ...r, severityLevel: severityLevel[r.severity] })
  );

  const [type, setType] = useState(reportTypes[0]);
  const [severity, setSeverity] = useState("Moderate");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [videoName, setVideoName] = useState("");
  const [coords, setCoords] = useState("");
  const [error, setError] = useState("");
  const [sentFlash, setSentFlash] = useState(false);

  const stateObj = places.states.find((s) => s.id === stateId);

  async function onPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setPhoto(await readAsDataUrl(f, 1_500_000));
      setPhotoName(f.name);
      setError("");
    } catch {
      setError("That photo is larger than 1.5 MB — choose a smaller one.");
    }
  }
  function onVideo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 15_000_000) {
      setError("That video is larger than 15 MB — choose a shorter clip.");
      return;
    }
    setVideoName(f.name);
    setError("");
  }
  function useLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
      () => setError("Couldn't get your location — enter it manually below.")
    );
  }

  function reset() {
    setType(reportTypes[0]);
    setSeverity("Moderate");
    setPlace("");
    setDescription("");
    setPhoto(null);
    setPhotoName("");
    setVideoName("");
    setCoords("");
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!stateId || !districtId) {
      setError("Choose a state and district so responders know where to go.");
      return;
    }
    if (!description.trim() && !photo && !videoName) {
      setError("Add a photo, video or a short description — at least one of the three.");
      return;
    }
    addReport({
      type,
      severity,
      state: stateObj.name,
      district: districtId,
      place: place.trim() || undefined,
      description: description.trim(),
      photo,
      photoName,
      videoName,
      coords,
    });
    reset();
    setError("");
    setSentFlash(true);
    setTimeout(() => setSentFlash(false), 4000);
  }

  return (
    <div className="space-y-4">
      {!online && (
        <Notice>
          <span className="inline-flex items-center gap-1.5 font-medium text-moderate">
            <WifiOffIcon size={13} /> Offline —
          </span>{" "}
          your report will be saved on this device and sent automatically once you're back online.
        </Notice>
      )}
      {sentFlash && (
        <div className="flex items-center gap-2 rounded-xl border border-low/40 bg-low/10 px-3.5 py-2.5 text-sm font-medium text-low">
          <CheckIcon size={16} />
          Report added to the queue below.
        </div>
      )}

      <Card title="Report an incident" subtitle="Photo, video or text — send whichever you have, or all three">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            >
              {reportTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">State</label>
              <select
                value={stateId}
                onChange={(e) => {
                  setStateId(e.target.value);
                  setDistrictId("");
                }}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Choose…</option>
                {places.states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">District</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                disabled={!stateObj}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="">Choose…</option>
                {stateObj?.districts.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Place / landmark <span className="normal-case text-muted">· optional</span>
            </label>
            <div className="flex gap-2">
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Near the school, NH-13, etc."
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <Button type="button" variant="outline" onClick={useLocation} aria-label="Use current location">
                <PinIcon size={16} />
              </Button>
            </div>
            {coords && <p className="mt-1 text-[11px] text-muted">GPS: {coords}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Severity</label>
            <div className="flex flex-wrap gap-2">
              {severities.map((s) => (
                <Chip key={s} active={severity === s} onClick={() => setSeverity(s)} type="button">
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <TextIcon size={13} /> What did you see?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mud and boulders across the road near the school…"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-5 text-center text-muted hover:bg-surface2">
              {photo ? (
                <img src={photo} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <CameraIcon size={20} />
              )}
              <span className="text-xs font-medium">{photoName || "Add a photo"}</span>
              <span className="text-[10px]">up to 1.5 MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
            <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-5 text-center text-muted hover:bg-surface2">
              <VideoIcon size={20} />
              <span className="text-xs font-medium">{videoName || "Add a video"}</span>
              <span className="text-[10px]">up to 15 MB</span>
              <input type="file" accept="video/*" className="hidden" onChange={onVideo} />
            </label>
          </div>

          {error && <p className="text-xs font-medium text-critical">{error}</p>}

          <Button type="submit" className="w-full">
            Submit report
          </Button>
        </form>
      </Card>

      {queue.length > 0 && (
        <Card title="Your reports" subtitle={`${queue.length} on this device`}>
          <div className="flex flex-col gap-2.5">
            {queue.map((r) => (
              <div key={r.clientId} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface2">
                  {r.photo ? <img src={r.photo} alt="" className="h-full w-full object-cover" /> : <CameraIcon size={16} className="text-muted" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.type} · {r.severity}</p>
                  <p className="truncate text-[11px] text-muted">{r.place ? r.place + ", " : ""}{r.state}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-[11px] font-medium ${
                      r.status === "synced" ? "text-low" : r.status === "failed" ? "text-critical" : "text-muted"
                    }`}
                  >
                    {statusLabel[r.status]}
                  </span>
                  {r.status === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => retry(r.clientId)}>
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

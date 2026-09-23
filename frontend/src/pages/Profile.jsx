import React, { useEffect, useState } from "react";
import { Card, Button, Chip } from "../components/ui.jsx";
import { UserIcon, LogOutIcon, CheckIcon } from "../components/icons.jsx";
import places from "../data/places.js";
import { isSoundOn, setSoundOn, playChime } from "../lib/sound.js";

const KEY = "nersafe-profile";
const defaultProfile = { username: "", email: "", mobile: "", stateId: "", districtId: "" };

function load() {
  try {
    return { ...defaultProfile, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaultProfile;
  }
}

export default function Profile() {
  const [profile, setProfile] = useState(load);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ push: true, sms: false, daily: true });
  const [sound, setSound] = useState(isSoundOn);
  const [lang, setLang] = useState("English");

  useEffect(() => {
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const stateObj = places.states.find((s) => s.id === profile.stateId);

  function set(field, value) {
    setProfile((p) => ({ ...p, [field]: value, ...(field === "stateId" ? { districtId: "" } : {}) }));
  }

  function onSave(e) {
    e.preventDefault();
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {
      /* storage unavailable - profile still holds for this session */
    }
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <UserIcon size={24} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold">{profile.username || "Add your name"}</p>
            <p className="truncate text-xs text-muted">{profile.email || "No email added yet"}</p>
          </div>
        </div>
      </Card>

      <Card title="Profile details">
        <form onSubmit={onSave} className="space-y-3">
          <Field label="Username">
            <input value={profile.username} onChange={(e) => set("username", e.target.value)} placeholder="e.g. rina_k" className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Email">
            <input type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Mobile number">
            <input value={profile.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 98xxxxxxx0" className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <select value={profile.stateId} onChange={(e) => set("stateId", e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent">
                <option value="">Choose…</option>
                {places.states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="District">
              <select value={profile.districtId} onChange={(e) => set("districtId", e.target.value)} disabled={!stateObj} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50">
                <option value="">Choose…</option>
                {stateObj?.districts.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit">Save changes</Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-medium text-low">
                <CheckIcon size={13} /> Saved on this device
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card title="Notification preferences">
        <div className="divide-y divide-line">
          <Toggle label="Push notifications" hint="Pop-up alerts inside this app" on={notifs.push} onChange={() => setNotifs((n) => ({ ...n, push: !n.push }))} />
          <Toggle
            label="Notification sound"
            hint="A short chime when a new warning pops up"
            on={sound}
            onChange={() => {
              const next = !sound;
              setSound(next);
              setSoundOn(next);
              if (next) playChime();
            }}
          />
          <Toggle label="SMS to my number" hint="Needs a gateway — not connected yet" on={notifs.sms} onChange={() => setNotifs((n) => ({ ...n, sms: !n.sms }))} />
          <Toggle label="Daily 6 am summary" hint="One message with the night's readings" on={notifs.daily} onChange={() => setNotifs((n) => ({ ...n, daily: !n.daily }))} />
        </div>
      </Card>

      <Card title="Alert language">
        <div className="flex flex-wrap gap-2">
          {["English", "हिन्दी", "অসমীয়া", "Mizo ṭawng"].map((l) => (
            <Chip key={l} active={lang === l} onClick={() => setLang(l)}>
              {l}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">Only English text ships in this prototype — translations are planned.</p>
      </Card>

      <Button variant="outline" className="w-full" onClick={() => alert("This is a demo — no account is signed in yet.")}>
        <LogOutIcon size={16} /> Log out
      </Button>

    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, hint, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onChange}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: on ? "rgb(var(--accent))" : "rgb(var(--line))" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

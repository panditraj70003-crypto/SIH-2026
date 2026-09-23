// No .mp3/.wav shipped - the chime is synthesised on the fly, so this adds
// ~0 KB to the app. Respects a "sound off" preference stored by Profile.jsx
// and gives up quietly if the browser blocks audio before any user gesture.
const KEY = "nersafe-sound";

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable - the toggle still works for this tab */
  }
}

let ctx = null;
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(ac, freq, start, dur, gain = 0.16) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.value = 0;
  osc.connect(g);
  g.connect(ac.destination);
  const t0 = ac.currentTime + start;
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A short, calm two-note chime - not an alarm siren, so it doesn't startle
// on a page that may already be showing something upsetting.
export function playChime() {
  if (!isSoundOn()) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  try {
    tone(ac, 880, 0, 0.22);
    tone(ac, 1174.66, 0.14, 0.28);
  } catch {
    /* audio blocked (e.g. autoplay policy before any user gesture) - fail silently */
  }
}

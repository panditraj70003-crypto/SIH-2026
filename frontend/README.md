# NER-SAFE

Frontend for **SIH26001 — AI-Based Early Warning and Landslide Risk Monitoring
System in NER** (Ministry of Development of North Eastern Region).

React + Tailwind. No router, no icon package, no chart library — icons and
analytics charts are still hand-rolled inline SVG (`src/components/icons.jsx`,
`src/components/charts.jsx`) to keep the JS bundle small. The one deliberate
exception is the risk map, which uses the real **Leaflet.js** map + actual
district polygons (Census of India boundaries) so every state and district is
clearly visible and clickable — this needs an internet connection to load its
map tiles (CartoDB), same as the reference map file it's built from.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

This was built in a sandbox with no network access, so `npm install` has not
been run here — the code has been verified with a full esbuild bundle
(zero errors, zero warnings, every import resolves, using a stand-in for the
`leaflet` package) instead. It should install and run normally on your
machine; `leaflet` will be fetched for real by `npm install`.

## What's inside

```
src/
  App.jsx                single-page shell: top bar, sliding tab nav, page
                          switch, toast, chatbot — no router
  context/
    ThemeContext.jsx      light/dark toggle (shown on Home only, per the brief)
    NotifyContext.jsx     shared live feed of notices + alerts, the
                          cross-page pop-up toast (with a chime) when
                          something new comes in
  pages/
    Home.jsx              risk map, notice board, emergency numbers
    Post.jsx              report an incident (photo / video / text, any mix)
    RiskAlerts.jsx         live alerts grouped by severity + analytics charts
    Profile.jsx            profile fields, notification/sound/language prefs
  components/
    NerLeafletMap.jsx      the real Leaflet district map (state borders,
                           per-district risk colour + glow, roadblock pulse
                           markers, alert ticker, HUD counts) — ported from
                           the team's ner-safe-map-2.html reference
    NerLeafletMap.css      its styling, scoped under .nsmap so it can't leak
                           into the rest of the app
    TopTabs.jsx             horizontal nav with a sliding pill/underline,
                           sits directly under the top bar on every screen
    ChatBot.jsx             floating chat widget, answers from this site's
                           own data only (see src/lib/chatbot.js)
    NoticeBoard.jsx        filterable notice list (state/district/category)
    EmergencyNumbers.jsx   national helplines + optional district numbers
    charts.jsx             AreaChart / BarChart / HBarChart / Donut (inline SVG)
    icons.jsx              hand-drawn icon set (no icon package dependency)
    ui.jsx                 Card, Button, RiskPill, Chip, StatCard, Notice
  lib/
    chatbot.js             local rule-based answer engine (alerts, notices,
                           emergency numbers, place lookup) — no external API
    sound.js                Web-Audio chime for pop-up notifications, plus
                           the on/off preference used by Profile.jsx
    places-helpers.js       resolves a stored district id to its real name,
                           so alerts/chatbot can point the map at it
    useReportQueue.js       offline-first report queue (localStorage)
    useOnlineStatus.js      navigator.onLine hook
    colors.js               CSS-variable color helpers for inline SVG
  data/
    mockData.js             sample notices, alerts, analytics, emergency
                            numbers — this is what you swap for a real API
    places.js               state/district/town lookup table, used by the
                            map's "view on map" flow, Post/Profile dropdowns,
                            EmergencyNumbers and the chatbot
    nerMap.js               GENERATED, currently unused (pre-drawn SVG paths
                            from the old lightweight map — kept in case you
                            want that version back instead of Leaflet)

public/
  data/districts.json      real district polygons (121 districts, 8 states)
  data/state-borders.json  state outline polygons
                            both fetched at runtime by NerLeafletMap so they
                            stay out of the JS bundle and get cached by
                            public/sw.js after first load

scripts/
  build-map-data.py        regenerates places.js (and the unused nerMap.js)
                           from source district polygons - only needed if you
                           change the town list or want different polygons
```

## The map

`NerLeafletMap.jsx` loads Leaflet from the `leaflet` npm package, fetches
`/data/districts.json` + `/data/state-borders.json`, and renders exactly the
look of the reference file: dark CartoDB tiles, red/orange/green/grey risk
fills with a glow on high/moderate districts, pulsing markers on high-risk
districts, a scrolling red-alert ticker, and a small HUD row with live counts.
Hover a district for its tooltip; tap it to select it (flies to it, and shows
a detail card below the map). The sample risk numbers come from
`fetchRiskData()` inside that file — swap it for a real API call and every
other UI piece keeps working, exactly as commented in the file.

## Nav

`TopTabs.jsx` replaces the old sidebar/bottom-nav with a single horizontal bar
under the top bar, with a sliding pill + underline that animates to whichever
tab is active — the same on mobile and desktop now.

## Pop-up sound

`NotifyContext`'s toast plays a short two-note chime via the Web Audio API
(`src/lib/sound.js`) — no audio file shipped, so it adds ~0 KB. Turn it off
in Profile → Notification preferences; the preference is remembered in
`localStorage`.

## Chatbot

The floating button (bottom-right) opens a small chat panel
(`ChatBot.jsx`) backed by `src/lib/chatbot.js` — plain keyword matching over
the app's own data (active alerts, notices, national/district emergency
numbers, every state and district name). It works fully offline and never
calls an external AI API. Answers include quick-action buttons that can jump
to a page or focus a specific district on the map. Extend `answerQuery()` in
`chatbot.js` to teach it more patterns.

## Theme

Colors live as `R G B` CSS variables in `src/index.css` (light palette under
`:root`, dark palette under `.dark`), mapped in `tailwind.config.js` using
`rgb(var(--x) / <alpha-value>)` so classes like `bg-accent/10` work with
opacity. Toggling dark mode just adds/removes the `.dark` class on `<html>`
(`src/context/ThemeContext.jsx`) — nothing else needs to change per-component.
Note the map itself stays permanently dark-themed (matching the reference
file and its map tiles) regardless of the app-wide toggle.

## Connecting a real backend

1. Map: replace `fetchRiskData()` in `NerLeafletMap.jsx` with a real
   `fetch('/api/risk')` call, keeping the same `{ "State|District": {level,
   rainfall} }` shape.
2. Alerts/notices: replace the arrays in `mockData.js`, or point
   `NotifyContext`'s `pushIncoming()` at a WebSocket/poll.
3. Reports: replace `trySend()` in `src/lib/useReportQueue.js` with
   `fetch('/api/reports', { method: 'POST', body: formData })` — the
   pending → syncing → synced/failed state machine doesn't need to change.
4. Chatbot: once alerts/map are live, `chatbot.js` automatically answers
   from the live data — no changes needed there.

## Offline behaviour

- A citizen report made offline is saved to `localStorage` immediately and
  retried automatically once `navigator.onLine` flips back on.
- `public/sw.js` caches the app shell and, generically, any GET response
  (including the district geojson) so a repeat visit works with no signal —
  it just can't fetch fresh map tiles or risk data while offline.

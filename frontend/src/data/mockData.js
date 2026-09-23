// All values on this page are SAMPLE DATA for the SIH demo.
// Swap the arrays below for real API responses once the backend/AI
// service is live - the rest of the app (map, notice board, alerts,
// analytics) already reads from here and doesn't need to change.

export const riskLevels = [
  { key: "low", label: "Low", range: "0 – 30%", var: "--low" },
  { key: "moderate", label: "Moderate", range: "30 – 60%", var: "--moderate" },
  { key: "high", label: "High", range: "60 – 80%", var: "--high" },
  { key: "critical", label: "Critical", range: "80 – 100%", var: "--critical" },
];

export function levelOf(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "moderate";
  return "low";
}

// Standard nationwide helpline numbers (India). District control rooms
// vary by district - add the real number for your district here once
// your team has it; "—" is shown until then.
export const nationalEmergencyNumbers = [
  { label: "All-in-one emergency (ERSS)", number: "112" },
  { label: "Police", number: "100" },
  { label: "Fire brigade", number: "101" },
  { label: "Ambulance", number: "102" },
  { label: "State disaster control room", number: "1070" },
  { label: "District disaster control room", number: "1077" },
  { label: "Women's helpline", number: "1091" },
  { label: "Child helpline", number: "1098" },
];

// district-specific control room numbers, only where known - keyed by district id
export const districtControlRooms = {
  "sikkim-gangtok": "03592-202033",
  "arunachal-pradesh-west-kameng": "03782-223627",
  "assam-kamrup-metropolitan": "0361-2237219",
};

export const reportTypes = [
  "Landslide",
  "Ground crack",
  "Slope movement",
  "Road blockage",
  "Flash flood",
  "Other",
];

// ---------------------------------------------------------------- notices
// category: weather | road | advisory | tourist | sports
export const initialNotices = [
  {
    id: "NB-1001",
    title: "Heavy rain warning — next 24 hours",
    message: "The met department expects very heavy rainfall over East Sikkim and West Kameng. Avoid non-essential travel on hill roads.",
    level: "high",
    state: "Sikkim",
    district: "sikkim-gangtok",
    place: "Gangtok",
    category: "weather",
    time: "18 min ago",
  },
  {
    id: "NB-1002",
    title: "NH-13 partially blocked near Bomdila",
    message: "Debris from a small slope slip is blocking one lane. A JCB has been called; expect delays of 30–40 minutes.",
    level: "moderate",
    state: "Arunachal Pradesh",
    district: "arunachal-pradesh-west-kameng",
    place: "Bomdila",
    category: "road",
    time: "42 min ago",
  },
  {
    id: "NB-1003",
    title: "Trek route advisory — Dzukou Valley",
    message: "Trails above 2,200 m are slippery after last night's rain. Local guides recommend postponing overnight treks this weekend.",
    level: "moderate",
    state: "Nagaland",
    district: "nagaland-kohima",
    place: "Dzukou Valley",
    category: "tourist",
    time: "1 hr ago",
  },
  {
    id: "NB-1004",
    title: "Kaziranga safari zones reopened",
    message: "Forest tracks that were closed after yesterday's rain have reopened for morning safaris.",
    level: "low",
    state: "Assam",
    district: "assam-golaghat",
    place: "Kaziranga (Kohora)",
    category: "tourist",
    time: "2 hr ago",
  },
  {
    id: "NB-1005",
    title: "Umiam Lake water sports paused",
    message: "Boating and kayaking are paused until water levels stabilise following upstream rain.",
    level: "moderate",
    state: "Meghalaya",
    district: "meghalaya-ribhoi",
    place: "Umiam Lake (Barapani)",
    category: "sports",
    time: "3 hr ago",
  },
  {
    id: "NB-1006",
    title: "Slope monitoring stepped up — Aizawl Hills",
    message: "Ground sensors show slow soil movement near residential slopes. Field teams are inspecting retaining walls today.",
    level: "high",
    state: "Mizoram",
    district: "mizoram-aizawl",
    place: "Aizawl",
    category: "advisory",
    time: "4 hr ago",
  },
];

// ---------------------------------------------------------------- alerts
export const initialAlerts = [
  {
    id: "ALT-2601",
    district: "arunachal-pradesh-tawang",
    place: "Tawang Pass",
    state: "Arunachal Pradesh",
    risk: 88,
    status: "active",
    reason: "Continuous rainfall for 19 hours with saturated soil on a 44° slope.",
    rainfall: 118,
    soil: 84,
    prediction: "Critical landslide risk within 6 hours",
    action: "Close the pass road, move crews to safe ground and alert the district control room.",
    time: "12 min ago",
  },
  {
    id: "ALT-2602",
    district: "sikkim-gangtok",
    place: "East Sikkim",
    state: "Sikkim",
    risk: 82,
    status: "active",
    reason: "Heavy rainfall combined with high soil moisture detected.",
    rainfall: 142,
    soil: 81,
    prediction: "High landslide risk within 6–12 hours",
    action: "Monitor vulnerable roads and restrict access if required.",
    time: "22 min ago",
  },
  {
    id: "ALT-2603",
    district: "mizoram-aizawl",
    place: "Aizawl Hills",
    state: "Mizoram",
    risk: 78,
    status: "active",
    reason: "Slope movement sensors report 4 mm displacement in 12 hours.",
    rainfall: 128,
    soil: 76,
    prediction: "High landslide risk within 12 hours",
    action: "Evacuate two hillside colonies and stage rescue teams nearby.",
    time: "27 min ago",
  },
  {
    id: "ALT-2604",
    district: "sikkim-mangan",
    place: "North Sikkim Corridor",
    state: "Sikkim",
    risk: 76,
    status: "active",
    reason: "Rain accumulation above the 120 mm threshold for this terrain class.",
    rainfall: 134,
    soil: 79,
    prediction: "Critical risk within 12 hours",
    action: "Hold civilian convoys at Mangan until the next model run.",
    time: "17 min ago",
  },
  {
    id: "ALT-2605",
    district: "meghalaya-east-khasi-hills",
    place: "Cherrapunji Slopes",
    state: "Meghalaya",
    risk: 71,
    status: "active",
    reason: "Record rainfall of 196 mm over 24 hours on fully saturated ground.",
    rainfall: 196,
    soil: 88,
    prediction: "Elevated risk within 12–24 hours",
    action: "Warn villages below the escarpment and inspect drainage channels.",
    time: "42 min ago",
  },
  {
    id: "ALT-2608",
    district: "assam-kamrup-metropolitan",
    place: "Guwahati Hills",
    state: "Assam",
    risk: 46,
    status: "active",
    reason: "Localised rainfall over hillside settlements.",
    rainfall: 58,
    soil: 55,
    prediction: "Moderate risk within 24 hours",
    action: "Continue monitoring; no restrictions needed yet.",
    time: "57 min ago",
  },
  {
    id: "ALT-2610",
    district: "manipur-imphal-east",
    place: "Imphal East Hills",
    state: "Manipur",
    risk: 38,
    status: "resolved",
    reason: "Rainfall stopped; soil moisture returned to the normal range.",
    rainfall: 42,
    soil: 48,
    prediction: "No further risk expected",
    action: "Road reopened after inspection.",
    time: "11 hr ago",
  },
  {
    id: "ALT-2611",
    district: "tripura-west-tripura",
    place: "Agartala Outskirts",
    state: "Tripura",
    risk: 29,
    status: "resolved",
    reason: "Drainage blockage cleared by the municipal team.",
    rainfall: 18,
    soil: 34,
    prediction: "No further risk expected",
    action: "Closed after field verification.",
    time: "14 hr ago",
  },
];

// events that can arrive "live" - NotifyContext rotates through these to
// demonstrate the cross-page pop-up notification (feature 3 of the brief)
export const incomingPool = [
  {
    kind: "alert",
    district: "meghalaya-west-jaintia-hills",
    place: "Jowai Escarpment",
    state: "Meghalaya",
    risk: 74,
    reason: "New crack reported near the quarry road after this morning's rain.",
    rainfall: 96,
    soil: 70,
    prediction: "High landslide risk within 12 hours",
    action: "Cordon off the quarry road and inspect the slope before reopening.",
  },
  {
    kind: "notice",
    title: "Flash flood warning — Dhemaji lowlands",
    message: "Rapid snowmelt and rain upstream may raise river levels quickly this evening.",
    level: "high",
    state: "Assam",
    district: "assam-dhemaji",
    place: "Dhemaji",
    category: "weather",
  },
  {
    kind: "notice",
    title: "Road cleared — NH-40 near Dimapur",
    message: "The earlier blockage has been cleared and traffic is moving normally again.",
    level: "low",
    state: "Nagaland",
    district: "nagaland-dimapur",
    place: "Dimapur",
    category: "road",
  },
  {
    kind: "alert",
    district: "manipur-senapati",
    place: "Senapati Hills",
    state: "Manipur",
    risk: 66,
    reason: "Soil moisture crossed the high-risk threshold after three days of rain.",
    rainfall: 88,
    soil: 72,
    prediction: "High risk within 18 hours",
    action: "Warn nearby settlements and check retaining walls on the district road.",
  },
];

// ---------------------------------------------------------------- analytics
export const rainfallTrend = [
  { t: "Mon", v: 22 },
  { t: "Tue", v: 35 },
  { t: "Wed", v: 18 },
  { t: "Thu", v: 40 },
  { t: "Fri", v: 61 },
  { t: "Sat", v: 88 },
  { t: "Sun", v: 104 },
];

export const riskByState = [
  { k: "Sikkim", v: 42 },
  { k: "Assam", v: 36 },
  { k: "Meghalaya", v: 31 },
  { k: "Mizoram", v: 27 },
  { k: "Arunachal", v: 24 },
  { k: "Nagaland", v: 18 },
  { k: "Manipur", v: 14 },
  { k: "Tripura", v: 9 },
];

export const alertsBySeverity = [
  { k: "Critical", v: 8, level: "critical" },
  { k: "High", v: 24, level: "high" },
  { k: "Moderate", v: 39, level: "moderate" },
  { k: "Low", v: 17, level: "low" },
];

export const riskTrendYear = [
  { m: "Apr", v: 22 },
  { m: "May", v: 34 },
  { m: "Jun", v: 58 },
  { m: "Jul", v: 71 },
  { m: "Aug", v: 66 },
  { m: "Sep", v: 78 },
  { m: "Oct", v: 41 },
];

// rainfall (mm) alongside predicted risk (%) for the same 7 days - feeds the
// combo chart (bars + line) on the Alerts page
export const rainVsRisk = [
  { d: "Sep 13", rain: 28, risk: 31 },
  { d: "Sep 14", rain: 46, risk: 39 },
  { d: "Sep 15", rain: 61, risk: 48 },
  { d: "Sep 16", rain: 88, risk: 59 },
  { d: "Sep 17", rain: 104, risk: 66 },
  { d: "Sep 18", rain: 131, risk: 74 },
  { d: "Sep 19", rain: 142, risk: 82 },
];

// surface (s) vs deep (p) soil sensors, last 7 days - feeds the two-line
// area chart on the Alerts page
export const soilMoisture = [
  { d: "Sep 13", s: 44, p: 38 },
  { d: "Sep 14", s: 52, p: 41 },
  { d: "Sep 15", s: 58, p: 47 },
  { d: "Sep 16", s: 66, p: 54 },
  { d: "Sep 17", s: 72, p: 61 },
  { d: "Sep 18", s: 78, p: 68 },
  { d: "Sep 19", s: 81, p: 73 },
];

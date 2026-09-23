#!/usr/bin/env python3
"""
Builds the two small data files the map needs:

  src/data/nerMap.js   - simplified district + state outlines as ready-to-draw SVG paths
  src/data/places.js   - states, districts, towns (names + lat/lon only, no geometry)

Source: the team's `ner-safe-map-2.html` (real district polygons, Census of India
boundaries). Run it again only if you change the source polygons or the town list:

    python3 scripts/build-map-data.py path/to/ner-safe-map-2.html

Why pre-draw the paths? The browser then does no projection or parsing work - it just
paints strings - which keeps the map fast on cheap phones.
"""
import json, math, re, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else "ner-safe-map-2.html"
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data")

# ---- projection: simple equirectangular, good enough for a 9 x 7 degree area ----
LON0, LAT0, K = 88.0, 29.6, 400.0            # west edge, north edge, units per degree
KX = K * math.cos(math.radians(26.0))          # squeeze longitude so shapes look right
TOL = 0.9                                      # simplification tolerance in map units (~0.2 km... ~0.002 deg)

def proj(lon, lat):
    return ((lon - LON0) * KX, (LAT0 - lat) * K)

def dp(pts, tol):
    """Douglas-Peucker on a list of (x, y)."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1e-9
        best, idx = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / L
            if d > best:
                best, idx = d, i
        if best > tol:
            keep[idx] = True
            stack.append((a, idx)); stack.append((idx, b))
    return [p for p, k in zip(pts, keep) if k]

def ring_to_pts(ring):
    pts = [proj(lo, la) for lo, la in ring]
    if pts[0] == pts[-1]:
        pts = pts[:-1]
    return pts

def simplify_ring(pts):
    s = dp(pts + [pts[0]], TOL)[:-1]
    return s if len(s) >= 3 else pts[:3]

def polys_of(geom):
    return geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]

def area(pts):
    return 0.5 * sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))

def build_path(rings):
    """Relative integer path: tiny to ship, fast to parse."""
    out = []
    for r in rings:
        ip = [(round(x), round(y)) for x, y in r]
        # drop consecutive duplicates
        ded = [ip[0]]
        for p in ip[1:]:
            if p != ded[-1]:
                ded.append(p)
        if len(ded) < 3:
            continue
        s = "M%d %d" % ded[0]
        px, py = ded[0]
        parts = []
        for x, y in ded[1:]:
            parts.append("%d %d" % (x - px, y - py))
            px, py = x, y
        out.append(s + "l" + " ".join(parts) + "z")
    return "".join(out).replace(" -", "-")

def bbox_of(rings):
    xs = [p[0] for r in rings for p in r]; ys = [p[1] for r in rings for p in r]
    return [round(min(xs)), round(min(ys)), round(max(xs) - min(xs)), round(max(ys) - min(ys))]

def pip(x, y, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi:
            inside = not inside
        j = i
    return inside

def inside_poly(x, y, rings_by_poly):
    for poly in rings_by_poly:
        if pip(x, y, poly[0]) and not any(pip(x, y, h) for h in poly[1:]):
            return True
    return False

def interior_point(poly_list):
    """A point that is really inside the shape (for labels): longest horizontal chord through the centroid row."""
    big = max(poly_list, key=lambda p: abs(area(p[0])))
    ring = big[0]
    A = area(ring)
    cy = sum((ring[i][1] + ring[(i + 1) % len(ring)][1]) *
             (ring[i][0] * ring[(i + 1) % len(ring)][1] - ring[(i + 1) % len(ring)][0] * ring[i][1])
             for i in range(len(ring))) / (6 * A)
    best = None
    for dy in [0, -6, 6, -12, 12, -20, 20, -32, 32]:
        y = cy + dy
        xs = []
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i]; x2, y2 = ring[(i + 1) % n]
            if (y1 > y) != (y2 > y):
                xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
        xs.sort()
        for a, b in zip(xs[0::2], xs[1::2]):
            if best is None or b - a > best[0]:
                best = (b - a, (a + b) / 2, y)
    return (round(best[1]), round(best[2]))

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

# ---------------------------------------------------------------- load source
html = open(SRC, encoding="utf-8").read()
def grab(name):
    i = html.find("const %s = " % name) + len("const %s = " % name)
    j = html.find(";\n", i)
    return json.loads(html[i:j])
DIST = grab("DISTRICTS")
STATES = grab("STATE_BORDERS")

# ---------------------------------------------------------------- districts
districts = []
dist_polys = {}     # id -> list of polygons (projected, unsimplified) for point-in-polygon checks
for f in DIST["features"]:
    p = f["properties"]
    did = slug(p["state"] + "-" + p["district"])
    full = [[ring_to_pts(r) for r in poly] for poly in polys_of(f["geometry"])]
    dist_polys[did] = full
    simp = [[simplify_ring(r) for r in poly] for poly in full]
    # keep the biggest ring of each polygon plus any hole that is not tiny
    rings = [r for poly in simp for r in poly if abs(area(r)) > 0.6]
    lx, ly = proj(p["lon"], p["lat"])
    if not inside_poly(lx, ly, full):
        lx, ly = interior_point(full)
    districts.append(dict(id=did, name=p["district"], state=p["state"], d=build_path(rings),
                          b=bbox_of(rings), lx=round(lx), ly=round(ly), lat=p["lat"], lon=p["lon"]))
districts.sort(key=lambda d: (d["state"], d["name"]))

# ---------------------------------------------------------------- states
states = []
for f in STATES["features"]:
    nm = f["properties"]["state"]
    full = [[ring_to_pts(r) for r in poly] for poly in polys_of(f["geometry"])]
    simp = [[simplify_ring(r) for r in poly] for poly in full]
    rings = [r for poly in simp for r in poly if abs(area(r)) > 1.5]
    lx, ly = interior_point(full)
    states.append(dict(id=slug(nm), name=nm, d=build_path(rings), b=bbox_of(rings), lx=lx, ly=ly))
states.sort(key=lambda s: s["name"])

allb = [b for s in states for b in [s["b"]]]
minx = min(b[0] for b in allb); miny = min(b[1] for b in allb)
maxx = max(b[0] + b[2] for b in allb); maxy = max(b[1] + b[3] for b in allb)
region = [minx, miny, maxx - minx, maxy - miny]

# ---------------------------------------------------------------- towns / places
# (name, lat, lon, kind, expected district) - kind: town | tourist | sports | road
# expected district is only used as a check; the real district comes from point-in-polygon.
T = [
 # Sikkim
 ("Gangtok",27.3389,88.6065,"town","Gangtok"),("Pakyong",27.2333,88.5833,"town","Pakyong"),
 ("Namchi",27.1667,88.3500,"town","Namchi"),("Mangan",27.5167,88.5333,"town","Mangan"),
 ("Gyalshing",27.2833,88.2667,"town","Gyalshing"),("Soreng",27.1833,88.2167,"town","Soreng"),
 ("Tsomgo (Changu) Lake",27.3750,88.7639,"tourist","Gangtok"),("Lachung",27.6900,88.7400,"tourist","Mangan"),
 ("Pelling",27.3000,88.2400,"tourist","Gyalshing"),("Ravangla",27.3000,88.3600,"tourist","Namchi"),
 # Arunachal Pradesh
 ("Itanagar",27.0844,93.6053,"town","Papum Pare"),("Naharlagun",27.1040,93.6960,"town","Papum Pare"),
 ("Tawang",27.5860,91.8590,"town","Tawang"),("Bomdila",27.2646,92.4157,"town","West Kameng"),
 ("Dirang",27.3580,92.2450,"town","West Kameng"),("Seppa",27.3630,93.0510,"town","East Kameng"),
 ("Ziro",27.5450,93.8260,"tourist","Lower Subansiri"),("Daporijo",27.9860,94.2270,"town","Upper Subansiri"),
 ("Along (Aalo)",28.1690,94.8010,"town","West Siang"),("Pasighat",28.0660,95.3260,"town","East Siang"),
 ("Yingkiong",28.6070,95.0350,"town","Upper Siang"),("Tezu",27.9310,96.1600,"town","Lohit"),
 ("Roing",28.1450,95.8410,"town","Lower Dibang Valley"),("Anini",28.8000,95.9000,"town","Upper Dibang Valley"),
 ("Changlang",27.1330,95.7330,"town","Changlang"),("Namsai",27.6667,95.8667,"town","Namsai"),
 ("Khonsa",26.9900,95.5600,"town","Tirap"),("Longding",26.8500,95.3200,"town","Longding"),
 ("Basar",27.9833,94.6833,"town","Lepa Rada"),("Likabali",27.7500,94.4900,"town","Lower Siang"),
 # Assam
 ("Guwahati",26.1445,91.7362,"town","Kamrup Metropolitan"),("Tinsukia",27.4886,95.3550,"town","Tinsukia"),
 ("Dhemaji",27.4833,94.5833,"town","Dhemaji"),("Dibrugarh",27.4728,94.9120,"town","Dibrugarh"),
 ("North Lakhimpur",27.2360,94.1020,"town","Lakhimpur"),("Sivasagar",26.9855,94.6422,"town","Sivasagar"),
 ("Jorhat",26.7509,94.2037,"town","Jorhat"),("Tezpur",26.6338,92.8000,"town","Sonitpur"),
 ("Golaghat",26.5180,93.9650,"town","Golaghat"),("Udalguri",26.7550,92.1020,"town","Udalguri"),
 ("Nagaon",26.3467,92.6836,"town","Nagaon"),("Kokrajhar",26.4014,90.2720,"town","Kokrajhar"),
 ("Mangaldoi",26.4420,92.0330,"town","Darrang"),("Barpeta",26.3200,91.0000,"town","Barpeta"),
 ("Nalbari",26.4460,91.4400,"town","Nalbari"),("Morigaon",26.2500,92.3400,"town","Morigaon"),
 ("Rangia",26.4500,91.6167,"town","Kamrup"),("Bongaigaon",26.4780,90.5600,"town","Bongaigaon"),
 ("Dhubri",26.0200,89.9800,"town","Dhubri"),("Goalpara",26.1667,90.6167,"town","Goalpara"),
 ("Haflong",25.1667,93.0167,"town","Dima Hasao"),("Silchar",24.8333,92.7789,"town","Cachar"),
 ("Karimganj",24.8690,92.3550,"town","Karimganj"),("Hailakandi",24.6833,92.5667,"town","Hailakandi"),
 ("Biswanath Chariali",26.7300,93.1500,"town","Biswanath"),("Hojai",26.0020,92.8590,"town","Hojai"),
 ("Mankachar",25.5333,89.8667,"town","South Salmara Mancachar"),("Diphu",25.8400,93.4300,"town","Karbi Anglong"),
 ("Kaziranga (Kohora)",26.5775,93.3630,"tourist","Golaghat"),("Majuli Island",26.9500,94.2000,"tourist","Majuli"),
 ("Sarusajai Sports Complex",26.1100,91.7800,"sports","Kamrup Metropolitan"),
 # Manipur
 ("Imphal",24.8170,93.9368,"town","Imphal West"),("Kakching",24.4967,93.9800,"town","Kakching"),
 ("Bishnupur",24.6300,93.7700,"town","Bishnupur"),("Thoubal",24.6400,94.0000,"town","Thoubal"),
 ("Churachandpur",24.3333,93.6833,"town","Churachandpur"),("Senapati",25.2670,94.0230,"town","Senapati"),
 ("Ukhrul",25.1167,94.3667,"town","Ukhrul"),("Tamenglong",24.9833,93.5000,"town","Tamenglong"),
 ("Chandel",24.3167,94.0000,"town","Chandel"),("Kangpokpi",25.1333,93.9667,"town","Kangpokpi"),
 ("Jiribam",24.8017,93.1197,"town","Jiribam"),("Moreh",24.2500,94.3000,"town","Tengnoupal"),
 ("Loktak Lake",24.5300,93.8000,"tourist","Bishnupur"),("Khuman Lampak Sports Complex",24.7960,93.9600,"sports","Imphal East"),
 # Meghalaya
 ("Shillong",25.5788,91.8933,"town","East Khasi Hills"),("Nongpoh",25.9000,91.8800,"town","Ribhoi"),
 ("Nongstoin",25.5167,91.2667,"town","West Khasi Hills"),("Khliehriat",25.3500,92.3667,"town","East Jaintia Hills"),
 ("Jowai",25.4500,92.2000,"town","West Jaintia Hills"),("Tura",25.5140,90.2020,"town","West Garo Hills"),
 ("Williamnagar",25.4930,90.6170,"town","East Garo Hills"),("Baghmara",25.2000,90.6333,"town","South Garo Hills"),
 ("Cherrapunji (Sohra)",25.2700,91.7320,"tourist","East Khasi Hills"),("Mawlynnong",25.2019,91.9161,"tourist","East Khasi Hills"),
 ("Dawki",25.2000,92.0300,"tourist","West Jaintia Hills"),("Umiam Lake (Barapani)",25.6500,91.9000,"sports","Ribhoi"),
 # Mizoram
 ("Aizawl",23.7307,92.7173,"town","Aizawl"),("Lunglei",22.8880,92.7350,"town","Lunglei"),
 ("Champhai",23.4700,93.3300,"town","Champhai"),("Kolasib",24.2300,92.6800,"town","Kolasib"),
 ("Serchhip",23.3000,92.8500,"town","Serchhip"),("Mamit",23.9300,92.4900,"town","Mamit"),
 ("Saiha",22.4833,92.9667,"town","Saiha"),("Lawngtlai",22.5300,92.9000,"town","Lawngtlai"),
 # Nagaland
 ("Kohima",25.6751,94.1086,"town","Kohima"),("Dimapur",25.9040,93.7270,"town","Dimapur"),
 ("Mokokchung",26.3220,94.5150,"town","Mokokchung"),("Tuensang",26.2700,94.8300,"town","Tuensang"),
 ("Mon",26.7150,95.0000,"town","Mon"),("Wokha",26.1000,94.2600,"town","Wokha"),
 ("Zunheboto",26.0000,94.5200,"town","Zunheboto"),("Phek",25.6700,94.4700,"town","Phek"),
 ("Peren",25.5000,93.7300,"town","Peren"),("Kiphire",25.9000,94.7800,"town","Kiphire"),
 ("Longleng",26.4800,94.8200,"town","Longleng"),("Kisama (Hornbill venue)",25.6333,94.0833,"tourist","Kohima"),
 ("Dzukou Valley",25.6000,94.1200,"tourist","Kohima"),
 # Tripura
 ("Agartala",23.8315,91.2868,"town","West Tripura"),("Udaipur",23.5333,91.4833,"town","Gomati"),
 ("Dharmanagar",24.3667,92.1667,"town","North Tripura"),("Kailashahar",24.3333,92.0000,"town","Unokoti"),
 ("Ambassa",23.9167,91.8500,"town","Dhalai"),("Belonia",23.2500,91.4500,"town","South Tripura"),
 ("Khowai",24.0667,91.6000,"town","Khowai"),("Bishalgarh",23.6800,91.2833,"town","Sipahijala"),
 ("Neermahal (Melaghar)",23.5000,91.3000,"tourist","Sipahijala"),
]
towns, bad = [], []
by_name = {}
for name, lat, lon, kind, exp in T:
    x, y = proj(lon, lat)
    found = [d["id"] for d in districts if inside_poly(x, y, dist_polys[d["id"]])]
    dn = {d["id"]: d for d in districts}
    if not found:
        bad.append((name, "outside every district polygon", exp)); continue
    d = dn[found[0]]
    if d["name"] != exp:
        bad.append((name, "landed in %s (%s)" % (d["name"], d["state"]), exp))
    towns.append(dict(id=slug(name), name=name, kind=kind, district=d["id"], state=d["state"], lat=lat, lon=lon))

# districts with no town at all get a single "district centre" point at the label anchor
have = {t["district"] for t in towns}
for d in districts:
    if d["id"] not in have:
        towns.append(dict(id=slug(d["name"] + " centre"), name=d["name"] + " (centre)", kind="centre",
                          district=d["id"], state=d["state"], lat=d["lat"], lon=d["lon"]))

print("problems:", *bad, sep="\n  ") if bad else print("all towns matched their expected district")
print("districts without a real town:", sorted(d["name"] for d in districts if d["id"] not in have))

# ---------------------------------------------------------------- write files
os.makedirs(OUT, exist_ok=True)
geo = dict(vb=region, states=[{k: s[k] for k in ("id", "name", "d", "b", "lx", "ly")} for s in states],
           districts=[{k: d[k] for k in ("id", "name", "state", "d", "b", "lx", "ly")} for d in districts])
with open(os.path.join(OUT, "nerMap.js"), "w") as f:
    f.write("// GENERATED by scripts/build-map-data.py - do not edit by hand.\n"
            "// Simplified district and state outlines, already projected and turned into SVG paths.\n"
            "export default " + json.dumps(geo, separators=(",", ":")) + ";\n")

st = {}
for d in districts:
    st.setdefault(d["state"], []).append([d["id"], d["name"], round(d["lat"], 3), round(d["lon"], 3)])
places = dict(proj=dict(lon0=LON0, lat0=LAT0, k=K, kx=round(KX, 3)),
              states=[dict(id=slug(s), name=s, districts=v) for s, v in sorted(st.items())],
              towns=[[t["id"], t["name"], t["kind"], t["district"], round(t["lat"], 4), round(t["lon"], 4)] for t in towns])
with open(os.path.join(OUT, "places.js"), "w") as f:
    f.write("// GENERATED by scripts/build-map-data.py - do not edit by hand.\n"
            "// districts: [id, name, lat, lon]   towns: [id, name, kind, districtId, lat, lon]\n"
            "// kind: town | tourist | sports | centre (centre = no town listed yet, point is the district middle)\n"
            "export default " + json.dumps(places, separators=(",", ":"), ensure_ascii=False) + ";\n")
for n in ("nerMap.js", "places.js"):
    print(n, os.path.getsize(os.path.join(OUT, n)), "bytes")
print("region viewBox", region)

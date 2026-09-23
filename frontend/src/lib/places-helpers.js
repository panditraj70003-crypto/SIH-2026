import places from "../data/places.js";

// alerts/notices store a slug district id (e.g. "sikkim-gangtok"); the map's
// geojson uses the real district name (e.g. "Gangtok") - this bridges the two.
export function districtNameById(districtId) {
  for (const s of places.states) {
    const hit = s.districts.find((d) => d[0] === districtId);
    if (hit) return hit[1];
  }
  return null;
}

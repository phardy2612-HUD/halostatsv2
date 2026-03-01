// src/utils/medals.js
// Medal NameId → Name mapping, verified against actual Waypoint API responses

export const MEDAL_NAMES = {
  // Multi-kills
  622331684:  "Double Kill",
  467375945:  "Triple Kill",
  2168749214: "Overkill",
  1720896249: "Killtacular",
  1580027473: "Killtrocity",
  3022799793: "Killamanjaro",
  3601718394: "Kilpocalypse",
  2877574698: "Killionaire",

  // Sprees
  548533137:  "Killing Spree",
  2123530881: "Killing Frenzy",
  1512363953: "Running Riot",
  3655682764: "Rampage",
  1176569867: "Untouchable",
  2852571933: "Nightmare",   // confirmed in data
  1169390319: "Boogeyman",
  3334154676: "Grim Reaper",
  269174970:  "Demon",

  // Style
  2625820422: "Ninja",
  4229934157: "Perfection",  // or Wheelman — needs more data
  3905838030: "Wheelman",
  2780740615: "Splatter",
  3091261182: "Bulltrue",
  2063152177: "Stick",
  1283796619: "Sniper Kill",
  1169571763: "Hail Mary",
  1284032216: "No Scope",
  221693153:  "Snipe",
  265478668:  "From the Grave",
  3233952928: "Assist",
  731054446:  "Driver",
  656245292:  "Gunner",
  3783455472: "Wingman",
  2278023431: "Distraction",
  1477806194: "Mind the Gap",
  1734214473: "Fastball",
  2758320809: "Reload This",
  1427176344: "Pancake",
  2602963073: "Chain Reaction",
  3085856613: "Tag & Bag",
  2852571933: "Nightmare",
};

// ALL medals that appear in actual match data = show them all
// We mark the "interesting" ones for highlighted display
const HIGHLIGHTED_IDS = new Set([
  // Multi-kills (Overkill+)
  2168749214, // Overkill
  1720896249, // Killtacular
  1580027473, // Killtrocity
  3022799793, // Killamanjaro
  3601718394, // Kilpocalypse
  2877574698, // Killionaire
  // Sprees (Running Riot+)
  1512363953, // Running Riot
  3655682764, // Rampage
  1176569867, // Untouchable
  2852571933, // Nightmare
  1169390319, // Boogeyman
  3334154676, // Grim Reaper
  269174970,  // Demon
  // Style
  2625820422, // Ninja
  4229934157, // Perfection
  1169571763, // Hail Mary
  1284032216, // No Scope
  265478668,  // From the Grave
  2063152177, // Stick
  2780740615, // Splatter
  1734214473, // Fastball
  2758320809, // Reload This
  1427176344, // Pancake
]);

export function getMedalName(nameId) {
  return MEDAL_NAMES[nameId] || `Medal #${nameId}`;
}

export function isInterestingMedal(nameId) {
  return HIGHLIGHTED_IDS.has(nameId);
}

// Show ALL medals (including common ones like Double Kill, Sprees)
export function isAnyMedal(nameId) {
  return MEDAL_NAMES[nameId] !== undefined;
}

// Parse ISO 8601 duration PT1M22.5S → seconds
export function parseDuration(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
  if (!m) return 0;
  return (parseFloat(m[1] || 0) * 3600)
       + (parseFloat(m[2] || 0) * 60)
       + (parseFloat(m[3] || 0));
}

// Alias for backward compat
export function formatSeconds(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

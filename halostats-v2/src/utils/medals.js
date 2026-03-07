// src/utils/medals.js
// Medal NameId → Name mapping, verified against Waypoint API / leafapp.co

export const MEDAL_NAMES = {
  // Multi-kills
  622331684:  "Double Kill",
  467375945:  "Triple Kill",       // unconfirmed
  835814121:  "Overkill",
  2137071619: "Killtacular",
  1430343434: "Killtrocity",
  3352648716: "Killpocalypse",
  3233051772: "Killionaire",

  // Sprees
  2780740615: "Killing Spree",
  2123530881: "Killing Frenzy",    // unconfirmed
  1512363953: "Perfect",           // verified (was wrongly "Running Riot")
  865763896:  "Perfection",        // verified
  3655682764: "Rampage",           // unconfirmed
  2567026752: "Grim Reaper",       // verified
  1169390319: "Boogeyman",         // unconfirmed
  269174970:  "Demon",             // unconfirmed
  2852571933: "Nightmare",         // unconfirmed

  // Style
  548533137:  "Back Smack",        // verified
  1427176344: "360",               // verified
  1176569867: "Yard Sale",         // verified
  3085856613: "Ninja",             // verified
  1841872491: "Tag & Bag",         // verified
  1477806194: "Counter-snipe",     // verified
  1880789493: "Mind the Gap",      // verified
  2861418269: "Quick Draw",        // verified
  521420212:  "Ace",               // verified
  3217141618: "Achilles Spine",    // verified
  2063152177: "Stick",             // unconfirmed
  1169571763: "Hail Mary",         // unconfirmed
  1284032216: "No Scope",          // unconfirmed
  221693153:  "Snipe",             // unconfirmed
  265478668:  "From the Grave",    // unconfirmed
  3783455472: "Wingman",           // unconfirmed
  2602963073: "Chain Reaction",    // unconfirmed
  1734214473: "Fastball",          // unconfirmed
  2758320809: "Reload This",       // unconfirmed
  3091261182: "Bulltrue",          // unconfirmed
  731054446:  "Driver",            // unconfirmed
  656245292:  "Gunner",            // unconfirmed
  2278023431: "Distraction",       // unconfirmed
  3905838030: "Wheelman",          // unconfirmed
  3233952928: "Assist",            // unconfirmed
};

// Medals worth highlighting (rare / impressive)
const HIGHLIGHTED_IDS = new Set([
  // Multi-kills (Overkill+)
  835814121,  // Overkill
  2137071619, // Killtacular
  1430343434, // Killtrocity
  3352648716, // Killpocalypse
  3233051772, // Killionaire
  // Sprees
  1512363953, // Perfect
  865763896,  // Perfection
  3655682764, // Rampage
  2852571933, // Nightmare
  1169390319, // Boogeyman
  2567026752, // Grim Reaper
  269174970,  // Demon
  // Style
  3217141618, // Achilles Spine
  3085856613, // Ninja
  1169571763, // Hail Mary
  1284032216, // No Scope
  265478668,  // From the Grave
  2063152177, // Stick
  1734214473, // Fastball
  2758320809, // Reload This
]);

export function getMedalName(nameId) {
  return MEDAL_NAMES[nameId] || `Medal #${nameId}`;
}

export function isInterestingMedal(nameId) {
  return HIGHLIGHTED_IDS.has(nameId);
}

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

export function formatSeconds(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

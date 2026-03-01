// src/utils/medals.js
// Maps Halo Infinite medal NameId integers to human-readable names
// Source: den.dev + community reverse engineering
// "Interesting" medals are ones that show skill or notable moments

export const MEDAL_NAMES = {
  // Killing Sprees
  554196669:  "Killing Spree",
  2801539423: "Killing Frenzy",
  3705888289: "Running Riot",
  4119182945: "Rampage",
  3523245893: "Nightmare",
  567716340:  "Boogeyman",
  2028318480: "Grim Reaper",
  1762873065: "Demon",
  // Multi-kills
  1486446780: "Double Kill",
  467375945:  "Triple Kill",
  ​2168749214: "Overkill",
  1720896249: "Killtacular",
  1580027473: "Killtrocity",
  3022799793: "Killamanjaro",
  3601718394: "Kilpocalypse",
  2877574698: "Killionaire",
  // Style / Skill
  1506365406: "Sniper Kill",
  3810871494: "Headshot",
  2789163448: "Ninja",
  1229482539: "Pancake",
  989552596:  "Grenade Stick",
  3843264598: "Skewer Stick",
  1871986714: "Quigley",
  1136273605: "Steaktacular",
  523965598:  "Bulltrue",
  1068279322: "Reversal",
  2055441630: "Comeback",
  1367019602: "Last Shot",
  3082856218: "Tag & Bag",
  88914608:   "Driver Assist",
  875856474:  "Cluster Luck",
  2068429783: "Autopilot Engaged",
  1025827095: "Pineapple Express",
  3710964640: "Pull",
  2150771238: "Splatter",
  4195138384: "Hail Mary",
  1031793312: "Hold This",
  2421588822: "From the Grave",
  3513435960: "EMP Assist",
  // Objective
  2717755703: "Flag Captured",
  1419486438: "Flag Carrier Kill",
  1440308318: "Flag Return",
  87172902:   "Oddball Kill",
  3505416278: "Zone Secured",
  1026925660: "Zone Contested",
  3956453706: "Hill Secured",
  // Ranked / misc
  1080613889: "Perfection",
  1350019962: "Extermination",
};

// The "interesting" medal IDs to highlight in the medals table
export const INTERESTING_MEDAL_IDS = [
  2789163448, // Ninja
  1229482539, // Pancake
  989552596,  // Grenade Stick
  3843264598, // Skewer Stick
  1871986714, // Quigley
  1080613889, // Perfection
  1350019962, // Extermination
  2877574698, // Killionaire
  3601718394, // Kilpocalypse
  3022799793, // Killamanjaro
  1580027473, // Killtrocity
  1720896249, // Killtacular
  2168749214, // Overkill
  3705888289, // Running Riot
  4119182945, // Rampage
  1136273605, // Steaktacular
  523965598,  // Bulltrue
  1068279322, // Reversal
  4195138384, // Hail Mary
  2421588822, // From the Grave
  875856474,  // Cluster Luck
  2150771238, // Splatter
  3810871494, // Headshot
];

export function getMedalName(nameId) {
  return MEDAL_NAMES[nameId] || `Medal #${nameId}`;
}

export function isInterestingMedal(nameId) {
  return INTERESTING_MEDAL_IDS.includes(nameId);
}

// Parse ISO 8601 duration like PT1M30S into total seconds
export function parseDuration(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
  if (!match) return 0;
  const h = parseFloat(match[1] || 0);
  const m = parseFloat(match[2] || 0);
  const s = parseFloat(match[3] || 0);
  return h * 3600 + m * 60 + s;
}

export function formatSeconds(s) {
  if (!s || isNaN(s)) return "0:00";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

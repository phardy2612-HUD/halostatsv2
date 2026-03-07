// src/utils/medals.js
// Medal name + description lookup by NameId.
// IDs verified against actual squad match data.
// spriteIndex intentionally omitted — loaded from live API when available.
// difficulty omitted — loaded from live API when available.

export const MEDAL_DATA = {
  // Multi-kills
  622331684:  { name: "Double Kill",    description: "Kill 2 enemies in quick succession." },
  467375945:  { name: "Triple Kill",    description: "Kill 3 enemies in quick succession." },
  2168749214: { name: "Overkill",       description: "Kill 4 enemies in quick succession." },
  1720896249: { name: "Killtacular",    description: "Kill 5 enemies in quick succession." },
  1580027473: { name: "Killtrocity",    description: "Kill 6 enemies in quick succession." },
  3022799793: { name: "Killamanjaro",   description: "Kill 7 enemies in quick succession." },
  3601718394: { name: "Kilpocalypse",   description: "Kill 8 enemies in quick succession." },
  2877574698: { name: "Killionaire",    description: "Kill 10 enemies in quick succession." },

  // Killing sprees
  548533137:  { name: "Killing Spree",  description: "Kill 5 enemies without dying." },
  2123530881: { name: "Killing Frenzy", description: "Kill 10 enemies without dying." },
  1512363953: { name: "Running Riot",   description: "Kill 15 enemies without dying." },
  3655682764: { name: "Rampage",        description: "Kill 20 enemies without dying." },
  1176569867: { name: "Untouchable",    description: "Kill 25 enemies without dying." },
  2852571933: { name: "Nightmare",      description: "Kill 30 enemies without dying." },
  1169390319: { name: "Boogeyman",      description: "Kill 35 enemies without dying." },
  3334154676: { name: "Grim Reaper",    description: "Kill 40 enemies without dying." },
  269174970:  { name: "Demon",          description: "Kill 45 enemies without dying." },

  // Style
  2625820422: { name: "Ninja",          description: "Assassinate an enemy from behind." },
  2780740615: { name: "Splatter",       description: "Run over an enemy with a vehicle." },
  3091261182: { name: "Bulltrue",       description: "Kill a charging enemy with a melee attack." },
  2063152177: { name: "Stick",          description: "Kill an enemy with a stuck plasma grenade." },
  1169571763: { name: "Hail Mary",      description: "Kill an enemy with a long-distance grenade throw." },
  1284032216: { name: "No Scope",       description: "Kill an enemy with a sniper rifle without zooming." },
  221693153:  { name: "Snipe",          description: "Kill an enemy with a sniper rifle headshot." },
  1283796619: { name: "Sniper Kill",    description: "Kill an enemy with a sniper rifle." },
  265478668:  { name: "From the Grave", description: "Kill an enemy after you've already been killed." },
  1427176344: { name: "Pancake",        description: "Kill an enemy with a Gravity Hammer ground pound." },
  1734214473: { name: "Fastball",       description: "Kill an enemy by throwing a grenade directly." },
  2758320809: { name: "Reload This",    description: "Kill an enemy immediately after reloading." },
  2602963073: { name: "Chain Reaction", description: "Kill an enemy with a chain explosion." },
  3085856613: { name: "Tag & Bag",      description: "Stick an enemy and kill them quickly." },

  // Team / assist
  3233952928: { name: "Assist",         description: "Help a teammate secure a kill." },
  2278023431: { name: "Distraction",    description: "Draw enemy fire while a teammate gets the kill." },
  1477806194: { name: "Mind the Gap",   description: "Kill an enemy who recently damaged your teammate." },
  3783455472: { name: "Wingman",        description: "Kill an enemy while near a teammate." },

  // Vehicle
  3905838030: { name: "Wheelman",       description: "Drive a vehicle while a passenger scores a kill." },
  731054446:  { name: "Driver",         description: "Get assists by driving passengers into combat." },
  656245292:  { name: "Gunner",         description: "Get kills as a vehicle gunner." },

  // Rare / mode
  4229934157: { name: "Perfection",     description: "Win a match without dying a single time." },
};

export function getMedalData(nameId) {
  return MEDAL_DATA[nameId] || null;
}

export function getMedalName(nameId) {
  return MEDAL_DATA[nameId]?.name || `Medal #${nameId}`;
}

// Medals shown by default (without "Show All")
const HIGHLIGHTED_IDS = new Set([
  2168749214, 1720896249, 1580027473, 3022799793, 3601718394, 2877574698,
  1512363953, 3655682764, 1176569867, 2852571933, 1169390319, 3334154676, 269174970,
  2625820422, 4229934157, 1169571763, 1284032216, 265478668, 2063152177,
  2780740615, 1734214473, 2758320809, 1427176344, 3091261182, 3085856613,
]);

export function isInterestingMedal(nameId) {
  return HIGHLIGHTED_IDS.has(nameId);
}

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

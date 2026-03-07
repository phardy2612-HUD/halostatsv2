// src/utils/medals.js
// Hardcoded medal data as fallback when API metadata is unavailable.
// IDs verified against actual match data from the squad's API responses.
// spriteIndex values from den.dev/blog/openspartan-medals (16-col sheet)
// difficultyIndex: 0=Normal, 1=Heroic, 2=Legendary, 3=Mythic

export const MEDAL_DATA = {
  // ── Multi-kills ──────────────────────────────────────────────
  622331684:  { name: "Double Kill",    description: "Kill 2 enemies in quick succession.",            spriteIndex: 64,  difficulty: 1 },
  467375945:  { name: "Triple Kill",    description: "Kill 3 enemies in quick succession.",            spriteIndex: 65,  difficulty: 1 },
  2168749214: { name: "Overkill",       description: "Kill 4 enemies in quick succession.",            spriteIndex: 66,  difficulty: 2 },
  1720896249: { name: "Killtacular",    description: "Kill 5 enemies in quick succession.",            spriteIndex: 67,  difficulty: 2 },
  1580027473: { name: "Killtrocity",    description: "Kill 6 enemies in quick succession.",            spriteIndex: 68,  difficulty: 2 },
  3022799793: { name: "Killamanjaro",   description: "Kill 7 enemies in quick succession.",            spriteIndex: 69,  difficulty: 3 },
  3601718394: { name: "Kilpocalypse",   description: "Kill 8 enemies in quick succession.",            spriteIndex: 70,  difficulty: 3 },
  2877574698: { name: "Killionaire",    description: "Kill 10 enemies in quick succession.",           spriteIndex: 71,  difficulty: 3 },

  // ── Killing sprees ───────────────────────────────────────────
  548533137:  { name: "Killing Spree",  description: "Kill 5 enemies without dying.",                  spriteIndex: 48,  difficulty: 0 },
  2123530881: { name: "Killing Frenzy", description: "Kill 10 enemies without dying.",                 spriteIndex: 49,  difficulty: 1 },
  1512363953: { name: "Running Riot",   description: "Kill 15 enemies without dying.",                 spriteIndex: 50,  difficulty: 1 },
  3655682764: { name: "Rampage",        description: "Kill 20 enemies without dying.",                 spriteIndex: 51,  difficulty: 2 },
  1176569867: { name: "Untouchable",    description: "Kill 25 enemies without dying.",                 spriteIndex: 52,  difficulty: 2 },
  2852571933: { name: "Nightmare",      description: "Kill 30 enemies without dying.",                 spriteIndex: 53,  difficulty: 2 },
  1169390319: { name: "Boogeyman",      description: "Kill 35 enemies without dying.",                 spriteIndex: 54,  difficulty: 3 },
  3334154676: { name: "Grim Reaper",    description: "Kill 40 enemies without dying.",                 spriteIndex: 55,  difficulty: 3 },
  269174970:  { name: "Demon",          description: "Kill 45 enemies without dying.",                 spriteIndex: 56,  difficulty: 3 },

  // ── Style medals ─────────────────────────────────────────────
  2625820422: { name: "Ninja",          description: "Assassinate an enemy from behind.",              spriteIndex: 32,  difficulty: 1 },
  2780740615: { name: "Splatter",       description: "Run over an enemy with a vehicle.",              spriteIndex: 20,  difficulty: 0 },
  3091261182: { name: "Bulltrue",       description: "Kill an enemy mid-charge with a melee.",         spriteIndex: 22,  difficulty: 1 },
  2063152177: { name: "Stick",          description: "Kill an enemy with a stuck plasma grenade.",     spriteIndex: 24,  difficulty: 1 },
  1169571763: { name: "Hail Mary",      description: "Kill an enemy with a long-distance grenade.",    spriteIndex: 27,  difficulty: 2 },
  1284032216: { name: "No Scope",       description: "Kill an enemy with a sniper rifle without zoom.",spriteIndex: 30,  difficulty: 1 },
  221693153:  { name: "Snipe",          description: "Kill an enemy with a headshot from a sniper.",   spriteIndex: 29,  difficulty: 0 },
  1283796619: { name: "Sniper Kill",    description: "Kill an enemy with a sniper rifle.",             spriteIndex: 28,  difficulty: 0 },
  265478668:  { name: "From the Grave", description: "Kill an enemy after you've been killed.",        spriteIndex: 35,  difficulty: 1 },
  1427176344: { name: "Pancake",        description: "Kill an enemy with a gravity hammer ground pound.",spriteIndex: 21, difficulty: 1 },
  1734214473: { name: "Fastball",       description: "Kill an enemy by throwing a grenade.",           spriteIndex: 26,  difficulty: 1 },
  2758320809: { name: "Reload This",    description: "Kill an enemy just after reloading.",            spriteIndex: 36,  difficulty: 1 },
  2602963073: { name: "Chain Reaction", description: "Kill an enemy with a chain explosion.",          spriteIndex: 25,  difficulty: 1 },
  3085856613: { name: "Tag & Bag",      description: "Stick and kill an enemy quickly.",               spriteIndex: 37,  difficulty: 2 },

  // ── Assist / team medals ──────────────────────────────────────
  3233952928: { name: "Assist",         description: "Help a teammate get a kill.",                    spriteIndex: 80,  difficulty: 0 },
  2278023431: { name: "Distraction",    description: "Draw enemy fire to help a teammate kill.",       spriteIndex: 82,  difficulty: 0 },
  1477806194: { name: "Mind the Gap",   description: "Kill an enemy that damaged your teammate.",      spriteIndex: 83,  difficulty: 0 },
  3783455472: { name: "Wingman",        description: "Kill an enemy near your teammate.",              spriteIndex: 81,  difficulty: 0 },

  // ── Vehicle ───────────────────────────────────────────────────
  3905838030: { name: "Wheelman",       description: "Drive a vehicle while a passenger gets a kill.", spriteIndex: 96,  difficulty: 0 },
  731054446:  { name: "Driver",         description: "Drive a vehicle into combat.",                   spriteIndex: 97,  difficulty: 0 },
  656245292:  { name: "Gunner",         description: "Get kills as a vehicle gunner.",                 spriteIndex: 98,  difficulty: 0 },

  // ── Mode-specific ─────────────────────────────────────────────
  4229934157: { name: "Perfection",     description: "Win a match without dying.",                     spriteIndex: 112, difficulty: 3 },
};

export function getMedalData(nameId) {
  return MEDAL_DATA[nameId] || null;
}

export function getMedalName(nameId) {
  return MEDAL_DATA[nameId]?.name || `Medal #${nameId}`;
}

// Medals worth highlighting in the table by default
const HIGHLIGHTED_IDS = new Set([
  2168749214, 1720896249, 1580027473, 3022799793, 3601718394, 2877574698, // overkill+
  1512363953, 3655682764, 1176569867, 2852571933, 1169390319, 3334154676, 269174970, // running riot+
  2625820422, 4229934157, 1169571763, 1284032216, 265478668, 2063152177,  // style
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

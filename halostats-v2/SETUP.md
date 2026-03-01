# Halo Squad Stats — Setup Guide

No Azure. No OAuth. No app registration. Just paste a token and go.

---

## Step 1 — Edit your player list

Open `src/players.js` and swap in your real gamertags:

```js
const PLAYERS = [
  { gamertag: "YourGamertag",  color: "#00e5ff", initials: "YG" },
  { gamertag: "Friend1",       color: "#ff375f", initials: "F1" },
  { gamertag: "Friend2",       color: "#ff9f0a", initials: "F2" },
  { gamertag: "Friend3",       color: "#30d158", initials: "F3" },
];
```

To add more players, add another `{ }` block. Gamertags are case-insensitive.

---

## Step 2 — Upload to GitHub

1. Go to [github.com](https://github.com) → sign up or log in
2. Click **"+"** → **"New repository"** → name it `halostats` → **Create**
3. Click **"uploading an existing file"**
4. Upload all project files and folders (`src/`, `api/`, `public/`, `package.json`, `vercel.json`)
5. Click **"Commit changes"**

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. Click **"Add New"** → **"Project"** → select `halostats`
3. Click **"Deploy"** — no settings need changing
4. Wait ~60 seconds, you get a live URL like `halostats-abc123.vercel.app`

That's it. No environment variables needed.

---

## Step 4 — Get your Spartan Token

Do this on a desktop/laptop browser (not phone):

1. Go to [halowaypoint.com](https://halowaypoint.com) and sign in with your Xbox account
2. Navigate to your player stats page
3. Press **F12** (Windows) or **Cmd+Option+I** (Mac) to open Developer Tools
4. Click the **Network** tab
5. Refresh the page
6. In the filter box, type `halostats`
7. Click on any request that appears
8. Click the **Headers** tab in the request detail
9. Scroll down to **Request Headers**
10. Find `x-343-authorization-spartan` → copy the entire value (starts with `v4=`)
11. Optionally also copy `343-clearance` (the app will auto-detect this if you skip it)

---

## Step 5 — Paste token into your app

1. Open your Vercel URL
2. You'll see the Token Setup screen
3. Paste your Spartan token into the text box
4. Click **"Save Token & Continue"**
5. Your squad stats will load

The app has step-by-step instructions built in too (tap each numbered step to expand it).

---

## Token expiry

Spartan tokens typically last **3–8 hours**, sometimes longer. The app:
- Shows a warning banner when your token is 3+ hours old
- Shows an error if the token has expired
- Has a **🔑 Token** tab in the bottom nav to paste a new one anytime

When it expires, just grab a fresh token from Waypoint (Steps 4–5 above, takes ~1 minute).

---

## Adding to iPhone home screen

1. Open your Vercel URL in **Safari**
2. Tap the **Share** button → **"Add to Home Screen"**
3. Tap **Add** — it appears on your home screen like a native app

---

## Troubleshooting

**"Spartan token rejected by Waypoint"**
→ Make sure you copied the full value including `v4=` at the start. It's very long — scroll right in DevTools to see all of it.

**"Player not found" for a gamertag**
→ Check exact spelling in `src/players.js`. Confirm the gamertag exists at halowaypoint.com.

**Stats show zeros or missing data**
→ The player may have a private profile on Waypoint. Ask them to set their stats to public.

**App works but shows no matches**
→ Try increasing the fetch count (25/50/100 in the top bar) and set date filter to "All Time".

---

## Updating later

Edit any file → push to GitHub → Vercel auto-deploys in ~60 seconds.

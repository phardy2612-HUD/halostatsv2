// api/auth/session.js
export default function handler(req, res) {
  const cookie = req.cookies?.halo_session;
  if (!cookie) return res.json({ loggedIn: false });

  try {
    const session = JSON.parse(Buffer.from(cookie, "base64").toString());
    const now = Date.now();
    const ageHours = (now - (session.savedAt || 0)) / (1000 * 60 * 60);

    res.json({
      loggedIn:   true,
      expiresAt:  session.expiresAt,
      savedAt:    session.savedAt,
      ageHours:   +ageHours.toFixed(1),
      nearExpiry: ageHours > 3,
      expired:    now > session.expiresAt,
    });
  } catch {
    res.json({ loggedIn: false });
  }
}

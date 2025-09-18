export default async function handler(req, res) {
  const spreadsheetId = "17meNocmInqv0vbbj6PeCUnsgvSSGqgoZpv0QpCQBG_I"; 
  const range = "Sheet1!B2:K1000";

  try {
    const r = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${process.env.GOOGLE_API_KEY}`
    );
    const data = await r.json();

    if (!data || !data.values) {
      return res.status(500).json({ error: "データが存在しません" });
    }

    const counts = {};
    data.values.flat().forEach(song => {
      const s = (song || "").trim();
      if (s) counts[s] = (counts[s] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    res.status(200).json(sorted);
  } catch (err) {
    console.error(err);  // ← ここでエラーをログに出す
    res.status(500).json({ error: err.message });
  }
}

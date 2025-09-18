// songs.js
import fetch from "node-fetch"; // Vercel Node で fetch が使えない場合

export default async function handler(req, res) {
  // ==========================
  // CORS 設定
  // ==========================
  res.setHeader("Access-Control-Allow-Origin", "*"); // すべてのオリジンからアクセス可能
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS リクエストに対応
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // ==========================
    // Google Sheets API 設定
    // ==========================
    const spreadsheetId = process.env.SPREADSHEET_ID; // Vercel の Environment Variables に設定
    const range = "Sheet1!B2:K1000";
    const apiKey = process.env.GOOGLE_API_KEY;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      res.status(404).json({ error: "No data found" });
      return;
    }

    // ==========================
    // 曲の出現回数を集計
    // ==========================
    const counts = new Map();
    data.values.flat().forEach((song) => {
      const s = song?.trim();
      if (s) counts.set(s, (counts.get(s) || 0) + 1);
    });

    // 出現回数で降順ソート
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

    res.status(200).json(sorted);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

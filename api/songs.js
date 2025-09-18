// import fetch は Node 18 以降不要
export default async function handler(req, res) {
  // ==========================
  // CORS 設定
  // ==========================
  res.setHeader("Access-Control-Allow-Origin", "*"); // 全オリジン許可
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
    const spreadsheetId = "17meNocmInqv0vbbj6PeCUnsgvSSGqgoZpv0QpCQBG_I"; // 直接書き込み
    const apiKey = process.env.GOOGLE_API_KEY; // APIキーのみ環境変数で管理
    const range = "Sheet1!B2:K1000";

    if (!apiKey) {
      console.error("Missing GOOGLE_API_KEY");
      return res.status(500).json({ error: "Missing GOOGLE_API_KEY" });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Sheets API error:", response.status, response.statusText);
      return res.status(500).json({ error: "Google Sheets API error" });
    }

    const data = await response.json();

    if (!data.values) {
      return res.status(404).json({ error: "No data found" });
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
    console.error("Serverless function exception:", err);
    res.status(500).json({ error: err.message });
  }
}

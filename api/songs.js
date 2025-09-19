// import fetch は Node 18 以降不要
export default async function handler(req, res) {
  // ==========================
  // CORS 設定
  // ==========================
  const allowedOrigins = [
  "http://localhost:5173",
  "https://task-official.github.io"
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);
}
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
    const spreadsheetId = "1k5VXL8UEXWZsYNSBw-6_u0f7Ic4MXu44xNDInFxAe4U"; // 直接書き込み
    const apiKey = process.env.GOOGLE_API_KEY; // APIキーのみ環境変数で管理
    const range = "Sheet1!B2:U1000";

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

//     // ==========================
//     // 曲の出現回数を集計
//     // ==========================
//     const counts = new Map();
//     data.values.flat().forEach((song) => {
//       const s = song?.trim();
//       if (s) counts.set(s, (counts.get(s) || 0) + 1);
//     });

//     // 出現回数で降順ソート
//     const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

//     res.status(200).json(sorted);

//   } catch (err) {
//     console.error("Serverless function exception:", err);
//     res.status(500).json({ error: err.message });
//   }
// }
// ==========================================================
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 変更箇所 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    // ==========================================================
    // 曲の出現回数を集計 (アーティスト名も考慮)
    // ==========================================================
    const songMap = new Map();
    data.values.forEach((row) => {
      // 2列ごと（アーティスト名、曲名）に処理
      for (let i = 0; i < row.length; i += 2) {
        const artist = row[i]?.trim();
        const song = row[i + 1]?.trim();

        if (artist && song) {
          // アーティスト名と曲名をキーとして結合
          const key = `${artist} - ${song}`;
          if (songMap.has(key)) {
            // 既にあればカウントを増やす
            songMap.get(key).count++;
          } else {
            // なければ新規追加
            songMap.set(key, { artist, song, count: 1 });
          }
        }
      }
    });

    // 出現回数で降順ソートし、[アーティスト名, 曲名, 回数] の配列に変換
    const sorted = Array.from(songMap.values())
      .sort((a, b) => b.count - a.count)
      .map(item => [item.artist, item.song, item.count]);

    res.status(200).json(sorted);
    // ==========================================================
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ 変更箇所 ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // ==========================================================

  } catch (err) {
    console.error("Serverless function exception:", err);
    res.status(500).json({ error: err.message });
  }
}
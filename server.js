// Portfolio serveri: saytni ko'rsatadi va forma xabarlarini Telegram botga yuboradi.
// Token .env faylidan o'qiladi. Qo'shimcha kutubxona kerak emas (Node 18+).
const http = require("http");
const fs = require("fs");
const path = require("path");

// .env ni o'qish
try {
  fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  });
} catch (e) {
  console.warn(".env fayli topilmadi");
}

const { BOT_TOKEN, CHAT_ID } = process.env;
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

// Oddiy spamdan himoya: bitta IP daqiqasiga 5 ta xabar
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

function send(res, code, body, type = "text/plain; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/contact") {
    if (!BOT_TOKEN || !CHAT_ID || BOT_TOKEN.startsWith("SHU_YERGA")) return send(res, 500, "Bot sozlanmagan (.env)");
    if (limited(req.socket.remoteAddress)) return send(res, 429, "Ko'p urinish");
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 10000) req.destroy(); });
    req.on("end", async () => {
      let d;
      try { d = JSON.parse(raw); } catch { return send(res, 400, "Xato"); }
      const name = String(d.name || "").slice(0, 100);
      const contact = String(d.contact || "").slice(0, 100);
      const text = String(d.text || "").slice(0, 1500);
      if (!name || !contact || !text) return send(res, 400, "Bo'sh maydon");
      const msg = `📩 Portfoliodan yangi xabar\n\n👤 Ism: ${name}\n📞 Aloqa: ${contact}\n\n💬 ${text}`;
      try {
        const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg }),
        });
        send(res, r.ok ? 200 : 502, r.ok ? "OK" : "Telegram xatosi");
      } catch {
        send(res, 502, "Telegramga ulanib bo'lmadi");
      }
    });
    return;
  }

  if (req.method !== "GET") return send(res, 405, "Ruxsat yo'q");
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(PUBLIC, path.normalize(p));
  if (!file.startsWith(PUBLIC)) return send(res, 403, "Taqiqlangan");
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "Topilmadi");
    send(res, 200, data, TYPES[path.extname(file)] || "application/octet-stream");
  });
});

server.listen(PORT, () => console.log(`Sayt ishga tushdi: http://localhost:${PORT}`));

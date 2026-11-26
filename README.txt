PORTFOLIO (token .env da)

1) .env faylini Bloknot bilan oching:
     BOT_TOKEN=  -> @BotFather bergan token
     CHAT_ID=    -> sizning chat id (https://api.telegram.org/bot<TOKEN>/getUpdates dan oling;
                    avval botingizga Start bosib xabar yozing)
2) Kompyuterda Node.js 18+ o'rnatilgan bo'lsin (nodejs.org).
3) Shu papkada terminal oching va:
     node server.js
4) Brauzerda: http://localhost:3000

Internetga chiqarish: papkani Render.com / Railway / VPS ga joylang.
Hostingda .env faylini yuklamang, token va chat id ni
"Environment Variables" bo'limiga qo'ying (BOT_TOKEN, CHAT_ID).
.env faylini hech kimga yubormang va GitHub ga qo'ymang (.gitignore da bor).

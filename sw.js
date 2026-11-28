// 20261129003944
// 競馬AI レポート: オフラインで見るための service worker (keiba-publish が作る)
const CACHE = "keiba-report";
const PRECACHE = ["./", "./index.html", "./20261129/today.html", "./20261129/today_ana.html", "./20261129/uma.html", "./20261129/predict.html", "./20261129/blood.html", "./20261129/ai_ana.html", "./20261128/today.html", "./20261128/today_ana.html", "./20261128/uma.html", "./20261128/predict.html", "./20261128/blood.html", "./20261128/ai_ana.html", "./common/jockey_form.html", "./common/blood_summary.html"];
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u =>
    fetch(u, { cache: "no-store" }).then(r => r.ok ? c.put(u, r) : null).catch(() => null)))));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {  // 電波があれば新しい版を取って保存し直す。4秒で返らなければ保存した版を出す
      const res = await Promise.race([fetch(req), timeout(4000)]);
      if (res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (err) {
      const hit = await caches.match(req, { ignoreSearch: true });
      return hit || (await caches.match("./index.html")) || Response.error();
    }
  })());
});

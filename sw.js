const CACHE="ciclo-v1";
const FILES=["./", "index.html", "style.css", "js/core.js", "js/render.js", "js/dial-input.js", "js/events.js", "js/auth.js", "js/history.js", "js/reminders.js", "js/account.js", "js/main.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Rede primeiro (você vê as edições no Live Server); se estiver offline, usa o cache.
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))));
});

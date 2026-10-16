/*
 * sw.js — deixa o Em Dia instalável e abrindo sem internet.
 * Guarda os arquivos do app (os dados ficam no localStorage do navegador, não aqui).
 * Mudou algum arquivo? Aumente VERSAO (e o ?v= do index.html), senão quem instalou continua com o antigo.
 */
var VERSAO = "1.2.0";
var CACHE = "em-dia-" + VERSAO;
var CACHE_FONTES = "em-dia-fontes";
var ARQUIVOS = [
  "./", "index.html", "manifest.webmanifest",
  "css/app.css?v=" + VERSAO, "css/em-dia.css?v=" + VERSAO,
  "js/dados.js?v=" + VERSAO, "js/storage.js?v=" + VERSAO, "js/auth.js?v=" + VERSAO, "js/acesso.js?v=" + VERSAO,
  "js/app.js?v=" + VERSAO, "js/entrada.js?v=" + VERSAO,
  "icons/icon-192.png", "icons/orprocon-logo.png", "icons/orprocon-logo-escuro.png", "icons/orprocon-simbolo.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"
];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ARQUIVOS.map(function (u) {
      return fetch(new Request(u, { cache: "reload" })).then(function (r) { if (!r.ok) throw new Error(u); return c.put(u, r); });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n.indexOf("em-dia-") === 0 && n !== CACHE && n !== CACHE_FONTES; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  // fontes do Google: guarda na primeira vez
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    ev.respondWith(caches.open(CACHE_FONTES).then(function (c) {
      return c.match(req).then(function (achou) {
        return achou || fetch(req).then(function (r) { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; });
      });
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // páginas: tenta a rede (pega versão nova), sem internet usa o guardado
  if (req.mode === "navigate") {
    ev.respondWith(fetch(req).catch(function () { return caches.match("index.html"); }));
    return;
  }
  ev.respondWith(caches.match(req).then(function (achou) { return achou || fetch(req); }));
});

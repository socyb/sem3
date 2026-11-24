/* Revelar respuestas (clic o R), sorteo de casos (S) y cronómetro. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var viva = function () { return $(".slide.is-live"); };

  function revela(lamina) {
    $$(".oculto", lamina).forEach(function (e) { e.classList.toggle("visto"); });
  }
  $$("[data-revela]").forEach(function (b) {
    b.addEventListener("click", function () { revela(b.closest(".slide")); b.blur(); });
  });

  if (location.hash === "#respuestas") { revela(document); }

  /* Sorteo: saca un caso sin repetir; al agotarse, vuelve a empezar. */
  function sortea() {
    var casos = $$(".caso");
    var libres = casos.filter(function (c) { return !c.classList.contains("fuera"); });
    casos.forEach(function (c) { c.classList.remove("elegido"); });
    if (!libres.length) {
      casos.forEach(function (c) { c.classList.remove("fuera"); });
      libres = casos;
    }
    var c = libres[Math.floor(Math.random() * libres.length)];
    c.classList.add("fuera", "elegido");
  }
  var bs = $("#sortea");
  if (bs) { bs.addEventListener("click", function () { sortea(); bs.blur(); }); }

  /* Cronómetro por hora de término: no se atrasa si cambias de lámina. */
  var reloj = $("#reloj"), resta = 600000, fin = 0, tic = null;
  function pinta() {
    var ms = fin ? Math.max(0, fin - Date.now()) : resta;
    var s = Math.ceil(ms / 1000);
    reloj.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    reloj.classList.toggle("fin", s === 0);
    if (fin && s === 0) { clearInterval(tic); fin = 0; resta = 0; }
  }
  function corre() { if (!resta) { return; } fin = Date.now() + resta; clearInterval(tic); tic = setInterval(pinta, 250); pinta(); }
  function pausa() { resta = Math.max(0, fin - Date.now()); fin = 0; clearInterval(tic); pinta(); }
  if (reloj) {
    $$("[data-min]").forEach(function (b) {
      b.addEventListener("click", function () { fin = 0; resta = b.dataset.min * 60000; corre(); b.blur(); });
    });
    $("#pausa").addEventListener("click", function () {
      if (fin) { pausa(); } else { corre(); }
      this.blur();
    });
    pinta();
  }

  /* Cada lámina a su mayor tamaño: busca la escala que llena el alto sin desbordar. */
  function cabe(s, i) {
    var cs = getComputedStyle(s);
    var alto = s.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (i.scrollHeight > alto || i.scrollWidth > i.clientWidth + 1) { return false; }
    return $$(".card,.num,.grande,.hito,td", i).every(function (e) {
      return e.scrollWidth <= e.clientWidth + 2;
    });
  }
  function ajusta() {
    var s = viva(), i = s && $(".slide-inner", s);
    if (!i) { return; }
    if (matchMedia("(max-width:900px) and (orientation:portrait)").matches) {
      i.style.removeProperty("--k");
      return;
    }
    var a = 0.6, b = 1.32;
    for (var n = 0; n < 9; n++) {
      var k = (a + b) / 2;
      i.style.setProperty("--k", k);
      if (cabe(s, i)) { a = k; } else { b = k; }
    }
    i.style.setProperty("--k", a);
  }
  var obs = new MutationObserver(function (ms) {
    if (ms.some(function (m) { return m.target.classList.contains("is-live"); })) { ajusta(); }
  });
  $$(".slide").forEach(function (s) { obs.observe(s, { attributes: true, attributeFilter: ["class"] }); });
  addEventListener("resize", ajusta);
  addEventListener("load", ajusta);
  if (document.fonts) { document.fonts.ready.then(ajusta); }
  ajusta();

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    if (e.key === "r" || e.key === "R") { revela(viva()); }
    if ((e.key === "s" || e.key === "S") && $(".caso", viva())) { sortea(); }
  });
})();

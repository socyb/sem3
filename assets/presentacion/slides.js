/* ==========================================================================
   Navegación de la presentación. Sin dependencias.

   Teclado   ← → · espacio · inicio/fin · O abre el índice · T cambia el tema
             F pantalla completa · Esc cierra el índice
   Táctil    deslizar de lado
   URL       ?d=7  abre en la diapositiva 7 y se actualiza al avanzar
   ========================================================================== */
(function () {
  "use strict";

  var TEMA = "sem3-27-theme";
  var raiz = document.documentElement;

  /* ── Tema ─────────────────────────────────────────────────────────────── */
  var guardado = null;
  try { guardado = localStorage.getItem(TEMA); } catch (e) { /* sin storage */ }
  raiz.setAttribute("data-theme", guardado ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  function pintaTema() {
    var oscuro = raiz.getAttribute("data-theme") === "dark";
    var b = document.getElementById("btnTema");
    if (b) { b.textContent = oscuro ? "☀" : "🌙"; }
  }
  function alternaTema() {
    var siguiente = raiz.getAttribute("data-theme") === "dark" ? "light" : "dark";
    raiz.setAttribute("data-theme", siguiente);
    try { localStorage.setItem(TEMA, siguiente); } catch (e) { /* sin storage */ }
    pintaTema();
  }

  /* ── Diapositivas ─────────────────────────────────────────────────────── */
  var slides = [].slice.call(document.querySelectorAll(".slide"));
  var total = slides.length;
  var actual = 0;

  var elCuenta   = document.getElementById("cuenta");
  var elProgreso = document.getElementById("progreso");
  var elIndice   = document.getElementById("indice");
  var elGrid     = document.getElementById("indiceGrid");

  function inicial() {
    var p = new URLSearchParams(location.search).get("d");
    var n = parseInt(p, 10);
    return (n >= 1 && n <= total) ? n - 1 : 0;
  }

  function muestra(i, empujaURL) {
    if (i < 0 || i >= total) { return; }
    slides[actual].classList.remove("is-live");
    actual = i;
    slides[actual].classList.add("is-live");
    slides[actual].scrollTop = 0;
    slides[actual].setAttribute("tabindex", "-1");

    if (elCuenta) { elCuenta.textContent = (actual + 1) + " / " + total; }
    if (elProgreso) {
      elProgreso.style.width = ((actual + 1) / total * 100) + "%";
    }
    document.querySelectorAll(".indice-item").forEach(function (b, k) {
      b.classList.toggle("actual", k === actual);
    });
    if (empujaURL !== false) {
      var u = new URL(location.href);
      u.searchParams.set("d", actual + 1);
      history.replaceState(null, "", u);
    }
  }

  function avanza(paso) { muestra(Math.min(total - 1, Math.max(0, actual + paso))); }

  /* ── Índice ───────────────────────────────────────────────────────────── */
  function construyeIndice() {
    if (!elGrid) { return; }
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "indice-item";
      b.innerHTML =
        '<span class="n">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="t"></span>' +
        '<span class="parte"></span>';
      b.querySelector(".t").textContent = s.dataset.titulo || "—";
      b.querySelector(".parte").textContent = s.dataset.parte || "";
      b.addEventListener("click", function () {
        muestra(i);
        cierraIndice();
      });
      elGrid.appendChild(b);
    });
  }
  function abreIndice() {
    if (elIndice) {
      elIndice.classList.add("abierto");
      var a = elIndice.querySelector(".indice-item.actual") ||
              elIndice.querySelector(".indice-item");
      if (a) { a.focus(); }
    }
  }
  function cierraIndice() {
    if (elIndice) { elIndice.classList.remove("abierto"); }
    slides[actual].focus();
  }
  function alternaIndice() {
    if (elIndice && elIndice.classList.contains("abierto")) { cierraIndice(); }
    else { abreIndice(); }
  }

  /* ── Pantalla completa ────────────────────────────────────────────────── */
  function alternaPantalla() {
    if (!document.fullscreenElement) {
      if (raiz.requestFullscreen) { raiz.requestFullscreen().catch(function () {}); }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /* ── Teclado ──────────────────────────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var abierto = elIndice && elIndice.classList.contains("abierto");

    switch (e.key) {
      case "ArrowRight": case "PageDown": case " ":
        if (!abierto) { e.preventDefault(); avanza(1); } break;
      case "ArrowLeft": case "PageUp":
        if (!abierto) { e.preventDefault(); avanza(-1); } break;
      case "Home":
        e.preventDefault(); muestra(0); break;
      case "End":
        e.preventDefault(); muestra(total - 1); break;
      case "Escape":
        if (abierto) { e.preventDefault(); cierraIndice(); } break;
      case "o": case "O":
        e.preventDefault(); alternaIndice(); break;
      case "t": case "T":
        e.preventDefault(); alternaTema(); break;
      case "f": case "F":
        e.preventDefault(); alternaPantalla(); break;
      default: break;
    }
  });

  /* ── Táctil ───────────────────────────────────────────────────────────── */
  var x0 = null, y0 = null;
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) { return; }
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      avanza(dx < 0 ? 1 : -1);
    }
    x0 = null; y0 = null;
  }, { passive: true });

  /* ── Botones ──────────────────────────────────────────────────────────── */
  function conecta(id, fn) {
    var b = document.getElementById(id);
    if (b) { b.addEventListener("click", fn); }
  }
  conecta("btnPrev",    function () { avanza(-1); });
  conecta("btnNext",    function () { avanza(1); });
  conecta("btnIndice",  alternaIndice);
  conecta("btnTema",    alternaTema);
  conecta("btnPantalla", alternaPantalla);
  conecta("btnImprimir", function () { window.print(); });
  conecta("cerrarIndice", cierraIndice);

  /* ── Arranque ─────────────────────────────────────────────────────────── */
  construyeIndice();
  pintaTema();
  slides.forEach(function (s) { s.classList.remove("is-live"); });
  actual = 0;
  slides[0].classList.add("is-live");
  // Siempre pasa por muestra(), también cuando arranca en la primera: es la que
  // pinta el contador, la barra de progreso y la marca del índice.
  muestra(inicial(), false);
})();

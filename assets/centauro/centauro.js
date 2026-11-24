/* Tarjeta del equipo: se guarda en el aparato y se copia como texto. */
(function () {
  "use strict";
  var CLAVE = "sem3-27-centauro";
  var raiz = document.documentElement;
  var lee = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var guarda = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };

  raiz.setAttribute("data-theme", lee("sem3-27-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  var form = document.getElementById("tarjeta");
  var aviso = document.getElementById("aviso");
  var salida = document.getElementById("salida");
  var campos = ["equipo", "integrantes", "caso", "quien", "kpi", "error", "rediseno", "cita", "termino"];
  var el = function (n) { return document.getElementById(n); };

  var previo = {};
  try { previo = JSON.parse(lee(CLAVE) || "{}") || {}; } catch (e) { previo = {}; }
  campos.forEach(function (n) { if (previo[n]) { el(n).value = previo[n]; } });

  form.addEventListener("input", function () {
    var d = {};
    campos.forEach(function (n) { d[n] = el(n).value; });
    guarda(CLAVE, JSON.stringify(d));
  });

  function texto() {
    var v = function (n) { return el(n).value.trim() || "—"; };
    return ["REDISEÑAR AL CENTAURO INVERSO",
      "Seminario de Negocios Internacionales III · FCA UNAM · Grupo 1746 · 2027-1", "",
      "Equipo: " + v("equipo"), "Integrantes: " + v("integrantes"), "Caso: " + v("caso"), "",
      "1. ¿Para quién y a quién?", v("quien"), "",
      "2. El KPI y su trampa", v("kpi"), "",
      "3. El error: quién da la cara y quién paga", v("error"), "",
      "4. El rediseño", v("rediseno"), "",
      "5. El respaldo", v("cita"), "Término: " + v("termino"), "",
      "Doctorow, C. (2026). The reverse centaur’s guide to life after AI: How to think about artificial intelligence—before it’s too late. MCD/Farrar, Straus and Giroux."
    ].join("\n");
  }

  function aMano(t) {
    salida.hidden = false;
    salida.value = t;
    salida.focus();
    salida.select();
    aviso.textContent = "Seleccionen el texto de abajo y cópienlo.";
  }

  el("copiar").addEventListener("click", function () {
    var t = texto();
    if (!navigator.clipboard) { aMano(t); return; }
    navigator.clipboard.writeText(t).then(function () {
      aviso.textContent = "Lista. Péguenla en el foro de Moodle.";
    }, function () { aMano(t); });
  });

  el("borrar").addEventListener("click", function () {
    if (!confirm("¿Vaciar toda la tarjeta?")) { return; }
    form.reset();
    guarda(CLAVE, "{}");
    salida.hidden = true;
    aviso.textContent = "";
  });
})();

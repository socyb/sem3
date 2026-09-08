/* ==========================================================================
   Seminario de Negocios Internacionales III · FCA UNAM
   Grupo 1746 · Semestre 2027-1
   ========================================================================== */
(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ── Tema claro / oscuro ────────────────────────────────────────────── */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  const stored = localStorage.getItem("sem3-27-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
      themeBtn.setAttribute("aria-label", theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }
  };
  applyTheme(stored || (prefersDark ? "dark" : "light"));

  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("sem3-27-theme", next);
    applyTheme(next);
  });

  $("#printBtn")?.addEventListener("click", () => window.print());

  /* ── Aviso flotante ─────────────────────────────────────────────────── */
  const toast = $("#toast");
  let toastTimer;
  const say = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2600);
  };

  /* ── Código QR de la página ─────────────────────────────────────────── */
  const qrModal = $("#qrModal");
  if (qrModal) {
    $("#qrBtn")?.addEventListener("click", () => qrModal.showModal());

    // Un clic fuera del recuadro también cierra el marco emergente.
    qrModal.addEventListener("click", (e) => {
      const box = qrModal.getBoundingClientRect();
      const outside =
        e.clientX < box.left || e.clientX > box.right ||
        e.clientY < box.top  || e.clientY > box.bottom;
      if (outside) qrModal.close();
    });

    // El aviso flotante queda debajo del <dialog>, así que confirmamos en el propio botón.
    const copyBtn = $("#qrCopyBtn");
    let copyTimer;
    copyBtn?.addEventListener("click", async () => {
      const url = $("#qrUrl")?.textContent.trim() || location.href;
      let message;
      try {
        await navigator.clipboard.writeText(url);
        message = "Liga copiada ✓";
      } catch {
        message = "No se pudo copiar";
      }
      copyBtn.textContent = message;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copyBtn.textContent = "Copiar liga"; }, 2000);
    });
  }

  /* ── Fecha de la última actualización ───────────────────────────────── */
  // El pie trae una fecha escrita a mano; si el servidor dice cuándo se subió
  // el archivo, gana esa. Cuando no manda ese dato el navegador devuelve la hora
  // actual, así que descartamos lo que parezca «ahora mismo».
  const stamp = $("#lastUpdate");
  if (stamp) {
    const modified = new Date(document.lastModified);
    if (!Number.isNaN(modified.valueOf()) && Date.now() - modified.getTime() > 60000) {
      stamp.dateTime = new Intl.DateTimeFormat("en-CA", {
        year: "numeric", month: "2-digit", day: "2-digit"
      }).format(modified);
      stamp.textContent = new Intl.DateTimeFormat("es-MX", {
        day: "numeric", month: "long", year: "numeric"
      }).format(modified);
    }
  }

  /* ── Calendario del seminario ───────────────────────────────────────── */
  // Martes de 16:00 a 19:00 en el salón C-102. El 15 de septiembre no hay sesión.
  // El séptimo dato es opcional: la fecha desde la que se abre la sesión. Sirve
  // cuando hay algo que leer antes y no basta con abrirla la víspera.
  const sessions = [
    [ 1,"2026-08-18","Mesa de innovaciones","Nos conocemos · qué tecnología te mueve","I",
      "Un objeto que uses todos los días y algo para escribir"],
    [ 2,"2026-08-25","¿Qué cuenta como innovación?","Manual de Oslo · producto y proceso","I",
      "Tu control de lectura del Manual de Oslo"],
    [ 3,"2026-09-01","Ciberseguridad","Con el Ing. Juan Esteban Castellanos · Director de SOC","I",
      "Las dudas que traigas"],
    [ 4,"2026-09-08","Dónde aterriza el dinero","Con la Lic. Yixili Ruiz Mendoza · Fusiones y adquisiciones (M&A)","I",
      "El reporte de Bain leído y una pregunta para ella","2026-09-04"],
    [ 5,"2026-09-22","Innovación y cultura organizacional","Trabajo · empresa · el mito de Sísifo","I",
      "Tu control de lectura y ganas de discutir"],
    [ 6,"2026-09-29","¿Quién paga la innovación?","Gasto en I+D · público y privado","II",
      "Tu control de lectura"],
    [ 7,"2026-10-06","Medir la innovación","Indicadores · índices · dónde está México","II",
      "Tu control de lectura"],
    [ 8,"2026-10-13","Síntesis de I+D · primer parcial","Repaso · examen","II",
      "Todo lo del primer tema repasado"],
    [ 9,"2026-10-20","La cadena de la inteligencia artificial","Cómputo · datos · energía · trabajo","III",
      "Tu control de lectura"],
    [10,"2026-10-27","Chips y minerales críticos","Cuellos de botella · dependencia","III",
      "Tu control de lectura"],
    [11,"2026-11-03","Sectores emergentes","Biotecnología · energía · movilidad","III",
      "Tu control de lectura"],
    [12,"2026-11-10","México y los sectores de alto crecimiento","Plan México · semiconductores · nearshoring","III",
      "Tu control de lectura"],
    [13,"2026-11-17","Datos, plataformas y vigilancia","Capitalismo de vigilancia · filtro burbuja","IV",
      "Tu control de lectura"],
    [14,"2026-11-24","Trabajo y automatización · segundo parcial","Empleo · desigualdad · examen","IV",
      "Todo lo del segundo tema repasado"],
    [15,"2026-12-01","Gobernanza de la tecnología","Regulación · ética · ambiente · exposiciones","IV",
      "Tu exposición lista"],
    [16,"2026-12-08","Cierre del seminario","Exposiciones · examen final","IV",
      "Tu exposición y el trabajo final"]
  ].map(([number, date, title, subtitle, unit, bring, open]) =>
    ({ number, date, title, subtitle, unit, bring, open, room: "C-102" }));

  const MONTHS = { "01":"ene","02":"feb","03":"mar","04":"abr","05":"may","06":"jun",
                   "07":"jul","08":"ago","09":"sep","10":"oct","11":"nov","12":"dic" };

  const params = new URLSearchParams(location.search);
  const queryDate = params.get("fecha");
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  const today = /^\d{4}-\d{2}-\d{2}$/.test(queryDate || "") ? queryDate : localDate;
  const cursor = today < sessions[0].date ? sessions[0].date : today;

  // Una sesión entra en vigor desde la víspera: la noche anterior ya puedes ver
  // lo que toca y con qué hay que llegar.
  const vispera = (iso) => {
    const t = new Date(`${iso}T12:00:00Z`);
    t.setUTCDate(t.getUTCDate() - 1);
    return t.toISOString().slice(0, 10);
  };

  const abre = s => s.open || vispera(s.date);
  const unlocked = sessions.filter(s => abre(s) <= cursor);
  const current  = unlocked[unlocked.length - 1] || sessions[0];
  const [y, m, d] = cursor.split("-");
  const pad = n => String(n).padStart(2, "0");
  const shortDate = iso => `${Number(iso.slice(8))} ${MONTHS[iso.slice(5, 7)]}`;

  const dateEl = $("#todayDate");
  if (dateEl) dateEl.textContent = `${Number(d)} ${MONTHS[m]} ${y}`;

  const activeEl = $("#activeSession");
  if (activeEl) activeEl.textContent = `${pad(current.number)} · ${current.title}`;

  const cuandoEs = (s) => s.date === cursor          ? "Sesión de hoy"
                        : vispera(s.date) === cursor ? "Sesión de mañana"
                        : s.date > cursor            ? "Próxima sesión"
                        : "Última sesión";

  const whenEl = $("#activeWhen");
  if (whenEl) whenEl.textContent = cuandoEs(current);

  const ctaEl = $("#heroCta");
  if (ctaEl) {
    ctaEl.textContent = `${current.date > cursor ? "Lo que sigue" : "Lo de hoy"}: ${current.title} →`;
  }

  const countEl = $("#sessionCount");
  if (countEl) countEl.textContent = `${pad(unlocked.length)} / ${sessions.length}`;

  /* ── Línea del tiempo: una parada por sesión, la de hoy abierta ──────── */
  // Solo tienen panel escrito las sesiones que ya ocurrieron y se documentaron;
  // si una parada no lo tiene, la línea la muestra pero no la abre.
  const track  = $("#tlTrack");
  const panels = $$(".session-panel");

  const bringEl = $("#todayBring");
  if (bringEl) bringEl.textContent = current.bring;

  const panelFor = n => panels.find(p => Number(p.dataset.sesion) === n) || null;

  if (track) {
    const stops = [];

    const openSession = (number, push = true) => {
      const panel = panelFor(number);
      if (!panel) return;
      panels.forEach(p => { p.hidden = p !== panel; });
      stops.forEach(btn => {
        const on = Number(btn.dataset.sesion) === number;
        btn.setAttribute("aria-selected", String(on));
        btn.tabIndex = on ? 0 : -1;
      });
      if (push) {
        const u = new URL(location.href);
        u.searchParams.set("sesion", pad(number));
        history.replaceState(null, "", u);
      }
    };

    unlocked.forEach(s => {
      const esHoy = s.number === current.number;
      const cuando = s.date === cursor          ? "Hoy"
                   : vispera(s.date) === cursor ? "Mañana"
                   : s.date > cursor            ? "Próxima"
                   : "Tema " + s.unit;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tl-stop" + (esHoy ? " is-live" : "");
      btn.id = `tab-${s.number}`;
      btn.dataset.sesion = s.number;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", "false");
      btn.tabIndex = -1;
      btn.innerHTML =
        `<span class="tl-mark" aria-hidden="true"></span>` +
        `<span class="tl-card">` +
          `<span class="tl-num">Sesión ${pad(s.number)}</span>` +
          `<time datetime="${s.date}">${shortDate(s.date)}</time>` +
          `<strong></strong><small></small>` +
          `<span class="tl-tag">${esHoy ? cuando : "Tema " + s.unit}</span>` +
        `</span>`;
      btn.querySelector("strong").textContent = s.title;
      btn.querySelector("small").textContent  = s.subtitle;

      if (panelFor(s.number)) {
        btn.setAttribute("aria-controls", `panel-${s.number}`);
        btn.addEventListener("click", () => openSession(s.number));
      } else {
        btn.disabled = true;
        btn.classList.add("is-locked");
      }
      track.appendChild(btn);
      stops.push(btn);
    });

    const faltan = sessions.length - unlocked.length;
    if (faltan > 0) {
      const resto = document.createElement("div");
      resto.className = "tl-stop is-locked";
      resto.innerHTML =
        `<span class="tl-mark" aria-hidden="true"></span>` +
        `<span class="tl-card">` +
          `<span class="tl-num">Lo que falta</span>` +
          `<time datetime="${sessions[sessions.length - 1].date}">hasta el ${shortDate(sessions[sessions.length - 1].date)}</time>` +
          `<strong>${faltan} ${faltan === 1 ? "sesión" : "sesiones"}</strong>` +
          `<small>Cada una aparece aquí el día que la trabajamos.</small>` +
        `</span>`;
      track.appendChild(resto);
    }

    // Moverse por la línea con las flechas del teclado.
    track.addEventListener("keydown", (e) => {
      const abiertos = stops.filter(b => !b.disabled);
      const i = abiertos.indexOf(document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === "ArrowRight") j = Math.min(abiertos.length - 1, i + 1);
      if (e.key === "ArrowLeft")  j = Math.max(0, i - 1);
      if (e.key === "Home")       j = 0;
      if (e.key === "End")        j = abiertos.length - 1;
      if (j === null) return;
      e.preventDefault();
      abiertos[j].focus();
      openSession(Number(abiertos[j].dataset.sesion));
    });

    // Al abrir: la sesión que pida la liga, si no la de hoy, si no la última escrita.
    const pedida = Number(params.get("sesion"));
    const escritas = unlocked.filter(s => panelFor(s.number)).map(s => s.number);
    const inicio =
      (escritas.includes(pedida) && pedida) ||
      (escritas.includes(current.number) && current.number) ||
      escritas[escritas.length - 1];

    if (inicio) {
      openSession(inicio, false);
      const btn = stops.find(b => Number(b.dataset.sesion) === inicio);
      const rail = $("#timeline");
      if (btn && rail && rail.scrollWidth > rail.clientWidth) {
        rail.scrollLeft = Math.max(0, btn.offsetLeft - (rail.clientWidth - btn.offsetWidth) / 2);
      }
    }
  }

  /* ── Radar de innovación ────────────────────────────────────────────── */
  const NODES = {
    a: {
      label: "01 · Quién", accent: "var(--guinda)", tint: "var(--tint-red)",
      question: "¿Cómo te llamas y qué estudias?",
      hint: "Tu nombre, tu carrera y el semestre en el que vas. Si trabajas o haces prácticas, cuéntalo: ahí ya estás viendo tecnología de cerca.",
      examples: ["nombre", "carrera", "semestre", "trabajo o prácticas"]
    },
    b: {
      label: "02 · Qué", accent: "var(--cobalt)", tint: "var(--tint-blue)",
      question: "¿Qué tecnología o innovación te interesa hoy y por qué?",
      hint: "Una sola, la que de verdad te da curiosidad, entusiasmo o desconfianza. El «por qué» importa más que el nombre.",
      examples: ["inteligencia artificial", "pagos digitales", "vehículos eléctricos", "biotecnología", "drones", "energía solar", "blockchain", "robótica"]
    },
    c: {
      label: "03 · Dónde", accent: "var(--teal)", tint: "var(--tint-teal)",
      question: "¿Qué industria o sector sigues más?",
      hint: "Puede ser el sector donde quieres trabajar, el de tu familia o el que te toca en las prácticas. Vale también un sector mexicano concreto.",
      examples: ["automotriz", "farmacéutica", "logística", "agroindustria", "banca", "comercio electrónico", "energía", "turismo"]
    },
    d: {
      label: "04 · Cómo", accent: "var(--amber)", tint: "var(--tint-amber)",
      question: "¿De dónde sacas lo que sabes de tecnología?",
      hint: "Tus fuentes y también tu tiempo libre: series, videojuegos, pódcast, música, deportes. Todo eso arma el lente con el que miras la innovación.",
      examples: ["TikTok", "YouTube", "pódcast", "prensa", "clases", "trabajo", "familia", "videojuegos"]
    },
    e: {
      label: "Centro · Para qué", accent: "var(--plum)", tint: "var(--tint-plum)",
      question: "¿Qué quieres poder hacer al terminar el seminario?",
      hint: "Una habilidad concreta. Es la que vamos a entrenar contigo durante el semestre, así que vale la pena pensarla bien.",
      examples: ["evaluar una tecnología", "escribir un informe", "leer un indicador", "defender una recomendación", "detectar promesas infladas"]
    }
  };

  const buttons  = $$(".sphere-node, .sphere-hub");
  const detail   = $("#sphereDetail");
  const cdKicker = $("#cdKicker");
  const cdQ      = $("#cdQuestion");
  const cdHint   = $("#cdHint");
  const cdEg     = $("#cdExamples");

  const showNode = (key) => {
    const data = NODES[key];
    if (!data || !detail) return;

    buttons.forEach(btn => {
      const on = btn.dataset.node === key;
      btn.setAttribute("aria-pressed", String(on));
      btn.style.setProperty("--accent", NODES[btn.dataset.node]?.accent || "");
      btn.style.setProperty("--accent-tint", NODES[btn.dataset.node]?.tint || "");
    });

    detail.style.setProperty("--accent", data.accent);
    cdKicker.textContent = data.label;
    cdKicker.style.color = data.accent;
    cdQ.textContent = data.question;
    cdHint.textContent = data.hint;
    cdEg.replaceChildren(...data.examples.map(text => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));
  };

  buttons.forEach(btn => btn.addEventListener("click", () => showNode(btn.dataset.node)));
  if (buttons.length) showNode("a");

  /* ── Constructor del radar ──────────────────────────────────────────── */
  const FIELDS = [
    { input: "#fName",    out: "#rcName",    key: "name",    copy: "Nombre" },
    { input: "#fTech",    out: "#rcTech",    key: "tech",    copy: "Tecnología (02)" },
    { input: "#fSector",  out: "#rcSector",  key: "sector",  copy: "Sector (03)" },
    { input: "#fSources", out: "#rcSources", key: "sources", copy: "Fuentes (04)" },
    { input: "#fGoal",    out: "#rcGoal",    key: "goal",    copy: "Rumbo (centro)" },
    { input: "#fDevice",  out: "#rcDevice",  key: "device",  copy: "Objeto de todos los días" }
  ];
  const STORE = "sem3-27-radar";
  const form = $("#builderForm");

  if (form) {
    const render = () => {
      const saved = {};
      FIELDS.forEach(f => {
        const input = $(f.input);
        const out = $(f.out);
        const value = (input?.value || "").trim();
        saved[f.key] = value;
        if (out) out.textContent = value;
      });
      localStorage.setItem(STORE, JSON.stringify(saved));
    };

    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "{}");
      FIELDS.forEach(f => { const el = $(f.input); if (el && saved[f.key]) el.value = saved[f.key]; });
    } catch { /* almacenamiento no disponible */ }
    render();

    form.addEventListener("input", render);
    form.addEventListener("submit", e => e.preventDefault());

    $("#copyBtn")?.addEventListener("click", async () => {
      const lines = ["MI RADAR DE INNOVACIÓN",
                     "Seminario de Negocios Internacionales III · FCA UNAM · Grupo 1746 · 2027-1", ""];
      FIELDS.forEach(f => {
        const value = ($(f.input)?.value || "").trim();
        if (value) lines.push(`${f.copy}: ${value}`);
      });

      if (lines.length === 3) { say("Escribe algo primero 🛰"); return; }

      const text = lines.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        say("Radar copiado ✓");
      } catch {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.cssText = "position:fixed;top:-1000px";
        document.body.appendChild(helper);
        helper.select();
        try { document.execCommand("copy"); say("Radar copiado ✓"); }
        catch { say("No se pudo copiar en este navegador"); }
        helper.remove();
      }
    });

    $("#printCardBtn")?.addEventListener("click", () => {
      root.classList.add("print-card");
      window.print();
      setTimeout(() => root.classList.remove("print-card"), 400);
    });

    $("#clearBtn")?.addEventListener("click", () => {
      FIELDS.forEach(f => { const el = $(f.input); if (el) el.value = ""; });
      render();
      say("Radar en blanco");
      $("#fName")?.focus();
    });
  }
})();

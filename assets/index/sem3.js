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

  /* ── Calendario del seminario ───────────────────────────────────────── */
  // Martes de 16:00 a 19:00 en el salón C-102. El 15 de septiembre no hay sesión.
  const sessions = [
    [ 1,"2026-08-18","Mesa de innovaciones","Nos conocemos · qué tecnología te mueve","I"],
    [ 2,"2026-08-25","¿Qué cuenta como innovación?","Manual de Oslo · producto y proceso","I"],
    [ 3,"2026-09-01","Genealogía de un invento","Origen · actores · impactos","I"],
    [ 4,"2026-09-08","Innovación y cultura organizacional","Trabajo · empresa · el mito de Sísifo","I"],
    [ 5,"2026-09-22","¿Quién paga la innovación?","Gasto en I+D · público y privado","II"],
    [ 6,"2026-09-29","Medir la innovación","Indicadores · índices · dónde está México","II"],
    [ 7,"2026-10-06","Del laboratorio al mercado","Silicon Valley y sus críticas","II"],
    [ 8,"2026-10-13","Síntesis de I+D · primer parcial","Repaso · examen","II"],
    [ 9,"2026-10-20","La cadena de la inteligencia artificial","Cómputo · datos · energía · trabajo","III"],
    [10,"2026-10-27","Chips y minerales críticos","Cuellos de botella · dependencia","III"],
    [11,"2026-11-03","Sectores emergentes","Biotecnología · energía · movilidad","III"],
    [12,"2026-11-10","México y los sectores de alto crecimiento","Plan México · semiconductores · nearshoring","III"],
    [13,"2026-11-17","Datos, plataformas y vigilancia","Capitalismo de vigilancia · filtro burbuja","IV"],
    [14,"2026-11-24","Trabajo y automatización · segundo parcial","Empleo · desigualdad · examen","IV"],
    [15,"2026-12-01","Gobernanza de la tecnología","Regulación · ética · ambiente · exposiciones","IV"],
    [16,"2026-12-08","Cierre del seminario","Exposiciones · examen final","IV"]
  ].map(([number, date, title, subtitle, unit]) => ({ number, date, title, subtitle, unit, room: "C-102" }));

  const MONTHS = { "01":"ene","02":"feb","03":"mar","04":"abr","05":"may","06":"jun",
                   "07":"jul","08":"ago","09":"sep","10":"oct","11":"nov","12":"dic" };

  const queryDate = new URLSearchParams(location.search).get("fecha");
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  const today = /^\d{4}-\d{2}-\d{2}$/.test(queryDate || "") ? queryDate : localDate;
  const cursor = today < sessions[0].date ? sessions[0].date : today;

  const unlocked = sessions.filter(s => s.date <= cursor);
  const current  = unlocked[unlocked.length - 1] || sessions[0];
  const [y, m, d] = cursor.split("-");
  const pad = n => String(n).padStart(2, "0");

  const dateEl = $("#todayDate");
  if (dateEl) dateEl.textContent = `${Number(d)} ${MONTHS[m]} ${y}`;

  const activeEl = $("#activeSession");
  if (activeEl) activeEl.textContent = `${pad(current.number)} · ${current.title}`;

  const countEl = $("#sessionCount");
  if (countEl) countEl.textContent = `${pad(unlocked.length)} / ${sessions.length}`;

  const list = $("#archiveList");
  if (list) {
    list.replaceChildren(...[...unlocked].reverse().map(s => {
      const item = document.createElement("article");
      item.className = "archive-item" + (s.number === current.number ? " is-current" : "");
      item.innerHTML =
        `<span class="ai-num">${pad(s.number)}</span>` +
        `<time datetime="${s.date}">${Number(s.date.slice(8))} ${MONTHS[s.date.slice(5, 7)]}</time>` +
        `<span class="ai-body"><strong></strong><small></small></span>` +
        `<span class="ai-tag">${s.number === current.number ? "Hoy" : "Tema " + s.unit}</span>`;
      item.querySelector("strong").textContent = s.title;
      item.querySelector("small").textContent  = `${s.subtitle} · ${s.room}`;
      return item;
    }));
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

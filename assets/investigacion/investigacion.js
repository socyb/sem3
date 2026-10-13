/* ==========================================================================
   Tu pregunta de investigación · arranque del trabajo final
   Seminario de Negocios Internacionales III · FCA UNAM · Grupo 1746 · 2027-1
   ========================================================================== */
(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // El almacenamiento puede no estar disponible (ventana privada, sitio bloqueado).
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* sin almacenamiento */ } },
    drop(key) { try { localStorage.removeItem(key); } catch { /* sin almacenamiento */ } }
  };

  /* ── Tema claro / oscuro (la misma preferencia que la página del seminario) ── */
  const root = document.documentElement;
  const embedded = Boolean($("#panel-8"));
  if (!embedded) {
    const themeBtn = $("#themeToggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const applyTheme = (theme) => {
      root.setAttribute("data-theme", theme);
      if (themeBtn) {
        themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
        themeBtn.setAttribute("aria-label", theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      }
    };
    applyTheme(store.get("sem3-27-theme") || (prefersDark ? "dark" : "light"));

    themeBtn?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      store.set("sem3-27-theme", next);
      applyTheme(next);
    });

    $("#printBtn")?.addEventListener("click", () => window.print());
  }

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

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.cssText = "position:fixed;top:-1000px";
      document.body.appendChild(helper);
      helper.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      helper.remove();
      return ok;
    }
  };

  /* ── Código QR de la página ─────────────────────────────────────────── */
  const qrModal = $("#qrModal");
  if (qrModal && !embedded) {
    $("#qrBtn")?.addEventListener("click", () => qrModal.showModal());

    qrModal.addEventListener("click", (e) => {
      const box = qrModal.getBoundingClientRect();
      const outside =
        e.clientX < box.left || e.clientX > box.right ||
        e.clientY < box.top  || e.clientY > box.bottom;
      if (outside) qrModal.close();
    });

    const copyBtn = $("#qrCopyBtn");
    let copyTimer;
    copyBtn?.addEventListener("click", async () => {
      const url = $("#qrUrl")?.textContent.trim() || location.href;
      copyBtn.textContent = (await copyText(url)) ? "Liga copiada ✓" : "No se pudo copiar";
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copyBtn.textContent = "Copiar liga"; }, 2000);
    });
  }

  /* ── Fecha de la última actualización ───────────────────────────────── */
  const stamp = $("#lastUpdate");
  if (stamp && !embedded) {
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

  /* ── Reloj de cada paso ─────────────────────────────────────────────── */
  // Un solo reloj a la vez. Cuenta contra la hora del sistema para no
  // atrasarse si el teléfono duerme la pestaña.
  const clock = $("#clock");
  const clockLabel = $("#clockLabel");
  const clockTime = $("#clockTime");
  const clockPause = $("#clockPause");
  const timerBtns = $$(".timer-btn");

  const mmss = (s) => {
    const t = Math.max(0, Math.ceil(s));
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };

  let endsAt = 0;
  let left = 0;
  let ticker = null;
  let activeLabel = "";

  const markButtons = () => {
    timerBtns.forEach(b => b.classList.toggle("is-running", !clock.hidden && b.dataset.label === activeLabel));
  };

  const tick = () => {
    left = (endsAt - Date.now()) / 1000;
    clockTime.textContent = mmss(left);
    if (left <= 0) {
      clearInterval(ticker);
      ticker = null;
      clock.classList.add("is-done");
      clockPause.disabled = true;
      say(`Se acabó el tiempo · ${activeLabel}`);
      navigator.vibrate?.([200, 120, 200]);
    }
  };

  const startClock = (seconds, label) => {
    clearInterval(ticker);
    activeLabel = label;
    endsAt = Date.now() + seconds * 1000;
    clock.hidden = false;
    root.classList.add("has-clock");
    clock.classList.remove("is-done", "is-paused");
    clockPause.disabled = false;
    clockPause.textContent = "❚❚";
    clockPause.setAttribute("aria-label", "Pausar el reloj");
    clockLabel.textContent = label;
    tick();
    ticker = setInterval(tick, 250);
    markButtons();
  };

  if (clock) {
    timerBtns.forEach(btn => btn.addEventListener("click", () => {
      startClock(Number(btn.dataset.timer) || 600, btn.dataset.label || "");
    }));

    clockPause.addEventListener("click", () => {
      if (ticker) {
        clearInterval(ticker);
        ticker = null;
        left = (endsAt - Date.now()) / 1000;
        clock.classList.add("is-paused");
        clockPause.textContent = "▶";
        clockPause.setAttribute("aria-label", "Seguir con el reloj");
      } else if (left > 0) {
        endsAt = Date.now() + left * 1000;
        clock.classList.remove("is-paused");
        clockPause.textContent = "❚❚";
        clockPause.setAttribute("aria-label", "Pausar el reloj");
        ticker = setInterval(tick, 250);
      }
    });

    const stopClock = () => {
      clearInterval(ticker);
      ticker = null;
      clock.hidden = true;
      root.classList.remove("has-clock");
      markButtons();
    };
    $("#clockStop")?.addEventListener("click", stopClock);
    document.addEventListener("sem3:sessionchange", (event) => {
      if (event.detail !== 8) stopClock();
    });
  }

  /* ── Tarjetas que se voltean ────────────────────────────────────────── */
  const flips = $$("#flips .flip");
  flips.forEach(card => card.addEventListener("click", () => {
    const on = card.getAttribute("aria-pressed") !== "true";
    card.setAttribute("aria-pressed", String(on));
    if (on) card.classList.add("is-done");
  }));

  // Pescar al azar: una que todavía no haya salido; cuando salen todas, se barajan de nuevo.
  let fished = [];
  $("#fishBtn")?.addEventListener("click", () => {
    if (!flips.length) return;
    let pool = flips.filter(c => !fished.includes(c));
    if (!pool.length) {
      fished = [];
      flips.forEach(c => { c.setAttribute("aria-pressed", "false"); c.classList.remove("is-done"); });
      pool = flips.slice();
      say("Se barajan otra vez");
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    fished.push(pick);
    flips.forEach(c => c.classList.toggle("is-picked", c === pick));
    pick.setAttribute("aria-pressed", "false");
    pick.scrollIntoView({ behavior: "smooth", block: "center" });
    pick.focus({ preventScroll: true });
  });

  /* ── Tarjeta del equipo ─────────────────────────────────────────────── */
  const FIELDS = [
    { input: "#fTeam",     key: "team",     copy: "Equipo" },
    { input: "#fMembers",  key: "members",  copy: "Integrantes y roles" },
    { input: "#fInnov",    key: "innov",    copy: "Innovación",       out: "#tcInnov" },
    { input: "#teamSector",   key: "sector",   copy: "Sector",           out: "#tcSector" },
    { input: "#fWhere",    key: "where",    copy: "Dónde" },
    { input: "#fWhen",     key: "when",     copy: "Cuándo" },
    { input: "#fWho",      key: "who",      copy: "Quiénes" },
    { input: "#fTerm",     key: "term",     copy: "Palabra clave",    out: "#tcTerm" },
    { input: "#fQuestion", key: "question", copy: "Pregunta de investigación (tentativa)" },
    { input: "#fHunch",    key: "hunch",    copy: "Lo que sospechamos", out: "#tcHunch" },
    { input: "#fBone",     key: "bone",     copy: "Cambiaríamos de idea si", out: "#tcBone" },
    { input: "#teamSources",  key: "sources",  copy: "Dónde vamos a buscar", out: "#tcSources" }
  ];
  const GROUPS = { rules: "Las cuatro reglas", tests: "Las cuatro pruebas" };
  const STORE = "sem3-27-tarjeta-equipo";
  const form = $("#teamForm");

  const val = (sel) => ($(sel)?.value || "").trim();
  const checked = (group) => $$(`input[data-group="${group}"]`).filter(i => i.checked).map(i => i.value);
  const lines = (text) => text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const cutText = () => {
    const parts = [["Dónde", val("#fWhere")], ["Cuándo", val("#fWhen")], ["Quiénes", val("#fWho")]]
      .filter(([, v]) => v);
    return parts.map(([k, v]) => `${k}: ${v}`).join(" · ");
  };

  if (form) {
    const render = () => {
      const saved = { checks: {} };
      FIELDS.forEach(f => {
        const value = val(f.input);
        saved[f.key] = value;
        if (f.out) { const out = $(f.out); if (out) out.textContent = value; }
      });

      $("#tcTeam").textContent = saved.team;
      $("#tcQuestion").textContent = saved.question;
      $("#tcCut").textContent = cutText();
      $("#tcMembers").replaceChildren(...lines(saved.members).map(name => {
        const li = document.createElement("li");
        li.textContent = name;
        return li;
      }));

      Object.keys(GROUPS).forEach(group => {
        const on = checked(group);
        saved.checks[group] = on;
        const meter = $(group === "rules" ? "#tcRules" : "#tcTests");
        if (meter) {
          meter.textContent = `${on.length} / 4`;
          meter.parentElement.classList.toggle("is-full", on.length === 4);
        }
      });

      store.set(STORE, JSON.stringify(saved));
    };

    try {
      const saved = JSON.parse(store.get(STORE) || "{}");
      FIELDS.forEach(f => { const el = $(f.input); if (el && saved[f.key]) el.value = saved[f.key]; });
      Object.keys(GROUPS).forEach(group => {
        const on = saved.checks?.[group] || [];
        $$(`input[data-group="${group}"]`).forEach(i => { i.checked = on.includes(i.value); });
      });
    } catch { /* tarjeta guardada ilegible: se empieza en blanco */ }
    render();

    form.addEventListener("input", render);
    form.addEventListener("change", render);
    form.addEventListener("submit", e => e.preventDefault());

    $("#teamCopyBtn")?.addEventListener("click", async () => {
      const out = ["TARJETA DEL EQUIPO · TRABAJO FINAL",
                   "Seminario de Negocios Internacionales III · FCA UNAM · Grupo 1746 · 2027-1", ""];
      const add = (label, value) => { if (value) out.push(`${label}: ${value}`); };

      add("Equipo", val("#fTeam"));
      const members = lines(val("#fMembers"));
      if (members.length) { out.push("Integrantes y roles:"); members.forEach(m => out.push(`  - ${m}`)); }
      add("Innovación", val("#fInnov"));
      add("Sector", val("#teamSector"));
      add("Recorte", cutText());
      add("Palabra clave", val("#fTerm"));
      if (val("#fQuestion")) out.push("", `PREGUNTA DE INVESTIGACIÓN (TENTATIVA): ${val("#fQuestion")}`, "");
      add("Lo que sospechamos", val("#fHunch"));
      add("Cambiaríamos de idea si", val("#fBone"));
      add("Dónde vamos a buscar", val("#teamSources"));
      Object.entries(GROUPS).forEach(([group, label]) => {
        const on = checked(group);
        if (on.length) out.push(`${label} (${on.length}/4): ${on.join("; ")}`);
      });

      if (out.length === 3) { say("Escriban algo primero"); return; }
      say((await copyText(out.join("\n"))) ? "Tarjeta copiada ✓" : "No se pudo copiar en este navegador");
    });

    $("#teamPrintBtn")?.addEventListener("click", () => {
      root.classList.add("print-team-card");
      window.print();
      setTimeout(() => root.classList.remove("print-team-card"), 400);
    });

    $("#teamClearBtn")?.addEventListener("click", () => {
      if (!window.confirm("¿Borrar la tarjeta del equipo en este aparato?")) return;
      FIELDS.forEach(f => { const el = $(f.input); if (el) el.value = ""; });
      $$("input[data-group]").forEach(i => { i.checked = false; });
      store.drop(STORE);
      render();
      say("Tarjeta en blanco");
      $("#fTeam")?.focus();
    });
  }
})();

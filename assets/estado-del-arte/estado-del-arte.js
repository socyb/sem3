/* ==========================================================================
   El estado del arte · segunda etapa del trabajo final
   Seminario de Negocios Internacionales III · FCA UNAM · Grupo 1746 · 2027-1
   El modo diapositivas vive aparte, en assets/investigacion/presentacion.js.
   ========================================================================== */
(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // El almacenamiento puede no estar disponible (ventana privada, sitio bloqueado).
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    drop(key) { try { localStorage.removeItem(key); } catch { /* sin almacenamiento */ } }
  };

  /* ── Tema claro / oscuro (la misma preferencia que la página del seminario) ── */
  const root = document.documentElement;
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

  /* ── Aviso flotante y portapapeles ──────────────────────────────────── */
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
  if (qrModal) {
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
  if (stamp) {
    const modified = new Date(document.lastModified);
    if (!Number.isNaN(modified.valueOf()) && Date.now() - modified.getTime() > 60000) {
      stamp.dateTime = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(modified);
      stamp.textContent = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(modified);
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

  if (clock) {
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
    document.addEventListener("sem3:presentationopen", () => { if (ticker) clockPause.click(); });
    $("#clockStop")?.addEventListener("click", () => {
      clearInterval(ticker);
      ticker = null;
      clock.hidden = true;
      root.classList.remove("has-clock");
      markButtons();
    });
  }

  /* ── ¿Existe o la inventaron? ───────────────────────────────────────── */
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

  $$("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
    say((await copyText(btn.dataset.copy)) ? "Copiado ✓ Búscalo entre comillas" : "No se pudo copiar en este navegador");
  }));

  /* ── El buscador de los tres puertos ────────────────────────────────── */
  const launch = $("#qLaunch");
  if (launch) {
    const QKEY = "sem3-27-busqueda";
    launch.value = store.get(QKEY) || "";
    const links = $$("[data-engine]");
    const aim = () => {
      const q = launch.value.trim();
      links.forEach(a => {
        a.href = q ? a.dataset.engine + encodeURIComponent(q + (a.dataset.suffix || "")) : a.dataset.home;
      });
      store.set(QKEY, launch.value);
    };
    launch.addEventListener("input", aim);
    aim();
    $("#qCopy")?.addEventListener("click", async () => {
      const q = launch.value.trim();
      if (!q) { say("Escribe tu búsqueda primero"); launch.focus(); return; }
      say((await copyText(q)) ? "Búsqueda copiada ✓ Pégala en el Descubridor de BIDI" : "No se pudo copiar en este navegador");
    });
  }

  /* ── La ficha del equipo ────────────────────────────────────────────── */
  const form = $("#teamForm");
  if (!form) return;

  const STORE = "sem3-27-estado-del-arte";
  const PREV  = "sem3-27-tarjeta-equipo";       // la tarjeta del 10 de noviembre
  const FIELDS = {
    team: "#fTeam", members: "#fMembers", question: "#fQuestion", sub1: "#fSub1", sub2: "#fSub2",
    hyp: "#fHyp", keys: "#fKeys", known: "#fKnown", debate: "#fDebate", gap: "#fGap"
  };
  const ANCHOR = ["Existe", "La abrimos", "Dice lo que creemos", "Sabemos quién habla", "Le sirve a la pregunta"];
  const TYPE = {
    articulo: "Artículo", libro: "Libro", capitulo: "Capítulo", informe: "Informe",
    datos: "Datos", prensa: "Prensa", web: "Página web"
  };
  const ACADEMIC = ["articulo", "libro", "capitulo"];
  const GOAL = { sources: 4, academic: 3 };

  const list = $("#srcList");
  const tpl = $("#srcTpl");
  const lines = (text) => text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const val = (sel) => ($(sel)?.value || "").trim();
  let uid = 0;

  /* Cada fuente es un bloque del molde; los ids se ponen aquí para que las etiquetas funcionen. */
  const addSource = (data = {}) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    uid += 1;
    $$("[data-k]", node).forEach(el => {
      const id = `src${uid}-${el.dataset.k}`;
      el.id = id;
      const label = el.closest(".field")?.querySelector("label");
      if (label) label.htmlFor = id;
      if (data[el.dataset.k]) el.value = data[el.dataset.k];
    });
    $$("[data-a]", node).forEach(box => { box.checked = Boolean(data.anchor?.[Number(box.dataset.a)]); });
    $(".sota-src-checks", node).setAttribute("aria-label", "Prueba del ancla de esta fuente");
    $(".sota-src-drop", node).addEventListener("click", () => {
      const filled = $$("[data-k]", node).some(el => el.value.trim());
      if (filled && !window.confirm("¿Quitar esta fuente de la ficha?")) return;
      node.remove();
      render();
    });
    list.appendChild(node);
    return node;
  };

  const readSources = () => $$(".sota-src", list).map(node => {
    const s = { anchor: $$("[data-a]", node).map(b => b.checked) };
    $$("[data-k]", node).forEach(el => { s[el.dataset.k] = el.value.trim(); });
    return s;
  });
  const isEmpty = (s) => !s.ref && !s.link && !s.adds && !s.type && !s.layer && !s.where && !s.anchor.some(Boolean);
  const anchored = (s) => s.anchor.every(Boolean);

  const render = () => {
    const saved = {};
    Object.entries(FIELDS).forEach(([k, sel]) => { saved[k] = val(sel); });
    const sources = readSources();
    saved.sources = sources;

    // Numeración y ancla de cada bloque del formulario
    $$(".sota-src", list).forEach((node, i) => {
      const s = sources[i];
      const n = s.anchor.filter(Boolean).length;
      $(".sota-src-num", node).textContent = String(i + 1).padStart(2, "0");
      $(".sota-src-anchor", node).textContent = `⚓ ${n}/5`;
      node.classList.toggle("is-anchored", n === 5);
    });

    // Vista previa
    $("#tcTeam").textContent = saved.team;
    $("#tcMembers").replaceChildren(...lines(saved.members).map(name => {
      const li = document.createElement("li");
      li.textContent = name;
      return li;
    }));
    $("#tcQuestion").textContent = saved.question;
    $("#tcSubs").replaceChildren(...[saved.sub1, saved.sub2].filter(Boolean).map(q => {
      const li = document.createElement("li");
      li.textContent = q;
      return li;
    }));
    $("#tcHyp").textContent = saved.hyp;
    $("#tcKeys").textContent = lines(saved.keys).join(" · ");
    $("#tcKnown").textContent = saved.known;
    $("#tcDebate").textContent = saved.debate;
    $("#tcGap").textContent = saved.gap;

    const real = sources.filter(s => !isEmpty(s));
    $("#tcRefs").replaceChildren(...real.map(s => {
      const li = document.createElement("li");
      li.textContent = s.ref || s.link || "Fuente sin referencia todavía";
      const meta = document.createElement("small");
      meta.textContent = [TYPE[s.type], s.layer, `⚓ ${s.anchor.filter(Boolean).length}/5`].filter(Boolean).join(" · ");
      li.appendChild(meta);
      li.classList.toggle("is-anchored", anchored(s));
      return li;
    }));

    const count = real.length;
    const acad = real.filter(s => ACADEMIC.includes(s.type)).length;
    const full = real.filter(anchored).length;
    const meter = (sel, text, ok) => {
      const el = $(sel);
      el.textContent = text;
      el.parentElement.classList.toggle("is-full", ok);
    };
    meter("#tcCount", `${count} / ${GOAL.sources}`, count >= GOAL.sources);
    meter("#tcAcad", `${acad} / ${GOAL.academic}`, acad >= GOAL.academic);
    meter("#tcAnchor", `${full} / ${count}`, count > 0 && full === count);

    store.set(STORE, JSON.stringify(saved));
  };

  /* Arranque: lo guardado hoy, o lo que quedó de la tarjeta del 10 de noviembre. */
  let saved = null;
  try { saved = JSON.parse(store.get(STORE) || "null"); } catch { saved = null; }
  if (saved) {
    Object.entries(FIELDS).forEach(([k, sel]) => { if (saved[k]) $(sel).value = saved[k]; });
    (saved.sources || []).forEach(s => addSource(s));
  } else {
    let prev = null;
    try { prev = JSON.parse(store.get(PREV) || "null"); } catch { prev = null; }
    if (prev && (prev.team || prev.question)) {
      if (prev.team) $("#fTeam").value = prev.team;
      if (prev.members) $("#fMembers").value = prev.members;
      if (prev.question) $("#fQuestion").value = prev.question;
      if (prev.hunch) $("#fHyp").value = prev.hunch;
      $("#prefillNote").hidden = false;
    }
  }
  if (!list.children.length) addSource();
  render();

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", e => e.preventDefault());

  $("#srcAdd").addEventListener("click", () => {
    const node = addSource();
    render();
    $("[data-k='type']", node)?.focus();
  });


  /* Texto para el foro */
  $("#teamCopyBtn")?.addEventListener("click", async () => {
    const out = ["FICHA DEL EQUIPO · ESTADO DEL ARTE",
                 "Seminario de Negocios Internacionales III · FCA UNAM · Grupo 1746 · 2027-1", ""];
    const add = (label, value) => { if (value) out.push(`${label}: ${value}`); };

    add("Equipo", val("#fTeam"));
    const members = lines(val("#fMembers"));
    if (members.length) { out.push("Integrantes y roles:"); members.forEach(m => out.push(`  - ${m}`)); }
    if (val("#fQuestion")) out.push("", `PREGUNTA PRINCIPAL: ${val("#fQuestion")}`);
    const subs = [val("#fSub1"), val("#fSub2")].filter(Boolean);
    if (subs.length) { out.push("Preguntas secundarias:"); subs.forEach((q, i) => out.push(`  ${i + 1}. ${q}`)); }
    add("Hipótesis provisional", val("#fHyp"));
    const keys = lines(val("#fKeys"));
    if (keys.length) out.push(`Palabras clave: ${keys.join(" · ")}`);

    const real = readSources().filter(s => !isEmpty(s));
    if (real.length) {
      const acad = real.filter(s => ACADEMIC.includes(s.type)).length;
      out.push("", `FUENTES (${real.length} · ${acad} académicas)`);
      real.forEach((s, i) => {
        const tags = [TYPE[s.type], s.layer, s.where].filter(Boolean).join(" · ");
        out.push(`${i + 1}. ${tags ? `[${tags}] ` : ""}${s.ref || "(sin referencia)"}`);
        if (s.link && !(s.ref || "").includes(s.link)) out.push(`   Enlace: ${s.link}`);
        const passed = ANCHOR.filter((_, j) => s.anchor[j]);
        out.push(`   Prueba del ancla (${passed.length}/5)${passed.length ? `: ${passed.join("; ")}` : ""}`);
        if (s.adds) out.push(`   Qué aporta: ${s.adds}`);
      });
    }

    if (val("#fKnown") || val("#fDebate") || val("#fGap")) {
      out.push("", "EL MAPA");
      add("Lo que ya se sabe", val("#fKnown"));
      add("En qué discuten", val("#fDebate"));
      add("Lo que falta", val("#fGap"));
    }

    if (out.length === 3) { say("Escriban algo primero"); return; }
    say((await copyText(out.join("\n"))) ? "Ficha copiada · publíquenla en el Foro de Moodle del Seminario" : "No se pudo copiar en este navegador");
  });

  $("#teamPrintBtn")?.addEventListener("click", () => {
    root.classList.add("print-team-card");
    window.print();
    setTimeout(() => root.classList.remove("print-team-card"), 400);
  });

  $("#teamClearBtn")?.addEventListener("click", () => {
    if (!window.confirm("¿Borrar la ficha del equipo en este aparato?")) return;
    Object.values(FIELDS).forEach(sel => { $(sel).value = ""; });
    list.replaceChildren();
    addSource();
    $("#prefillNote").hidden = true;
    store.drop(STORE);
    render();
    say("Ficha en blanco");
    $("#fTeam")?.focus();
  });
})();

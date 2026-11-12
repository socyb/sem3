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
  // El 6 de octubre la sesión es la conferencia que la Academia nos asignó en la
  // Semana Académica: Auditorio Echenique García, de 16:00 a 18:00.
  // El 20 de octubre es la jornada de Método del Caso: edificio J, de 16:00 a 18:00.
  // El 27 de octubre la invitada se conecta desde Medellín: la sesión es por Zoom.
  // El 13 de octubre nos visitó el Dr. Javier Jasso Villazul; la hora para la pregunta
  // de investigación pasó al 10 de noviembre, junto con las lecturas de nearshoring.
  // La 12 se abre el 4 de noviembre para dar una semana al control de lectura,
  // pero ya está en la bitácora desde el 3 para quien quiera adelantarse.
  // La 13 se abre el 11 de noviembre, también por el control de lectura (Crawford).
  // El séptimo dato es opcional: fecha de apertura o fecha y hora con zona.
  // Sin ese dato, la sesión se abre a medianoche de la víspera en Ciudad de México.
  // El octavo también es opcional: desde cuándo sale la parada en la bitácora,
  // antes de su apertura. Ahí ya se puede abrir, pero la portada sigue con la de hoy.
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
    [ 6,"2026-09-29","Mercado mundial de energéticos","Con el Ing. Ulises Matus · Gas natural México–Estados Unidos","II",
      "Una pregunta escrita para él"],
    [ 7,"2026-10-06","Conversando con egresados de Negocios Internacionales","Semana Académica · Auditorio Echenique García","II",
      "Las preguntas que quieras hacerles"],
    [ 8,"2026-10-13","Innovación y conocimiento","Con el Dr. Javier Jasso Villazul · FCA UNAM","II",
      "Tus preguntas para el invitado","2026-10-13T07:00:00-06:00"],
    [ 9,"2026-10-20","Jornada de Método del Caso","Contentra · ¿quién decide lo que vemos?","III",
      "El caso leído y tu análisis individual"],
    [10,"2026-10-27","Microcréditos, innovación y sostenibilidad","Con la Ing. Deisy Carmona · desde Medellín vía Zoom","III",
      "Una pregunta para Deisy"],
    [11,"2026-11-03","Ciudadanía digital","Con el Dr. Amílcar Chavarría Cruz · medios digitales y desinformación","III",
      "Tus preguntas para el invitado"],
    [12,"2026-11-10","México y los sectores de alto crecimiento","Nearshoring y semiconductores · tu pregunta de investigación","III",
      "Tu control de lectura y una innovación que te interese","2026-11-04","2026-11-03"],
    [13,"2026-11-17","La inteligencia artificial está hecha de tierra y de trabajo","Kate Crawford · Atlas of AI","IV",
      "Tu control de lectura de Crawford","2026-11-11"],
    [14,"2026-11-24","Trabajo y automatización · segundo parcial","Empleo · desigualdad · examen","IV",
      "Todo lo del segundo tema repasado"],
    [15,"2026-12-01","Gobernanza de la tecnología","Regulación · ética · ambiente · entrega final y entrevistas","IV",
      "Tu trabajo final terminado para entregar y conversar sobre él en la entrevista"]
  ].map(([number, date, title, subtitle, unit, bring, open, listed]) =>
    ({ number, date, title, subtitle, unit, bring, open, listed, room: "C-102" }));

  /* ── Lema de la portada: uno por sesión ─────────────────────────────── */
  // Primera línea en redonda, segunda en cursiva guinda.
  const LEMAS = {
     1: ["Cada quien trae su radar.", "Juntos vemos el punto ciego."],
     2: ["Inventar no basta.", "Innovar es llegar al mercado."],
     3: ["Toda tecnología se rompe.", "Alguien tiene que estar ahí."],
     4: ["Las ideas se discuten.", "El dinero decide dónde aterrizan."],
     5: ["Toda acción tiene consecuencias.", "Casi nunca las que buscábamos."],
     6: ["La luz que prendes cruzó una frontera.", "Alguien la compró antes que tú."],
     7: ["Alguien ya estuvo en tu lugar.", "Pregúntale qué encontró al salir."],
     8: ["La tecnología se puede comprar.", "Las capacidades hay que construirlas."],
     9: ["Alguien decide lo que vemos.", "Hoy te toca decidir a ti."],
    10: ["Un crédito puede transformar un territorio.", "Lo difícil es que el cambio se quede."],
    11: ["La ciudadanía también se ejerce en línea.", "¿Cómo participamos entre tanta información?"],
    12: ["Ensamblar, diseñar, decidir.", "¿Dónde queremos participar?"],
    13: ["La nube está hecha de minas.", "Y de manos que nadie ve."],
    14: ["Las máquinas no despiden a nadie.", "Alguien decide hacerlo."],
    15: ["Toda tecnología tiene reglas.", "La pregunta es quién las escribe."]
  };

  const heroTitle = $(".hero-title");
  const ponerLema = (n) => {
    const lema = LEMAS[n];
    if (!heroTitle || !lema) return;
    const em = document.createElement("em");
    em.textContent = lema[1];
    heroTitle.replaceChildren(lema[0], document.createElement("br"), em);
  };

  const MONTHS = { "01":"ene","02":"feb","03":"mar","04":"abr","05":"may","06":"jun",
                   "07":"jul","08":"ago","09":"sep","10":"oct","11":"nov","12":"dic" };

  const params = new URLSearchParams(location.search);
  const queryDate = params.get("fecha");
  const preview = /^\d{4}-\d{2}-\d{2}$/.test(queryDate || "");
  const queryTime = params.get("hora");
  const previewTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(queryTime || "") ? queryTime : "12:00";
  const now = preview ? new Date(`${queryDate}T${previewTime}:00-06:00`) : new Date();
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(now);
  const today = localDate;
  const cursor = today < sessions[0].date ? sessions[0].date : today;

  // Una sesión entra en vigor desde la víspera: la noche anterior ya puedes ver
  // lo que toca y con qué hay que llegar.
  const vispera = (iso) => {
    const t = new Date(`${iso}T12:00:00Z`);
    t.setUTCDate(t.getUTCDate() - 1);
    return t.toISOString().slice(0, 10);
  };

  const abre = s => s.open || vispera(s.date);
  const instante = iso => new Date(iso.includes("T") ? iso : `${iso}T00:00:00-06:00`).getTime();
  const openingTime = s => instante(abre(s));
  const listingTime = s => s.listed ? Math.min(instante(s.listed), openingTime(s)) : openingTime(s);
  const unlocked = sessions.filter(s => s.number === 1 || openingTime(s) <= now.getTime());
  const current  = unlocked[unlocked.length - 1] || sessions[0];
  // La bitácora puede ir un paso adelante de la portada: las sesiones con octavo
  // dato salen en la línea desde esa fecha, aunque todavía no sean la de hoy.
  const listed   = sessions.filter(s => s.number === 1 || listingTime(s) <= now.getTime());

  // También se actualiza una pestaña que se haya dejado abierta antes de las 7.
  // Las ligas de vista previa (?fecha=...&hora=...) conservan la hora simulada.
  if (!preview) {
    const nextOpening = sessions.flatMap(s => [listingTime(s), openingTime(s)])
      .filter(time => time > now.getTime())
      .sort((a, b) => a - b)[0];
    if (nextOpening) {
      setTimeout(() => location.reload(), Math.min(nextOpening - now.getTime(), 2147483647));
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && Date.now() >= nextOpening) location.reload();
      });
    }
  }
  const [y, m, d] = cursor.split("-");
  const pad = n => String(n).padStart(2, "0");
  const shortDate = iso => `${Number(iso.slice(8))} ${MONTHS[iso.slice(5, 7)]}`;

  const dateEl = $("#todayDate");
  if (dateEl) dateEl.textContent = `${Number(d)} ${MONTHS[m]} ${y}`;

  ponerLema(current.number);

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
  if (countEl) countEl.textContent = `${pad(listed.length)} / ${sessions.length}`;

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
      document.dispatchEvent(new CustomEvent("sem3:sessionchange", { detail: number }));
      if (push) ponerLema(number);
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

    listed.forEach(s => {
      const esHoy = s.number === current.number;
      const adelantada = s.number > current.number;
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
          `<span class="tl-tag">${esHoy || adelantada ? cuando : "Tema " + s.unit}</span>` +
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

    const faltan = sessions.length - listed.length;
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
    // Una sesión que se adelantó a la bitácora solo se abre si la liga la pide.
    const pedida = Number(params.get("sesion"));
    const enLinea  = listed.filter(s => panelFor(s.number)).map(s => s.number);
    const escritas = unlocked.filter(s => panelFor(s.number)).map(s => s.number);
    const inicio =
      (enLinea.includes(pedida) && pedida) ||
      (escritas.includes(current.number) && current.number) ||
      escritas[escritas.length - 1];

    // Deja la parada de una sesión al centro del riel.
    const rail = $("#timeline");
    const centrar = (number, behavior = "auto") => {
      const btn = stops.find(b => Number(b.dataset.sesion) === number);
      if (btn && rail && rail.scrollWidth > rail.clientWidth) {
        rail.scrollTo({ left: Math.max(0, btn.offsetLeft - (rail.clientWidth - btn.offsetWidth) / 2), behavior });
      }
    };

    if (inicio) {
      openSession(inicio, false);
      // Si la liga pide una sesión, el lema la acompaña; si no, se queda el de hoy.
      if (inicio === pedida) ponerLema(pedida);
      centrar(inicio);
    }

    // Cuando la bitácora va adelantada, un botón lleva directo a la próxima sesión
    // y de regreso a la de hoy: en el celular esa parada queda fuera de la vista.
    const proxima = listed.find(s => s.number > current.number && panelFor(s.number));
    const hint = $(".tl-hint");
    if (proxima && hint) {
      hint.textContent = "Toca una parada para volver a una sesión anterior o adelantarte a la próxima.";
      const salto = document.createElement("button");
      salto.type = "button";
      salto.className = "btn btn-primary btn-small tl-jump";
      const hoyEscrita = escritas.includes(current.number);
      const rotular = (number) => {
        const regreso = number === proxima.number && hoyEscrita;
        salto.dataset.destino = regreso ? current.number : proxima.number;
        salto.textContent = regreso
          ? `← Volver a la sesión de hoy (${pad(current.number)})`
          : `Ir a la próxima: sesión ${pad(proxima.number)} →`;
      };
      salto.addEventListener("click", () => {
        const destino = Number(salto.dataset.destino);
        openSession(destino);
        centrar(destino, "smooth");
      });
      document.addEventListener("sem3:sessionchange", (e) => rotular(e.detail));
      rotular(inicio);
      hint.after(salto);
    }
  }

  /* ── Lo del curso, plegado ──────────────────────────────────────────── */
  // La ruta, la evaluación, el profesor y los recursos viven en <details>.
  // Una liga que apunte a uno de ellos (#ruta, #profesor…) lo abre antes de
  // llegar; al imprimir se abren todos y después vuelven a como estaban.
  const folds = $$("details.fold");
  const abrirPliegue = (hash) => {
    const id = decodeURIComponent((hash || "").slice(1));
    const fold = id ? document.getElementById(id)?.closest("details.fold") : null;
    if (fold) fold.open = true;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) abrirPliegue(a.getAttribute("href"));
  });
  window.addEventListener("hashchange", () => abrirPliegue(location.hash));
  abrirPliegue(location.hash);

  let cerrados = [];
  window.addEventListener("beforeprint", () => {
    cerrados = folds.filter(f => !f.open);
    cerrados.forEach(f => { f.open = true; });
  });
  window.addEventListener("afterprint", () => {
    cerrados.forEach(f => { f.open = false; });
    cerrados = [];
  });

  /* ── Datos bajo llave ───────────────────────────────────────────────── */
  // La liga de Zoom no queda a la vista en el código: viaja cifrada en
  // data-sellado = base64(sal de 16 bytes · iv de 12 · AES-GCM), con una llave
  // PBKDF2-SHA-256 de 150 000 vueltas sacada de la clave. Por dentro es un JSON
  // { href, label, items: [[dt, dd], …] }. La clave no distingue mayúsculas,
  // espacios ni guiones, y se recuerda en el dispositivo una vez que abrió.
  const CLAVE = "sem3-27-clave";
  const limpiaClave = k => k.toLowerCase().replace(/[\s-]/g, "");

  const abrirSello = async (sellado, clave) => {
    const bytes = Uint8Array.from(atob(sellado), c => c.charCodeAt(0));
    const base = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(clave), "PBKDF2", false, ["deriveKey"]);
    const llave = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: bytes.slice(0, 16), iterations: 150000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const claro = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(16, 28) }, llave, bytes.slice(28));
    return JSON.parse(new TextDecoder().decode(claro));
  };

  $$(".vault[data-sellado]").forEach(vault => {
    const lock  = $(".vault-lock", vault);
    const open  = $(".vault-open", vault);
    const input = lock && $("input", lock);
    const msg   = $(".vault-msg", vault);
    if (!lock || !open || !input) return;

    const mostrar = (datos) => {
      const link = document.createElement("a");
      link.className = "btn btn-primary";
      link.href = datos.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${datos.label} ↗`;

      const copy = document.createElement("button");
      copy.className = "btn btn-ghost btn-small";
      copy.type = "button";
      copy.textContent = "Copiar liga";
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(datos.href); say("Liga copiada ✓"); }
        catch { say("No se pudo copiar en este navegador"); }
      });

      const actions = document.createElement("div");
      actions.className = "vault-actions";
      actions.append(link, copy);

      const dl = document.createElement("dl");
      dl.className = "vault-data";
      (datos.items || []).forEach(([term, value]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = term;
        dd.textContent = value;
        row.append(dt, dd);
        dl.append(row);
      });

      open.replaceChildren(actions, dl);
      lock.hidden = true;
      open.hidden = false;
      return link;
    };

    const probar = async (clave) => {
      const link = mostrar(await abrirSello(vault.dataset.sellado, clave));
      try { localStorage.setItem(CLAVE, clave); } catch { /* almacenamiento no disponible */ }
      return link;
    };

    lock.addEventListener("submit", async (e) => {
      e.preventDefault();
      const clave = limpiaClave(input.value);
      if (!clave) return;
      if (!window.crypto?.subtle) {
        msg.textContent = "Este navegador no puede abrir los datos aquí. Entra desde socyb.github.io/sem3.";
        return;
      }
      msg.textContent = "Abriendo…";
      try {
        (await probar(clave)).focus();
      } catch {
        msg.textContent = "Esa no es la clave. Inténtalo de nuevo.";
        input.select();
      }
    });

    let guardada = null;
    try { guardada = localStorage.getItem(CLAVE); } catch { /* almacenamiento no disponible */ }
    if (guardada && window.crypto?.subtle) probar(guardada).catch(() => {});
  });

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

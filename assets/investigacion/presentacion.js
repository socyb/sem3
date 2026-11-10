/* Taller de investigación: diapositivas y un reloj independiente por fase. */
(() => {
  "use strict";
  const dialog = document.querySelector("#workshopSlides");
  if (!dialog) return;
  const $ = selector => dialog.querySelector(selector);
  const slides = [...dialog.querySelectorAll(".ws-slide")];
  const stage = $("#wsStage");
  const clock = $("#wsClock");
  const time = $("#wsTime");
  const toggle = $("#wsToggle");
  const status = $("#wsStatus");
  // El tablero de la actividad es la fuente de los nombres y las duraciones.
  const phases = [null, ...[...document.querySelectorAll("#pasos .board-item")].map(item => {
    const total = Number(item.querySelector("[data-timer]").dataset.timer);
    return { name: item.querySelector("strong").textContent, total, left: total, endsAt: 0 };
  })];
  let at = 0;
  let running = 0;
  let interval = null;
  let opener = null;
  let previousHash = "";
  const phase = () => Number(slides[at].dataset.phase) || 0;
  const mmss = seconds => {
    const whole = Math.max(0, Math.ceil(seconds));
    return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
  };
  const paint = () => {
    const n = phase();
    clock.hidden = !n;
    if (!n) return;
    const current = phases[n];
    time.textContent = mmss(current.left);
    clock.classList.toggle("is-done", current.left <= 0);
    clock.classList.toggle("is-running", running === n);
    toggle.textContent = running === n ? "Pausar" : current.left <= 0 ? "Tiempo cumplido" : current.left < current.total ? "Reanudar" : "Iniciar";
    toggle.disabled = current.left <= 0;
    toggle.setAttribute("aria-label", `${toggle.textContent} · fase ${n}`);
  };
  const pause = () => {
    if (running) {
      const current = phases[running];
      current.left = Math.max(0, (current.endsAt - Date.now()) / 1000);
    }
    clearInterval(interval);
    interval = null;
    running = 0;
    paint();
  };
  const tick = () => {
    if (!running) return;
    const n = running;
    const current = phases[n];
    current.left = Math.max(0, (current.endsAt - Date.now()) / 1000);
    if (current.left <= 0) {
      pause();
      status.textContent = `Terminó el tiempo de la fase ${n}. Revisen lo escrito antes de avanzar.`;
    }
    paint();
  };
  const toggleTimer = () => {
    const n = phase();
    if (!n || !dialog.open) return;
    if (running === n) { pause(); return; }
    if (phases[n].left <= 0) return;
    pause();
    phases[n].endsAt = Date.now() + phases[n].left * 1000;
    running = n;
    status.textContent = "";
    interval = setInterval(tick, 200);
    paint();
  };
  const show = index => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    const nextPhase = Number(slides[next].dataset.phase) || 0;
    if (nextPhase !== phase()) pause();
    at = next;
    slides.forEach((slide, i) => { slide.hidden = i !== at; });
    stage.scrollTop = 0;
    $("#wsCount").textContent = `${at + 1} / ${slides.length}`;
    $("#wsPhase").textContent = nextPhase ? `Fase ${nextPhase} · ${phases[nextPhase].name}` : "Una hora · Cinco fases";
    $("#wsProgress").style.width = `${(at + 1) / slides.length * 100}%`;
    $("#wsPrev").disabled = at === 0;
    $("#wsNext").disabled = at === slides.length - 1;
    status.textContent = "";
    paint();
    history.replaceState(null, "", `${location.pathname}${location.search}#diapositiva-${at + 1}`);
  };
  const open = index => {
    if (dialog.open) return;
    opener = document.activeElement;
    previousHash = location.hash.startsWith("#diapositiva-") ? "" : location.hash;
    document.dispatchEvent(new CustomEvent("sem3:presentationopen"));
    dialog.showModal();
    document.documentElement.classList.add("workshop-presenting");
    show(index);
    stage.focus();
  };
  const close = () => dialog.close();
  dialog.addEventListener("close", () => {
    pause();
    document.documentElement.classList.remove("workshop-presenting");
    if (document.fullscreenElement === dialog) document.exitFullscreen?.().catch(() => {});
    history.replaceState(null, "", `${location.pathname}${location.search}${previousHash}`);
    opener?.focus({ preventScroll: true });
  });
  document.querySelectorAll("[data-workshop-open]").forEach(button => {
    button.addEventListener("click", () => open(at));
  });
  $("#wsPrev").addEventListener("click", () => show(at - 1));
  $("#wsNext").addEventListener("click", () => show(at + 1));
  toggle.addEventListener("click", toggleTimer);
  $("#wsReset").addEventListener("click", () => {
    const n = phase();
    if (!n) return;
    pause();
    phases[n].left = phases[n].total;
    status.textContent = `Reloj de la fase ${n} reiniciado y en pausa.`;
    paint();
  });
  $("#wsExit").addEventListener("click", close);
  const fullscreen = () => {
    if (document.fullscreenElement === dialog) document.exitFullscreen?.().catch(() => {});
    else dialog.requestFullscreen?.().catch(() => {
      status.textContent = "La presentación sigue disponible en esta ventana.";
    });
  };
  $("#wsFull").hidden = !dialog.requestFullscreen;
  $("#wsFull").addEventListener("click", fullscreen);
  document.addEventListener("fullscreenchange", () => {
    $("#wsFull").setAttribute("aria-pressed", String(document.fullscreenElement === dialog));
  });
  dialog.querySelectorAll("[data-ws-card]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    // El evento close restaura la URL y el foco antes de saltar a la ficha.
    dialog.addEventListener("close", () => {
      location.hash = "tarjeta";
      document.querySelector("#fTeam")?.focus({ preventScroll: true });
      document.querySelector("#tarjeta")?.scrollIntoView({ block: "start" });
    }, { once: true });
    close();
  }));
  dialog.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.matches("input, textarea, select, [contenteditable]")) return;
    const key = event.key.toLowerCase();
    if (["arrowright", "pagedown"].includes(key)) { event.preventDefault(); show(at + 1); }
    else if (["arrowleft", "pageup"].includes(key)) { event.preventDefault(); show(at - 1); }
    else if (key === " " && !event.target.closest("button, a")) { event.preventDefault(); show(at + 1); }
    else if (key === "home") { event.preventDefault(); show(0); }
    else if (key === "end") { event.preventDefault(); show(slides.length - 1); }
    else if (key === "t") { event.preventDefault(); toggleTimer(); }
    else if (key === "f") { event.preventDefault(); fullscreen(); }
    // Escape y el foco modal los gestiona el elemento dialog nativo.
  });
  document.addEventListener("visibilitychange", () => { if (dialog.open) tick(); });
  const initial = /^#diapositiva-(\d+)$/.exec(location.hash);
  if (initial) open(Number(initial[1]) - 1);
})();

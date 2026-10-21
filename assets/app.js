/* Rempart landing page: language, effects and interactive demo (vanilla JS, no dependencies) */
(function () {
  "use strict";
  var DICT = window.I18N;
  /* French typography: keep amounts like "38 500 $" or "15 %" on one line */
  Object.keys(DICT.fr).forEach(function (k) {
    DICT.fr[k] = DICT.fr[k].replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u00A0").replace(/(\d) (?=(\$|%|M\$|G\$|mm|min|h\b|j\b))/g, "$1\u00A0");
  });
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = root.dataset.lang === "fr" ? "fr" : "en";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function money(n) {
    return new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Math.round(n));
  }
  function num(n) { return new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA").format(n); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- i18n ---------- */
  var renderers = [];
  function applyLang(next, save) {
    lang = next;
    root.lang = lang === "fr" ? "fr-CA" : "en";
    root.dataset.lang = lang;
    if (save) { try { localStorage.setItem("rempart-lang", lang); } catch (e) {} }
    $$("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (el.tagName === "TITLE") { document.title = v.replace(/<[^>]+>/g, ""); } else { el.innerHTML = v; }
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"); if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()).replace(/<[^>]+>/g, ""));
      });
    });
    $$(".lang-toggle button").forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", b.dataset.lang === "fr" ? "Français" : "English");
    });
    renderers.forEach(function (fn) { fn(); });
  }
  $$(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { if (b.dataset.lang !== lang) applyLang(b.dataset.lang, true); });
  });

  /* ---------- header ---------- */
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var menuBtn = $(".menu-btn"), mnav = $("#mobile-nav");
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open)); mnav.hidden = open;
  });
  $$("#mobile-nav a").forEach(function (a) { a.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", "false"); mnav.hidden = true; }); });

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var sibs = $$(".reveal:not(.in)", e.target.parentElement);
          var i = Math.max(0, sibs.indexOf(e.target));
          e.target.style.transitionDelay = Math.min(i, 5) * 70 + "ms";
          e.target.classList.add("in"); io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
    var ring = $(".big-ring"); var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { ring.classList.add("in"); io2.disconnect(); } }); }, { threshold: .4 }); io2.observe(ring);
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
    $(".big-ring").classList.add("in");
  }

  /* ---------- hero rain ---------- */
  (function rain() {
    var cv = $(".rain"); if (!cv || reduceMotion) return;
    var ctx = cv.getContext("2d"), drops = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true, raf;
    function size() {
      var r = cv.getBoundingClientRect(); w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / 7000); drops = [];
      for (var i = 0; i < n; i++) drops.push(mk(true));
    }
    function mk(any) {
      var z = Math.random();
      return { x: Math.random() * (w + 200) - 100, y: any ? Math.random() * h : -20 - Math.random() * 100, l: 8 + z * 18, v: 6 + z * 10, a: .08 + z * .3, z: z };
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        ctx.strokeStyle = "rgba(160,200,255," + d.a + ")"; ctx.lineWidth = d.z > .7 ? 1.4 : 1;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * .18, d.y + d.l); ctx.stroke();
        d.y += d.v; d.x -= d.v * .18;
        if (d.y > h) { drops[i] = mk(false); }
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    size(); frame();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { var was = running; running = e.isIntersecting; if (running && !was) frame(); else if (!running) cancelAnimationFrame(raf); });
      }).observe(cv);
    }
  })();

  /* ================= DEMO ================= */
  var ICON = {
    valve: '<svg viewBox="0 0 20 20"><path d="M2 10h4m8 0h4M6 6h8v8H6zM10 6V3m-2 0h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    pump: '<svg viewBox="0 0 20 20"><rect x="5" y="8" width="10" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 8V3h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    drop: '<svg viewBox="0 0 20 20"><path d="M10 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    check: '<svg viewBox="0 0 20 20"><path d="m5 10 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 6v4l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  /* ---- tabs ---- */
  var tabs = $$(".app-tabs [role=tab]");
  function selectTab(id, focus) {
    tabs.forEach(function (tb) {
      var on = tb.id === "tab-" + id;
      tb.setAttribute("aria-selected", on ? "true" : "false");
      tb.tabIndex = on ? 0 : -1;
      $("#" + tb.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) tb.focus();
    });
    if (id === "home") animateGauge();
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener("click", function () { selectTab(tb.id.slice(4)); });
    tb.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % tabs.length;
      if (k === "ArrowLeft" || k === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
      if (k === "Home") n = 0; if (k === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); selectTab(tabs[n].id.slice(4), true); }
    });
  });
  $$("[data-demo-tab]").forEach(function (a) { a.addEventListener("click", function () { selectTab(a.dataset.demoTab); }); });

  /* ---- 1. home dashboard ---- */
  var mitigated = false, lastUpdate = Date.now(), gaugeSeen = false;
  var devState = [
    { k: "d1.dv1", s: "d1.dv1s", ic: "valve", batt: null },
    { k: "d1.dv2", s: "d1.dv2s", ic: "pump", batt: 98 },
    { k: "d1.dv3", s: "d1.dry", ic: "drop", batt: 94 },
    { k: "d1.dv4", s: "d1.dry", ic: "drop", batt: 88 },
    { k: "d1.dv5", s: "d1.dry", ic: "drop", batt: 91 }
  ];
  var sumpHours = 3;
  function renderDevices() {
    $("#devices").innerHTML = devState.map(function (d) {
      return '<li class="device"><span class="dic" aria-hidden="true">' + ICON[d.ic] + '</span><div><b>' + t(d.k) + '</b><small>' + t(d.s, { h: sumpHours }) + '</small></div>' +
        '<div class="right"><span class="pill ok"><span class="dot-live" aria-hidden="true"></span>OK</span>' + (d.batt ? '<span class="batt">' + t("d1.batt") + ' ' + d.batt + '&nbsp;%</span>' : '') + '</div></li>';
    }).join("");
  }
  function renderUpdated() { $("#dev-updated").textContent = t("d1.updated", { s: Math.max(1, Math.round((Date.now() - lastUpdate) / 1000)) }); }
  setInterval(function () {
    if (Math.random() < .35) { lastUpdate = Date.now(); }
    renderUpdated();
  }, 1000);
  function score() { return mitigated ? 41 : 72; }
  function level(s) { return s >= 80 ? ["d1.level.high", "#FF5C7A"] : s >= 60 ? ["d1.level.elev", "#FFB547"] : s >= 35 ? ["d1.level.mod", "#FFD66B"] : ["d1.level.low", "#3EE6A0"]; }
  function renderGauge() {
    var s = score(), lv = level(s);
    $("#score-level").textContent = t(lv[0]); $("#score-level").style.color = lv[1];
    $("#factors").classList.toggle("mitigated", mitigated);
  }
  function animateGauge() {
    var s = score();
    var arc = $("#gauge-arc"), needle = $("#gauge-needle"), val = $("#score-val");
    arc.style.strokeDashoffset = 100 - s;
    needle.style.transform = "rotate(" + (-90 + s * 1.8) + "deg)";
    var from = parseInt(val.textContent, 10) || 0, start = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - start) / (reduceMotion ? 1 : 1100)); var e = 1 - Math.pow(1 - p, 3);
      val.textContent = Math.round(from + (s - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(start);
    gaugeSeen = true;
    renderGauge();
  }
  $("#score-toggle").addEventListener("change", function (e) { mitigated = e.target.checked; animateGauge(); });
  (function bars() {
    var v = [1, 1, 2, 0, 0, 1, 3, 4, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 2, 3, 1, 0, 0];
    $("#forecast-bars").innerHTML = v.map(function (x) { return '<i style="height:' + (8 + x * 22) + '%"></i>'; }).join("");
  })();
  function renderMiniSub() { $("#mini-sub").textContent = money(2500); }
  renderers.push(renderDevices, renderUpdated, renderGauge, renderMiniSub);
  if ("IntersectionObserver" in window) {
    var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { $("#score-val").textContent = "0"; animateGauge(); gio.disconnect(); } }); }, { threshold: .35 });
    gio.observe($(".gauge"));
  } else animateGauge();

  /* ---- 2. subsidy calculator ---- */
  var CAPS = { simplified: 1700, barrier: 800, diag: 1000, guidedMax: 35000, guidedRate: .75, home: 38500 };
  var measures = [
    { id: "valve", n: "d2.m1", s: "d2.m1s", on: true, cost: 3500 },
    { id: "sump", n: "d2.m2", s: "d2.m2s", on: true, cost: 2000 },
    { id: "barrier", n: "d2.m3", s: "d2.m3s", on: false, cost: 1200 },
    { id: "diag", n: "d2.m4", s: "d2.m4s", on: false, cost: 1000 },
    { id: "guided", n: "d2.m5", s: "d2.m5s", on: false, cost: 20000, range: [0, 60000, 500] }
  ];
  var COLORS = { b1: "#6CF5DD", b2: "#38B2F0", b3: "#4C7DFF", b4: "#9B7BFF" };
  function renderMeasures() {
    $("#measures").innerHTML = measures.map(function (m) {
      return '<div class="measure ' + (m.on ? "on" : "off") + '" data-id="' + m.id + '">' +
        '<input class="cbx" type="checkbox" id="m-' + m.id + '" ' + (m.on ? "checked" : "") + '>' +
        '<label class="mt" for="m-' + m.id + '"><b>' + t(m.n) + '</b><small>' + t(m.s) + '</small></label>' +
        '<div class="cost"><span>$</span><input type="text" inputmode="numeric" aria-label="' + esc(t("d2.cost") + " · " + t(m.n)) + '" value="' + num(m.cost) + '" data-cost="' + m.id + '"></div>' +
        (m.range ? '<div class="range-row"><input type="range" min="' + m.range[0] + '" max="' + m.range[1] + '" step="' + m.range[2] + '" value="' + m.cost + '" data-range="' + m.id + '" aria-label="' + esc(t("d2.cost") + " · " + t(m.n)) + '"></div>' : '') +
        '</div>';
    }).join("");
  }
  function get(id) { return measures.filter(function (m) { return m.id === id; })[0]; }
  function calc() {
    var M = {}; measures.forEach(function (m) { M[m.id] = m; });
    var c = function (id) { return M[id].on ? Math.max(0, M[id].cost) : 0; };
    var total = c("valve") + c("sump") + c("barrier") + c("diag") + c("guided");
    var b1 = Math.min(c("valve") + c("sump"), CAPS.simplified);
    var b2 = Math.min(c("barrier"), CAPS.barrier);
    var b3 = Math.min(c("diag"), CAPS.diag);
    var guidedBlocked = M.guided.on && !M.diag.on;
    var b4 = guidedBlocked ? 0 : Math.min(c("guided") * CAPS.guidedRate, CAPS.guidedMax);
    var raw = b1 + b2 + b3 + b4, sub = Math.min(raw, CAPS.home), capped = raw > CAPS.home;
    return { total: total, parts: { b1: b1, b2: b2, b3: b3, b4: b4 }, sub: sub, oop: Math.max(0, total - sub), blocked: guidedBlocked, capped: capped };
  }
  function renderCalc() {
    var r = calc();
    $("#c-total").textContent = money(r.total);
    $("#c-sub").textContent = money(r.sub);
    $("#c-oop").textContent = money(r.oop);
    $("#c-pct").textContent = t("d2.covered", { p: r.total ? Math.round(r.sub / r.total * 100) : 0 });
    var denom = Math.max(r.total, 1);
    $("#c-stack").innerHTML = Object.keys(r.parts).map(function (k) { return '<i style="width:' + (r.parts[k] / denom * 100) + '%;background:' + COLORS[k] + '"></i>'; }).join("");
    $("#c-legend").innerHTML = Object.keys(r.parts).map(function (k) { return '<li style="--c:' + COLORS[k] + '"><span>' + t("d2." + k) + '</span><b>' + money(r.parts[k]) + '</b></li>'; }).join("");
    var note = $("#c-note");
    if (r.blocked) { note.hidden = false; note.textContent = t("d2.note.diag"); }
    else if (r.capped) { note.hidden = false; note.textContent = t("d2.note.cap"); }
    else note.hidden = true;
    $$(".measure").forEach(function (el) { var m = get(el.dataset.id); el.classList.toggle("on", m.on); el.classList.toggle("off", !m.on); });
  }
  var mbox = $("#measures");
  mbox.addEventListener("change", function (e) {
    if (e.target.classList.contains("cbx")) { get(e.target.id.slice(2)).on = e.target.checked; renderCalc(); }
  });
  mbox.addEventListener("input", function (e) {
    var id = e.target.dataset.cost || e.target.dataset.range; if (!id) return;
    var v = parseInt(String(e.target.value).replace(/[^\d]/g, ""), 10) || 0; v = Math.min(v, 250000);
    var m = get(id); m.cost = v; if (!m.on && v > 0) { m.on = true; $("#m-" + id).checked = true; }
    if (e.target.dataset.range) { var ci = $('[data-cost="' + id + '"]'); ci.value = num(v); }
    else { var ri = $('[data-range="' + id + '"]'); if (ri) ri.value = v; }
    renderCalc();
  });
  mbox.addEventListener("blur", function (e) { if (e.target.dataset.cost) e.target.value = num(get(e.target.dataset.cost).cost); }, true);
  renderers.push(renderMeasures, renderCalc);

  /* ---- 3. storm simulation ---- */
  var storm = { t: 0, running: false, timer: null, log: [], fired: {}, startMin: 17 * 60 + 42 };
  var EVENTS = [
    { at: .03, k: "d3.e1", c: "var(--warn)" },
    { at: .22, k: "d3.e2", c: "var(--warn)" },
    { at: .28, k: "d3.e3", c: "var(--ok)" },
    { at: .33, k: "d3.e4", c: "#9bb7ff" },
    { at: .45, k: "d3.e5", c: "var(--danger)", bad: true },
    { at: .47, k: "d3.e6", c: "#9bb7ff" },
    { at: .50, k: "d3.e7", c: "var(--accent)" },
    { at: .90, k: "d3.e8", c: "var(--ok)" },
    { at: .96, k: "d3.e9", c: "var(--ok)" }
  ];
  var DISPATCH = .5, ARRIVE = .9, ETA0 = 38, SIM_MIN = 120, DURATION = 22000, TICK = 100;
  function rainAt(t) { return Math.max(0, 4 + 84 * Math.exp(-Math.pow((t - .4) / .2, 2)) + (t > .1 && t < .7 ? Math.sin(t * 60) * 4 : 0)); }
  function clock(t) { var m = storm.startMin + Math.round(t * SIM_MIN); return ("0" + Math.floor(m / 60) % 24).slice(-2) + ":" + ("0" + m % 60).slice(-2); }
  function drawChart() {
    var svg = $("#rain-chart"), W = 320, H = 110, n = 60, bw = W / n, max = 100;
    var out = '<line x1="0" x2="' + W + '" y1="' + (H - 50 / max * H) + '" y2="' + (H - 50 / max * H) + '" stroke="#FFB547" stroke-opacity=".5" stroke-dasharray="4 4"/>' +
      '<text x="' + (W - 4) + '" y="' + (H - 50 / max * H - 4) + '" fill="#FFB547" fill-opacity=".8" font-size="9" text-anchor="end" font-family="JetBrains Mono, monospace">50 mm/h</text>';
    for (var i = 0; i < n; i++) {
      var ti = (i + 1) / n, shown = ti <= storm.t + 1e-9, v = shown ? rainAt(ti) : 0;
      if (!shown) { out += '<rect x="' + (i * bw + .5) + '" y="' + (H - 2) + '" width="' + (bw - 1.2) + '" height="2" rx="1" fill="#ffffff" opacity=".08"/>'; continue; }
      var bh = Math.max(1, v / max * H), col = v > 50 ? "#FF7A8F" : v > 25 ? "#FFB547" : "#5C8BFF";
      out += '<rect x="' + (i * bw + .5) + '" y="' + (H - bh) + '" width="' + (bw - 1.2) + '" height="' + bh + '" rx="1" fill="' + col + '" opacity=".9"/>';
    }
    svg.innerHTML = out;
  }
  var MAP_ROUTE = "M30 125 L30 95 L110 95 L110 55 L210 55 L210 35 L272 35";
  function drawMap() {
    var svg = $("#map"), s = "";
    s += '<defs><pattern id="blk" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#0a1130"/><rect x="4" y="4" width="32" height="22" rx="3" fill="#111b42"/></pattern></defs>';
    s += '<rect width="320" height="150" fill="url(#blk)"/>';
    s += '<path d="M0 118 C80 110 120 140 200 128 S300 120 320 132 V150 H0z" fill="#16306b" opacity=".7"/>';
    s += '<path d="' + MAP_ROUTE + '" fill="none" stroke="#2a3a7a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path id="route-done" d="' + MAP_ROUTE + '" fill="none" stroke="#6CF5DD" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<g transform="translate(30 125)"><rect x="-9" y="-9" width="18" height="18" rx="4" fill="#4C7DFF"/><path d="M-4 -1h8M-4 3h8" stroke="#fff" stroke-width="1.5"/></g>';
    s += '<g id="home-pin" transform="translate(272 35)"><circle id="home-ring" r="12" fill="none" stroke="#6CF5DD" stroke-width="2" opacity=".6"/><path d="M-7 2 0-6 7 2v7h-14z" fill="#6CF5DD"/></g>';
    s += '<g id="truck" transform="translate(30 125)" opacity="0"><circle r="9" fill="#FFB547"/><path d="M-5 2V-3h6v5M1-1h3l2 2v1H1z" fill="none" stroke="#1a1200" stroke-width="1.4"/></g>';
    svg.innerHTML = s;
    var p = $("#route-done"), L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
  }
  function stateTxt(key, cls) { return { txt: t(key), cls: cls }; }
  function renderStorm() {
    var tt = storm.t, r = rainAt(tt) * (storm.running || tt > 0 ? 1 : 0);
    if (!storm.running && tt === 0) r = 0;
    $("#rain-val").textContent = Math.round(r) + " mm/h";
    var load = Math.round(22 + (tt === 0 ? 0 : Math.min(118, r * 1.45)));
    $("#sewer-val").textContent = load + "%";
    var sb = $("#sewer-bar"); sb.style.width = Math.min(100, load) + "%"; sb.style.backgroundPosition = -Math.min(200, load * 1.6) + "px 0";
    var valve = tt >= .28 && tt < .97 ? stateTxt("d3.st.closed", "ok") : stateTxt("d3.st.open", "");
    var sump = tt >= .33 && tt < .97 ? stateTxt("d3.st.running", "info") : stateTxt("d3.st.idle", "");
    var leak = tt >= .45 && tt < .9 ? stateTxt("d3.st.wet", "bad") : stateTxt("d3.st.dry", "");
    [["#st-valve", valve], ["#st-sump", sump], ["#st-leak", leak]].forEach(function (x) {
      var el = $(x[0]); el.className = "st " + x[1].cls; $("b", el).textContent = x[1].txt;
    });
    var eta = $("#eta-val");
    if (tt < DISPATCH) eta.textContent = "—";
    else if (tt < ARRIVE) eta.textContent = Math.max(1, Math.ceil(ETA0 * (ARRIVE - tt) / (ARRIVE - DISPATCH))) + " " + t("d3.etaMin");
    else eta.textContent = t("d3.onsite");
    var p = $("#route-done"), truck = $("#truck");
    if (p) {
      var L = p.getTotalLength(), prog = Math.max(0, Math.min(1, (tt - DISPATCH) / (ARRIVE - DISPATCH)));
      p.style.strokeDashoffset = L * (1 - prog);
      var pt = p.getPointAtLength(L * prog);
      truck.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
      truck.setAttribute("opacity", tt >= DISPATCH ? "1" : "0");
      var ring = $("#home-ring"); ring.setAttribute("stroke", tt >= .45 && tt < .9 ? "#FF5C7A" : "#6CF5DD");
    }
    var tl = $("#timeline"), full = arguments[0] === true || tl.children.length > storm.log.length;
    if (full) tl.innerHTML = "";
    for (var j = tl.children.length; j < storm.log.length; j++) {
      var e = storm.log[j], li = document.createElement("li");
      li.style.setProperty("--c", e.c); li.className = (e.bad ? "bad " : "") + (full ? "noanim" : "");
      li.innerHTML = "<time>" + clock(e.at) + "</time>" + t(e.k); tl.appendChild(li);
    }
    $("#tl-empty").hidden = storm.log.length > 0;
    var run = $("#storm-run"); run.disabled = storm.running;
    $("span", run).textContent = storm.running ? t("d3.running") : t("d3.run");
    drawChart();
  }
  function tick() {
    storm.t = Math.min(1, storm.t + TICK / DURATION);
    EVENTS.forEach(function (e) { if (!storm.fired[e.k] && storm.t >= e.at) { storm.fired[e.k] = 1; storm.log.push(e); } });
    if (storm.t >= 1) { clearInterval(storm.timer); storm.running = false; }
    renderStorm();
  }
  function resetStorm() {
    clearInterval(storm.timer); storm.running = false; storm.t = 0; storm.log = []; storm.fired = {};
    renderStorm();
  }
  $("#storm-run").addEventListener("click", function () {
    if (storm.running) return;
    if (storm.t >= 1) resetStorm();
    storm.running = true;
    if (reduceMotion) { while (storm.t < 1) tick(); return; }
    storm.timer = setInterval(tick, TICK); renderStorm();
  });
  $("#storm-reset").addEventListener("click", resetStorm);
  drawMap(); resetStorm();
  renderers.push(function () { renderStorm(true); });

  /* ---- 4. verified home record ---- */
  var PHOTO = {
    p1: '<rect width="160" height="120" fill="#1a2550"/><rect y="78" width="160" height="42" fill="#141d42"/><rect x="0" y="54" width="160" height="16" fill="#3a4a8a"/><rect x="58" y="40" width="44" height="44" rx="6" fill="#56679e"/><path d="M80 40V24m-10 0h20" stroke="#8796c8" stroke-width="5" stroke-linecap="round"/><path d="M72 52h16v4c0 8-4 12-8 14-4-2-8-6-8-14z" fill="#6CF5DD"/>',
    p2: '<rect width="160" height="120" fill="#1d2754"/><rect y="70" width="160" height="50" fill="#262f5a"/><ellipse cx="80" cy="84" rx="38" ry="14" fill="#0b1026"/><ellipse cx="80" cy="86" rx="30" ry="9" fill="#2f63d8" opacity=".7"/><rect x="70" y="54" width="20" height="30" rx="3" fill="#4c7dff"/><path d="M80 54V20h30" stroke="#8796c8" stroke-width="5" fill="none"/>',
    p3: '<rect width="160" height="120" fill="#222c5c"/><rect y="92" width="160" height="28" fill="#2b3567"/><rect x="28" y="40" width="46" height="56" rx="4" fill="#d8deef"/><circle cx="51" cy="70" r="15" fill="#3c4a7e"/><circle cx="51" cy="70" r="10" fill="#6c8bd8"/><rect x="84" y="40" width="46" height="56" rx="4" fill="#c5cde6"/><circle cx="107" cy="70" r="15" fill="#3c4a7e"/><rect x="32" y="44" width="16" height="4" rx="2" fill="#8a96c0"/>',
    p4: '<rect width="160" height="120" fill="#2a2f5e"/><rect y="88" width="160" height="32" fill="#3a3466"/><ellipse cx="80" cy="104" rx="56" ry="8" fill="#4a4380"/><rect x="34" y="62" width="92" height="30" rx="6" fill="#4c5ba8"/><rect x="40" y="52" width="80" height="18" rx="6" fill="#5c6cbf"/><path d="M134 92V40" stroke="#8796c8" stroke-width="3"/><path d="M124 40h20l-4-12h-12z" fill="#f6c76b"/><rect x="18" y="20" width="34" height="24" rx="2" fill="#1a2148" stroke="#6c7bb8" stroke-width="2"/>',
    p5: '<rect width="160" height="120" fill="#1f2a55"/><rect x="48" y="16" width="64" height="90" rx="4" fill="#9aa6c9"/><rect x="54" y="22" width="52" height="78" rx="2" fill="#2a3466"/><g fill="#c8d0ea">' +
      (function () { var s = ""; for (var r = 0; r < 6; r++) { s += '<rect x="58" y="' + (27 + r * 12) + '" width="20" height="7" rx="1"/><rect x="82" y="' + (27 + r * 12) + '" width="20" height="7" rx="1"/>'; } return s; })() + '</g>',
    p6: '<rect width="160" height="120" fill="#3a3f63"/><g fill="#4b5078" stroke="#33385a" stroke-width="2">' +
      (function () { var s = ""; for (var r = 0; r < 6; r++) for (var c = -1; c < 5; c++) s += '<rect x="' + (c * 40 + (r % 2 ? 20 : 0)) + '" y="' + (r * 20) + '" width="40" height="20"/>'; return s; })() +
      '</g><rect x="56" y="14" width="48" height="28" rx="2" fill="#7fa7e8" stroke="#c8d0ea" stroke-width="3"/><path d="M80 14v28" stroke="#c8d0ea" stroke-width="2"/>'
  };
  var PHOTO_TIMES = ["10:12", "10:18", "10:24", "10:31", "10:36", "10:44"];
  function renderPhotos() {
    $("#photos").innerHTML = ["p1", "p2", "p3", "p4", "p5", "p6"].map(function (k, i) {
      return '<figure class="photo" style="margin:0"><svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(t("d4." + k)) + '">' + PHOTO[k] + '</svg>' +
        '<span class="vbadge" aria-hidden="true">' + ICON.check + '</span><figcaption>' + t("d4." + k) + '<small>2026-09-14 ' + PHOTO_TIMES[i] + ' · GPS ✓</small></figcaption></figure>';
    }).join("");
  }
  var CHECKS = [["d4.c1", 1], ["d4.c2", 1], ["d4.c3", 1], ["d4.c4", 1], ["d4.c5", 1], ["d4.c6", 0]];
  function renderChecklist() {
    $("#checklist").innerHTML = CHECKS.map(function (c) {
      return '<li class="' + (c[1] ? "" : "pend") + '"><span class="ck" aria-hidden="true">' + (c[1] ? ICON.check : ICON.clock) + '</span><span>' + t(c[0]) + '</span>' + (c[1] ? '' : '<span class="pill warn">' + t("d4.pending") + '</span>') + '</li>';
    }).join("");
  }
  var exportStep = 0, exportTimer;
  function renderExport() { if (exportStep > 0 && exportStep < 4) $("#export-step").textContent = t("d4.s" + exportStep); }
  $("#export-btn").addEventListener("click", function () {
    var btn = $("#export-btn"); btn.hidden = true; $("#export-progress").hidden = false; $("#export-done").hidden = true;
    var bar = $("#export-bar"); bar.style.width = "0%"; exportStep = 1; renderExport();
    var pct = 0;
    clearInterval(exportTimer);
    exportTimer = setInterval(function () {
      pct += 4; bar.style.width = pct + "%";
      var s = pct < 34 ? 1 : pct < 70 ? 2 : 3; if (s !== exportStep) { exportStep = s; renderExport(); }
      if (pct >= 100) { clearInterval(exportTimer); exportStep = 4; $("#export-progress").hidden = true; $("#export-done").hidden = false; }
    }, reduceMotion ? 1 : 80);
  });
  $("#export-again").addEventListener("click", function () { $("#export-done").hidden = true; $("#export-btn").hidden = false; $("#export-btn").click(); });
  $("#export-dl").addEventListener("click", function () {
    var lines = [
      "REMPART: " + t("d4.title").toUpperCase(),
      t("demo.badge"),
      "",
      t("demo.home") + ": " + t("demo.addr").replace(/&rsquo;|’/g, "'"),
      t("d4.verified") + ": 2026-09-14",
      "",
      t("d4.photos") + ":"
    ].concat(["p1", "p2", "p3", "p4", "p5", "p6"].map(function (k, i) { return "  - " + t("d4." + k) + " (2026-09-14 " + PHOTO_TIMES[i] + ")"; }))
      .concat(["", t("d4.check") + ":"])
      .concat(CHECKS.map(function (c) { return "  [" + (c[1] ? "x" : " ") + "] " + t(c[0]); }));
    var blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = lang === "fr" ? "rempart-dossier-reclamation-demo.txt" : "rempart-claim-packet-demo.txt";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  renderers.push(renderPhotos, renderChecklist, renderExport);

  /* ---------- waitlist form (client-side only, nothing is sent or stored) ---------- */
  var form = $("#waitlist"), thanks = $("#thanks"), submitted = null;
  function setErr(id, key) {
    var input = $("#f-" + id), err = $("#e-" + id);
    err.textContent = key ? t(key) : ""; err.dataset.key = key || "";
    if (key) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !key;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#f-name").value.trim(), email = $("#f-email").value.trim(), postal = $("#f-postal").value.trim().toUpperCase();
    var ok = setErr("name", name ? null : "form.err.name");
    ok = setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? null : "form.err.email") && ok;
    ok = setErr("postal", !postal || /^[ABCEGHJ-NPRSTVXY]\d[A-Z][ -]?\d[A-Z]\d$/.test(postal) ? null : "form.err.postal") && ok;
    if (!ok) { var bad = $("[aria-invalid=true]", form); if (bad) bad.focus(); return; }
    submitted = { name: name.split(/\s+/)[0], region: postal ? postal.charAt(0) : "" };
    form.reset(); form.hidden = true; thanks.hidden = false; renderThanks(); thanks.focus();
  });
  ["name", "email", "postal"].forEach(function (id) { $("#f-" + id).addEventListener("input", function () { if ($("#e-" + id).textContent) setErr(id, null); }); });
  function renderThanks() {
    $$(".err", form).forEach(function (el) { if (el.dataset.key) el.textContent = t(el.dataset.key); });
    if (!submitted) return;
    $("#thanks-h").textContent = t("form.thanks.h", { name: submitted.name });
    var hint = $("#thanks-hint"), r = submitted.region;
    if ("GHJ".indexOf(r) > -1 && r) { hint.hidden = false; hint.textContent = t("form.thanks.qc"); }
    else if (r === "M") { hint.hidden = false; hint.textContent = t("form.thanks.on"); }
    else hint.hidden = true;
  }
  $("#thanks-again").addEventListener("click", function () { submitted = null; thanks.hidden = true; form.hidden = false; $("#f-name").focus(); });
  renderers.push(renderThanks);

  /* ---------- boot ---------- */
  applyLang(lang, false);
})();

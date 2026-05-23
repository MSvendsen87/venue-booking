(function () {
  console.log("[VENUE BOOKING v1.3] LOADED");

  /* ------------------------------------------------ */
  /* KONFIG */
  /* ------------------------------------------------ */

  var PRODUCT_VENUE = "1349"; // Leie hele lokalet
  var PRODUCT_A = "1316";     // Dart Bane A
  var PRODUCT_B = "1317";     // Dart Bane B
  var PRODUCT_DISC = "1320";  // Disc simulator
  var PRODUCT_CLUB = "1322";  // Klubbkveld
  var PRODUCT_DART_SET = "1318"; // Leie pilsett

  var EVENT_ID = "9847005";
  var PAGE_PATH = "/sider/leie-hele-lokalet";
  var ROOT_ID = "gk-venue-booking";

  var WORKER_BASE = "https://cold-shadow-36dc.post-cd6.workers.dev";
  var API_BASE = WORKER_BASE + "/products/";

  var NORMAL_BOOKING_DAYS_AHEAD = 40;
  var CUTOFF_MINUTES_BEFORE_START = 20;

  /*
    Manuell stenging.
    Eksempel:
    {
      date: "2026-06-05",
      from: "19:00",
      to: "22:00",
      label: "Stengt – privat arrangement"
    }
  */
  var CUSTOM_CLOSED_TIMES = [
    // {
    //   date: "2026-06-05",
    //   from: "19:00",
    //   to: "22:00",
    //   label: "Stengt – privat arrangement"
    // }
  ];

  /* ------------------------------------------------ */
  /* PATH / ROOT */
  /* ------------------------------------------------ */

  var path = String(location.pathname || "");
  while (path.length && path.charAt(path.length - 1) === "/" && path !== "/") {
    path = path.slice(0, -1);
  }

  if (path !== PAGE_PATH) return;

  var root = document.getElementById(ROOT_ID);
  if (!root) {
    console.warn("[VENUE BOOKING] Fant ikke #" + ROOT_ID);
    return;
  }

  root.innerHTML = "";

  /* ------------------------------------------------ */
  /* CSS */
  /* ------------------------------------------------ */

  function injectCss() {
    if (document.getElementById("gk-venue-css-v1")) return;

    var style = document.createElement("style");
    style.id = "gk-venue-css-v1";
    style.textContent = ""
      + "#gk-venue-booking{max-width:1120px;margin:0 auto 40px;color:#e9eef5;font-family:inherit;}"
      + "#gk-venue-booking *{box-sizing:border-box;}"
      + "#gk-venue-booking button,#gk-venue-booking a{font-family:inherit;}"
      + ".gkv-hero{border:1px solid rgba(172,124,255,.22);background:linear-gradient(180deg,rgba(43,40,63,.96),rgba(30,30,36,.96));border-radius:22px;padding:18px;margin:0 0 14px;box-shadow:0 14px 34px rgba(0,0,0,.25);}"
      + ".gkv-kicker{font-size:13px;font-weight:900;color:#ffe29b;margin:0 0 6px;letter-spacing:.2px;}"
      + ".gkv-h1{margin:0 0 8px;font-size:clamp(26px,4vw,42px);line-height:1.08;color:#fff;font-weight:1000;letter-spacing:.2px;}"
      + ".gkv-lead{margin:0;color:rgba(233,238,245,.92);line-height:1.55;font-size:16px;max-width:850px;}"
      + ".gkv-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}"
      + ".gkv-chip{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:8px 12px;font-size:13px;font-weight:900;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:rgba(255,255,255,.94);}"
      + ".gkv-chip.price{border-color:rgba(240,193,75,.35);background:linear-gradient(135deg,rgba(240,193,75,.18),rgba(240,193,75,.06));color:#ffe29b;}"
      + ".gkv-note{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:16px;padding:12px 14px;margin:14px 0;color:rgba(233,238,245,.92);line-height:1.5;}"
      + ".gkv-status{margin:12px 0;color:rgba(233,238,245,.86);font-size:14px;}"
      + ".gkv-weekbar{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(27,27,29,.96),rgba(19,19,21,.96));border-radius:20px 20px 0 0;padding:14px 16px;margin-top:16px;}"
      + ".gkv-weektitle{font-size:20px;font-weight:1000;color:#fff;line-height:1.25;}"
      + ".gkv-weeksub{font-size:13px;color:rgba(233,238,245,.75);margin-top:3px;}"
      + ".gkv-weekbuttons{display:flex;gap:8px;}"
      + ".gkv-weekbtn{min-height:42px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(255,255,255,.07);color:#fff;font-weight:900;padding:0 14px;cursor:pointer;}"
      + ".gkv-weekbtn:disabled{opacity:.38;cursor:not-allowed;}"
      + ".gkv-weekbtn:not(:disabled):hover{background:rgba(255,255,255,.12);}"
      + ".gkv-days{display:flex;gap:8px;overflow-x:auto;padding:14px 16px;border-left:1px solid rgba(255,255,255,.08);border-right:1px solid rgba(255,255,255,.08);background:rgba(20,20,22,.96);}"
      + ".gkv-day{min-width:110px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.055);color:#fff;padding:10px 11px;text-align:left;cursor:pointer;}"
      + ".gkv-day strong{display:block;font-size:14px;margin-bottom:4px;}"
      + ".gkv-day span{font-size:12px;color:rgba(233,238,245,.72);}"
      + ".gkv-day.active{border-color:rgba(49,210,135,.75);background:linear-gradient(180deg,rgba(29,82,55,.72),rgba(22,55,40,.72));}"
      + ".gkv-day:disabled{opacity:.45;cursor:not-allowed;}"
      + ".gkv-body{border:1px solid rgba(255,255,255,.08);border-top:0;background:linear-gradient(180deg,rgba(24,24,26,.96),rgba(18,18,20,.96));border-radius:0 0 20px 20px;padding:16px;}"
      + ".gkv-date-title{font-size:22px;font-weight:1000;color:#fff;margin:0 0 10px;}"
      + ".gkv-slots{display:grid;grid-template-columns:1fr;gap:12px;}"
      + "@media(min-width:800px){.gkv-slots{grid-template-columns:repeat(2,minmax(0,1fr));}}"
      + ".gkv-slot{border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(38,38,40,.92),rgba(30,30,32,.94));border-radius:18px;padding:14px;}"
      + ".gkv-slot-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}"
      + ".gkv-time{font-size:22px;font-weight:1000;color:#fff;letter-spacing:.2px;}"
      + ".gkv-meta{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;}"
      + ".gkv-mini{border-radius:999px;padding:7px 10px;font-size:12px;font-weight:1000;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;}"
      + ".gkv-mini.price{border-color:rgba(240,193,75,.35);color:#ffe29b;background:rgba(240,193,75,.11);}"
      + ".gkv-mini.ok{border-color:rgba(49,210,135,.40);color:#aef5cc;background:rgba(49,210,135,.10);}"
      + ".gkv-mini.warn{border-color:rgba(255,188,88,.45);color:#ffd79a;background:rgba(255,188,88,.11);}"
      + ".gkv-mini.stop{border-color:rgba(255,100,100,.42);color:#ffb3b3;background:rgba(255,100,100,.10);}"
      + ".gkv-reason{font-size:13px;color:rgba(233,238,245,.74);line-height:1.45;margin:0 0 12px;min-height:18px;}"
      + ".gkv-btn{width:100%;min-height:48px;border-radius:16px;border:1px solid rgba(49,210,135,.50);background:linear-gradient(180deg,rgba(31,95,65,.95),rgba(24,72,51,.95));color:#fff;font-weight:1000;font-size:15px;cursor:pointer;}"
      + ".gkv-btn:hover:not(:disabled){transform:translateY(-1px);background:linear-gradient(180deg,rgba(37,115,78,.98),rgba(26,82,57,.98));}"
      + ".gkv-btn:disabled{cursor:not-allowed;opacity:.72;}"
      + ".gkv-btn.booked{border-color:rgba(255,188,88,.35);background:rgba(255,188,88,.12);color:#ffd79a;}"
      + ".gkv-btn.stopped{border-color:rgba(255,100,100,.32);background:rgba(255,100,100,.10);color:#ffb3b3;}"
      + ".gkv-btn.ok{border-color:rgba(49,210,135,.55);background:rgba(49,210,135,.14);color:#baf5d5;}"
      + ".gkv-empty{border:1px dashed rgba(255,255,255,.16);border-radius:16px;padding:18px;color:rgba(233,238,245,.78);}"
      + ".gkv-extra{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(255,255,255,.10);background:linear-gradient(180deg,rgba(28,28,31,.96),rgba(22,22,25,.96));border-radius:18px;padding:14px;margin:14px 0;}"
      + ".gkv-extra-title{font-size:17px;font-weight:1000;color:#fff;margin-bottom:3px;}"
      + ".gkv-extra-sub{font-size:13px;color:rgba(233,238,245,.76);line-height:1.4;}"
      + ".gkv-extra-select{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:900;color:rgba(233,238,245,.85);}"
      + ".gkv-extra-select select{min-height:42px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:#1f1f23;color:#fff;font-weight:900;padding:0 12px;}"
      + ".gkv-foot{margin-top:14px;color:rgba(233,238,245,.70);font-size:13px;line-height:1.45;}"
      + "@media(max-width:640px){.gkv-hero{padding:14px;border-radius:18px}.gkv-extra{align-items:flex-start;flex-direction:column}.gkv-extra-select{width:100%;justify-content:space-between}.gkv-extra-select select{flex:1}.gkv-weekbar{align-items:flex-start;flex-direction:column}.gkv-weekbuttons{width:100%}.gkv-weekbtn{flex:1}.gkv-body{padding:12px}.gkv-slot{padding:12px}.gkv-time{font-size:20px}.gkv-day{min-width:102px}}";

    document.head.appendChild(style);
  }

  injectCss();

  /* ------------------------------------------------ */
  /* HTML */
  /* ------------------------------------------------ */

  root.innerHTML = ''
    + '<section class="gkv-hero">'
    + '  <div class="gkv-kicker">GolfKongen – privat booking</div>'
    + '  <h1 class="gkv-h1">Leie hele lokalet</h1>'
    + '  <p class="gkv-lead">Book hele GolfKongen til bursdag, teambuilding, vennegjeng eller firma. Booking inkluderer begge dartbaner, discgolf simulator, møtebord og fri tilgang til kaffe.</p>'
    + '  <div class="gkv-chips">'
    + '    <span class="gkv-chip price">800 kr / 4 timer</span>'
    + '    <span class="gkv-chip">200 kr per time</span>'
    + '    <span class="gkv-chip">Minimum 4 timer</span>'
    + '  </div>'
    + '</section>'
    + '<div class="gkv-note">Velg en ledig 4-timersblokk. Dersom dart eller disc-simulator allerede er booket i et tidsrom, blir overlappende privatkveld automatisk sperret her.</div>'
    + '<div id="gkv-status" class="gkv-status">Laster tider…</div>'
    + '<section class="gkv-cal">'
    + '  <div class="gkv-weekbar">'
    + '    <div>'
    + '      <div id="gkv-week-title" class="gkv-weektitle">Velg dag</div>'
    + '      <div class="gkv-weeksub">Kun ledige og relevante datoer vises.</div>'
    + '    </div>'
    + '    <div class="gkv-weekbuttons">'
    + '      <button id="gkv-prev-week" class="gkv-weekbtn" type="button">Forrige uke</button>'
    + '      <button id="gkv-next-week" class="gkv-weekbtn" type="button">Neste uke</button>'
    + '    </div>'
    + '  </div>'
    + '  <div id="gkv-days" class="gkv-days"></div>'
    + '  <div class="gkv-body">'
    + '    <h2 id="gkv-date-title" class="gkv-date-title">Velg dato</h2>'
    + '    <div id="gkv-slots" class="gkv-slots"></div>'
    + '  </div>'
    + '</section>'
    + '<div class="gkv-foot">Booking legges i handlekurven. Tiden er først endelig reservert når betaling/bestilling er fullført.</div>';

  var statusEl = document.getElementById("gkv-status");
  var daysEl = document.getElementById("gkv-days");
  var slotsEl = document.getElementById("gkv-slots");
  var titleEl = document.getElementById("gkv-date-title");
  var weekTitleEl = document.getElementById("gkv-week-title");
  var prevWeekBtn = document.getElementById("gkv-prev-week");
  var nextWeekBtn = document.getElementById("gkv-next-week");

  /* ------------------------------------------------ */
  /* STATE */
  /* ------------------------------------------------ */

  var venueSlots = {};
  var dartASlots = {};
  var dartBSlots = {};
  var discSlots = {};
  var clubSlots = {};
  var dartSetProduct = null;

  var allDates = [];
  var activeDate = "";
  var weekOffset = 0;

  /* ------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------ */

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function ymd(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function todayLocal() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function addDays(d, days) {
    var x = new Date(d.getTime());
    x.setDate(x.getDate() + days);
    return x;
  }

  function parseYmd(s) {
    var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function timeToMinutes(t) {
    var m = String(t || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return 0;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function normalizeTime(t) {
    var s = String(t || "").trim();
    var m = s.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
    if (!m) return s;
    return pad2(Number(m[1])) + ":" + m[2] + "-" + pad2(Number(m[3])) + ":" + m[4];
  }

  function durationHours(time) {
    var parts = String(time || "").split("-");
    if (parts.length !== 2) return 0;

    var h = (timeToMinutes(parts[1]) - timeToMinutes(parts[0])) / 60;
    return h > 0 ? h : 0;
  }

  function getSelectedDurationHours() {
    var el = document.getElementById("gkv-duration-hours");
    if (!el) return 4;

    var n = parseInt(el.value || "4", 10);
    return isNaN(n) ? 4 : n;
  }

  function timesOverlap(a, b) {
    var aa = String(a || "").split("-");
    var bb = String(b || "").split("-");
    if (aa.length !== 2 || bb.length !== 2) return false;

    var a1 = timeToMinutes(aa[0]);
    var a2 = timeToMinutes(aa[1]);
    var b1 = timeToMinutes(bb[0]);
    var b2 = timeToMinutes(bb[1]);

    return a1 < b2 && a2 > b1;
  }

  function dateLabel(dateStr) {
    var d = parseYmd(dateStr);
    if (!d) return dateStr;

    var days = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
    return days[d.getDay()] + " " + pad2(d.getDate()) + "." + pad2(d.getMonth() + 1);
  }

  function fullDateLabel(dateStr) {
    var d = parseYmd(dateStr);
    if (!d) return dateStr;

    var days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
    return days[d.getDay()] + " " + pad2(d.getDate()) + "." + pad2(d.getMonth() + 1) + "." + d.getFullYear();
  }

  function isWithinRange(dateStr) {
    var d = parseYmd(dateStr);
    if (!d) return false;

    var start = todayLocal();
    var end = addDays(start, NORMAL_BOOKING_DAYS_AHEAD);

    return d >= start && d <= end;
  }

  function isPassedOrCutoff(dateStr, time) {
    var d = parseYmd(dateStr);
    if (!d) return true;

    var from = String(time || "").split("-")[0] || "00:00";
    var startMinutes = timeToMinutes(from);

    var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(startMinutes / 60), startMinutes % 60, 0);
    var cutoff = new Date(start.getTime() - CUTOFF_MINUTES_BEFORE_START * 60000);

    return new Date() >= cutoff;
  }

  function keys(obj) {
    return Object.keys(obj || {}).sort();
  }

  function parseDT(v) {
    var date = "";
    var time = "";

    if (v && v.values && v.values.length) {
      for (var i = 0; i < v.values.length; i++) {
        var it = v.values[i] || {};
        var name = String(it.name || "").toLowerCase();
        var val = String(it.val || "").trim();

        if (!date && name.indexOf("dag") !== -1 && val) date = val;
        if (!time && name.indexOf("tid") !== -1 && val) time = normalizeTime(val);
      }
    }

    var sku = String((v && v.sku) || "").trim();
    var m = sku.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})-(\d{2})(\d{2})$/);
    if (m) {
      if (!date) date = m[1];
      if (!time) time = m[2] + ":" + m[3] + "-" + m[4] + ":" + m[5];
    }

    return { date: date, time: normalizeTime(time) };
  }

  function productPrice(product) {
    if (!product) return 0;
    var p = Number(String(product.price || "0").replace(",", "."));
    return isNaN(p) ? 0 : p;
  }

  function variantPrice(v, product) {
    var p = Number(String((v && v.price) || "").replace(",", "."));
    if (isNaN(p) || p <= 0) p = productPrice(product);
    return p;
  }

  function formatPrice(n) {
    var x = Number(n || 0);
    if (isNaN(x)) x = 0;
    return String(Math.round(x)) + " kr";
  }

  function buildFlatIndex(productId, product) {
    var map = {};
    var variants = product && product.variants ? product.variants : [];

    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      var dt = parseDT(v);

      if (!dt.date || !dt.time) continue;
      if (!isWithinRange(dt.date)) continue;
      if (isPassedOrCutoff(dt.date, dt.time)) continue;

      var qty = parseInt(v.qty || "0", 10);
      if (isNaN(qty)) qty = 0;

      if (!map[dt.date]) map[dt.date] = {};

      map[dt.date][dt.time] = {
        productId: String(productId),
        variantId: String(v.id || ""),
        sku: String(v.sku || ""),
        date: dt.date,
        time: dt.time,
        qty: qty,
        soldOut: qty <= 0,
        price: variantPrice(v, product)
      };
    }

    return map;
  }

  function getCustomLock(date, time) {
    for (var i = 0; i < CUSTOM_CLOSED_TIMES.length; i++) {
      var c = CUSTOM_CLOSED_TIMES[i];
      if (!c || c.date !== date) continue;

      var closedTime = String(c.from || "") + "-" + String(c.to || "");
      if (timesOverlap(time, closedTime)) {
        return {
          text: c.label || "Stengt",
          reason: c.label || "Dette tidsrommet er stengt."
        };
      }
    }

    return null;
  }

  function getTuesdayOpenForThursday(dateStr) {
    var d = parseYmd(dateStr);
    if (!d || d.getDay() !== 4) return null;

    var monday = addDays(d, -3);
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1, 0, 1, 0);
  }

  function getThursdayClubRuleLock(date, time) {
    if (!timesOverlap(time, "19:00-22:00")) return null;

    var d = parseYmd(date);
    if (!d || d.getDay() !== 4) return null;

    var opensAt = getTuesdayOpenForThursday(date);
    if (!opensAt) return null;

    if (new Date() < opensAt) {
      return {
        text: "Reservert klubb",
        reason: "Torsdag 19:00–22:00 er reservert for klubbkveld frem til tirsdag samme uke."
      };
    }

    return null;
  }

  function findSoldOverlap(map, date, time) {
    var day = map && map[date] ? map[date] : null;
    if (!day) return null;

    var ts = keys(day);
    for (var i = 0; i < ts.length; i++) {
      var s = day[ts[i]];
      if (!s || !s.soldOut) continue;
      if (timesOverlap(s.time, time)) return s;
    }

    return null;
  }

  function getVenueLock(slot) {
    if (!slot) return { text: "Stengt", reason: "Ugyldig tid." };

    if (slot.soldOut) {
      return { text: "Booket", reason: "Hele lokalet er allerede booket i dette tidsrommet." };
    }

    var custom = getCustomLock(slot.date, slot.time);
    if (custom) return custom;

    var clubRule = getThursdayClubRuleLock(slot.date, slot.time);
    if (clubRule) return clubRule;

    var venueOverlap = findSoldOverlap(venueSlots, slot.date, slot.time);
    if (venueOverlap) {
      return {
        text: "Overlapp booket",
        reason: "En annen privatkveld overlapper med denne tiden."
      };
    }

    var a = findSoldOverlap(dartASlots, slot.date, slot.time);
    if (a) {
      return {
        text: "Bane A booket",
        reason: "Dart Bane A er allerede booket i dette tidsrommet."
      };
    }

    var b = findSoldOverlap(dartBSlots, slot.date, slot.time);
    if (b) {
      return {
        text: "Bane B booket",
        reason: "Dart Bane B er allerede booket i dette tidsrommet."
      };
    }

    var disc = findSoldOverlap(discSlots, slot.date, slot.time);
    if (disc) {
      return {
        text: "Disc booket",
        reason: "Disc-simulator er allerede booket i dette tidsrommet."
      };
    }

    var club = findSoldOverlap(clubSlots, slot.date, slot.time);
    if (club) {
      return {
        text: "Klubbkveld",
        reason: "Klubbkveld overlapper med dette tidsrommet."
      };
    }

    return null;
  }

  function gkStoreBookingDetails(payload) {
    try {
      var KEY = "gk_last_booking_payload_v1";
      var TARGET_KEY = "gk_success_target";

      var current = {
        createdAt: new Date().toISOString(),
        source: "venue",
        title: "Leie hele lokalet",
        items: [],
        extras: {}
      };

      if (payload && payload.item) current.items.push(payload.item);
      if (payload && payload.extras) current.extras = payload.extras;

      localStorage.setItem(KEY, JSON.stringify(current));
      localStorage.setItem(TARGET_KEY, "booking");
    } catch (e) {
      console.log("[VENUE BOOKING] Kunne ikke lagre bookingdetaljer:", e);
    }
  }

  function gkBumpCartCount() {
    try {
      var selectors = [
        ".cart-count",
        ".cart-counter",
        ".cart-qty",
        "[data-cart-count]",
        ".header-cart-count",
        ".cart_quantity",
        ".cart__count"
      ];

      var updated = false;

      for (var i = 0; i < selectors.length; i++) {
        var nodes = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < nodes.length; j++) {
          var el = nodes[j];
          var txt = String(el.textContent || "").trim();

          if (/^\d+$/.test(txt)) {
            el.textContent = String(parseInt(txt, 10) + 1);
            updated = true;
          }

          var attr = el.getAttribute("data-cart-count");
          if (attr !== null && /^\d+$/.test(attr)) {
            el.setAttribute("data-cart-count", String(parseInt(attr, 10) + 1));
            updated = true;
          }
        }
      }

      console.log("[VENUE BOOKING] cart count bumped:", updated);
    } catch (e) {
      console.log("[VENUE BOOKING] cart count bump error:", e);
    }
  }

  function addVariantToCart(productId, variantId, cb) {
    var body =
      "product_id=" + encodeURIComponent(String(productId)) +
      "&variant=" + encodeURIComponent(String(variantId)) +
      "&qty=1&quantity=1" +
      "&eventId=" + encodeURIComponent(String(EVENT_ID)) +
      "&page=product";

    fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: body,
      credentials: "same-origin"
    })
      .then(function (r) { return r.text(); })
      .then(function () {
        gkBumpCartCount();
        cb(true);
      })
      .catch(function (e) {
        console.log("[VENUE BOOKING] addVariantToCart error:", e);
        cb(false);
      });
  }

  function addProductToCart(productId, qty, cb) {
    qty = parseInt(qty || "0", 10);
    if (isNaN(qty) || qty <= 0) {
      cb(true);
      return;
    }

    var body =
      "product_id=" + encodeURIComponent(String(productId)) +
      "&qty=" + encodeURIComponent(String(qty)) +
      "&quantity=" + encodeURIComponent(String(qty)) +
      "&page=product";

    fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: body,
      credentials: "same-origin"
    })
      .then(function (r) { return r.text(); })
      .then(function () {
        gkBumpCartCount();
        cb(true);
      })
      .catch(function (e) {
        console.log("[VENUE BOOKING] addProductToCart error:", e);
        cb(false);
      });
  }

  function getDartSetCount() {
    var el = document.getElementById("gkv-dartset-count");
    if (!el) return 0;

    var n = parseInt(el.value || "0", 10);
    return isNaN(n) ? 0 : n;
  }

  /* ------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------ */

  function renderDays() {
    daysEl.innerHTML = "";

    var startIndex = weekOffset * 7;
    var visibleDates = allDates.slice(startIndex, startIndex + 7);

    if (!visibleDates.length && allDates.length) {
      weekOffset = 0;
      visibleDates = allDates.slice(0, 7);
    }

    var weekStart = visibleDates[0] || "";
    var weekEnd = visibleDates[visibleDates.length - 1] || "";

    if (weekStart && weekEnd) {
      weekTitleEl.textContent = dateLabel(weekStart) + " – " + dateLabel(weekEnd);
    } else {
      weekTitleEl.textContent = "Velg dag";
    }

    prevWeekBtn.disabled = weekOffset <= 0;
    nextWeekBtn.disabled = (weekOffset + 1) * 7 >= allDates.length;

    if (!visibleDates.length) {
      daysEl.innerHTML = '<div class="gkv-empty">Ingen tilgjengelige datoer enda.</div>';
      return;
    }

    for (var i = 0; i < visibleDates.length; i++) {
      var d = visibleDates[i];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gkv-day" + (d === activeDate ? " active" : "");
      btn.innerHTML = "<strong>" + dateLabel(d) + "</strong><span>" + d + "</span>";
      btn.setAttribute("data-date", d);
      btn.onclick = function () {
        setActiveDate(this.getAttribute("data-date"));
      };
      daysEl.appendChild(btn);
    }
  }

  function renderSlots(dateStr) {
    slotsEl.innerHTML = "";
    titleEl.textContent = fullDateLabel(dateStr);

    var day = venueSlots[dateStr] || {};
    var selectedDuration = getSelectedDurationHours();

    var times = keys(day).filter(function (t) {
      return durationHours(t) === selectedDuration;
    });

    if (!times.length) {
      slotsEl.innerHTML = '<div class="gkv-empty">Ingen tider med ' + selectedDuration + ' timers varighet denne dagen.</div>';
      return;
    }

    for (var i = 0; i < times.length; i++) {
      slotsEl.appendChild(createSlotCard(day[times[i]]));
    }
  }

  function createSlotCard(slot) {
    var lock = getVenueLock(slot);

    var card = document.createElement("div");
    card.className = "gkv-slot";

    var top = document.createElement("div");
    top.className = "gkv-slot-top";
    card.appendChild(top);

    var time = document.createElement("div");
    time.className = "gkv-time";
    time.textContent = slot.time;
    top.appendChild(time);

    var meta = document.createElement("div");
    meta.className = "gkv-meta";
    top.appendChild(meta);

    var price = document.createElement("div");
    price.className = "gkv-mini price";
    price.textContent = formatPrice(slot.price || 800);
    meta.appendChild(price);

    var state = document.createElement("div");
    if (lock) {
      state.className = slot.soldOut ? "gkv-mini warn" : "gkv-mini stop";
      state.textContent = lock.text || "Opptatt";
    } else {
      state.className = "gkv-mini ok";
      state.textContent = "Ledig";
    }
    meta.appendChild(state);

    var reason = document.createElement("p");
    reason.className = "gkv-reason";
    reason.textContent = lock ? (lock.reason || "Tiden er ikke tilgjengelig.") : "Inkluderer begge dartbaner, disc-simulator, møtebord og fri kaffe. Varighet: " + durationHours(slot.time) + " timer.";
    card.appendChild(reason);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gkv-btn";
    btn.textContent = "Book hele lokalet";
    card.appendChild(btn);

    if (lock || !slot.productId || !slot.variantId) {
      btn.disabled = true;
      btn.className = "gkv-btn " + (slot.soldOut ? "booked" : "stopped");
      btn.textContent = lock ? (lock.text || "Opptatt") : "Stengt";
    }

    btn.onclick = function () {
      if (btn.disabled) return;

      var checkLock = getVenueLock(slot);
      if (checkLock) {
        btn.disabled = true;
        btn.className = "gkv-btn stopped";
        btn.textContent = checkLock.text || "Opptatt";
        reason.textContent = checkLock.reason || "Tiden er ikke tilgjengelig.";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Legger til…";

      addVariantToCart(slot.productId, slot.variantId, function (ok) {
        if (!ok) {
          btn.disabled = false;
          btn.textContent = "Feil – prøv igjen";
          statusEl.textContent = "Kunne ikke legge tiden i handlekurven. Prøv igjen.";
          return;
        }

        var dartSetCount = getDartSetCount();

        addProductToCart(PRODUCT_DART_SET, dartSetCount, function (extraOk) {
          gkStoreBookingDetails({
            item: {
              type: "venue",
              label: "Leie hele lokalet",
              date: slot.date,
              time: slot.time,
              productId: slot.productId,
              variantId: slot.variantId,
              price: String(slot.price || 800)
            },
            extras: {
              dartSets: dartSetCount
            }
          });

          btn.className = "gkv-btn ok";
          btn.textContent = "Lagt i handlekurv ✓";

          if (dartSetCount > 0 && extraOk) {
            statusEl.textContent = "Tiden og " + dartSetCount + " pilsett er lagt i handlekurven. Fullfør bestillingen for å reservere.";
          } else if (dartSetCount > 0 && !extraOk) {
            statusEl.textContent = "Tiden er lagt i handlekurven, men pilsett kunne ikke legges til automatisk.";
          } else {
            statusEl.textContent = "Tiden er lagt i handlekurven. Fullfør bestillingen for å reservere.";
          }
        });
      });
    };

    return card;
  }

  function setActiveDate(dateStr) {
    activeDate = dateStr;
    renderDays();
    renderSlots(dateStr);
  }

  prevWeekBtn.onclick = function () {
    if (weekOffset > 0) {
      weekOffset--;
      var d = allDates[weekOffset * 7] || allDates[0] || "";
      if (d) setActiveDate(d);
    }
  };

  nextWeekBtn.onclick = function () {
    if ((weekOffset + 1) * 7 < allDates.length) {
      weekOffset++;
      var d = allDates[weekOffset * 7] || allDates[0] || "";
      if (d) setActiveDate(d);
    }
  };

  var durationSelect = document.getElementById("gkv-duration-hours");
  if (durationSelect) {
    durationSelect.onchange = function () {
      if (activeDate) renderSlots(activeDate);
    };
  }

  /* ------------------------------------------------ */
  /* LOAD */
  /* ------------------------------------------------ */

  function fetchProduct(id) {
    return fetch(API_BASE + id, { credentials: "omit" })
      .then(function (r) { return r.json(); })
      .then(function (j) { return j && j.product ? j.product : null; })
      .catch(function (e) {
        console.log("[VENUE BOOKING] Kunne ikke lese produkt " + id + ":", e);
        return null;
      });
  }

  Promise.all([
    fetchProduct(PRODUCT_VENUE),
    fetchProduct(PRODUCT_A),
    fetchProduct(PRODUCT_B),
    fetchProduct(PRODUCT_DISC),
    fetchProduct(PRODUCT_CLUB),
    fetchProduct(PRODUCT_DART_SET)
  ]).then(function (res) {
    var venue = res[0];
    var a = res[1];
    var b = res[2];
    var disc = res[3];
    var club = res[4];
    dartSetProduct = res[5];

    venueSlots = buildFlatIndex(PRODUCT_VENUE, venue);
    dartASlots = buildFlatIndex(PRODUCT_A, a);
    dartBSlots = buildFlatIndex(PRODUCT_B, b);
    discSlots = buildFlatIndex(PRODUCT_DISC, disc);
    clubSlots = buildFlatIndex(PRODUCT_CLUB, club);

    allDates = keys(venueSlots).filter(function (d) {
      return isWithinRange(d);
    });

    statusEl.textContent = "";

    if (!allDates.length) {
      statusEl.textContent = "Ingen hele-lokalet tider er tilgjengelige enda.";
      daysEl.innerHTML = '<div class="gkv-empty">Ingen tider funnet. Kjør oppdatering av produkt 1349 først.</div>';
      slotsEl.innerHTML = "";
      return;
    }

    activeDate = allDates[0];
    renderDays();
    renderSlots(activeDate);

    console.log("[VENUE BOOKING] Klar", {
      venueDates: allDates.length,
      venueSlots: venueSlots,
      dartA: dartASlots,
      dartB: dartBSlots,
      disc: discSlots,
      club: clubSlots
    });
  }).catch(function (e) {
    console.error("[VENUE BOOKING] Feil ved lasting:", e);
    statusEl.textContent = "Kunne ikke laste booking. Prøv igjen senere.";
  });
})();

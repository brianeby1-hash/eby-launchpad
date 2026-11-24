// Learn tab picture explorers: small interactive SVG widgets shown on a unit's Explore screen or above a problem.
// A widget is a spec like {type:"moon", step:2}. Specs are attached in learn.js (window.LEARN_VIZ).
// API: LVIZ.html(spec, id) returns markup; LVIZ.bind(root) wires up every widget inside root.
// Widget state is kept here by id, so it survives the app re-rendering the page.
(function () {
  "use strict";
  const ST = {}, SPEC = {}, TIMERS = {};
  const C = { kid: "var(--kid)", ink: "var(--ink)", muted: "var(--muted)", line: "var(--line)", p2: "var(--panel-2)", panel: "var(--panel)", sun: "var(--sun)", mint: "var(--mint)", acc: "var(--accent)", violet: "var(--violet)", sky: "var(--sky)" };
  const PAL = ["#2F7BF5", "#FF7A1A", "#19B38A", "#8A5CF6", "#FFC43D", "#E5484D"];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const neg = n => (n < 0 ? "−" + -n : String(n));
  const T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="fill:${o.c || C.ink};font:${o.w || 800} ${o.s || 15}px var(--body)">${s}</text>`; };
  const svg = (w, h, inner, lab) => `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;margin:0 auto;overflow:visible" role="img" aria-label="${esc(lab || "")}">${inner}</svg>`;
  const B = (act, label, on) => `<button type="button" class="btn sm ${on ? "primary" : "ghost"}" style="background:${on ? "" : "var(--panel)"}" data-va="${act}">${label}</button>`;
  const R = (min, max, val, step) => `<input type="range" min="${min}" max="${max}" step="${step || 1}" value="${val}" data-vr="1" style="flex:1;min-width:180px;accent-color:var(--kid)">`;

  const W = {};

  /* ---- number line: move a marker by +/-1 and +/-5 and watch the path ---- */
  W.numberline = {
    init: s => ({ pos: s.start || 0 }),
    title: s => s.title || "Number line: hop to find the answer",
    art(s, st) {
      const from = s.from, to = s.to, x = v => 30 + (v - from) * (580 / (to - from)), y = 70;
      let g = `<line x1="20" y1="${y}" x2="620" y2="${y}" style="stroke:${C.ink};stroke-width:3"/>`;
      const every = to - from > 26 ? 5 : 1;
      for (let v = from; v <= to; v++) {
        const big = v % every === 0;
        g += `<line x1="${x(v)}" y1="${y - (big ? 9 : 5)}" x2="${x(v)}" y2="${y + (big ? 9 : 5)}" style="stroke:${v === 0 ? C.acc : C.ink};stroke-width:${v === 0 ? 3 : 2}"/>`;
        if (big) g += T(x(v), y + 30, neg(v), { s: 13, c: v === 0 ? C.acc : C.muted });
      }
      const s0 = s.start || 0, p = st.pos;
      if (p !== s0) {
        const a = x(s0), b = x(p), h = Math.min(55, 12 + Math.abs(b - a) / 4);
        g += `<path d="M${a},${y - 6} Q${(a + b) / 2},${y - 6 - h * 2} ${b},${y - 6}" style="fill:none;stroke:${C.kid};stroke-width:3;stroke-dasharray:6 5"/>`;
      }
      g += `<circle cx="${x(s0)}" cy="${y}" r="7" style="fill:${C.panel};stroke:${C.muted};stroke-width:3"/>`;
      g += `<circle cx="${x(p)}" cy="${y}" r="11" style="fill:${C.kid};stroke:#fff;stroke-width:3"/>` + T(x(p), y - 20, neg(p) + (s.unit || ""), { s: 16, c: C.kid });
      return svg(640, 115, g, "Number line");
    },
    read: (s, st) => { const d = st.pos - (s.start || 0); return `Start ${neg(s.start || 0)} · moved ${d >= 0 ? "+" + d : neg(d)} · now at <b>${neg(st.pos)}${s.unit || ""}</b>`; },
    controls: () => B("m:-5", "−5") + B("m:-1", "−1") + B("m:1", "+1") + B("m:5", "+5") + B("reset", "Start over"),
    act(s, st, a) { if (a === "reset") st.pos = s.start || 0; else if (a.startsWith("m:")) st.pos = Math.max(s.from, Math.min(s.to, st.pos + Number(a.slice(2)))); }
  };

  /* ---- moon: orbit seen from above + what we see from Earth ---- */
  const PH = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Third quarter", "Waning crescent"];
  function moonDisk(cx, cy, r, step) {
    const th = step * Math.PI / 4, rx = Math.abs(Math.cos(th)) * r;
    let lit = "";
    if (step === 4) lit = `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:#F5F1DC"/>`;
    else if (step > 0 && step < 4) lit = `<path d="M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} A${rx},${r} 0 0 ${step < 2 ? 0 : 1} ${cx},${cy - r}Z" style="fill:#F5F1DC"/>`;
    else if (step > 4) lit = `<path d="M${cx},${cy - r} A${r},${r} 0 0 0 ${cx},${cy + r} A${rx},${r} 0 0 ${step > 6 ? 1 : 0} ${cx},${cy - r}Z" style="fill:#F5F1DC"/>`;
    if (step === 2 || step === 6) lit = step === 2 ? `<path d="M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r}Z" style="fill:#F5F1DC"/>` : `<path d="M${cx},${cy - r} A${r},${r} 0 0 0 ${cx},${cy + r}Z" style="fill:#F5F1DC"/>`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:#2A3347;stroke:#56617A;stroke-width:2"/>${lit}`;
  }
  W.moon = {
    init: s => ({ step: s.step || 0, play: false }),
    title: s => s.title || "Moon phase machine: slide the Moon around Earth",
    art(s, st) {
      const cx = 200, cy = 125, Rr = 88, th = st.step * Math.PI / 4, mx = cx - Rr * Math.cos(th), my = cy + Rr * Math.sin(th);
      let g = `<rect x="0" y="0" width="640" height="250" rx="16" style="fill:#0E1626"/>`;
      for (let i = 0; i < 5; i++) g += `<line x1="18" y1="${45 + i * 40}" x2="78" y2="${45 + i * 40}" style="stroke:#FFC43D;stroke-width:3;stroke-linecap:round"/><path d="M70,${39 + i * 40} L80,${45 + i * 40} L70,${51 + i * 40}" style="fill:none;stroke:#FFC43D;stroke-width:3"/>`;
      g += T(48, 238, "Sunlight", { s: 12, c: "#FFC43D" });
      g += `<circle cx="${cx}" cy="${cy}" r="${Rr}" style="fill:none;stroke:#56617A;stroke-width:2;stroke-dasharray:4 6"/>`;
      g += `<circle cx="${cx}" cy="${cy}" r="20" style="fill:#2F7BF5"/><path d="M${cx - 9},${cy - 8} q6,-6 12,0 q4,6 -2,10 q-6,4 -10,-2z" style="fill:#19B38A"/>` + T(cx, cy + 40, "Earth", { s: 12, c: "#9FB0C8" });
      g += `<circle cx="${mx}" cy="${my}" r="13" style="fill:#2A3347;stroke:#56617A;stroke-width:1.5"/><path d="M${mx},${my - 13} A13,13 0 0 0 ${mx},${my + 13}Z" style="fill:#F5F1DC"/>`;
      g += T(200, 20, "Seen from above", { s: 12, c: "#9FB0C8" });
      g += moonDisk(500, 118, 72, st.step) + T(500, 28, "What you see from Earth", { s: 12, c: "#9FB0C8" });
      g += T(500, 222, PH[st.step], { s: 19, c: "#F1F5FB" }) + T(500, 242, "about day " + Math.round(st.step * 3.7) + " of 29.5", { s: 12, c: "#9FB0C8" });
      return svg(640, 250, g, "Moon phases: " + PH[st.step]);
    },
    read: (s, st) => `<b>${PH[st.step]}</b>${st.step === 0 ? ": the lit side faces away from us." : st.step === 4 ? ": the whole lit half faces us." : st.step < 4 ? ": waxing, the light is growing." : ": waning, the light is shrinking."}`,
    controls: (s, st) => `<span class="small muted">Slide:</span>${R(0, 7, st.step)}` + B("play", st.play ? "Pause" : "Play the month", st.play),
    range(s, st, v) { st.step = Number(v); },
    act(s, st, a, el) { if (a === "play") { st.play = !st.play; tick(el, st.play, 700, () => { st.step = (st.step + 1) % 8; }); } }
  };

  /* ---- fractions: tap slices, change how many equal parts ---- */
  function slices(cx, cy, r, n, on, unequal, tag) {
    let g = "";
    const angs = unequal ? [0, 0.68, 1] : Array.from({ length: n + 1 }, (_, i) => i / n);
    for (let i = 0; i < angs.length - 1; i++) {
      const a0 = angs[i] * 2 * Math.PI - Math.PI / 2, a1 = angs[i + 1] * 2 * Math.PI - Math.PI / 2, big = angs[i + 1] - angs[i] > 0.5 ? 1 : 0;
      const d = angs.length === 2 ? `M${cx - r},${cy} a${r},${r} 0 1 0 ${2 * r},0 a${r},${r} 0 1 0 ${-2 * r},0` : `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}Z`;
      const isOn = on.includes(tag + i);
      g += `<path d="${d}" data-va="t:${tag}${i}" style="cursor:pointer;fill:${isOn ? "#FFC43D" : "#F6E2B8"};stroke:#B4651E;stroke-width:3"/>`;
      if (isOn) { const am = (a0 + a1) / 2; for (let k = 0; k < 2; k++) g += `<circle cx="${cx + r * (0.45 + k * 0.2) * Math.cos(am + k * 0.2)}" cy="${cy + r * (0.45 + k * 0.2) * Math.sin(am + k * 0.2)}" r="${r / 12}" style="fill:#E5484D;pointer-events:none"/>`; }
    }
    return g;
  }
  W.fraction = {
    init: s => ({ parts: s.parts || 2, on: [] }),
    title: s => s.title || (s.shape === "compare" ? "Which piece is bigger?" : s.shape === "twocuts" ? "Two ways to cut a sandwich" : s.unequal ? "Is this cut fair?" : "Pizza cutter: tap slices to color them"),
    art(s, st) {
      let g = "";
      if (s.shape === "compare") {
        g += slices(160, 120, 95, 2, ["a0"].concat(st.on), false, "a") + T(160, 245, "cut into 2: one HALF", { s: 15 });
        g += slices(480, 120, 95, 4, ["b0"].concat(st.on), false, "b") + T(480, 245, "cut into 4: one FOURTH", { s: 15 });
        return svg(640, 255, g, "A half and a fourth of the same pizza");
      }
      if (s.shape === "twocuts") {
        const sq = (x, kind) => kind === "diag"
          ? `<path d="M${x},20 L${x + 200},20 L${x},220Z" data-va="t:d0" style="cursor:pointer;fill:${st.on.includes("d0") ? "#FFC43D" : "#F6E2B8"};stroke:#B4651E;stroke-width:3"/><path d="M${x + 200},20 L${x + 200},220 L${x},220Z" data-va="t:d1" style="cursor:pointer;fill:${st.on.includes("d1") ? "#FFC43D" : "#F6E2B8"};stroke:#B4651E;stroke-width:3"/>`
          : `<rect x="${x}" y="20" width="100" height="200" data-va="t:v0" style="cursor:pointer;fill:${st.on.includes("v0") ? "#FFC43D" : "#F6E2B8"};stroke:#B4651E;stroke-width:3"/><rect x="${x + 100}" y="20" width="100" height="200" data-va="t:v1" style="cursor:pointer;fill:${st.on.includes("v1") ? "#FFC43D" : "#F6E2B8"};stroke:#B4651E;stroke-width:3"/>`;
        g += sq(60, "diag") + T(160, 245, "Holden: corner to corner", { s: 14 }) + sq(380, "vert") + T(480, 245, "Rowan: down the middle", { s: 14 });
        return svg(640, 255, g, "Two squares cut in half two different ways");
      }
      if (s.shape === "rect") {
        const n = st.parts, w = 400 / n;
        for (let i = 0; i < n; i++) g += `<rect x="${120 + i * w}" y="40" width="${w}" height="160" data-va="t:r${i}" style="cursor:pointer;fill:${st.on.includes("r" + i) ? "#C08A5A" : "#E9D3B5"};stroke:#7A4A22;stroke-width:3"/>`;
        return svg(640, 240, g, "A chocolate bar cut into " + n + " equal parts");
      }
      g += slices(320, 125, 110, st.parts, st.on, !!s.unequal, "p");
      return svg(640, 250, g, s.unequal ? "A pizza cut into two unequal pieces" : "A pizza cut into " + st.parts + " equal parts");
    },
    read(s, st) {
      if (s.shape === "compare") return "Same pizza. More slices means each slice is <b>smaller</b>.";
      if (s.shape === "twocuts") return "Both squares are cut into <b>2 equal parts</b>. Different shapes, still halves!";
      if (s.unequal) return "2 pieces, but <b>not equal</b>. One is much bigger. So they are not halves.";
      const n = st.parts, k = st.on.length, name = { 2: "halves", 3: "thirds", 4: "fourths", 6: "sixths", 8: "eighths" }[n] || n + " parts";
      return `${n} equal parts (${name}). ${k ? `You colored <b>${k} of ${n}</b>.` : "Tap a slice to color it."}`;
    },
    controls: (s, st) => (s.shape === "compare" || s.shape === "twocuts" || s.unequal) ? B("clear", "Clear") : B("n:-1", "Fewer slices") + B("n:1", "More slices") + B("clear", "Clear"),
    act(s, st, a) {
      if (a === "clear") st.on = [];
      else if (a.startsWith("n:")) { st.parts = Math.max(2, Math.min(12, st.parts + Number(a.slice(2)))); st.on = []; }
      else if (a.startsWith("t:")) { const id = a.slice(2); st.on = st.on.includes(id) ? st.on.filter(x => x !== id) : st.on.concat(id); }
    }
  };

  /* ---- Singapore bar model ---- */
  W.bars = {
    init: () => ({ show: false }),
    title: s => s.title || "Bar model: draw it to see it",
    art(s, st) {
      const uw = 74; let g = "", y = 22;
      s.rows.forEach((row, ri) => {
        g += T(80, y + 30, esc(row.label), { a: "end", s: 15 });
        for (let u = 0; u < row.units; u++) {
          const x = 95 + u * uw, show = st.show || row.known;
          g += `<rect x="${x}" y="${y}" width="${uw - 4}" height="44" rx="6" style="fill:${PAL[ri % PAL.length]};opacity:.9"/>` + T(x + (uw - 4) / 2, y + 29, show ? row.val : "?", { s: 18, c: "#fff" });
        }
        if (st.show && s.sums) g += T(95 + row.units * uw + 12, y + 29, "= " + row.units * row.val, { a: "start", s: 17 });
        y += 64;
      });
      if (st.show && s.total && s.sums) g += T(95, y + 14, "Altogether: " + s.rows.reduce((a, r) => a + r.units * r.val, 0), { a: "start", s: 17, c: C.kid });
      return svg(640, y + (s.total ? 30 : 4), g, "Bar model");
    },
    read: (s, st) => st.show ? "Each box is the same size, so each box has the same number. Now add up the boxes!" : "Count the boxes. Every box is worth the same amount.",
    controls: (s, st) => B("show", st.show ? "Hide the numbers" : "Show the numbers", st.show),
    act(s, st, a) { if (a === "show") st.show = !st.show; }
  };

  /* ---- analog clock ---- */
  W.clock = {
    init: s => ({ t: (s.h % 12) * 60 + (s.m || 0) }),
    title: s => s.title || "Clock: move the time and watch the hands",
    art(s, st) {
      const cx = 140, cy = 130, r = 108, h = Math.floor(st.t / 60) % 12, m = st.t % 60;
      let g = `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:${C.panel};stroke:${C.ink};stroke-width:5"/>`;
      for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, big = i % 5 === 0; g += `<line x1="${cx + (r - (big ? 14 : 7)) * Math.sin(a)}" y1="${cy - (r - (big ? 14 : 7)) * Math.cos(a)}" x2="${cx + (r - 3) * Math.sin(a)}" y2="${cy - (r - 3) * Math.cos(a)}" style="stroke:${C.ink};stroke-width:${big ? 3 : 1.5}"/>`; }
      for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; g += T(cx + (r - 30) * Math.sin(a), cy - (r - 30) * Math.cos(a) + 6, i, { s: 17 }); }
      const ha = ((h + m / 60) * 30) * Math.PI / 180, ma = m * 6 * Math.PI / 180;
      g += `<line x1="${cx}" y1="${cy}" x2="${cx + 55 * Math.sin(ha)}" y2="${cy - 55 * Math.cos(ha)}" style="stroke:${C.ink};stroke-width:8;stroke-linecap:round"/>`;
      g += `<line x1="${cx}" y1="${cy}" x2="${cx + 88 * Math.sin(ma)}" y2="${cy - 88 * Math.cos(ma)}" style="stroke:${C.kid};stroke-width:5;stroke-linecap:round"/><circle cx="${cx}" cy="${cy}" r="7" style="fill:${C.ink}"/>`;
      const hh = h === 0 ? 12 : h, words = m === 0 ? hh + " o'clock" : m === 15 ? "quarter past " + hh : m === 30 ? "half past " + hh : m === 45 ? "quarter to " + (hh % 12 + 1) : m + " minutes past " + hh;
      g += `<rect x="320" y="70" width="270" height="80" rx="16" style="fill:#0E1626"/>` + T(455, 128, hh + ":" + String(m).padStart(2, "0"), { s: 44, c: "#5BF59A" }) + T(455, 185, words, { s: 17 });
      g += T(455, 215, "Blue = minute hand · black = hour hand", { s: 12, c: C.muted });
      return svg(620, 260, g, "Clock showing " + hh + ":" + String(m).padStart(2, "0"));
    },
    read: () => "Each number on the clock = 5 minutes for the blue minute hand.",
    controls: () => B("t:-15", "−15 min") + B("t:-5", "−5 min") + B("t:5", "+5 min") + B("t:15", "+15 min") + B("reset", "Reset"),
    act(s, st, a) { if (a === "reset") st.t = (s.h % 12) * 60 + (s.m || 0); else st.t = (st.t + Number(a.slice(2)) + 720) % 720; }
  };

  /* ---- shapes gallery ---- */
  const SH = {
    triangle: ["3 sides, 3 corners", "M45,12 L80,78 L10,78Z"], square: ["4 equal sides, 4 corners", "M14,14 H76 V76 H14Z"], rectangle: ["4 sides, 4 corners", "M6,24 H84 V66 H6Z"],
    hexagon: ["6 sides, 6 corners", "M25,10 H65 L85,45 L65,80 H25 L5,45Z"], trapezoid: ["4 sides, 4 corners", "M28,20 H62 L84,72 H6Z"], circle: ["0 corners, 1 curved side", "M10,45 a35,35 0 1 0 70,0 a35,35 0 1 0 -70,0"],
    cube: ["3D · 6 flat faces, 8 corners", ""], sphere: ["3D · round all over, no corners", ""], cylinder: ["3D · 2 circle faces, no corners", ""], cone: ["3D · 1 circle face and 1 point", ""]
  };
  function shapeArt(k, col) {
    const st = `style="fill:${col};stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"`;
    if (k === "cube") return `<path d="M15,30 L45,15 L80,25 L50,40Z" style="fill:${col};fill-opacity:.75;stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/><path d="M15,30 L50,40 L50,80 L15,68Z" ${st}/><path d="M50,40 L80,25 L80,66 L50,80Z" style="fill:${col};fill-opacity:.6;stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/>`;
    if (k === "sphere") return `<circle cx="45" cy="45" r="35" ${st}/><ellipse cx="45" cy="45" rx="35" ry="10" style="fill:none;stroke:var(--ink);stroke-width:1.5;stroke-dasharray:4 4"/><circle cx="33" cy="32" r="7" style="fill:#fff;opacity:.5"/>`;
    if (k === "cylinder") return `<path d="M15,20 V70 A30,9 0 0 0 75,70 V20" ${st}/><ellipse cx="45" cy="20" rx="30" ry="9" style="fill:${col};opacity:.7;stroke:var(--ink);stroke-width:2.5"/>`;
    if (k === "cone") return `<path d="M45,8 L78,70 A33,10 0 0 1 12,70Z" ${st}/><path d="M12,70 A33,10 0 0 0 78,70" style="fill:none;stroke:var(--ink);stroke-width:1.5;stroke-dasharray:4 4"/>`;
    return `<path d="${SH[k][1]}" ${st}/>`;
  }
  W.shapes = {
    init: () => ({ sel: null }),
    title: s => s.title || "Shape detective: tap a shape",
    art(s, st) {
      const list = s.list || Object.keys(SH), per = Math.min(list.length, 5), rows = Math.ceil(list.length / per);
      let g = "";
      list.forEach((k, i) => { const x = (i % per) * 124 + (640 - per * 124) / 2, y = Math.floor(i / per) * 128; g += `<g data-va="s:${i}" style="cursor:pointer"><rect x="${x + 4}" y="${y + 4}" width="116" height="118" rx="14" style="fill:${st.sel === i ? "color-mix(in srgb,var(--kid) 18%,transparent)" : C.panel};stroke:${st.sel === i ? C.kid : C.line};stroke-width:2"/><g transform="translate(${x + 17},${y + 8})">${shapeArt(k, PAL[i % PAL.length])}</g>${T(x + 62, y + 112, k, { s: 13 })}</g>`; });
      return svg(640, rows * 128, g, "Shapes");
    },
    read(s, st) { const list = s.list || Object.keys(SH); return st.sel == null ? "Tap any shape to see what makes it that shape." : `<b>${list[st.sel]}</b>: ${SH[list[st.sel]][0]}`; },
    controls: () => "",
    act(s, st, a) { if (a.startsWith("s:")) st.sel = Number(a.slice(2)); }
  };

  /* ---- data: mean / median / mode, plus an outlier ---- */
  W.data = {
    init: () => ({ mean: false, median: false, mode: false, out: false, sorted: false }),
    title: s => s.title || "Data lab: find the middle three ways",
    art(s, st) {
      let v = s.values.slice(); if (st.out) v.push(s.outlier);
      const order = v.map((x, i) => ({ x, i })); if (st.sorted || st.median) order.sort((a, b) => a.x - b.x);
      const max = Math.max(...v, 1), n = v.length, bw = Math.min(70, 520 / n), x0 = 320 - (n * bw) / 2, base = 190, hs = 160 / max;
      const sorted = v.slice().sort((a, b) => a - b), mid = n % 2 ? [Math.floor(n / 2)] : [n / 2 - 1, n / 2];
      const cnt = {}; v.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const top = Math.max(...Object.values(cnt)), modes = top > 1 ? Object.keys(cnt).filter(k => cnt[k] === top).map(Number) : [];
      let g = `<line x1="${x0 - 10}" y1="${base}" x2="${x0 + n * bw + 10}" y2="${base}" style="stroke:${C.ink};stroke-width:2"/>`;
      order.forEach((o, j) => {
        const hl = (st.mode && modes.includes(o.x)) ? "#FF7A1A" : (st.median && mid.includes(j)) ? "#8A5CF6" : (st.out && o.i === n - 1) ? "#E5484D" : "#2F7BF5";
        g += `<rect x="${x0 + j * bw + 5}" y="${base - o.x * hs}" width="${bw - 10}" height="${o.x * hs}" rx="5" style="fill:${hl}"/>` + T(x0 + j * bw + bw / 2, base - o.x * hs - 6, o.x, { s: 13 });
      });
      if (st.mean) { const m = v.reduce((a, b) => a + b, 0) / n, y = base - m * hs; g += `<line x1="${x0 - 10}" y1="${y}" x2="${x0 + n * bw + 10}" y2="${y}" style="stroke:#19B38A;stroke-width:3;stroke-dasharray:8 6"/>` + T(x0 + n * bw + 14, y + 5, "mean " + (Math.round(m * 10) / 10), { a: "start", s: 13, c: "#19B38A" }); }
      return svg(640, 205, g, "Bar chart of the data");
    },
    read(s, st) {
      const parts = [];
      if (st.mean) parts.push('<span style="color:#19B38A">Mean</span> = add them all, divide by how many');
      if (st.median) parts.push('<span style="color:#8A5CF6">Median</span> = the middle once they\'re in order');
      if (st.mode) parts.push('<span style="color:#FF7A1A">Mode</span> = the one that shows up most');
      if (st.out) parts.push('<span style="color:#E5484D">Outlier</span> added: watch the mean drop more than the median');
      return parts.length ? parts.join("<br>") : "Turn on mean, median or mode to see each one.";
    },
    controls: (s, st) => B("mean", "Mean", st.mean) + B("median", "Median", st.median) + B("mode", "Mode", st.mode) + B("out", st.out ? "Remove " + s.outlier : "Add a " + s.outlier, st.out),
    act(s, st, a) { st[a] = !st[a]; }
  };

  /* ---- sky through a day ---- */
  const STARS = Array.from({ length: 34 }, (_, i) => [(i * 137) % 620 + 10, (i * 71) % 130 + 12, i % 3 ? 1.6 : 2.6]);
  W.sky = {
    init: s => ({ h: s.hour || 12, play: false }),
    title: s => s.title || "Sky watcher: slide through a whole day",
    art(s, st) {
      const h = st.h, day = h >= 6 && h <= 18, dusk = (h > 5 && h < 8) || (h > 16 && h < 19);
      const sky = day ? (dusk ? "#F4A361" : "#7EC8F2") : "#0E1626";
      let g = `<rect x="0" y="0" width="640" height="220" rx="16" style="fill:${sky}"/>`;
      if (!day || h > 18.5 || h < 6.5) STARS.forEach(([x, y, r]) => g += `<circle cx="${x}" cy="${y}" r="${r}" style="fill:#fff"/>`);
      const arc = t => [40 + 560 * t, 175 - 140 * Math.sin(Math.PI * t)];
      g += `<path d="M40,175 Q320,-105 600,175" style="fill:none;stroke:#fff;stroke-opacity:.35;stroke-width:2;stroke-dasharray:5 7"/>`;
      if (day) { const [x, y] = arc((h - 6) / 12); g += `<circle cx="${x}" cy="${y}" r="26" style="fill:#FFD166"/><circle cx="${x}" cy="${y}" r="36" style="fill:#FFD166;opacity:.25"/>`; }
      else { const t = ((h < 6 ? h + 24 : h) - 18) / 12, [x, y] = arc(t); g += `<circle cx="${x}" cy="${y}" r="18" style="fill:#F5F1DC"/>`; }
      g += `<rect x="0" y="175" width="640" height="65" rx="0" style="fill:#3F8F4E"/><rect x="0" y="225" width="640" height="15" style="fill:#3F8F4E"/>`;
      g += T(40, 205, "EAST", { s: 14, c: "#fff" }) + T(600, 205, "WEST", { s: 14, c: "#fff" });
      const hh = ((h + 11) % 12) + 1, ap = h % 24 < 12 ? "AM" : "PM";
      g += T(320, 212, hh + ":00 " + ap, { s: 18, c: "#fff" });
      return svg(640, 240, g, "The sky at " + hh + " " + ap);
    },
    read: (s, st) => st.h >= 6 && st.h <= 18 ? "Daytime: the Sun is so bright it hides the stars. It rises in the <b>East</b> and sets in the <b>West</b>." : "Nighttime: now you can see the stars. They were there all day!",
    controls: (s, st) => `<span class="small muted">Time:</span>${R(6, 29, st.h)}` + B("play", st.play ? "Pause" : "Play the day", st.play),
    range(s, st, v) { st.h = Number(v) % 24; },
    act(s, st, a, el) { if (a === "play") { st.play = !st.play; tick(el, st.play, 450, () => { st.h = (st.h + 1) % 24; if (st.h < 6) st.h = 6; }); } }
  };

  /* ---- ten frames: make a ten ---- */
  W.tenframe = {
    init: s => ({ moved: 0, busy: false }),
    title: s => s.title || "Ten frames: make a ten!",
    art(s, st) {
      const a = s.a + st.moved, b = s.b - st.moved; let g = "";
      const frame = (x, n, col) => { let f = ""; for (let i = 0; i < 10; i++) { const cx = x + (i % 5) * 48 + 24, cy = 40 + Math.floor(i / 5) * 48 + 24; f += `<rect x="${cx - 24}" y="${cy - 24}" width="48" height="48" style="fill:${C.panel};stroke:${C.ink};stroke-width:2"/>`; if (i < n) f += `<circle cx="${cx}" cy="${cy}" r="17" style="fill:${col}"/>`; } return f; };
      g += frame(20, a, "#2F7BF5") + frame(330, b, "#FF7A1A");
      g += T(140, 160, a === 10 ? "10!" : String(a), { s: 22, c: "#2F7BF5" }) + T(450, 160, String(b), { s: 22, c: "#FF7A1A" }) + T(310, 95, "+", { s: 30 });
      return svg(640, 175, g, "Two ten frames");
    },
    read(s, st) { const a = s.a + st.moved, b = s.b - st.moved; return a === 10 ? `<b>10 + ${b} = ${10 + b}</b>. Making a ten makes it easy!` : `${s.a} + ${s.b}: fill up the first ten frame. It needs ${10 - s.a} more.`; },
    controls: (s, st) => B("go", "Make a ten", true) + B("reset", "Start over"),
    act(s, st, a, el) {
      if (a === "reset") { st.moved = 0; return; }
      if (a === "go" && !st.busy) { st.busy = true; const need = Math.min(10 - s.a, s.b); tick(el, true, 450, () => { if (st.moved < need) st.moved++; if (st.moved >= need) { st.busy = false; tick(el, false); } }); }
    }
  };

  /* ---- base-ten blocks ---- */
  W.blocks = {
    init: s => ({ n: s.n || 0 }),
    title: s => s.title || "Base-ten blocks: tens and ones",
    art(s, st) {
      const h = Math.floor(st.n / 100), t = Math.floor(st.n / 10) % 10, o = st.n % 10; let g = "", x = 20;
      for (let i = 0; i < h; i++) { g += `<rect x="${x}" y="20" width="100" height="100" style="fill:#8A5CF6;stroke:#fff;stroke-width:1"/>`; for (let k = 1; k < 10; k++) g += `<line x1="${x + k * 10}" y1="20" x2="${x + k * 10}" y2="120" style="stroke:#fff;stroke-width:.8"/><line x1="${x}" y1="${20 + k * 10}" x2="${x + 100}" y2="${20 + k * 10}" style="stroke:#fff;stroke-width:.8"/>`; x += 110; }
      for (let i = 0; i < t; i++) { g += `<rect x="${x}" y="20" width="14" height="140" rx="2" style="fill:#2F7BF5"/>`; for (let k = 1; k < 10; k++) g += `<line x1="${x}" y1="${20 + k * 14}" x2="${x + 14}" y2="${20 + k * 14}" style="stroke:#fff;stroke-width:1"/>`; x += 20; }
      x += 12; for (let i = 0; i < o; i++) g += `<rect x="${x + (i % 3) * 18}" y="${110 + Math.floor(i / 3) * 18 - 36}" width="14" height="14" rx="2" style="fill:#FF7A1A"/>`;
      return svg(640, 175, g, st.n + " in base-ten blocks");
    },
    read(s, st) { const h = Math.floor(st.n / 100), t = Math.floor(st.n / 10) % 10, o = st.n % 10; return `<span style="color:#8A5CF6">${h ? h + " hundreds + " : ""}</span><span style="color:#2F7BF5">${t} tens</span> + <span style="color:#FF7A1A">${o} ones</span> = <b>${st.n}</b>`; },
    controls: (s) => B("n:-10", "−10") + B("n:-1", "−1") + B("n:1", "+1") + B("n:10", "+10") + (s.hundreds ? B("n:100", "+100") : "") + B("reset", "Start over"),
    act(s, st, a) { if (a === "reset") st.n = s.n || 0; else st.n = Math.max(0, Math.min(s.hundreds ? 999 : 99, st.n + Number(a.slice(2)))); }
  };

  /* ---- arrays: rows x columns ---- */
  W.array = {
    init: s => ({ r: s.r || 3, c: s.c || 4, count: false }),
    title: s => s.title || "Array builder: rows times columns",
    art(s, st) {
      let g = ""; const d = Math.min(42, 360 / Math.max(st.r, st.c)), x0 = 320 - (st.c * d) / 2;
      for (let i = 0; i < st.r; i++) for (let j = 0; j < st.c; j++) g += `<circle cx="${x0 + j * d + d / 2}" cy="${15 + i * d + d / 2}" r="${d * 0.36}" style="fill:${PAL[i % PAL.length]}"/>` + (st.count ? T(x0 + j * d + d / 2, 15 + i * d + d / 2 + 4, i * st.c + j + 1, { s: Math.max(9, d * 0.3), c: "#fff" }) : "");
      return svg(640, st.r * d + 30, g, st.r + " rows of " + st.c);
    },
    read: (s, st) => `${st.r} rows of ${st.c}` + (st.count ? ` = <b>${st.r * st.c}</b>` : ""),
    controls: (s, st) => B("r:-1", "− row") + B("r:1", "+ row") + B("c:-1", "− column") + B("c:1", "+ column") + B("count", st.count ? "Hide count" : "Count them", st.count),
    act(s, st, a) { if (a === "count") st.count = !st.count; else { const k = a[0], v = Number(a.slice(2)); st[k] = Math.max(1, Math.min(10, st[k] + v)); } }
  };

  /* ---- unit converter: big units split into small units ---- */
  const PAIRS = [["foot", "feet", "inch", "inches", 12, "#2F7BF5"], ["yard", "yards", "foot", "feet", 3, "#19B38A"], ["pound", "pounds", "ounce", "ounces", 16, "#FF7A1A"], ["quart", "quarts", "cup", "cups", 4, "#8A5CF6"]];
  W.convert = {
    init: s => ({ p: 0, n: 2 }),
    title: s => s.title || "Unit converter: big units are made of small units",
    art(s, st) {
      const [b1, bN, s1, sN, k, col] = PAIRS[st.p]; let g = ""; const w = 560 / Math.max(st.n, 1);
      for (let i = 0; i < st.n; i++) { g += `<rect x="${40 + i * w}" y="20" width="${w - 6}" height="46" rx="8" style="fill:${col}"/>` + T(40 + i * w + (w - 6) / 2, 50, "1 " + b1, { s: 13, c: "#fff" }); for (let j = 0; j < k; j++) g += `<rect x="${40 + i * w + j * (w - 6) / k + 1}" y="78" width="${(w - 6) / k - 2}" height="26" rx="3" style="fill:${col};opacity:.45"/>`; }
      return svg(640, 115, g, "Unit converter");
    },
    read(s, st) { const [b1, bN, s1, sN, k] = PAIRS[st.p]; return `${st.n} ${st.n === 1 ? b1 : bN} × ${k} = <b>${st.n * k} ${sN}</b>. Big unit → small unit: multiply.`; },
    controls: (s, st) => PAIRS.map((p, i) => B("p:" + i, p[1] + " → " + p[3], st.p === i)).join("") + B("n:-1", "−") + B("n:1", "+"),
    act(s, st, a) { if (a.startsWith("p:")) st.p = Number(a.slice(2)); else st.n = Math.max(1, Math.min(6, st.n + Number(a.slice(2)))); }
  };

  /* ---- timeline ---- */
  W.timeline = {
    init: () => ({ sel: 0 }),
    title: s => s.title || "Timeline: tap a dot",
    art(s, st) {
      const ev = s.events, ys = ev.map(e => e.y), lo = Math.min(...ys), hi = Math.max(...ys), x = y => 40 + (y - lo) * (560 / ((hi - lo) || 1));
      let g = `<line x1="30" y1="60" x2="610" y2="60" style="stroke:${C.ink};stroke-width:4;stroke-linecap:round"/>`;
      ev.forEach((e, i) => { const on = st.sel === i; g += `<g data-va="e:${i}" style="cursor:pointer"><circle cx="${x(e.y)}" cy="60" r="${on ? 15 : 11}" style="fill:${on ? C.kid : C.panel};stroke:${C.kid};stroke-width:4"/>${T(x(e.y), i % 2 ? 100 : 32, e.l || (e.y < 0 ? -e.y + " BCE" : e.y), { s: 12, c: on ? C.kid : C.muted })}</g>`; });
      return svg(640, 115, g, "Timeline");
    },
    read: (s, st) => `<b>${esc(s.events[st.sel].l || (s.events[st.sel].y < 0 ? -s.events[st.sel].y + " BCE" : s.events[st.sel].y))}</b>: ${esc(s.events[st.sel].t)}`,
    controls: () => B("prev", "← Earlier") + B("next", "Later →"),
    act(s, st, a) { if (a.startsWith("e:")) st.sel = Number(a.slice(2)); else st.sel = Math.max(0, Math.min(s.events.length - 1, st.sel + (a === "next" ? 1 : -1))); }
  };

  /* ---- engine ---- */
  function tick(el, on, ms, fn) {
    const id = el.dataset.viz; clearInterval(TIMERS[id]); delete TIMERS[id];
    if (!on) return;
    TIMERS[id] = setInterval(() => {
      const cur = document.querySelector(`[data-viz="${id}"]`);
      if (!cur) { clearInterval(TIMERS[id]); delete TIMERS[id]; const s = ST[id]; if (s) s.play = false; return; }
      fn(); paint(cur, true);
    }, ms);
  }
  function inner(spec, st) {
    const w = W[spec.type];
    return `<div class="viz-t">${esc(w.title(spec))}</div><div class="viz-art">${w.art(spec, st)}</div><div class="viz-read">${w.read(spec, st)}</div>${(() => { const c = w.controls(spec, st); return c ? `<div class="viz-c">${c}</div>` : ""; })()}`;
  }
  function paint(el, artOnly) {
    const id = el.dataset.viz, spec = SPEC[id], st = ST[id], w = W[spec.type];
    if (artOnly) { el.querySelector(".viz-art").innerHTML = w.art(spec, st); el.querySelector(".viz-read").innerHTML = w.read(spec, st); const r = el.querySelector("[data-vr]"); if (r && document.activeElement !== r) r.value = st.step != null ? st.step : st.h; return; }
    el.innerHTML = inner(spec, st); wire(el);
  }
  function wire(el) {
    const id = el.dataset.viz, spec = SPEC[id], st = ST[id], w = W[spec.type];
    el.querySelectorAll("[data-va]").forEach(b => b.onclick = ev => { ev.preventDefault(); w.act(spec, st, b.getAttribute("data-va"), el); paint(el); });
    el.querySelectorAll("[data-vr]").forEach(r => r.oninput = () => { if (w.range) { w.range(spec, st, r.value); paint(el, true); } });
  }
  window.LVIZ = {
    has: spec => !!(spec && W[spec.type]),
    html(spec, id) {
      if (!spec || !W[spec.type]) return "";
      SPEC[id] = spec; if (!ST[id]) ST[id] = W[spec.type].init(spec);
      return `<div class="viz" data-viz="${esc(id)}">${inner(spec, ST[id])}</div>`;
    },
    bind(root) { (root || document).querySelectorAll("[data-viz]").forEach(wire); },
    types: Object.keys(W)
  };
})();

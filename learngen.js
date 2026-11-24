// "More like this!" bonus rounds: generators that make fresh practice problems for a quest, on demand.
// window.LGEN.byUnit maps a quest id in learn.js to a generator; quests without one get new problems from the
// Saturday refresh instead (the kid's request is saved, and the task builds a "part 2" quest marked more:"<id>").
// Each generator returns one problem in the learn.js format (num / text / mc with hints, traps, why, optional viz).
(function () {
  "use strict";
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[r(0, a.length - 1)];
  const N = n => (n < 0 ? "−" + -n : String(n));
  const P = n => (n < 0 ? "(" + N(n) + ")" : String(n));
  const nz = (a, b) => { let x = 0; while (x === 0) x = r(a, b); return x; };
  const fix = x => Math.round(x * 1e6) / 1e6;
  function num(q, ans, traps, hints, why, extra) {
    const t = {};
    Object.keys(traps || {}).forEach(k => { const v = Number(k); if (!isNaN(v) && Math.abs(v - ans) > 1e-9 && !(String(v) in t)) t[String(fix(v))] = traps[k]; });
    return Object.assign({ type: "num", q, ans: fix(ans), traps: t, hints, why }, extra || {});
  }
  function mc(q, right, wrongs, hints, why, extra) {
    const seen = new Set([String(right)]), all = [{ o: right, ok: true }].concat(wrongs.filter(w => { const k = String(w.o); if (seen.has(k)) return false; seen.add(k); return true; })).sort(() => Math.random() - 0.5);
    const traps = {}; all.forEach((x, i) => { if (!x.ok && x.msg) traps[i] = x.msg; });
    return Object.assign({ type: "mc", q, opts: all.map(x => String(x.o)), ans: all.findIndex(x => x.ok), traps, hints, why }, extra || {});
  }
  const G = {};

  /* Kellan: integers + mean / median / range */
  G.int = () => {
    const t = r(0, 6);
    if (t === 0) { const a = r(-15, -2), b = r(3, 20); return num(`${N(a)} + ${b} = ?`, a + b, { [a - b]: "You moved the wrong way. Adding a positive number moves RIGHT on the number line.", [-(a + b)]: "Close! Which is bigger without its sign? The answer takes that one's sign." }, ["Picture a number line. Start at " + N(a) + ".", "Adding " + b + " means " + b + " hops to the right."], `${N(a)} + ${b} = ${N(a + b)}.`, { viz: { type: "numberline", from: Math.min(-15, a - 1), to: Math.max(15, a + b + 1), start: a } }); }
    if (t === 1) { const a = r(-10, 10), b = r(2, 12); return num(`${N(a)} − (${N(-b)}) = ?`, a + b, { [a - b]: "Subtracting a negative is the same as ADDING a positive. Rewrite it as " + N(a) + " + " + b + ".", [-(a + b)]: "Good rewrite. Now check the sign of your answer." }, ["Minus a negative is a double negative. What does it turn into?", N(a) + " − (" + N(-b) + ") is the same as " + N(a) + " + " + b + "."], `${N(a)} − (${N(-b)}) = ${N(a)} + ${b} = ${N(a + b)}.`); }
    if (t === 2) { const a = r(-12, -2), b = nz(-9, 9); return num(`${P(a)} × ${P(b)} = ?`, a * b, { [-(a * b)]: "Check the sign rule: same signs make a positive, different signs make a negative." }, ["Multiply the sizes first: " + -a + " × " + Math.abs(b) + ".", "Now the sign: same signs = positive, different signs = negative."], `${P(a)} × ${P(b)} = ${N(a * b)}.`); }
    if (t === 3) { const b = nz(-9, 9), q = nz(-9, 9); return num(`${N(b * q)} ÷ ${P(b)} = ?`, q, { [-q]: "Check the sign rule: same signs make a positive, different signs make a negative." }, ["Divide the sizes first: " + Math.abs(b * q) + " ÷ " + Math.abs(b) + ".", "Now the sign: same signs = positive, different signs = negative."], `${N(b * q)} ÷ ${P(b)} = ${N(q)}.`); }
    if (t === 4) { const lo = r(-12, -2), hi = r(5, 25); return num(`It was ${N(lo)}°F at sunrise and ${hi}°F in the afternoon. How many degrees warmer did it get?`, hi - lo, { [hi + lo]: "You did " + hi + " − " + -lo + ". The change is " + hi + " − (" + N(lo) + ").", [-(hi - lo)]: "It got warmer, so the change is positive." }, ["How many degrees from " + N(lo) + " up to 0?", "Then from 0 up to " + hi + ". Add the two."], `${hi} − (${N(lo)}) = ${hi - lo} degrees.`, { viz: { type: "numberline", from: Math.min(-15, lo - 1), to: Math.max(25, hi + 1), start: lo, unit: "°F" } }); }
    const v = [r(60, 100), r(60, 100), r(60, 100), r(60, 100)]; let f = r(60, 100); while ((v.reduce((a, b) => a + b, 0) + f) % 5) f++; if (f > 100) f -= 5; v.push(f);
    const s = v.slice().sort((a, b) => a - b), sum = v.reduce((a, b) => a + b, 0), mean = sum / 5, med = s[2], range = s[4] - s[0];
    if (t === 5) return num(`Test scores: ${v.join(", ")}. What is the MEAN?`, mean, { [med]: "That's the MEDIAN (the middle one). Mean = total ÷ 5.", [sum]: "That's the total. Now divide by how many scores there are.", [range]: "That's the RANGE. Mean = total ÷ how many." }, ["Mean = add them all, then divide by how many.", "The total is " + sum + ". How many scores are there?"], `${sum} ÷ 5 = ${mean}.`);
    return pick([
      () => num(`Scores: ${v.join(", ")}. What is the MEDIAN?`, med, { [mean]: "That's the mean. The median is the middle number once they're in order.", [v[2]]: "Put them in order first! Then find the middle." }, ["Put them in order from smallest to biggest.", "In order: " + s.join(", ") + ". Which is in the middle?"], `In order: ${s.join(", ")}. The middle is ${med}.`),
      () => num(`Scores: ${v.join(", ")}. What is the RANGE?`, range, { [s[4] + s[0]]: "You added. Range = biggest MINUS smallest." }, ["Range = biggest − smallest."], `${s[4]} − ${s[0]} = ${range}.`)
    ])();
  };

  /* Kellan: customary and metric conversions */
  const PAIRS = [["feet", "inches", 12], ["yards", "feet", 3], ["pounds", "ounces", 16], ["quarts", "cups", 4], ["gallons", "quarts", 4], ["kilometers", "meters", 1000], ["meters", "centimeters", 100], ["liters", "milliliters", 1000], ["kilograms", "grams", 1000]];
  G.units = () => {
    const [big, small, k] = pick(PAIRS), metric = k >= 100;
    if (Math.random() < 0.6) {
      const n = metric ? r(12, 95) / 10 : r(2, 9);
      return num(`Convert ${n} ${big} to ${small}.`, n * k, { [n / k]: "You divided. Big unit → small unit means MULTIPLY.", [n * k / 10]: metric ? "Count the zeros in " + k + ". Move the decimal that many places." : "Check how many " + small + " are in 1 " + big.replace(/s$/, "").replace("feet", "foot") + "." }, [`1 ${big.replace(/s$/, "").replace("feet", "foot")} = ${k} ${small}.`, metric ? `Multiply by ${k}: move the decimal ${String(k).length - 1} places right.` : `${n} groups of ${k}.`], `${n} × ${k} = ${fix(n * k)} ${small}. Big unit → small unit: multiply.`);
    }
    const n = metric ? r(2, 9) + (Math.random() < 0.5 ? 0.5 : 0) : r(2, 9), m = fix(n * k);
    return num(`Convert ${m} ${small} to ${big}.`, n, { [m * k]: "You multiplied. Small unit → big unit means DIVIDE.", [n * 10]: "Check how many " + small + " make 1 " + big.replace(/s$/, "").replace("feet", "foot") + "." }, [`${k} ${small} make 1 ${big.replace(/s$/, "").replace("feet", "foot")}.`, `Divide ${m} by ${k}.`], `${m} ÷ ${k} = ${n} ${big}. Small unit → big unit: divide.`);
  };

  /* Rowan: multiply and divide (Singapore style) */
  const ITEMS = [["bags", "apples"], ["boxes", "crayons"], ["teams", "players"], ["tables", "kids"], ["packs", "cards"], ["shelves", "books"]];
  G.mult = () => {
    const t = r(0, 4), [g, it] = pick(ITEMS);
    if (t === 0) { const a = r(3, 9), b = r(3, 9); return num(`${a} × ${b} = ?`, a * b, { [a + b]: "You added. Times means groups of: " + a + " groups of " + b + "." }, [`Start with a fact you know, like 5 × ${b} = ${5 * b}.`], `${a} × ${b} = ${a * b}.`); }
    if (t === 1) { const a = r(3, 9), b = r(3, 9); return num(`There are ${a} ${g}. Each has ${b} ${it}. How many ${it} in all?`, a * b, { [a + b]: "You added " + a + " and " + b + ". But there are " + a + " GROUPS of " + b + ". That's multiplying.", [Math.abs(a - b)]: "You subtracted. We're putting all of them together." }, [`Draw ${a} ${g} with ${b} in each.`, `${a} groups of ${b} = ${a} × ${b}.`], `${a} × ${b} = ${a * b} ${it}.`, { viz: { type: "array", r: a, c: b, title: `${a} ${g} with ${b} ${it} each` } }); }
    if (t === 2) { const a = r(3, 9), b = r(3, 9), c = a * b; return num(`${c} ${it} are shared equally into ${a} ${g}. How many in each?`, b, { [c - a]: "You subtracted. 'Shared equally' means divide.", [c + a]: "You added. 'Shared equally' means divide.", [c * a]: "You multiplied. Sharing makes each group SMALLER." }, [`'Shared equally' means divide: ${c} ÷ ${a}.`, `${a} × ? = ${c}`], `${c} ÷ ${a} = ${b} in each.`); }
    const h = r(3, 9), m = r(2, 4);
    if (t === 3) return num(`Holden has ${h} stickers. Rowan has ${m} times as many. How many stickers does Rowan have?`, h * m, { [h + m]: "You added. '" + m + " times as many' means " + m + " bars, each the size of Holden's " + h + ".", [h * m + h]: "That's both boys together. The question asks only about Rowan." }, [`Draw Holden's bar: ${h}. Rowan's bar is ${m} of those.`], `${m} × ${h} = ${h * m}.`, { viz: { type: "bars", rows: [{ label: "Holden", units: 1, val: h, known: true }, { label: "Rowan", units: m, val: h }] } });
    return num(`Holden has ${h} stickers. Rowan has ${m} times as many. How many do they have ALTOGETHER?`, h * m + h, { [h * m]: "That's Rowan's stickers. Now add Holden's " + h + ".", [h + m]: "'" + m + " times as many' means Rowan has " + m + " × " + h + ". Then add Holden's." }, [`First find Rowan's: ${m} × ${h}.`, `Rowan has ${h * m}. Holden has ${h}. Together?`], `${h * m} + ${h} = ${h * m + h}. Two steps: find Rowan's, then add Holden's.`, { viz: { type: "bars", total: true, rows: [{ label: "Holden", units: 1, val: h, known: true }, { label: "Rowan", units: m, val: h }] } });
  };

  /* Rowan: place value and rounding */
  G.place = () => {
    const t = r(0, 2);
    if (t === 0) { const d = [r(1, 9), r(0, 9), r(0, 9), r(0, 9)]; const n = Number(d.join("")); const pos = r(0, 3), digit = d[3 - pos]; if (!digit) return G.place(); const names = ["ones", "tens", "hundreds", "thousands"]; return num(`What is the VALUE of the ${digit} in the ${names[pos]} place of ${n.toLocaleString("en-US")}?`, digit * Math.pow(10, pos), { [digit]: "That's the digit. What is it worth in the " + names[pos] + " place?", [digit * Math.pow(10, pos + 1)]: "Count the places from the right: ones, tens, hundreds, thousands.", [digit * Math.pow(10, Math.max(0, pos - 1))]: "Count the places from the right: ones, tens, hundreds, thousands." }, ["Name the places from the right: ones, tens, hundreds, thousands."], `A ${digit} in the ${names[pos]} place is worth ${(digit * Math.pow(10, pos)).toLocaleString("en-US")}.`); }
    if (t === 1) { let n = r(101, 989); if (n % 10 === 0) n++; const up = Math.round(n / 10) * 10, other = n % 10 >= 5 ? Math.floor(n / 10) * 10 : Math.ceil(n / 10) * 10; return num(`Round ${n} to the nearest TEN.`, up, { [other]: "Look at the ones digit: " + (n % 10) + ". 5 or more rounds UP, 4 or less rounds DOWN.", [Math.round(n / 100) * 100]: "That's the nearest hundred. Nearest TEN ends in one 0." }, [`${n} is between ${Math.floor(n / 10) * 10} and ${Math.ceil(n / 10) * 10}. Which is closer?`], `The ones digit is ${n % 10}, so it rounds to ${up}.`); }
    let n = r(1010, 9890); if (n % 100 === 0) n += 7; const up = Math.round(n / 100) * 100, other = Math.floor(n / 10) % 10 >= 5 ? Math.floor(n / 100) * 100 : Math.ceil(n / 100) * 100;
    return num(`Round ${n.toLocaleString("en-US")} to the nearest HUNDRED.`, up, { [other]: "Look at the tens digit: " + (Math.floor(n / 10) % 10) + ". 5 or more rounds UP.", [Math.round(n / 10) * 10]: "That's the nearest ten. Nearest hundred ends in 00." }, [`It's between ${(Math.floor(n / 100) * 100).toLocaleString("en-US")} and ${(Math.ceil(n / 100) * 100).toLocaleString("en-US")}.`, "Look at the tens digit."], `The tens digit is ${Math.floor(n / 10) % 10}, so it rounds to ${up.toLocaleString("en-US")}.`);
  };

  /* Rowan: telling time */
  const fmt = (h, m) => { h = ((h - 1) % 12 + 12) % 12 + 1; return h + ":" + String(m).padStart(2, "0"); };
  G.time = () => {
    if (Math.random() < 0.55) {
      const h = r(1, 11), m = pick([15, 20, 30, 35, 40, 45, 50]), k = pick([15, 20, 25, 30, 45]), tot = m + k, right = fmt(h + Math.floor(tot / 60), tot % 60);
      const over = tot >= 60, back = Math.abs(m - k);
      const wrongs = over ? [{ o: h + ":" + tot, msg: "There's no :" + tot + "! After :59 comes the next hour." }, { o: fmt(h + 2, tot % 60), msg: "That's an hour too far. We only added " + k + " minutes." }]
        : [{ o: fmt(h + 1, tot), msg: "That adds an extra hour. We only added " + k + " minutes." }, { o: fmt(h, back === tot ? (tot + 5) % 60 : back), msg: "Adding minutes moves the clock FORWARD. Count on from :" + String(m).padStart(2, "0") + "." }];
      return mc(`It's ${fmt(h, m)}. What time will it be in ${k} minutes?`, right, wrongs, [`How many minutes until the next o'clock?`, `${60 - m} minutes gets you to ${fmt(h + 1, 0)}. How many are left?`], `${fmt(h, m)} + ${k} minutes = ${right}.`, { viz: { type: "clock", h, m, title: `Start at ${fmt(h, m)} and add ${k} minutes` } });
    }
    const h = r(1, 10), m2 = pick([10, 15, 20, 30, 40, 45]);
    return num(`Practice starts at ${h}:00 and ends at ${fmt(h + 1, m2)}. How many MINUTES long is it?`, 60 + m2, { [100 + m2]: "An hour isn't 100 minutes. It's 60.", [m2]: "That's just the part after " + fmt(h + 1, 0) + ". Don't forget the hour.", [60]: "That gets you to " + fmt(h + 1, 0) + ". It goes " + m2 + " more minutes." }, [`${h}:00 to ${fmt(h + 1, 0)} is how many minutes?`, `60 + ${m2} = ?`], `60 + ${m2} = ${60 + m2} minutes.`);
  };

  /* Holden: add and subtract to 20 */
  G.add20 = () => {
    if (Math.random() < 0.55) {
      const a = r(6, 9), b = r(11 - a, 9), need = 10 - a, left = b - need;
      return num(pick([`${a} + ${b} = ?`, `Holden has ${a} Legos. He gets ${b} more. How many now?`, `${a} dogs are at the park. ${b} more come. How many dogs?`]), a + b, { [Math.abs(a - b)]: "You took away. PLUS means put together.", [a + b - 1]: "So close! Count up from " + a + " " + b + " times." }, [`Make a ten! ${a} needs ${need} more to make 10.`, `Take ${need} from the ${b}. What's left?`], `${a} + ${need} = 10, plus ${left} more = ${a + b}. Making a ten makes it easy!`, { viz: { type: "tenframe", a, b }, walk: [{ q: `${a} needs how many more to make 10?`, opts: [String(need), String(b)].filter((x, i, s) => s.indexOf(x) === i).concat(need === b ? [String(need + 1)] : []), c: 0, ok: `${need}! ${a} + ${need} = 10.` }, { q: `${b} is ${need} and…`, opts: [String(left), String(left + 1)], c: 0, ok: `${left}! So you have 10 and ${left} more.` }, { q: `10 + ${left} =`, opts: [String(10 + left), String(9 + left)], c: 0, ok: `${10 + left}! Type it in.` }] });
    }
    const c = r(11, 18), d = r(3, 9);
    return num(pick([`${c} − ${d} = ?`, `There are ${c} birds. ${d} fly away. How many are left?`, `Holden has ${c} crackers. He eats ${d}. How many are left?`]), c - d, { [c + d]: "They go AWAY, so there are fewer. Take away!", [c - d + 1]: "Close! Count back from " + c + " " + d + " times." }, [`Take away ${c - 10} first to get to 10.`, `Then take away ${d - (c - 10)} more.`], `${c} − ${d} = ${c - d}.`);
  };

  /* Holden: tens and ones */
  G.tens = () => {
    const n = r(21, 89), t = Math.floor(n / 10), o = n % 10, k = r(0, 3);
    if (k === 0 && o !== t) return num(`How many TENS are in ${n}?`, t, { [o]: o + " is the ONES. The tens digit is on the left.", [n]: "How many groups of ten fit in " + n + "?" }, ["The tens digit is the one on the left."], `${n} = ${t} tens and ${o} ones.`, { viz: { type: "blocks", n } });
    if (k === 1) return num(`${t} tens and ${o} ones make what number?`, n, { [t + o]: t + " TENS is " + t * 10 + ", not " + t + ".", [o * 10 + t]: "Tens go first, on the left." }, [`${t} tens = ${t * 10}.`], `${t * 10} + ${o} = ${n}.`);
    if (k === 2) return num(`What number is 10 MORE than ${n}?`, n + 10, { [n + 1]: "That's 1 more. 10 more makes the TENS digit go up.", [n - 10]: "That's 10 LESS." }, ["Adding 10 makes the tens digit go up by one."], `${n} + 10 = ${n + 10}.`, { viz: { type: "blocks", n } });
    return num(`What number is 10 LESS than ${n}?`, n - 10, { [n - 1]: "That's 1 less. 10 less makes the TENS digit go down.", [n + 10]: "That's 10 MORE." }, ["Taking away 10 makes the tens digit go down by one."], `${n} − 10 = ${n - 10}.`, { viz: { type: "blocks", n } });
  };

  /* Holden: shapes */
  const SIDES = [["triangle", 3], ["square", 4], ["rectangle", 4], ["hexagon", 6], ["trapezoid", 4]];
  const OBJ = [["a ball", "sphere"], ["a soup can", "cylinder"], ["a block", "cube"], ["an ice cream cone", "cone"], ["a box of tissues", "rectangular prism"]];
  G.shapes = () => {
    if (Math.random() < 0.5) { const [s, n] = pick(SIDES); return num(`How many sides does a ${s} have?`, n, { [n - 1]: "Count again, slowly. Touch each side.", [n + 1]: "Count again, slowly. Touch each side." }, [`Picture a ${s}. Count the straight sides.`], `A ${s} has ${n} sides and ${n} corners.`); }
    const [o, s] = pick(OBJ); const others = OBJ.map(x => x[1]).filter(x => x !== s).sort(() => Math.random() - 0.5).slice(0, 2);
    return mc(`${o[0].toUpperCase() + o.slice(1)} is shaped like a…`, s, others.map(x => ({ o: x, msg: x === "circle" ? "A circle is flat." : null })), [`Picture holding ${o}. Is it round, flat on top, pointy?`], `${o[0].toUpperCase() + o.slice(1)} is a ${s}.`);
  };

  /* Holden: equal parts */
  const FOOD = ["pizza", "pie", "sandwich", "cookie", "tortilla"];
  G.equal = () => {
    const k = r(0, 3), f = pick(FOOD);
    if (k === 0) { const n = pick([2, 4]); return mc(`A ${f} is cut into ${n} EQUAL parts. Each part is called a…`, n === 2 ? "half" : "fourth", [{ o: n === 2 ? "fourth" : "half", msg: n === 2 ? "Fourths means 4 equal parts. This one has 2." : "Halves means 2 equal parts. This one has 4." }, { o: "whole", msg: "The whole is the entire " + f + " before it's cut." }], [`${n} equal parts.`], n === 2 ? "2 equal parts are halves." : "4 equal parts are fourths (also called quarters).", { viz: { type: "fraction", parts: n } }); }
    if (k === 1) return mc(`Which piece of the same ${f} is BIGGER?`, "one half", [{ o: "one fourth", msg: "Tricky! 4 is more than 2, but MORE pieces means each piece is SMALLER." }], ["Sharing with 1 friend or with 3 friends: when is your piece bigger?"], "A half is bigger than a fourth. More pieces = smaller pieces.", { viz: { type: "fraction", shape: "compare" } });
    if (k === 2) { const n = pick([2, 4]); return num(`How many ${n === 2 ? "halves" : "fourths"} make one whole?`, n, { [n === 2 ? 4 : 2]: n === 2 ? "That's fourths. How many HALVES?" : "That's halves. How many FOURTHS?", 1: "One piece is only part of it." }, [`Cut a ${f} into ${n === 2 ? "halves" : "fourths"}. How many pieces?`], `${n} ${n === 2 ? "halves" : "fourths"} make 1 whole.`); }
    const n = pick([2, 4]); return mc(`${n} friends share a ${f} equally. Each friend gets one…`, n === 2 ? "half" : "fourth", [{ o: n === 2 ? "fourth" : "half", msg: n === 2 ? "There are only 2 friends, so 2 equal parts." : "A half is for 2 people. There are 4 friends." }, { o: "whole", msg: "If everyone shares, nobody gets the whole thing." }], [`${n} friends means ${n} equal parts.`], `${n} equal parts, so each friend gets one ${n === 2 ? "half" : "fourth"}.`, { viz: { type: "fraction", parts: n } });
  };

  window.LGEN = {
    gens: G,
    byUnit: { "k-int": "int", "k-units": "units", "r-mult": "mult", "r-place": "place", "r-time": "time", "h-add": "add20", "h-tens": "tens", "h-shapes": "shapes", "h-equal": "equal" },
    round(unitId, n) { const g = G[this.byUnit[unitId]]; if (!g) return null; return Array.from({ length: n || 5 }, (_, i) => Object.assign(g(), { id: "b" + i })); }
  };
})();

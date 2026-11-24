# Eby Launchpad

Family app for Kellan, Rowan and Holden: habits, SMART goals, missions, chores + coins, rewards, Brave Book, wins. Syncs live through Firebase (project `eby-launchpad`).

- `index.html` — the whole app (single file)
- `config.js` — Firebase client config (public by design; access is enforced by `firestore.rules`)
- `seasons.js` — Alpha-style 8-week seasons: dates, the three skill tracks (milestone templates, picks, Test2Pass), the Season Picker quiz, weekly debate and money-talk topics. Edit this to add a season or change content; kid progress lives in Firestore under `kids/<id>.seasons`.
- `learn.js` — Learn tab content: guided practice units per boy, built from their Battle Ground Academy schoolwork (parent portal assignments for Kellan; BGA's published curriculum for Rowan and Holden until teacher newsletters come in). Each problem has hints, mistake-specific feedback (traps), an optional step-by-step walkthrough, and a why. Kid progress lives in Firestore under `kids/<id>.learn`; never reuse a problem id. Parent Mode shows a Learn table per boy with the problems to talk about.
- `learnviz.js` — picture explorers for the Learn tab (moon phases, number line, pizza fractions, bar models, clock, shapes, data lab, sky, ten frames, base-ten blocks, arrays, unit converter, timeline). Attach them in learn.js under `window.LEARN_VIZ` (units = Explore screen, problems = shown above a problem). Learn is a game: quests with 3 stars, combos, daily streak, a 60-second Speed Round per boy (`speed` in learn.js) with a family high-score board, confetti and sounds (muteable).
- `firestore.rules` — the security rules currently published in the Firebase console

## Fresh content (automated)
`fresh.js` holds dated batches of new missions, games and brave-thing quests. A scheduled Claude task appends a new batch every few days (newest batch first in the array). The app shows the newest batch as "New this week". Never remove old batches; never change `index.html` from that task.

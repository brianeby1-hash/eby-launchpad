# Eby Launchpad

Family app for Kellan, Rowan and Holden: habits, SMART goals, missions, chores + coins, rewards, Brave Book, wins. Syncs live through Firebase (project `eby-launchpad`).

- `index.html` — the whole app (single file)
- `config.js` — Firebase client config (public by design; access is enforced by `firestore.rules`)
- `firestore.rules` — the security rules currently published in the Firebase console

## Fresh content (automated)
`fresh.js` holds dated batches of new missions, games and brave-thing quests. A scheduled Claude task appends a new batch every few days (newest batch first in the array). The app shows the newest batch as "New this week". Never remove old batches; never change `index.html` from that task.

// Fresh content deck. A scheduled task appends a new batch every few days.
// Keep ALL past batches (newest first). The app shows the newest batch as "New this week"
// and keeps older ones reachable. Missions: {title, type, steps[], for: "all"|"kellan"|"rowan"|"holden"}.
// Types: Learn, Build, Body, Brave, Money, Life skill, Kindness. Keep steps to 3-4 levels, easiest first.
window.FRESH = [
  {
    week: "2026-10-21",
    theme: "Liftoff week",
    missions: [
      {for:"kellan", title:"Plan and cook one family dinner start to finish", type:"Life skill", steps:["Pick a recipe and write the shopping list","Shop for it with Mom or Dad","Cook it (grown-up nearby)","Serve it and clean the kitchen"]},
      {for:"rowan", title:"Learn to juggle two balls", type:"Learn", steps:["Toss one ball hand to hand 20 times","Two balls: 5 catches in a row","Two balls: 20 catches in a row"]},
      {for:"holden", title:"Read a whole book to Mom or Dad", type:"Learn", steps:["Pick the book","Read half of it","Read the rest and tell what happened"]},
      {for:"all", title:"Write and mail a real letter to Grandma and Grandpa", type:"Kindness", steps:["Decide 3 things to tell them","Write it (ask for spelling help if you want)","Address the envelope and mail it"]}
    ],
    games: [
      {title:"Compliment Tag", how:"Whoever is 'it' has to give a real, specific compliment to tag someone. 'You're nice' doesn't count. 'You helped Holden find his shoe' counts."},
      {title:"Two Truths and a Brave", how:"Each person says two true things they did this week and one brave thing they WANT to do. Others guess which is the brave one."}
    ],
    quests: [
      "Ask a grown-up (not Mom or Dad) a question about their job.",
      "Do 10 push-ups before breakfast.",
      "Say thank you to a teacher and tell them one specific thing they did well."
    ]
  }
];

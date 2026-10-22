// Fresh content deck. A scheduled task appends a new batch every few days.
// Keep ALL past batches (newest first). The app shows the newest batch as "New this week"
// and keeps older ones reachable. Missions: {title, type, steps[], for: "all"|"kellan"|"rowan"|"holden"}.
// Types: Learn, Build, Body, Brave, Money, Life skill, Kindness. Keep steps to 3-4 levels, easiest first.
window.FRESH = [
  {
    week: "2026-10-22",
    theme: "Leaf Pile Legends",
    missions: [
      {for:"kellan", title:"Run a Saturday leaf-raking business on our street", type:"Money", steps:["Decide your price per yard and write it on a flyer","Knock on 3 neighbor doors with Dad nearby and make your pitch out loud","Rake at least one yard start to finish (bag the leaves too)","Split your money: some to save, some to spend, some to give, and write down why"]},
      {for:"rowan", title:"Give a 2-minute talk at dinner about your favorite animal", type:"Brave", steps:["Pick the animal and find 3 cool facts about it from a book","Practice saying it to a dog first (they are great listeners)","Stand up at dinner, say it to the whole family, and look at people while you talk","Take one question from a brother and answer it"]},
      {for:"holden", title:"Build a fort for the dogs out of blankets and chairs", type:"Build", steps:["Pick a spot and gather 4 chairs and 3 blankets","Build it so the roof does not fall when a dog goes in","Put a dog bed or towel inside and invite a dog in","Draw a picture of your fort and tape it to the fridge"]},
      {for:"all", title:"Family Fitness Streak: 5 days in a row", type:"Body", steps:["Pick one move everyone can do (jumping jacks, wall sit, bear crawl)","Do it together for 2 minutes every day right after school","If someone misses a day, nobody quits: just never miss twice","Day 5: do it outside in the leaves and take a victory lap around the yard"]}
    ],
    games: [
      {title:"Feelings Thermometer", how:"One person names a thing that happened today. Everyone holds up fingers 1 to 5 for how big the feeling was, then says what word fits it: annoyed, nervous, pumped, proud, bummed. Guess each other's number first."},
      {title:"Coach or Critic?", how:"One person says a sentence like 'I messed up my spelling test.' The next person answers twice: once as the mean Critic voice, once as the Coach voice. Everyone votes which one they would want in their head."}
    ],
    quests: [
      "Order your own food at a restaurant or drive-thru window, loud and clear, with no help.",
      "Pet the dogs and tell them one thing you are not good at YET and one thing you are going to practice.",
      "Introduce yourself to a kid you do not know at school or practice and ask them their name."
    ]
  },
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

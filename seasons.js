// Seasons: Alpha-style 8-week skill blocks. Each boy owns one skill per season and ends with a live
// "Test2Pass" in front of the family. Edit this file to add a season, change milestones, or add topics.
// The app picks the season whose dates include today (else the next upcoming one, else the latest).
// Kid progress lives in Firestore (kid.seasons[<season id>]); changing text here does not wipe progress,
// but milestones are copied into a kid's record when a parent locks in his pick, so later template edits
// only reach kids locked in afterwards (parents can still edit each milestone in Parent Mode).
// Placeholders in milestone/test text: {pick} = the specific thing he chose (business, topic, race).
window.SEASONS = [
  {
    id: "s1-2026",
    name: "Season 1",
    kickoff: "2026-10-25",          // Sunday kickoff
    start: "2026-10-26",            // Monday of Week 1
    finale: "2026-12-19",           // Finale Day (Saturday)
    weeks: 8,
    playbook: "https://claude.ai/artifact/BWwC7JU9ZqrJDYYbr2ondV",
    defaults: { kellan: "business", rowan: "speaking", holden: "hard" },  // the plan from the playbook; the quiz can suggest otherwise
    debate: [
      "Kids should get paid for chores.",
      "Homework should be banned.",
      "Dogs make better pets than cats.",
      "Everyone should learn to code.",
      "Thanksgiving should be longer than Christmas break.",
      "Video games are good for you.",
      "Kids should be allowed to vote.",
      "Robots and AI will make life better."
    ],
    money: [
      "Needs vs. wants: sort 10 things the family bought this month.",
      "Where money comes from: what Dad's job actually sells.",
      "Saving: why $10 saved now beats $10 next year.",
      "Profit: price minus cost, using Kellan's business as the example.",
      "Giving: pick a cause together and decide how much to give.",
      "Compounding: the penny-doubling story, run on a calculator.",
      "Taxes: where sales tax goes, a lesson from Dad's world.",
      "Investing: owning a piece of a company, reviewing each boy's stock."
    ]
  }
];

// The three skill tracks. Every season reuses them; add a new track here and it shows up everywhere.
// `picks` are the starter choices offered to a kid; `ageMax` hides an option for older kids, `ageMin` for younger.
window.TRACKS = {
  business: {
    name: "Business",
    tagline: "Run a real business",
    color: "#19B38A",
    pickQ: "What will you sell?",
    picks: [
      { t: "Hot cocoa and cookie stand at a December event" },
      { t: "Holiday gift-wrapping service for neighbors" },
      { t: "Flip used stuff online (with Dad's account)", ageMin: 10 },
      { t: "Make and sell holiday crafts or ornaments" }
    ],
    milestones: [
      "Pick the business ({pick}). Write a one-page plan: what you're selling, who buys it, and the price.",
      "Figure out cost per item and how many sales it takes to break even. Sign a loan agreement with Dad ($100 at 10%).",
      "Ask 10 neighbors or family friends if they'd buy it and for how much. Change the plan if you need to.",
      "Buy supplies, make a test batch, and design a flyer or sign.",
      "Have coffee with a business owner Dad knows and bring 3 questions. Practice your pitch on family over Thanksgiving.",
      "First sales day. Write down every sale and every cost.",
      "Second sales day. Fix one thing that didn't work the first time.",
      "Build your profit-and-loss sheet. Decide how to split the profit: spend, save, invest, give."
    ],
    test: "Board meeting: present your profit-and-loss in 5 minutes to Mom, Dad and an outside investor. Pay back the loan plus interest, and answer 3 questions about your numbers without help."
  },
  speaking: {
    name: "Speaking",
    tagline: "Give a 5-minute talk",
    color: "#FF7A1A",
    pickQ: "What will your talk be about?",
    picks: [
      { t: "Something I'm really into (my favorite sport, game or animal)" },
      { t: "How to do something I'm good at" },
      { t: "A person I look up to" },
      { t: "A cool place or invention and how it works" }
    ],
    milestones: [
      "Pick your topic ({pick}). Find 3 surprising facts about it.",
      "Watch 2 short kid TED talks with Dad. Name one thing each speaker did well.",
      "Outline the talk: a hook, 3 main points, and a strong ending.",
      "First full run-through for Mom or Dad, notes allowed. Film it.",
      "Give it to family over Thanksgiving, notes allowed. Get one piece of feedback from each person.",
      "Cut down to note cards with keywords only. Add one prop or picture.",
      "Run it twice with no notes. Practice eye contact and pausing.",
      "Dress rehearsal, filmed and timed between 4 and 6 minutes."
    ],
    test: "The talk: stand up and give it, filmed, in front of the family. Finish in 4 to 6 minutes without reading, then take 2 questions from the audience."
  },
  hard: {
    name: "Hard thing",
    tagline: "Train for a big challenge",
    color: "#8A5CF6",
    pickQ: "What's your big challenge?",
    picks: [
      { t: "Run a 1-mile kids' race without stopping", ageMax: 8 },
      { t: "Run a 5K race without stopping", ageMin: 9 },
      { t: "Swim 4 pool lengths without stopping" },
      { t: "Do 25 push-ups in a row", ageMin: 9 },
      { t: "Climb to the top of the rock wall" }
    ],
    milestones: [
      "Pick your challenge ({pick}) and sign up. Test yourself: how far can you go right now?",
      "Train 3 times this week. Log every practice.",
      "Train 3 times. Go a little longer or harder than last week.",
      "Get halfway to the goal without stopping.",
      "Keep it going over Thanksgiving: a family turkey-trot practice.",
      "Get three-quarters of the way without stopping.",
      "Do the whole thing in practice, no stopping.",
      "Easy week. Lay out your gear and make a plan for the big day."
    ],
    test: "The challenge: do it for real ({pick}) with Mom or Dad there. Finish without stopping, and bring your medal, bib or proof to Finale Day."
  }
};

// Season Picker quiz. Each answer adds points to one or more tracks; the top score is the suggestion.
// Keep it short and kid-friendly; younger kids get the same questions.
window.SEASON_QUIZ = [
  { id: "fun", q: "Which sounds MOST fun?", opts: [
    { t: "Running my own little business and earning money", s: { business: 3 } },
    { t: "Standing up and teaching everyone something cool", s: { speaking: 3 } },
    { t: "Training hard to finish a big challenge", s: { hard: 3 } } ] },
  { id: "saturday", q: "A free Saturday. What do you do?", opts: [
    { t: "Make something people would want to buy", s: { business: 2 } },
    { t: "Put on a show or make a video for the family", s: { speaking: 2 } },
    { t: "Play outside until I'm tired", s: { hard: 2 } },
    { t: "Build or invent something", s: { business: 1, speaking: 1 } } ] },
  { id: "scary", q: "Which one feels the SCARIEST? (Being brave is the point.)", opts: [
    { t: "Talking in front of a bunch of people", s: { speaking: 2 } },
    { t: "Asking a grown-up I don't know to buy something", s: { business: 2 } },
    { t: "Being out of breath and still keeping going", s: { hard: 2 } } ] },
  { id: "proud", q: "What would make you proudest at the end?", opts: [
    { t: "Holding money I earned myself", s: { business: 2 } },
    { t: "Everyone clapping after my talk", s: { speaking: 2 } },
    { t: "A medal around my neck", s: { hard: 2 } } ] },
  { id: "hero", q: "Who's more like you?", opts: [
    { t: "A shop owner", s: { business: 1 } },
    { t: "A YouTuber or news anchor", s: { speaking: 1 } },
    { t: "An athlete", s: { hard: 1 } },
    { t: "An inventor", s: { business: 1 } } ] }
];

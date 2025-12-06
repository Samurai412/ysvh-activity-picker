const activities = [
    {
        name: "Jukebox Party",
        url: "https://jukeboxparty.tk/",
        category: "Music",
        description: "Host a music party and share tunes with friends!"
    },
    {
        name: "Just Sketch Me",
        url: "https://app.justsketch.me/",
        category: "Creative",
        description: "Pose and draw 3D figure references together."
    },
    {
        name: "Just a Minute",
        url: "https://jinay.dev/just-a-minute/",
        category: "Challenge",
        description: "Test your time estimation skills - can you guess a minute?"
    },
    {
        name: "8values Political Quiz",
        url: "https://8values.github.io/",
        category: "Quiz",
        description: "Discover your political values through this comprehensive quiz."
    },
    {
        name: "Online Sequencer",
        url: "https://onlinesequencer.net/",
        category: "Music",
        description: "Create music together with this online sequencer."
    },
    {
        name: "BeepBox",
        url: "https://www.beepbox.co/",
        category: "Music",
        description: "Make chiptune music in your browser!"
    },
    {
        name: "Spatial",
        url: "https://spatial.io/",
        category: "Social",
        description: "Hang out in virtual spaces with custom avatars."
    },
    {
        name: "Music IQ Quiz",
        url: "https://www.themusiclab.org/quizzes/miq",
        category: "Quiz",
        description: "Test your musical intelligence with science-backed quizzes."
    },
    {
        name: "Kung Fu Chess",
        url: "https://www.kfchess.com",
        category: "Strategy",
        description: "Real-time chess with no turns - pure chaos!"
    },
    {
        name: "Death by AI",
        url: "https://deathbyai.gg",
        category: "AI Game",
        description: "Try to survive scenarios judged by AI - hilarious and deadly!"
    },
    {
        name: "Bloob.io",
        url: "https://bloob.io",
        category: "Party Games",
        description: "Collection of fun multiplayer minigames."
    },
    {
        name: "Voximity",
        url: "https://voximity.chat/",
        category: "Social",
        description: "Proximity voice chat for virtual hangouts."
    },
    {
        name: "Tabletop Club",
        url: "https://drwhut.itch.io/tabletop-club",
        category: "Board Games",
        description: "Open-source tabletop game simulator."
    },
    {
        name: "Tales of Fablecraft",
        url: "https://store.steampowered.com/app/2176900/Tales_of_Fablecraft/",
        category: "TTRPG",
        description: "Collaborative storytelling TTRPG adventure."
    },
    {
        name: "Chesscraft",
        url: "https://chesscraft.ca/",
        category: "Strategy",
        description: "Create and play custom chess variants."
    },
    {
        name: "FreeCiv Web",
        url: "https://www.freecivx.net/",
        category: "Strategy",
        description: "Free browser-based Civilization clone."
    },
    {
        name: "FreeCiv",
        url: "https://www.freeciv.org/",
        category: "Strategy",
        description: "Classic open-source Civilization game."
    },
    {
        name: "Blunder Chess",
        url: "https://blunderchess.net/",
        category: "Strategy",
        description: "Chess variant where mistakes are encouraged!"
    },
    {
        name: "Odie.us",
        url: "https://odie.us/",
        category: "Creative",
        description: "Interactive visual art experience."
    },
    {
        name: "GeoHunt",
        url: "https://geohunt.vercel.app/",
        category: "Geography",
        description: "GeoGuessr-style location guessing game."
    },
    {
        name: "Movember Conversations",
        url: "https://conversations.movember.com/en/conversations/",
        category: "Social",
        description: "Practice meaningful conversation skills."
    },
    {
        name: "Really Boring Website",
        url: "https://really.boring.website/lobby",
        category: "Party Games",
        description: "Surprisingly fun browser party games!"
    },
    {
        name: "Wiki Conflict",
        url: "https://wikiconflict.com/",
        category: "Educational",
        description: "Learn history through Wikipedia conflicts."
    },
    {
        name: "Go European",
        url: "https://www.goeuropean.org/",
        category: "Strategy",
        description: "Play the ancient game of Go online."
    },
    {
        name: "Trivia Duel",
        url: "https://www.triviaduel.com/",
        category: "Quiz",
        description: "Compete in head-to-head trivia battles."
    },
    {
        name: "TETR.IO",
        url: "https://tetr.io/",
        category: "Puzzle",
        description: "Competitive modern Tetris - fast and furious!"
    },
    {
        name: "Hide and Seek World",
        url: "https://hideandseek.world/",
        category: "Geography",
        description: "Global hide and seek with real locations."
    },
    {
        name: "Alone Together",
        url: "https://www.enchambered.com/puzzles/alone-together/",
        category: "Puzzle",
        description: "Cooperative escape room puzzle experience."
    },
    {
        name: "Chained",
        url: "https://moncee.itch.io/chained",
        category: "Co-op",
        description: "Cooperative platformer - stay connected!"
    },
    {
        name: "We Ending Friendships",
        url: "https://itch.io/queue/c/4028198/we-ending-friendships-with-this-one?game_id=95798",
        category: "Co-op",
        description: "Collection of friendship-testing co-op games."
    },
    {
        name: "ChronoPhoto",
        url: "https://www.chronophoto.app/",
        category: "Quiz",
        description: "Guess when historical photos were taken."
    },
    {
        name: "Globle",
        url: "https://globle-game.com/game",
        category: "Geography",
        description: "Guess the mystery country on a 3D globe."
    },
    {
        name: "Gidd.io",
        url: "https://gidd.io/games",
        category: "Party Games",
        description: "Free party games for groups."
    },
    {
        name: "Locator",
        url: "https://store.steampowered.com/app/2459030/Locator/",
        category: "Detective",
        description: "Detective location-finding game."
    },
    {
        name: "Murdle",
        url: "https://murdle.com/",
        category: "Puzzle",
        description: "Daily murder mystery logic puzzles."
    },
    {
        name: "Geotastic",
        url: "https://geotastic.net/quick-play",
        category: "Geography",
        description: "Free GeoGuessr alternative with quick play."
    },
    {
        name: "Phantom Chess",
        url: "https://www.phantomchess.in/",
        category: "Strategy",
        description: "Chess variant with hidden pieces."
    },
    {
        name: "Secret Hitler Online",
        url: "https://secret-hitler.online/",
        category: "Social Deduction",
        description: "Classic social deduction - find the fascists!"
    },
    {
        name: "The Wiki Game",
        url: "https://www.thewikigame.com/",
        category: "Educational",
        description: "Race to connect Wikipedia articles."
    },
    {
        name: "Six Degrees of Wikipedia",
        url: "https://www.sixdegreesofwikipedia.com/",
        category: "Educational",
        description: "Find the shortest path between Wikipedia pages."
    },
    {
        name: "Chess Guessr",
        url: "https://www.chessguessr.com/",
        category: "Strategy",
        description: "Guess the next move in famous chess games."
    },
    {
        name: "Nerdle",
        url: "https://nerdlegame.com/",
        category: "Puzzle",
        description: "Wordle but with math equations!"
    },
    {
        name: "10 Second Mixtape",
        url: "https://scottts.itch.io/10-second-mixtape",
        category: "Music",
        description: "Create music in 10-second bursts."
    },
    {
        name: "Scattergories",
        url: "https://swellgarfo.com/scattergories/",
        category: "Word Games",
        description: "Classic word game - think fast!"
    },
    {
        name: "Tabletopia",
        url: "https://tabletopia.com/",
        category: "Board Games",
        description: "Massive library of digital board games."
    },
    {
        name: "Gyra",
        url: "https://lucaju.itch.io/gyra",
        category: "Action",
        description: "Beyblade-style spinning top battles!"
    },
    {
        name: "Time to React",
        url: "https://ottoojala.itch.io/time-to-react",
        category: "Challenge",
        description: "Test your reaction time!"
    },
    {
        name: "Ghost Game",
        url: "https://literal-rorquals.itch.io/ghost-game",
        category: "Word Games",
        description: "Spooky word guessing game."
    },
    {
        name: "Mosaic",
        url: "https://winston-yallow.itch.io/mosaic",
        category: "Puzzle",
        description: "Relaxing puzzle game with tiles."
    },
    {
        name: "Dles",
        url: "https://dles.aukspot.com/",
        category: "Puzzle",
        description: "Collection of daily puzzle games."
    },
    {
        name: "Language Guessr",
        url: "https://languageguessr.io/",
        category: "Quiz",
        description: "Guess the language being spoken."
    },
    {
        name: "Dice Chess",
        url: "https://www.dicechess.com/",
        category: "Strategy",
        description: "Chess with dice - embrace the chaos!"
    }
];

// Extract unique categories
const categories = [...new Set(activities.map(a => a.category))].sort();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { activities, categories };
}

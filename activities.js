const activities = [
    {
        name: "Jukebox Party",
        url: "https://jukeboxparty.tk/",
        tags: ["Music", "Multiplayer", "Social"],
        description: "Host a music party and share tunes with friends!"
    },
    {
        name: "Just Sketch Me",
        url: "https://app.justsketch.me/",
        tags: ["Creative", "Art", "Tools"],
        description: "Pose and draw 3D figure references together."
    },
    {
        name: "Just a Minute",
        url: "https://jinay.dev/just-a-minute/",
        tags: ["Challenge", "Casual", "Quick"],
        description: "Test your time estimation skills - can you guess a minute?"
    },
    {
        name: "8values Political Quiz",
        url: "https://8values.github.io/",
        tags: ["Quiz", "Educational", "Discussion"],
        description: "Discover your political values through this comprehensive quiz."
    },
    {
        name: "Online Sequencer",
        url: "https://onlinesequencer.net/",
        tags: ["Music", "Creative", "Tools"],
        description: "Create music together with this online sequencer."
    },
    {
        name: "BeepBox",
        url: "https://www.beepbox.co/",
        tags: ["Music", "Creative", "Retro"],
        description: "Make chiptune music in your browser!"
    },
    {
        name: "Spatial",
        url: "https://spatial.io/",
        tags: ["Social", "VR", "Multiplayer"],
        description: "Hang out in virtual spaces with custom avatars."
    },
    {
        name: "Music IQ Quiz",
        url: "https://www.themusiclab.org/quizzes/miq",
        tags: ["Quiz", "Music", "Educational"],
        description: "Test your musical intelligence with science-backed quizzes."
    },
    {
        name: "Kung Fu Chess",
        url: "https://www.kfchess.com",
        tags: ["Strategy", "Multiplayer", "Chaos"],
        description: "Real-time chess with no turns - pure chaos!"
    },
    {
        name: "Death by AI",
        url: "https://deathbyai.gg",
        tags: ["AI", "Party", "Funny"],
        description: "Try to survive scenarios judged by AI - hilarious and deadly!"
    },
    {
        name: "Bloob.io",
        url: "https://bloob.io",
        tags: ["Party", "Multiplayer", "Minigames"],
        description: "Collection of fun multiplayer minigames."
    },
    {
        name: "Voximity",
        url: "https://voximity.chat/",
        tags: ["Social", "Voice Chat", "Tools"],
        description: "Proximity voice chat for virtual hangouts."
    },
    {
        name: "Tabletop Club",
        url: "https://drwhut.itch.io/tabletop-club",
        tags: ["Board Games", "Multiplayer", "Sandbox"],
        description: "Open-source tabletop game simulator."
    },
    {
        name: "Tales of Fablecraft",
        url: "https://store.steampowered.com/app/2176900/Tales_of_Fablecraft/",
        tags: ["TTRPG", "Co-op", "Storytelling"],
        description: "Collaborative storytelling TTRPG adventure."
    },
    {
        name: "Chesscraft",
        url: "https://chesscraft.ca/",
        tags: ["Strategy", "Chess", "Creative"],
        description: "Create and play custom chess variants."
    },
    {
        name: "FreeCiv Web",
        url: "https://www.freecivx.net/",
        tags: ["Strategy", "Multiplayer", "Classic"],
        description: "Free browser-based Civilization clone."
    },
    {
        name: "FreeCiv",
        url: "https://www.freeciv.org/",
        tags: ["Strategy", "Multiplayer", "Classic"],
        description: "Classic open-source Civilization game."
    },
    {
        name: "Blunder Chess",
        url: "https://blunderchess.net/",
        tags: ["Strategy", "Chess", "Chaos"],
        description: "Chess variant where mistakes are encouraged!"
    },
    {
        name: "Odie.us",
        url: "https://odie.us/",
        tags: ["Creative", "Art", "Interactive"],
        description: "Interactive visual art experience."
    },
    {
        name: "GeoHunt",
        url: "https://geohunt.vercel.app/",
        tags: ["Geography", "Guessing", "Multiplayer"],
        description: "GeoGuessr-style location guessing game."
    },
    {
        name: "Movember Conversations",
        url: "https://conversations.movember.com/en/conversations/",
        tags: ["Social", "Educational", "Discussion"],
        description: "Practice meaningful conversation skills."
    },
    {
        name: "Really Boring Website",
        url: "https://really.boring.website/lobby",
        tags: ["Party", "Multiplayer", "Casual"],
        description: "Surprisingly fun browser party games!"
    },
    {
        name: "Wiki Conflict",
        url: "https://wikiconflict.com/",
        tags: ["Educational", "History", "Quiz"],
        description: "Learn history through Wikipedia conflicts."
    },
    {
        name: "Go European",
        url: "https://www.goeuropean.org/",
        tags: ["Strategy", "Classic", "Multiplayer"],
        description: "Play the ancient game of Go online."
    },
    {
        name: "Trivia Duel",
        url: "https://www.triviaduel.com/",
        tags: ["Quiz", "Multiplayer", "Competitive"],
        description: "Compete in head-to-head trivia battles."
    },
    {
        name: "TETR.IO",
        url: "https://tetr.io/",
        tags: ["Puzzle", "Competitive", "Fast-paced"],
        description: "Competitive modern Tetris - fast and furious!"
    },
    {
        name: "Hide and Seek World",
        url: "https://hideandseek.world/",
        tags: ["Geography", "Multiplayer", "Casual"],
        description: "Global hide and seek with real locations."
    },
    {
        name: "Alone Together",
        url: "https://www.enchambered.com/puzzles/alone-together/",
        tags: ["Puzzle", "Co-op", "Escape Room"],
        description: "Cooperative escape room puzzle experience."
    },
    {
        name: "Chained",
        url: "https://moncee.itch.io/chained",
        tags: ["Co-op", "Platformer", "Indie"],
        description: "Cooperative platformer - stay connected!"
    },
    {
        name: "We Ending Friendships",
        url: "https://itch.io/queue/c/4028198/we-ending-friendships-with-this-one?game_id=95798",
        tags: ["Co-op", "Party", "Chaos"],
        description: "Collection of friendship-testing co-op games."
    },
    {
        name: "ChronoPhoto",
        url: "https://www.chronophoto.app/",
        tags: ["Quiz", "History", "Guessing"],
        description: "Guess when historical photos were taken."
    },
    {
        name: "Globle",
        url: "https://globle-game.com/game",
        tags: ["Geography", "Daily", "Guessing"],
        description: "Guess the mystery country on a 3D globe."
    },
    {
        name: "Gidd.io",
        url: "https://gidd.io/games",
        tags: ["Party", "Multiplayer", "Free"],
        description: "Free party games for groups."
    },
    {
        name: "Locator",
        url: "https://store.steampowered.com/app/2459030/Locator/",
        tags: ["Detective", "Geography", "Puzzle"],
        description: "Detective location-finding game."
    },
    {
        name: "Murdle",
        url: "https://murdle.com/",
        tags: ["Puzzle", "Daily", "Mystery"],
        description: "Daily murder mystery logic puzzles."
    },
    {
        name: "Geotastic",
        url: "https://geotastic.net/quick-play",
        tags: ["Geography", "Multiplayer", "Free"],
        description: "Free GeoGuessr alternative with quick play."
    },
    {
        name: "Phantom Chess",
        url: "https://www.phantomchess.in/",
        tags: ["Strategy", "Chess", "Mystery"],
        description: "Chess variant with hidden pieces."
    },
    {
        name: "Secret Hitler Online",
        url: "https://secret-hitler.online/",
        tags: ["Social Deduction", "Party", "Multiplayer"],
        description: "Classic social deduction - find the fascists!"
    },
    {
        name: "The Wiki Game",
        url: "https://www.thewikigame.com/",
        tags: ["Educational", "Racing", "Wikipedia"],
        description: "Race to connect Wikipedia articles."
    },
    {
        name: "Six Degrees of Wikipedia",
        url: "https://www.sixdegreesofwikipedia.com/",
        tags: ["Educational", "Wikipedia", "Puzzle"],
        description: "Find the shortest path between Wikipedia pages."
    },
    {
        name: "Chess Guessr",
        url: "https://www.chessguessr.com/",
        tags: ["Strategy", "Chess", "Guessing"],
        description: "Guess the next move in famous chess games."
    },
    {
        name: "Nerdle",
        url: "https://nerdlegame.com/",
        tags: ["Puzzle", "Daily", "Math"],
        description: "Wordle but with math equations!"
    },
    {
        name: "10 Second Mixtape",
        url: "https://scottts.itch.io/10-second-mixtape",
        tags: ["Music", "Creative", "Quick"],
        description: "Create music in 10-second bursts."
    },
    {
        name: "Scattergories",
        url: "https://swellgarfo.com/scattergories/",
        tags: ["Word Games", "Party", "Multiplayer"],
        description: "Classic word game - think fast!"
    },
    {
        name: "Tabletopia",
        url: "https://tabletopia.com/",
        tags: ["Board Games", "Multiplayer", "Library"],
        description: "Massive library of digital board games."
    },
    {
        name: "Gyra",
        url: "https://lucaju.itch.io/gyra",
        tags: ["Action", "Competitive", "Indie"],
        description: "Beyblade-style spinning top battles!"
    },
    {
        name: "Time to React",
        url: "https://ottoojala.itch.io/time-to-react",
        tags: ["Challenge", "Quick", "Reflexes"],
        description: "Test your reaction time!"
    },
    {
        name: "Ghost Game",
        url: "https://literal-rorquals.itch.io/ghost-game",
        tags: ["Word Games", "Spooky", "Puzzle"],
        description: "Spooky word guessing game."
    },
    {
        name: "Mosaic",
        url: "https://winston-yallow.itch.io/mosaic",
        tags: ["Puzzle", "Relaxing", "Art"],
        description: "Relaxing puzzle game with tiles."
    },
    {
        name: "Dles",
        url: "https://dles.aukspot.com/",
        tags: ["Puzzle", "Daily", "Collection"],
        description: "Collection of daily puzzle games."
    },
    {
        name: "Language Guessr",
        url: "https://languageguessr.io/",
        tags: ["Quiz", "Educational", "Languages"],
        description: "Guess the language being spoken."
    },
    {
        name: "Dice Chess",
        url: "https://www.dicechess.com/",
        tags: ["Strategy", "Chess", "Chaos"],
        description: "Chess with dice - embrace the chaos!"
    }
];

// Get all unique tags from activities
function getAllTags(activityList) {
    const tagSet = new Set();
    activityList.forEach(a => {
        if (a.tags && Array.isArray(a.tags)) {
            a.tags.forEach(tag => tagSet.add(tag));
        } else if (a.category) {
            // Backward compatibility: convert category to tags array
            tagSet.add(a.category);
        }
    });
    return [...tagSet].sort();
}

// Normalize activity to ensure it has tags array
function normalizeActivity(activity) {
    if (!activity.tags && activity.category) {
        activity.tags = [activity.category];
    }
    if (!activity.tags) {
        activity.tags = [];
    }
    return activity;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { activities, getAllTags, normalizeActivity };
}

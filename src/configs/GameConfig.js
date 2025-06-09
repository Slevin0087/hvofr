export const GameConfig = {
  gameState: {
    isRunning: false,
    isPaused: false,
    score: 0,
    moves: 0,
    time: 0,
    lastMove: null,
    minPossibleMoves: 52, // Теоретический минимум для пасьянса
    difficulty: "normal",
  },
  rules: {
    initialScore: 0,
    scoreForFoundation: 10,
    scoreForTableauMove: 5,
    scoreForCardFlip: 2,
    penaltyForFoundationToTableau: 5,
    winScoreBonus: 100,
    hintCost: 5,
  },

  difficulties: {
    easy: {
      timeMultiplier: 1.2,
      scoreMultiplier: 1.2,
    },
    normal: {
      timeMultiplier: 1.0,
      scoreMultiplier: 1.0,
    },
    hard: {
      timeMultiplier: 0.8,
      scoreMultiplier: 0.8,
    },
  },

  defaultSettings: {
    soundEnabled: true,
    theme: "default",
    language: "ru",
    musicVolume: 0.7,
    effectsVolume: 0.9,
    difficulty: "normal",
    cardFaceStyle: "classic",
    cardBackStyle: "blue",
    backgroundStyle: "default",
  },

  defaultPlayerStats: {
    wins: 0,
    losses: 0,
    totalMoves: 0,
    cardsToFoundation: 0,
    highestScore: 0,
    fastestWin: Infinity,
    gamesPlayed: 0,
    cardsFlipped: 0,
    winsWithoutHints: 0,
  },
};

export const CardSuits = {
  HEARTS: "♥",
  DIAMONDS: "♦",
  CLUBS: "♣",
  SPADES: "♠",
};

export const CardValues = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const GameEvents = {
  GAME_START: "game:start",
  GAME_WIN: "game:win",
  GAME_MOVE: "game:move",
  GAME_OVER: "game:over",
  CARD_CLICK: "card:click",
  CARD_FLIP: "card:flip",
  SCORE_UPDATE: "game:score:update",
  TIME_UPDATE: "game:time:update",
};

export const AnimationDurations = {
  CARD_MOVE: 300,
  CARD_FLIP: 200,
  FADE_IN: 250,
  FADE_OUT: 250,
};

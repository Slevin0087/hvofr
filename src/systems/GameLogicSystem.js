import { GameEvents } from "../utils/Constants.js";

export class GameLogicSystem {
  constructor(stateManager, eventManager, audioManager) {
    this.state = stateManager;
    this.events = eventManager;
    this.audio = audioManager;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  // после
  // handleCardClick(card) {
  //   if (!card.faceUp || this.state.game.isPaused) return;

  //   // Проверяем можно ли переместить карту в foundation
  //   for (let i = 0; i < this.state.game.foundations.length; i++) {
  //     if (this.state.game.foundations[i].canAccept(card)) {
  //       this.events.emit("card:to:foundation", { card, foundationIndex: i });
  //       return;
  //     }
  //   }

  //   // Если нет - проверяем tableau
  //   for (let i = 0; i < this.state.game.tableaus.length; i++) {
  //     if (this.state.game.tableaus[i].canAccept(card)) {
  //       this.events.emit("card:to:tableau", { card, tableauIndex: i });
  //       return;
  //     }
  //   }

  //   // Если карту нельзя переместить - звуковой сигнал
  //   this.audio.play("error");
  // }

  setupEventListeners() {
    this.events.on(GameEvents.CARD_CLICK, (card) => this.handleCardClick(card));
    this.events.on("card:to:foundation", (data) =>
      this.moveCardToFoundation(data)
    );
    this.events.on("card:to:tableau", (data) => this.moveCardToTableau(data));
    this.events.on("hint:request", () => this.provideHint());
    this.events.on("game:undo", () => this.handleUndo());
  }

  setupNewGame(deck, tableaus, stock) {
    console.log('setupNewGame');
    console.log('deck, tableaus, stock:', deck, tableaus, stock);
    
    
    // deck = new Deck();
    deck.shuffle();

    // Раздача карт в tableau
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.deal();
        card.faceUp = j === i;
        card.indexTableau = i;
        tableaus[i].addCard(card);
      }
    }

    // Оставшиеся карты в сток
    const stockCards = [];
    while (!deck.isEmpty()) {
      stockCards.push(deck.deal());
    }
    stock.addCards(stockCards);

    // Сброс состояния игры
    this.state.game = {
      score: 0,
      moves: 0,
      playTime: 0,
      isRunning: true,
      faceDownCards: 28, // 7 рядов по (n) карт
    };
  }

  // изначально
  handleCardClick(card, foundations, tableaus) {
    this.audio.play("click");

    // Проверка foundation
    for (let i = 0; i < foundations.length; i++) {
      if (foundations[i].canAccept(card)) {
        this.moveCardToFoundation(card, i, foundations, tableaus);
        this.updateScore(10);
        if (this.checkWin(foundations)) {
          this.events.emit("game:win");
        }
        return;
      }
    }

    // Проверка tableau
    for (let i = 0; i < tableaus.length; i++) {
      if (tableaus[i].canAccept(card)) {
        this.moveCardToTableau(card, i, tableaus);
        this.updateScore(5);
        return;
      }
    }

    this.events.emit("game:invalid:move");
  }

  // изначально
  moveCardToFoundation(card, foundationIndex, foundations, tableaus) {
    // Логика перемещения карты в foundation
    const source = this.getCardSource(card);

    if (source.type === "tableau") {
      const tableau = tableaus[source.index];
      tableau.removeCard(card);
      if (
        tableau.cards.length > 0 &&
        !tableau.cards[tableau.cards.length - 1].faceUp
      ) {
        this.flipCard(tableau.cards[tableau.cards.length - 1]);
        this.state.game.faceDownCards--;
      }
    } else if (source.type === "waste") {
      this.stock.removeCurrentCard();
    }

    foundations[foundationIndex].addCard(card);
    this.events.emit("card:moved", {
      card,
      to: `foundation-${foundationIndex}`,
    });
  }

  // Остальные методы системы логики...
  // после
  moveCardToFoundation({ card, foundationIndex }) {
    const foundation = this.state.game.foundations[foundationIndex];
    const source = this.getCardSource(card);

    if (!foundation.canAccept(card)) {
      this.audio.play("error");
      return;
    }

    // Запоминаем ход для возможной отмены
    this.state.updateLastMove({
      card,
      from: source,
      to: `foundation-${foundationIndex}`,
    });

    // Удаляем карту из исходного места
    this.removeCardFromSource(card, source);

    // Добавляем в foundation
    foundation.addCard(card);
    this.state.incrementStat("cardsToFoundation");

    // Обновляем очки
    const points = this.calculatePoints("toFoundation");
    this.state.updateScore(points);

    // Проверяем победу
    if (this.checkWinCondition()) {
      this.handleWin();
      return;
    }

    // Открываем следующую карту в tableau, если нужно
    this.openNextCardIfNeeded(source);

    this.audio.play("cardPlace");
    this.events.emit("game:move:completed");
  }

  moveCardToTableau({ card, tableauIndex }) {
    const tableau = this.state.game.tableaus[tableauIndex];
    const source = this.getCardSource(card);

    if (!tableau.canAccept(card)) {
      this.audio.play("error");
      return;
    }

    // Запоминаем ход для возможной отмены
    this.state.updateLastMove({
      card,
      from: source,
      to: `tableau-${tableauIndex}`,
    });

    // Удаляем карту из исходного места
    this.removeCardFromSource(card, source);

    // Добавляем в tableau
    tableau.addCard(card);

    // Обновляем очки
    const points = this.calculatePoints("toTableau");
    this.state.updateScore(points);

    this.audio.play("cardPlace");
    this.events.emit("game:move:completed");
  }

  getCardSource(card) {
    // Определяем откуда взята карта (tableau, foundation, waste)
    if (card.positionData.parent.includes("tableau")) {
      return `tableau-${card.positionData.index}`;
    } else if (card.positionData.parent.includes("foundation")) {
      return `foundation-${card.positionData.index}`;
    } else {
      return "waste";
    }
  }

  removeCardFromSource(card, source) {
    if (source.startsWith("tableau")) {
      const index = parseInt(source.split("-")[1]);
      this.state.game.tableaus[index].removeCard(card);
    } else if (source.startsWith("foundation")) {
      const index = parseInt(source.split("-")[1]);
      this.state.game.foundations[index].removeTopCard();
    } else if (source === "waste") {
      this.state.game.stock.takeFromWaste();
    }
  }

  openNextCardIfNeeded(source) {
    if (!source.startsWith("tableau")) return;

    const index = parseInt(source.split("-")[1]);
    const tableau = this.state.game.tableaus[index];
    const topCard = tableau.getTopCard();

    if (topCard && !topCard.faceUp) {
      topCard.flip();
      this.state.incrementStat("cardsFlipped");
      this.state.updateScore(this.calculatePoints("cardFlip"));
      this.audio.play("cardFlip");
    }
  }

  calculatePoints(action) {
    const { difficulty } = this.state.game;
    const basePoints = {
      toFoundation: 10,
      toTableau: 5,
      cardFlip: 2,
      fromFoundationToTableau: -5,
    }[action];

    const multiplier = {
      easy: 1.2,
      normal: 1.0,
      hard: 0.8,
    }[difficulty];

    return Math.round(basePoints * multiplier);
  }

  checkWinCondition() {
    return this.state.game.foundations.every((f) => f.isComplete());
  }

  handleWin() {
    this.state.incrementStat("wins");
    this.state.updateScore(this.calculatePoints("winBonus"));

    // Проверяем победу без подсказок
    if (this.state.game.hintsUsed === 0) {
      this.state.incrementStat("winsWithoutHints");
    }

    // Проверяем быструю победу
    if (this.state.game.time < this.state.player.stats.fastestWin) {
      this.state.player.stats.fastestWin = this.state.game.time;
    }

    this.audio.play("win");
    this.events.emit("game:win");
  }

  provideHint() {
    if (this.state.game.score < 5) {
      this.events.emit(
        "ui:notification",
        "Нужно минимум 5 очков для подсказки"
      );
      this.audio.play("error");
      return;
    }

    // Логика поиска возможных ходов...
    const hint = this.findBestHint();

    if (hint) {
      this.state.deductCoins(5);
      this.state.game.hintsUsed = (this.state.game.hintsUsed || 0) + 1;
      this.events.emit("hint:show", hint);
    } else {
      this.events.emit("ui:notification", "Нет доступных ходов");
    }
  }

  findBestHint() {
    // Сначала проверяем карты в waste
    const wasteCard = this.state.game.stock.getWasteCard();
    if (wasteCard) {
      // Проверяем foundation
      for (let i = 0; i < this.state.game.foundations.length; i++) {
        if (this.state.game.foundations[i].canAccept(wasteCard)) {
          return {
            card: wasteCard,
            target: `foundation-${i}`,
            type: "waste-to-foundation",
          };
        }
      }

      // Проверяем tableau
      for (let i = 0; i < this.state.game.tableaus.length; i++) {
        if (this.state.game.tableaus[i].canAccept(wasteCard)) {
          return {
            card: wasteCard,
            target: `tableau-${i}`,
            type: "waste-to-tableau",
          };
        }
      }
    }

    // Затем проверяем tableau
    for (let i = 0; i < this.state.game.tableaus.length; i++) {
      const tableau = this.state.game.tableaus[i];
      const topCard = tableau.getTopCard();

      if (!topCard) continue;

      // Проверяем foundation
      for (let j = 0; j < this.state.game.foundations.length; j++) {
        if (this.state.game.foundations[j].canAccept(topCard)) {
          return {
            card: topCard,
            target: `foundation-${j}`,
            type: "tableau-to-foundation",
          };
        }
      }
    }

    return null;
  }

  handleUndo() {
    if (!this.state.game.lastMove) {
      this.audio.play("error");
      return;
    }

    const { card, from, to } = this.state.game.lastMove;
    this.events.emit("game:undo:move", { card, from, to });
  }
}

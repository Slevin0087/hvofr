import { Deck } from "./Deck.js";
import { Foundation } from "./Foundation.js";
import { Tableau } from "./Tableau.js";
import { Stock } from "./Stock.js";
import { GameLogicSystem } from "../systems/GameLogicSystem.js";
import { RenderingSystem } from "../systems/RenderingSystem.js";
import { AnimationSystem } from "../systems/AnimationSystem.js";
import { CardSystem } from "../systems/CardSystem.js";

export class Game {
  constructor(stateManager, eventManager, audioManager) {
    this.stateManager = stateManager;
    this.state = stateManager.state;
    this.events = eventManager;
    this.audio = audioManager;

    this.deck = new Deck();
    this.foundations = Array.from({ length: 4 }, (_, i) => new Foundation(i));
    this.tableaus = Array.from({ length: 7 }, (_, i) => new Tableau(i));
    this.stock = new Stock();

    this.systems = {
      cards: new CardSystem(this.stateManager, this.events),
      logic: new GameLogicSystem(this.stateManager, this.events, this.audio),
      render: new RenderingSystem(this.stateManager, this.events, this.stock, this.foundations, this.tableaus),
      animation: new AnimationSystem(this.stateManager, this.events),
    };


    this.setupEventListeners();
  }

  init() {
    this.systems.logic.setupNewGame(this.deck, this.tableaus, this.stock);
    this.systems.render.renderGame(
      this.deck,
      this.tableaus,
      this.foundations,
      this.stock
    );
    // this.initCards();
    console.log('this.state:', this.state);
    this.state.game.isRunning = true;
    this.events.emit("game:started");
    
  }

  // initCards() {
  //   this.state.cards = {
  //     deck: this.deck,
  //     foundations: this.foundations,
  //     tableaus: this.tableaus,
  //     stock: this.stock,
  //   }
  // }

  restart() {
    this.systems.logic.clearGame();
    this.systems.render.clearGame();
    this.init();
  }

  setupEventListeners() {
    this.events.on("card:clicked", (card) =>
      this.systems.logic.handleCardClick(card)
    );
    this.events.on("card:flip", (card) =>
      this.systems.logic.handleCardFlip(card)
    );
    this.events.on("stock:click", () => this.handleStockClick());
    this.events.on("hint:request", () =>
      this.systems.logic.provideHint(this.foundations, this.tableaus)
    );

    this.events.on("game:win", () => {
      this.state.game.isRunning = false;
      this.systems.animation.playWinAnimation();
    });
  }

  handleStockClick() {
    this.audio.play("cardFlip");
    const card = this.stock.deal();
    if (card) {
      this.systems.animation.animateStockDeal(card);
    }
    this.systems.render.renderStock(this.stock);
  }

  update(deltaTime) {
    
    if (this.state.game.isRunning) {
      // console.log('this.state.game:', this.state.game);
      this.state.game.playTime += deltaTime;
      this.events.emit("game:time:update", this.state.game.playTime);
    }
  }
}

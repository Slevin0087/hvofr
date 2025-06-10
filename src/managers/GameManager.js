import { Game } from "../core/Game.js";

export class GameManager {
  constructor(stateManager, eventManager, audioManager) {
    this.state = stateManager;
    this.events = eventManager;
    this.audio = audioManager;
    this.lastTime = 0;
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.gameLoop(0);
  }

  setupEventListeners() {
    this.events.on("game:restart", () => {
      console.log('this.state.currentGame ДО:', this.state.currentGame);
      
      this.state.currentGame = new Game(this.state, this.events, this.audio);
      console.log('new Game(this.state, this.events, this.audio) ПОСЛЕ:', this.state.currentGame);
      this.state.currentGame.init();
    })
    
    this.events.on("game:start", () => {
      this.state.currentGame = new Game(this.state, this.events, this.audio);
      this.state.currentGame.init();
    });

    this.events.on("game:continue", () => {
      if (this.state.currentGame) {
        this.events.emit("ui:game:show");
      }
    });
  }

  gameLoop(timestamp) {
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    if (this.state.currentGame && this.state.currentGame.update) {
      this.state.currentGame.update(deltaTime / 1000);
      // console.log('в gameLoop timestamp:', this.state.currentGame.update);
    }
    
    requestAnimationFrame((t) => {
      this.gameLoop(t)
  });
  }
}

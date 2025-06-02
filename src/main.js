import { EventManager } from "./managers/EventManager.js";
import { StateManager } from "./managers/StateManager.js";
import { UIManager } from "./managers/UIManager.js";
import { AudioManager } from "./managers/AudioManager.js";
import { Game } from "./core/Game.js";
import { GameManager } from "./managers/GameManager.js";

const volumeSlider = document.getElementById("music-volume");

volumeSlider.addEventListener("input", function () {
  console.log("this.style:", this.style);
  console.log("this.value:", this.value);
  this.style.setProperty("--fill-percent", `${this.value}%`);
});

class App {
  constructor() {
    this.eventManager = new EventManager();
    this.stateManager = new StateManager(this.eventManager);
    this.uiManager = new UIManager(this.eventManager, this.stateManager);
    this.audioManager = new AudioManager(this.eventManager);
    this.gameManager = new GameManager(this.stateManager, this.eventManager);
    this.game = new Game(
      this.stateManager,
      this.eventManager,
      this.audioManager
    );

    this.init();
  }

  init() {
    // console.log('начало init App');
    this.setupEventListeners();
    this.eventManager.emit("app:start");
    console.log("this.stateManager:", this.stateManager);
  }

  setupEventListeners() {
    this.eventManager.on("game:new", () => {
      
    })
  }


}

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  console.log("перед запуском");

  const app = new App();
  console.log("после запуска");
  // Для отладки
  // window.app = app;
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  volumeSlider.style.setProperty("--fill-percent", `${volumeSlider.value}%`);
});

import { Animator } from "../utils/Animator.js";

export class GamePage {
  constructor(eventManager, stateManager) {
    this.stateManager = stateManager;
    this.events = eventManager;
    this.state = stateManager.state;
    this.page = document.getElementById("game-interface");
    this.displayPage = "";
    this.elements = {
      messageEl: document.getElementById("message"),
      scoreEl: document.getElementById("points-in-game"),
      timeEl: document.getElementById("time-display"),
      restartGameBtn: document.getElementById("new-game-ctr-btn"),
      hintBtn: document.getElementById("hint"),
      menuBtn: document.getElementById("menu-btn"),
      collectBtn: document.getElementById("collect-cards"),
    };

    this.initialize();
  }

  initialize() {
    console.log('ИНИЦИАЛИЗАЦИЯ GamePage');
    
    this.getDisplayPage();
    this.setupEventListeners();
    this.updateUI();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.restartGameBtn.addEventListener("click", () => {
      this.events.emit("game:restart");

    });

    this.elements.hintBtn.addEventListener("click", () => {
      this.events.emit("hint:request");
    });

    this.elements.menuBtn.addEventListener("click", () => {
      this.events.emit("ui:menu:show", this);
    });

    this.elements.collectBtn.addEventListener("click", () => {
      this.events.emit("cards:collect");
    });

    this.events.on("game:score:update", (score) => {
      this.updateScore(score);
    });

    this.events.on("game:time:update", (time) => {
      this.updateTime(time);
    });

    this.events.on("game:message", (message, type) => {
      this.showMessage(message, type);
    });

    this.events.on("game:score:updated", (score) => this.updateScore(score));
  }

  updateUI() {
    this.updateScore(this.state.game.score);
    this.updateTime(this.state.game.playTime);
  }

  resetScore(score) {
    
    
    this.elements.scoreEl.textContent = `🌟 ${score}`;
  }

  resetTime(minutes, seconds) {
    console.log('resetTime(minutes):', minutes);
    console.log('resetTime(seconds):', seconds);
    this.elements.timeEl.textContent = `${minutes}${minutes}:${seconds}${seconds}`;
  }

  updateScore(score) {
    console.log("score:", score);

    this.elements.scoreEl.textContent = `🌟 ${score}`;
  }

  updateTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    this.elements.timeEl.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  showMessage(message, type = "info") {
    this.elements.messageEl.textContent = message;
    this.elements.messageEl.className = `game-message ${type}`;

    setTimeout(() => {
      this.elements.messageEl.className = "game-message";
    }, 2000);
  }

  show() {
    this.page.classList.remove("hidden");
    // await Animator.fadeIn(this.page, this.displayPage);
    this.updateUI();
  }

  hide() {
    // await Animator.fadeOut(this.page);
    this.page.classList.add("hidden");
  }
}

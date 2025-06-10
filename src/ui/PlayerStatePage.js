import { Animator } from "../utils/Animator.js";

export class PlayerStatePage {
  constructor(eventManager, stateManager) {
    this.events = eventManager;
    this.state = stateManager;
    this.page = document.getElementById("player-state");
    this.displayPage = "";
    this.elements = {
      btnBack: document.getElementById("btn-back-st-player"),
    };

    this.initialize();
  }

  initialize() {
    this.getDisplayPage();
    this.setupEventListeners();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.btnBack.addEventListener("click", () => {
      this.events.emit("ui:menu:show", this);
    });
  }

  render() {
    const statePlayer = this.state.state.player;
    console.log('statePlayer:', statePlayer);
    
    const container = document.getElementById('player-state-content');
    container.innerHTML = '';
    container.innerHTML = `<table class="p-state-table table">
      <tr>
        <td class="left-td">Имя:</td>
        <td class="right-td">${statePlayer.name}</td>
      </tr>
      <tr>
        <td class="left-td">Монеты:</td>
        <td class="right-td">${statePlayer.coins}</td>
      </tr>
      <tr>
        <td class="left-td">Сыграно игр:</td>
        <td class="right-td">${statePlayer.gamesPlayed}</td>
      </tr>
      <tr>
        <td class="left-td">Выиграно игр:</td>
        <td class="right-td">${statePlayer.wins}</td>
      </tr>
      <tr>
        <td class="left-td">Лучший счет:</td>
        <td class="right-td">${statePlayer.highestScore}</td>
      </tr>`;
  }

  show() {
    this.page.classList.remove("hidden");
    this.render();
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  hide() {
    // await Animator.fadeOut(this.page);
    this.page.classList.add("hidden");
  }
}

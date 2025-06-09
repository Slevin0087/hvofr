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

  show() {
    this.page.classList.remove("hidden");
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  hide() {
    // await Animator.fadeOut(this.page);
    this.page.classList.add("hidden");
  }
}

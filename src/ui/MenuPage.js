import { Animator } from "../utils/Animator.js";

export class MenuPage {
  constructor(eventManager) {
    this.events = eventManager;
    this.page = document.getElementById("game-menu");
    this.displayPage = "";
    this.elements = {
      newGameBtn: document.getElementById("new-game-btn"),
      settingsBtn: document.getElementById("settings-btn"),
      statePlayerBtn: document.getElementById("state-player"),
      shopBtn: document.getElementById("shop-btn"),
      exitBtn: document.getElementById("exit-btn"),
      continueBtn: document.getElementById("continue-btn"),
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
    this.elements.newGameBtn.addEventListener("click", () => {
      this.events.emit("game:new");
      // this.events.emit("game:start");
    });

    this.elements.continueBtn.addEventListener("click", () => {
      this.events.emit("game:continue", this);
    });

    this.elements.settingsBtn.addEventListener("click", () => {
      this.events.emit("ui:settings:show");
    });

    this.elements.statePlayerBtn.addEventListener("click", () => {
      this.events.emit("ui:stateplayer:show");
    });

    this.elements.shopBtn.addEventListener("click", () => {
      this.events.emit("ui:shop:show", this);
    });

    this.elements.exitBtn.addEventListener("click", () => {
      this.events.emit("game:exit", this);
      this.events.emit("game:end");
    });
  }

  show(gameInProgress = false) {
    this.elements.continueBtn.style.display = gameInProgress ? "block" : "none";
    this.page.classList.remove("hidden");
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  hide() {
    // await Animator.fadeOut(this.page);
    this.page.classList.add("hidden");
  }

  updateContinueButton(visible) {
    this.elements.continueBtn.style.display = visible ? "block" : "none";
  }
}

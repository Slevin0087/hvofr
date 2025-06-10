import { Validator } from "../utils/Validator.js";
import { Animator } from "../utils/Animator.js";

export class NamePage {
  constructor(eventManager, stateManager) {
    this.events = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.page = document.getElementById("player-page");
    this.displayPage = "";
    this.elements = {
      form: document.getElementById("player-form"),
      input: document.getElementById("player-name"),
      submitBtn: document.getElementById("submit-name"),
      skipBtn: document.getElementById("skip-name"),
      errorMsg: document.getElementById("name-error"),
    };

    this.init();
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
    this.setNameInInput();
    // console.log("this.displayPage:", this.displayPage);
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.elements.skipBtn.addEventListener("click", () => this.handleSkip());
    // this.elements.input.addEventListener("input", () => this.validateInput());

    // this.events.on("ui:name:show", () => this.show());
    // this.events.on("ui:name:hide", () => this.hide());
  }
  

  setNameInInput() {
    this.elements.input.value = this.state.player.name;
  }
  // loadSavedName() {
  //   const savedName = this.state.storage.loadPlayerData();
  //   if (savedName) {
  //   }
  // }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("player_name").trim();
    this.events.emit("player:name:set", name);
    this.events.emit("ui:name:hide");
  }

  handleSkip() {
    this.events.emit("player:name:set", this.state.player.name);
    this.events.emit("ui:name:hide");
  }

  validateInput() {
    const name = this.elements.input.value.trim();
    this.validateName(name, true);
  }

  validateName(name, showErrors = false) {
    const validator = new Validator();

    if (!validator.isNameValid(name)) {
      if (showErrors) {
        this.showError(validator.getErrorMessage("name"));
      }
      return false;
    }

    this.hideError();
    return true;
  }

  showError(message) {
    this.elements.errorMsg.textContent = message;
    this.elements.errorMsg.classList.remove("hidden");
    this.elements.submitBtn.disabled = true;
  }

  hideError() {
    this.elements.errorMsg.classList.add("hidden");
    this.elements.submitBtn.disabled = false;
  }

  saveName(name) {
    this.state.player.name = name;
    // const playerData = this.state.storage.loadPlayerData();
    // playerData.name = name;
    this.stateManager.storage.savePlayerStats(this.state.player);
  }

  hide() {
    this.page.classList.add("hidden");
    // await Animator.fadeOut(this.page);
  }

  show() {
    // this.events.emit("ui:name:show");
    this.page.classList.remove("hidden");
    this.elements.input.focus();
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  reset() {
    this.otherElements.input.value = "";
    this.hideError();
  }
}

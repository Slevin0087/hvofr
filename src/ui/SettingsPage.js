import { Animator } from "../utils/Animator.js";

export class SettingsPage {
  constructor(eventManager, stateManager) {
    this.events = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.page = document.getElementById("settings");
    this.displayPage = "";
    this.elements = {
      backBtn: document.getElementById("back-to-menu"),
      soundToggle: document.getElementById("sound-toggle"),
      difficultySelect: document.getElementById("difficulty"),
      musicVolume: document.getElementById("music-volume"),
    };

    this.initialize();
  }

  initialize() {
    this.getDisplayPage();
    this.setupEventListeners();
    this.render();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.backBtn.addEventListener("click", () => {
      this.saveSettings();
      this.events.emit("ui:menu:show");
    });

    this.elements.soundToggle.addEventListener("change", (e) => {
      this.events.emit("settings:sound:toggle", e.target.checked);
    });

    this.elements.difficultySelect.addEventListener("change", (e) => {
      this.events.emit("settings:difficulty:change", e.target.value);
    });

    this.elements.musicVolume.addEventListener("input", (e) => {
      this.events.emit("settings:music:volume", parseFloat(e.target.value));
    });
  }

  render() {
    
    const settings = this.state.settings;
    
    this.elements.soundToggle.checked = settings.soundEnabled;
    this.elements.difficultySelect.value = settings.difficulty;
    this.elements.musicVolume.value = settings.musicVolume;
  }
  
  saveSettings() {
    const newSettings = {
      soundEnabled: this.elements.soundToggle.checked,
      difficulty: this.elements.difficultySelect.value,
      musicVolume: parseFloat(this.elements.musicVolume.value),
    };
    
    this.events.emit("settings:save", newSettings);
  }
  
  show() {
    console.log("loaaaaaaaaaaaaaaaaaad", this.state.settings);
    this.render();
    this.page.classList.remove("hidden");
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  hide() {
    this.page.classList.add("hidden");
    // await Animator.fadeOut(this.page);
  }
}

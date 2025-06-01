import { EventManager } from "./managers/EventManager.js";
import { StateManager } from "./managers/StateManager.js";
import { UIManager } from "./managers/UIManager.js";

class App {
    constructor() {
        this.eventManager = new EventManager();
        this.stateManager = new StateManager(this.eventManager);
        this.uiManager = new UIManager(this.eventManager, this.stateManager);

        this.init();
    }

    init() {
        // console.log('начало init App');
        this.eventManager.emit("app:start");
        console.log('this.stateManager:', this.stateManager);
        
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  console.log("перед запуском");

  const app = new App();
  console.log("после запуска");
  // Для отладки
  // window.app = app;
});
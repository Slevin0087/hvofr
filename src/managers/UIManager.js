import { NamePage } from "../ui/NamePage.js";
import { MenuPage } from "../ui/MenuPage.js";
import { SettingsPage } from "../ui/SettingsPage.js";
import { GamePage } from "../ui/GamePage.js";
import { ShopUI } from "../ui/ShopUI.js";
import { PlayerStatePage } from "../ui/PlayerStatePage.js";
import { ShopConfig } from "../configs/ShopConfig.js";
import { GameManager } from "./GameManager.js";
import { GameConfig } from "../configs/GameConfig.js";

export class UIManager {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.components = {};

    this.init();
  }

  init() {
    this.registerComponents();
    this.hideAll();
    document.getElementById("loader").classList.add("hidden"),
      this.setupEventListeners();
  }

  registerComponents() {
    this.components = {
      namePage: new NamePage(this.eventManager, this.stateManager),
      menuPage: new MenuPage(this.eventManager),
      settingsPage: new SettingsPage(this.eventManager, this.stateManager),
      gamePage: new GamePage(this.eventManager, this.stateManager),
      shopPage: new ShopUI(this.eventManager, this.stateManager),
      playerStatePage: new PlayerStatePage(
        this.eventManager,
        this.stateManager
      ),
    };
  }

  setupEventListeners() {
    this.eventManager.on("app:start", () => {
      this.components.namePage.show();
      this.stateManager.state.ui.activePage = this.components.namePage;
    });
    this.eventManager.on("ui:name:hide", () => {
      this.hideAll(this.components.namePage);
      this.components.menuPage.show(this.stateManager.state.game.isRunning);
      this.stateManager.state.ui.activePage = this.components.menuPage;
    });

    this.eventManager.on("game:new", () => {
      this.hideAll(this.components.menuPage);
      this.components.gamePage.show();
      this.stateManager.state.ui.activePage = this.components.gamePage;
      this.stateManager.state.game.isRunning = true;
    });

    this.eventManager.on("game:restart", () => {
      
      const config = GameConfig.gefaultGameState;
      console.log('В СОБИТИИ UIManager GameConfig.gefaultGameState:', GameConfig.gefaultGameState);
      this.components.gamePage.resetScore(0);
      this.components.gamePage.resetTime(0, 0);
    });

    this.eventManager.on("ui:menu:show", (activePage) => {
      // console.log("activePage:", activePage);

      this.hideAll(activePage);
      this.components.menuPage.show(this.stateManager.state.game.isRunning);
      this.stateManager.state.ui.activePage = this.components.menuPage;
    });

    this.eventManager.on("ui:settings:show", () => {
      this.hideAll(this.components.menuPage);
      this.components.settingsPage.show();
      this.stateManager.state.ui.activePage = this.components.settingsPage;
    });

    this.eventManager.on("game:exit", (activePage) => {
      this.hideAll(activePage);
      this.eventManager.emit("game:end");
      this.components.namePage.show();
    });

    this.eventManager.on("game:continue", (activePage) => {
      this.hideAll(activePage);
      this.components.gamePage.show();
      this.stateManager.state.ui.activePage = this.components.gamePage;
      this.stateManager.state.game.isRunning = true;
    });

    this.eventManager.on("ui:shop:show", (activePage) => {
      this.hideAll(activePage);
      this.components.shopPage.show();
      this.stateManager.state.ui.activePage = this.components.shopPage;
      this.eventManager.emit(
        "shop:render",
        this.stateManager.state.shop,
        ShopConfig
      );
    });

    this.eventManager.on("shop:category:change", (category, config) => {
      this.stateManager.state.shop.currentCategory = category;
      this.components.shopPage.render(this.stateManager.state.shop, config);
    });

    this.eventManager.on("ui:stateplayer:show", (activePage) => {
      this.hideAll(activePage);
      this.components.playerStatePage.show();
      this.stateManager.state.ui.activePage = this.components.playerStatePage;
    });
  }

  hideAll(arg = null) {
    // console.log("arg:", arg);

    Object.values(this.components).forEach((component) => {
      if (!arg) component.page.classList.add("hidden");
      else {
        if (component === arg) component.hide();
        else component.page.classList.add("hidden");
      }
    });
  }
}

import { Storage } from "../utils/Storage.js";
import { Validator } from "../utils/Validator.js";
import { ShopConfig } from "../configs/ShopConfig.js";
import { UIConfig } from "../configs/UIConfig.js";

export class StateManager {
  constructor(eventManager) {
    this.events = eventManager;
    this.storage = new Storage();
    this.validator = new Validator();
    this.state = this.getInitialState();

    this.init();
  }

  init() {
    this.loadAllData();
    this.saveAllData();
    this.setupEventListeners();
  }

  getInitialState() {
    return {
      ui: {
        activePage: UIConfig.activePage,
      },
      game: this.storage.getGameState(),
      player: this.storage.getPlayerState(),
      settings: this.storage.getGameSettings(),
      shop: this.storage.getShopState(),
      achievements: {
        unlocked: [],
      },
    };
  }

  loadAllData() {
    // Загрузка сохраненных данных
    this.loadGameState();
    this.loadPlayerStats();
    this.loadGameSettings();
    // Загрузка магазина
    this.state.shop.purchasedItems = this.storage.getPurchasedItems();
    this.state.player.coins = this.storage.getCoins();
    this.state.achievements.unlocked = this.storage.getUnlockedAchievements();
    console.log("загрузка всех localStorage this.state:", this.state);
  }

  loadGameState() {
    const savedGameState = this.storage.loadGameState();
    console.log("savedGameState:", savedGameState);
    console.log("aaaaaaaaaaaaaaaaaaaaa", this.state);
    if (savedGameState && this.validator.isGameStateValid(savedGameState)) {
      this.state.game = {
        ...this.state.game,
        ...savedGameState,
      };
    }
  }

  loadPlayerStats() {
    // Загрузка статистики игрока
    const savedPlayerStats = this.storage.loadPlayerStats(this.state.player);
    // if (savedPlayerStats) {
    this.state.player = {
      ...this.state.player,
      ...savedPlayerStats,
    };
  }

  loadGameSettings() {
    // Загрузка настроек
    const savedSettings = this.storage.loadGameSettings(this.state.settings);
    // if (savedSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...savedSettings,
    };
    // }
  }

  saveAllData() {
    this.saveGameState();
    this.savePlayerStats();
    this.saveGameSettings();
  }

  saveGameState() {
    this.storage.saveGameState(this.state.game);
  }

  savePlayerStats() {
    this.storage.savePlayerStats(this.state.player);
  }

  saveGameSettings() {
    this.storage.saveGameSettings(this.state.settings);
  }

  setupEventListeners() {
    this.events.on("player:name:set", (name) => {
      this.state.player.name = name;
      this.storage.savePlayerStats(this.state.player);
    });

    this.events.on("game:start", () => {
      this.state.game.isRunning = true;
      this.state.player.gamesPlayed++;
      this.saveGameState();
    });

    this.events.on("game:restart", () => {
      this.resetScore(0);
      this.resetTime(0);
    });

    this.events.on("game:end", () => {
      this.state.game.isRunning = false;
      this.saveAllData();
    });

    this.events.on("game:pause", () => {
      this.state.game.isPaused = true;
    });

    this.events.on("game:resume", () => {
      this.state.game.isPaused = false;
    });

    // Другие обработчики событий...
    this.events.on("game:exit", (activePage) => {
      this.state.ui.activePage = activePage;
    });

    this.events.on("settings:sound:toggle", (enabled) => {
      this.state.settings.soundEnabled = enabled;
      this.saveGameSettings();
    });

    this.events.on("settings:music:volume", (value) => {
      this.state.settings.musicVolume = value;
      this.saveGameSettings();
    });
  }

  resetScore(score) {
    this.state.game.score = score;
  }

  resetTime(time) {
    this.state.game.playTime = time;
  }

  addCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.state.player.coins += amount;
    this.storage.addCoins(amount);
    this.events.emit("player:coins:updated", this.state.player.coins);
  }

  deductCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.state.player.coins = Math.max(0, this.state.player.coins - amount);
    this.storage.deductCoins(amount);
    this.events.emit("player:coins:updated", this.state.player.coins);
  }

  addUnlockAchievement(achievementId) {
    if (this.state.achievements.unlocked.includes(achievementId)) return;

    this.state.achievements.unlocked.push(achievementId);
    this.storage.addUnlockAchievement(achievementId);
    this.events.emit("achievement:unlocked", achievementId);
  }

  purchaseShopItem(itemId) {
    const item = ShopConfig.items.find((i) => i.id === itemId);
    if (!item || this.state.shop.purchasedItems.includes(itemId)) return false;

    if (this.state.player.coins >= item.price) {
      this.deductCoins(item.price);
      this.state.shop.purchasedItems.push(itemId);
      this.storage.purchaseItem(itemId);
      return true;
    }

    return false;
  }

  updateLastMove(moveData) {
    this.state.game.lastMove = moveData;
  }

  updateScore(points) {
    // console.log('points:', points);

    this.state.game.score += points;
    if (this.state.game.score > this.state.player.highestScore) {
      this.state.player.highestScore = this.state.game.score;
    }
    console.log("this.state.game:", this.state.game);

    this.events.emit("game:score:updated", this.state.game.score);
  }

  incrementStat(statName, amount = 1) {
    if (this.state.player[statName] !== undefined) {
      this.state.player[statName] += amount;
    }
  }

  resetGameState() {
    this.state.game = {
      ...this.getInitialState().game,
      difficulty: this.state.game.difficulty,
    };
    this.saveGameState();
  }

  /////////////////////////////
  loadInitialState() {
    this.loadGameSettings();
    this.loadShopState();
    // this.loadPlayerData();
  }

  loadGameSettings() {
    // this.state.game.settings = this.storage.getGameSettings();
    this.state.game.settings = this.storage.loadGameSettings();
  }

  loadShopState() {
    this.state.shop.items = this.storage.getShopItems();
    this.state.shop.balance = this.storage.getCoins();
  }

  // loadPlayerData() {
  //   this.state.player = {
  //     name: this.storage.getPlayerName() || "Игрок",
  //     stats: this.storage.getPlayerStats(),
  //   };
  // }

  // Другие методы управления состоянием...
}

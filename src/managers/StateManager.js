import { Storage } from "../utils/Storage.js";
import { Validator } from "../utils/Validator.js";
import { GameConfig } from "../configs/GameConfig.js";
import { ShopConfig } from "../configs/ShopConfig.js";

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
    this.setupEventListeners();
  }

  getInitialState() {
    return {
      ui: {
        activePage: null,
      },
      game: GameConfig.gameState,
      player: {
        name: "Игрок",
        coins: 0,
        stats: GameConfig.defaultPlayerStats,
      },
      settings: GameConfig.defaultSettings,
      shop: ShopConfig.defaultShopState,
      achievements: {
        unlocked: [],
      },
    };
  }

  loadAllData() {
    // Загрузка сохраненных данных
    const savedState = this.storage.loadGameState();
    console.log('savedState:', savedState);
    console.log('aaaaaaaaaaaaaaaaaaaaa', this.state);
    if (savedState && this.validator.isGameStateValid(savedState)) {
      
      this.state.game = {
        ...this.state.game,
        ...savedState,
      };
    }
    console.log('ffffffffffffffffff', this.state);

    // Загрузка статистики
    const savedPlayerStats = this.storage.loadPlayerStats();
    if (savedPlayerStats) {
      this.state.player.stats = {
        ...this.state.player.stats,
        ...savedPlayerStats,
      };
    }

    // Загрузка настроек
    const savedSettings = this.storage.loadGameSettings();
    if (savedSettings) {
      this.state.settings = {
        ...this.state.settings,
        ...savedSettings,
      };
    }

    // Загрузка магазина
    this.state.shop.purchasedItems = this.storage.getPurchasedItems();
    this.state.player.coins = this.storage.getCoins();
    this.state.achievements.unlocked = this.storage.getUnlockedAchievements();
  }

  setupEventListeners() {

    this.events.on("game:start", () => {
      this.state.game.isRunning = true;
      this.state.player.stats.gamesPlayed++;
      this.saveGameState();
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
  }

  saveAllData() {
    this.saveGameState();
    this.storage.savePlayerStats(this.state.player.stats);
    this.storage.saveGameSettings(this.state.settings);
  }

  saveGameState() {
    this.storage.saveGameState({
      game: this.state.game,
      player: {
        name: this.state.player.name,
        coins: this.state.player.coins,
      },
      settings: this.state.settings,
      shop: this.state.shop,
      achievements: this.state.achievements,
    });
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
    this.state.game.score += points;
    if (this.state.game.score > this.state.player.stats.highestScore) {
      this.state.player.stats.highestScore = this.state.game.score;
    }
    this.events.emit("game:score:updated", this.state.game.score);
  }

  incrementStat(statName, amount = 1) {
    if (this.state.player.stats[statName] !== undefined) {
      this.state.player.stats[statName] += amount;
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

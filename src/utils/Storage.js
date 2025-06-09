import { GameConfig } from "../configs/GameConfig.js";

export class Storage {
  constructor() {
    this.defaultSettings = GameConfig.defaultSettings;
    this.defaultPlayerStats = {
      wins: 0,
      losses: 0,
      totalMoves: 0,
      cardsToFoundation: 0,
      highestScore: 0,
      fastestWin: Infinity,
      totalTimePlayed: 0,
      achievementsUnlocked: 0,
    };
  }

  loadGameState() {
    try {
      const state = JSON.parse(localStorage.getItem("gameState"));
      return state || null;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  loadPlayerStats(stats) {
    try {
      const playerStats = JSON.parse(localStorage.getItem("playerStats"));
      console.log('playerStatssssssssssss:', playerStats);
      
      return { ...stats, ...playerStats };
    } catch {
      return { ...stats };
    }
  }

  loadGameSettings(settings) {
    try {
      const gameSettings = JSON.parse(localStorage.getItem("gameSettings"));
      return { ...settings, ...gameSettings };
    } catch {
      return { ...settings };
    }
  }

  // === Game State ===
  saveGameState(gameState) {
    try {
      localStorage.setItem("gameState", JSON.stringify(gameState));
      return true;
    } catch (e) {
      console.error("Error saving game state:", e);
      return false;
    }
  }

  clearGameState() {
    localStorage.removeItem("gameState");
  }

  // === Shop & Inventory ===
  addPurchasedItem(itemId) {
    const purchased = this.getPurchasedItems();
    if (!purchased.includes(itemId)) {
      purchased.push(itemId);
      localStorage.setItem("purchasedItems", JSON.stringify(purchased));
    }
  }

  // потом
  getPurchasedItems() {
    try {
      return JSON.parse(localStorage.getItem("purchasedItems")) || [];
    } catch {
      return [];
    }
  }

  // === Coins Economy ===
  addCoins(amount) {
    const current = this.getCoins();
    localStorage.setItem("gameCoins", current + amount);
  }

  deductCoins(amount) {
    const current = this.getCoins();
    localStorage.setItem("gameCoins", Math.max(0, current - amount));
  }

  getCoins() {
    return parseInt(localStorage.getItem("gameCoins")) || 0;
  }

  // === Session Data ===
  saveSessionData(data) {
    sessionStorage.setItem("gameSession", JSON.stringify(data));
  }

  loadSessionData() {
    return JSON.parse(sessionStorage.getItem("gameSession"));
  }

  clearSessionData() {
    sessionStorage.removeItem("gameSession");
  }

  // === Helpers ===
  clearAll() {
    localStorage.clear();
    sessionStorage.clear();
  }

  migrateLegacyData() {
    // Перенос данных из старых версий при необходимости
    if (localStorage.getItem("legacyData")) {
      // Логика миграции...
      localStorage.removeItem("legacyData");
    }
  }

  // ... существующие методы ...

  getShopItems() {
    const defaultItems = [
      {
        id: "classic_faces",
        name: "Классические лица",
        type: "cardFace",
        styleClass: "classic-fup",
        price: 0,
        description: "Стандартный дизайн карт",
        previewStyle: "linear-gradient(135deg, #fff, #eee)",
      },
      {
        id: "cosmo_faces",
        name: "Космический стиль",
        type: "cardFace",
        styleClass: "cosmo-fup",
        price: 100,
        description: "Футуристический дизайн карт",
        previewStyle: "linear-gradient(135deg, #6e48aa, #9d50bb)",
      },
      // Другие предметы магазина...
    ];

    return JSON.parse(localStorage.getItem("shopItems")) || defaultItems;
  }

  // === Achievements ===
  addUnlockAchievement(achievementId) {
    const unlocked = this.getUnlockedAchievements();
    if (!unlocked.includes(achievementId)) {
      unlocked.push(achievementId);
      localStorage.setItem("unlockedAchievements", JSON.stringify(unlocked));

      // Обновляем счетчик в статистике
      const stats = this.loadPlayerStats();
      stats.achievementsUnlocked = unlocked.length;
      this.savePlayerStats(stats);
    }
  }

  getUnlockedAchievements() {
    try {
      return JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
    } catch {
      return [];
    }
  }

  // getPlayerStats() {
  //   const defaultPlayerStats = {
  //     wins: 0,
  //     losses: 0,
  //     totalMoves: 0,
  //     highestScore: 0,
  //     fastestWin: Infinity,
  //     totalTimePlayed: 0,
  //   };

  //   return JSON.parse(localStorage.getItem("playerStats")) || defaultPlayerStats;
  // }

  // === Settings ===
  saveGameSettings(settings) {
    const storage = JSON.parse(localStorage.getItem("gameSettings"));
    const settingsState = {
      ...storage,
      ...settings,
    };
    localStorage.setItem("gameSettings", JSON.stringify(settingsState));
  }

  // === Player Data ===
  savePlayerData(name) {
    console.log('name:', name);
    
    // console.log("playerData:", playerData);
    const playerStats = JSON.parse(localStorage.getItem("playerStats"));
    console.log('playerStats:', playerStats);
    
    localStorage.setItem("playerData", JSON.stringify(playerData));
  }

  // === Stats ===
  // изночально было savePlayerStats(stats)???????????????????????????????
  savePlayerStats(stats) {    
    const storage = JSON.parse(localStorage.getItem("playerStats"));    
    const playerStats = {
      ...storage,
      ...stats,
    };    
    localStorage.setItem("playerStats", JSON.stringify(playerStats));
  }
}

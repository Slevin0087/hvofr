import { GameConfig } from "../configs/GameConfig.js";

export class Storage {
  constructor() {
    this.defaultSettings = GameConfig.defaultSettings;
    this.defaultStats = {
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

  loadGameState() {
    try {
      const state = JSON.parse(localStorage.getItem("gameState"));
      return state || null;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  loadPlayerData() {
    return (
      JSON.parse(localStorage.getItem("playerData")) || {
        name: "Игрок",
        coins: 0,
      }
    );
  }

  loadPlayerStats() {
    try {
      const stats = JSON.parse(localStorage.getItem("playerStats"));
      return { ...this.defaultStats, ...stats };
    } catch {
      return { ...this.defaultStats };
    }
  }

  loadGameSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem("gameSettings"));
      return { ...this.defaultSettings, ...settings };
    } catch {
      return { ...this.defaultSettings };
    }
  }

  clearGameState() {
    localStorage.removeItem("gameState");
  }

  // === Shop & Inventory ===
  purchaseItem(itemId) {
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

  //   // изночально было
  //   getPurchasedItems() {
  //     return JSON.parse(localStorage.getItem("purchasedItems")) || [];
  //   }

  addPurchasedItem(itemId) {
    const purchased = this.getPurchasedItems();
    if (!purchased.includes(itemId)) {
      purchased.push(itemId);
      localStorage.setItem("purchasedItems", JSON.stringify(purchased));
    }
  }

  //   // изночально было
  //   getUnlockedAchievements() {
  //     return JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
  //   }

  //   // изночально было
  //   unlockAchievement(achievementId) {
  //     const unlocked = this.getUnlockedAchievements();
  //     if (!unlocked.includes(achievementId)) {
  //       unlocked.push(achievementId);
  //       localStorage.setItem("unlockedAchievements", JSON.stringify(unlocked));
  //     }
  //   }

  // === Achievements ===
  // потом
  unlockAchievement(achievementId) {
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

  // потом
  getUnlockedAchievements() {
    try {
      return JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
    } catch {
      return [];
    }
  }

  getPlayerStats() {
    const defaultStats = {
      wins: 0,
      losses: 0,
      totalMoves: 0,
      highestScore: 0,
      fastestWin: Infinity,
      totalTimePlayed: 0,
    };

    return JSON.parse(localStorage.getItem("playerStats")) || defaultStats;
  }

  // === Settings ===
  saveGameSettings(settings) {
    const mergedSettings = {
      ...this.defaultSettings,
      ...settings,
    };
    localStorage.setItem("gameSettings", JSON.stringify(mergedSettings));
  }

  // === Player Data ===
  savePlayerData(playerData) {
    // console.log("playerData:", playerData);

    localStorage.setItem("playerData", JSON.stringify(playerData));
  }

  //   // изночально. нужен ли????????????????????????????????????????
  //   savePlayerStats(stats) {
  //     localStorage.setItem("playerStats", JSON.stringify(stats));
  //   }

  // === Stats ===
  // изночально было savePlayerStats(stats)???????????????????????????????
  savePlayerStats(stats) {
    const mergedStats = {
      ...this.defaultStats,
      ...stats,
    };
    localStorage.setItem("playerStats", JSON.stringify(mergedStats));
  }
}

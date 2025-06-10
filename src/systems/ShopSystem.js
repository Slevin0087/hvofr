import { Storage } from "../utils/Storage.js";
import { Validator } from "../utils/Validator.js";

export class ShopSystem {
  constructor(stateManager, eventManager) {
    this.state = stateManager;
    this.events = eventManager;
    this.storage = new Storage();
    this.validator = new Validator();
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.loadShopItems();
  }

  setupEventListeners() {
    this.events.on("shop:item:select", (itemId) =>
      this.handleItemSelect(itemId)
    );
    this.events.on("shop:item:purchase", (itemId) => this.purchaseItem(itemId));
    this.events.on("shop:category:change", (category) =>
      this.changeCategory(category)
    );
  }

  loadShopItems() {
    const items = this.storage.getShopItems();
    const purchasedItems = this.storage.getPurchasedItems();

    this.state.shop = {
      items: items.map((item) => ({
        ...item,
        owned: purchasedItems.includes(item.id),
      })),
      currentCategory: "cardFaces",
      balance: this.storage.getCoins(),
    };
  }

  handleItemSelect(itemId) {
    const item = this.state.shop.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.owned) {
      this.applyItem(item);
      this.events.emit("ui:notification", `Стиль "${item.name}" применен`);
    } else {
      this.events.emit("shop:item:preview", item);
    }
  }

  purchaseItem(itemId) {
    const item = this.state.shop.items.find((i) => i.id === itemId);
    if (!item || item.owned) return;

    if (this.state.shop.balance >= item.price) {
      this.state.shop.balance -= item.price;
      item.owned = true;

      this.storage.saveCoins(this.state.shop.balance);
      this.storage.addPurchasedItem(itemId);

      this.applyItem(item);
      this.events.emit(
        "ui:notification",
        `Стиль "${item.name}" куплен и применен`
      );
    } else {
      this.events.emit("ui:notification", "Недостаточно монет", "error");
    }
  }

  applyItem(item) {
    switch (item.type) {
      case "cardFace":
        this.state.state.settings.cardFaceStyle = item.styleClass;
        break;
      case "cardBack":
        this.state.state.settings.cardBackStyle = item.styleClass;
        break;
      case "background":
        this.state.state.settings.backgroundImage = item.imageUrl;
        break;
    }

    this.storage.saveGameSettings(this.state.state.settings);
    this.events.emit("game:settings:update", this.state.state.settings);
  }

  changeCategory(category) {
    this.state.shop.currentCategory = category;
    this.events.emit("shop:render", this.state.shop);
  }

  addCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.state.shop.balance += amount;
    this.storage.saveCoins(this.state.shop.balance);
    this.events.emit("shop:balance:update", this.state.shop.balance);
  }
}

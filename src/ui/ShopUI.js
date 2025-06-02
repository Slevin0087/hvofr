import { Animator } from "../utils/Animator.js";

export class ShopUI {
  constructor(eventManager, stateManager) {
    this.events = eventManager;
    this.state = stateManager;
    this.page = document.getElementById("shop");
    this.displayPage = "";
    this.elements = {
      backBtn: document.getElementById("shop-back"),
      balance: document.getElementById("coins"),
      categoryButtons: {
        faces: document.getElementById("face-btn"),
        backs: document.getElementById("shirt-btn"),
        backgrounds: document.getElementById("fon-btn"),
      },
      containers: {
        faces: document.getElementById("face-container"),
        backs: document.getElementById("shirt-container"),
        backgrounds: document.getElementById("fon-container"),
      },
      // itemsContainer: document.getElementById("shop-items-container"),
      itemsContainer: document.getElementById("all-items-container"),
    };

    this.initialize();
  }

  initialize() {
    this.getDisplayPage();
    this.setupEventListeners();
    // this.render();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.backBtn.addEventListener("click", () => {
      this.events.emit("ui:menu:show");
    });

    Object.entries(this.elements.categoryButtons).forEach(([category, btn]) => {
        console.log('category:', typeof category);
        
      btn.addEventListener("click", () => {
        this.events.emit("shop:category:change", category);
      });
    });

    this.events.on("shop:render", (shopState) => this.render(shopState));
    this.events.on("shop:balance:update", (balance) =>
      this.updateBalance(balance)
    );
  }

  render(shopState = this.state.state.shop) {
    console.log("в render:", this.state);

    // Очищаем контейнер
    this.elements.itemsContainer.innerHTML = "";

    // Устанавливаем активную категорию
    this.setActiveCategory(shopState.currentCategory);

    // Рендерим предметы текущей категории
    const items = shopState.items.filter(
      (item) => item.type === this.getTypeForCategory(shopState.currentCategory)
    );

    items.forEach((item) => {
      const itemElement = this.createShopItemElement(item);
      this.elements.itemsContainer.appendChild(itemElement);
    });

    // Обновляем баланс
    this.updateBalance(shopState.balance);
  }

  createShopItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.className = `shop-item ${item.owned ? "owned" : ""}`;
    itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <div class="item-preview" style="background: ${
              item.previewStyle
            }"></div>
            <p>${item.description}</p>
            <button class="shop-action-btn" 
                    data-id="${item.id}" 
                    data-price="${item.price}">
                ${item.owned ? "Применить" : `Купить (${item.price})`}
            </button>
        `;

    const button = itemElement.querySelector(".shop-action-btn");
    button.addEventListener("click", () => {
      if (item.owned) {
        this.events.emit("shop:item:select", item.id);
      } else {
        this.events.emit("shop:item:purchase", item.id);
      }
    });

    return itemElement;
  }

  setActiveCategory(category) {
    console.log("в setActiveCategory:", category);

    // Обновляем кнопки
    Object.values(this.elements.categoryButtons).forEach((btn) => {
      btn.classList.remove("active-shop-btn");
    });
    this.elements.categoryButtons[category].classList.add("active-shop-btn");

    // Обновляем контейнеры
    Object.values(this.elements.containers).forEach((container) => {
      container.style.display = "none";
    });
    this.elements.containers[category].style.display = "block";
  }

  updateBalance(balance) {
    this.elements.balance.textContent = balance;
  }

  getTypeForCategory(category) {
    const mapping = {
      faces: "cardFace",
      backs: "cardBack",
      backgrounds: "background",
    };
    return mapping[category];
  }

  show() {
    this.page.classList.remove("hidden");
    Animator.fadeIn(this.page);
  }

  hide() {
    Animator.fadeOut(this.page).then(() => {
      this.page.classList.add("hidden");
    });
  }
}

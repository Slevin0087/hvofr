import { Animator } from "../utils/Animator.js";
import { ShopConfig } from "../configs/ShopConfig.js";

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
      // console.log('category:', typeof category);

      btn.addEventListener("click", () => {
        this.events.emit("shop:category:change", category, ShopConfig);
      });
    });

    // this.events.on("shop:render", (shopState) => this.render(shopState));
    this.events.on("shop:render", (shopState, config) =>
      this.render(shopState, config)
    );
    this.events.on("shop:balance:update", (balance) =>
      this.updateBalance(balance)
    );
  }

  // render(shopState = this.state.state.shop) {
  //   console.log("в render:", this.state);

  //   // Очищаем контейнер
  //   this.elements.itemsContainer.innerHTML = "";

  //   // Устанавливаем активную категорию
  //   this.setActiveCategory(shopState.currentCategory);

  //   // Рендерим предметы текущей категории
  //   const items = shopState.items.filter(
  //     (item) => item.type === this.getTypeForCategory(shopState.currentCategory)
  //   );

  //   items.forEach((item) => {
  //     const itemElement = this.createShopItemElement(item);
  //     this.elements.itemsContainer.appendChild(itemElement);
  //   });

  //   // Обновляем баланс
  //   this.updateBalance(shopState.balance);
  // }

  render(shopState = this.state.state.shop, ShopConfig) {
    console.log("в render:", this.state);

    // Очищаем контейнер
    this.elements.itemsContainer.innerHTML = "";

    // Устанавливаем активную категорию
    this.setActiveCategory(shopState.currentCategory);

    // Рендерим предметы текущей категории
    const items = ShopConfig.items.filter(
      (item) =>
        item.category === this.getTypeForCategory(shopState.currentCategory)
    );
    console.log("items:", items);

    items.forEach((item) => {
      console.log("dddddddddddddddddddddddddd");
      const itemElement = this.createShopItemElement(item);
      this.elements.itemsContainer.appendChild(itemElement);
    });

    // Обновляем баланс
    // this.updateBalance(shopState.balance);
    this.updateBalance(this.state.state.player.coins);
  }

  // <div class="item-container" id="classic-skin">
  //         <p>Классический</p>
  //         <div class="shop-card-container">
  //           <div class="item" data-style="classic" id="classic-skin-1">
  //             <div
  //               class="shop-card"
  //               data-suit="♥"
  //               data-value="A"
  //               data-color="red"
  //             >
  //               <span class="shop-card-top-left value-red">A♥</span>
  //               <span class="shop-card-center value-red">♥</span>
  //               <span class="shop-card-bottom-right value-red">A♥</span>
  //             </div>
  //           </div>
  //           <div class="item" data-style="classic" id="classic-skin-2">
  //             <div
  //               class="shop-card"
  //               data-suit="♣"
  //               data-value="K"
  //               data-color="black"
  //             >
  //               <span class="shop-card-top-left value-black">K♣</span>
  //               <span class="shop-card-center value-black">♣</span>
  //               <span class="shop-card-bottom-right value-black">K♣</span>
  //             </div>
  //           </div>
  //         </div>
  //         <button class="buy-btn" data-style-btn="classic-fup" data-price="0">
  //           Выбрать
  //         </button>
  //       </div>

  createShopItemElement(item) {
    console.log("в createShopItemElement");

    const containerElement = document.createElement("div");
    containerElement.className = "item-container";

    const itemElement = document.createElement("div");
    itemElement.className = `shop-item ${item.owned ? "owned" : ""}`;
    itemElement.innerHTML = `
    <div class="item-head">
      <h3>${item.name}</h3>
      <div class="item-preview" style="background: ${item.previewStyle}"></div>
      <p>${item.description}</p>
    </div>
    <div class="shop-item-container">
      <div 
          class="shop-card"
          data-suit="♥"
          data-value="A"
          data-color="red"
      >
        <span class="shop-card-top-left value-red">A♥</span>
        <span class="shop-card-center value-red">♥</span>
        <span class="shop-card-bottom-right value-red">A♥</span>
      </div>
      <div
          class="shop-card"
          data-suit="♣"
          data-value="K"
          data-color="black"
      >
        <span class="shop-card-top-left value-black">K♣</span>
        <span class="shop-card-center value-black">♣</span>
        <span class="shop-card-bottom-right value-black">K♣</span>
      </div>
    </div>  
    <button class="shop-action-btn" 
    data-id="${item.id}" 
    data-price="${item.price}">
    ${item.owned ? "Применить" : `Купить (${item.price})`}
    </button>
    `;

    containerElement.appendChild(itemElement);

    const button = itemElement.querySelector(".shop-action-btn");
    button.addEventListener("click", () => {
      if (item.owned) {
        this.events.emit("shop:item:select", item.id);
      } else {
        this.events.emit("shop:item:purchase", item.id);
      }
    });

    return containerElement;
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
    // Animator.fadeIn(this.page);
  }

  hide() {
    // Animator.fadeOut(this.page).then(() => {
    this.page.classList.add("hidden");
    // });
  }
}

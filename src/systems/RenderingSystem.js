import { Animator } from "../utils/Animator.js";
// import { Helpers } from "../utils/Helpers.js";
import { UIConfig } from "../configs/UIConfig.js";
// import { Stock } from "../core/Stock.js";

export class RenderingSystem {
  constructor(stateManager, eventManager, stock, foundations, tableaus) {
    this.state = stateManager;
    this.events = eventManager;
    this.stock = stock;
    this.foundations = foundations;
    this.tableaus = tableaus;
    this.cache = new Map();
    this.domElements = {
      gameContainer: document.getElementById("game-container"),
      rowElement: document.getElementById("row"),
      foundationsDiv: document.getElementById("foundationsDiv"),
      tableausEl: document.getElementById("tableausDiv"),
      stockDivEl: document.getElementById("stockDiv"),
      wasteContainer: document.getElementById("waste"),
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    // this.setupGameArea();
  }

  // изначально, потом renderFullGame
  //   renderGame(deck, tableaus, foundations, stock) {
  //     // this.clearGameElements();
  //     this.renderTableaus(tableaus);
  //     this.renderFoundations(foundations);
  //     this.renderStock(stock);
  //     this.renderWaste(stock);
  //   }

  // изначально
  // renderCard(card, containerId, offset) {
  //   const cardElement = this.createCardElement(card);
  //   const container = this.getCachedElement(containerId);

  //   if (!container) return;

  //   this.setCardPosition(cardElement, container, offset);
  //   this.setCardStyles(cardElement, card);
  //   this.setupCardEventListeners(cardElement, card);

  //   container.appendChild(cardElement);
  //   card.parentElement = container;
  //   card.cardEl = cardElement;
  // }

  // Остальные методы рендеринга...

  setupEventListeners() {
    this.events.on("game:start", () => this.renderFullGame());
    // this.events.on("card:moved", (data) => this.animateCardMove(data));
    this.events.on("card:moved", () => this.renderCards());
    this.events.on("card:flipped", (card) => this.animateCardFlip(card));
    this.events.on("game:undo:move", (data) => this.animateUndoMove(data));
    this.events.on("hint:show", (hint) => this.showHint(hint));
    this.events.on("ui:theme:change", (theme) => this.applyTheme(theme));
  }

  // setupGameArea() {
  //   // Создаем DOM элементы для игровых зон
  //   this.createFoundations();
  //   this.createTableaus();
  //   this.createStockAndWaste();
  //   this.applyTheme(this.state.state.settings.theme);
  // }

  createFoundations() {
    this.domElements.foundationsContainer.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const foundation = document.createElement("div");
      foundation.className = "foundation";
      foundation.id = `foundation-${i}`;
      this.domElements.foundationsContainer.appendChild(foundation);
    }
  }

  createTableaus() {
    this.domElements.tableausContainer.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const tableau = document.createElement("div");
      tableau.className = "tableau";
      tableau.id = `tableau-${i}`;
      this.domElements.tableausContainer.appendChild(tableau);
    }
  }

  createStockAndWaste() {
    this.domElements.stockContainer.innerHTML = "";
    this.domElements.wasteContainer.innerHTML = "";

    const stock = document.createElement("div");
    stock.className = "stock";
    stock.id = "stock";
    this.domElements.stockContainer.appendChild(stock);

    const waste = document.createElement("div");
    waste.className = "waste";
    waste.id = "waste";
    this.domElements.wasteContainer.appendChild(waste);
  }

  // потом, изначально renderGame
  renderFullGame() {
    this.clearAllCards();
    // this.renderStock();
    // this.renderWaste();
    // this.renderFoundations();
    // this.renderTableaus();
    this.renderGame();
  }

  /////////////////////////////////
  renderGame() {
    // Очищение контейнеров
    this.domElements.gameContainer.innerHTML = '';
    this.domElements.rowElement.innerHTML = '';
    this.domElements.tableausEl.innerHTML = '';
    this.domElements.foundationsDiv.innerHTML = '';
    this.domElements.stockDivEl.innerHTML = '';


    // Добавляем элементы в DOM
    this.domElements.gameContainer.append(
      this.domElements.rowElement,
      this.domElements.tableausEl,
    );
    this.domElements.rowElement.append(
      this.domElements.stockDivEl,
      this.domElements.foundationsDiv
    );

    this.domElements.stockDivEl.appendChild(this.stock.element);
    this.domElements.stockDivEl.appendChild(this.stock.wasteElement);

    this.foundations.forEach((foundation) => {
      this.domElements.foundationsDiv.appendChild(foundation.element);
    });

    this.tableaus.forEach((tableau) => {
      this.domElements.tableausEl.appendChild(tableau.element);
    });
    // Рендерим карты
    this.renderCards();
  }

  renderCards() {
    // Очищаем старые карты
    document.querySelectorAll(".card").forEach((el) => el.remove());
    // Рендерим карты в tableau
    this.renderCardsForTableau();
    // Рендерим карты в foundations
    this.renderCardsForFoundation();
    // Рендерим карту в waste
    this.renderCardsForWaste();
    // Устанавливаем стили для stock добавив класс
    this.renderStockElement();
  }

  renderCardsForFoundation() {
    console.log('в renderCardsForFoundation');
    this.foundations.forEach((foundation, i) => {
      if (foundation.cards.length > 0) {
        const card = foundation.cards[foundation.cards.length - 1];
        this.renderCard(card, `foundation-${i}`, 0);
      }
    });
  }

  renderCardsForTableau() {
    this.tableaus.forEach((tableau, i) => {
      // console.log('renderCardssssssssss', tableau);
      tableau.cards.forEach((card, j) => {
        this.renderCard(card, `tableau-${i}`, j);
      });
    });
  }

  renderCardsForWaste() {
    const wasteCard = this.stock.getWasteCard();
    // console.log('wasteCard:', wasteCard);
    if (wasteCard) {
      wasteCard.wasteCard = true;
      this.renderCard(wasteCard, "waste", 0);
    }
  }

  renderStockElement() {
    this.stock.element.className = "";
    this.stock.element.classList.add("stock");
    // if (this.stock.index === this.stock.cards.length) {
    //   console.log("if");

    //   this.stock.element.classList.replace("stock", "card-waste");
    // } else {
    //   this.stock.element.classList.add(
    //     "card-back",
    //     `${shopItemsShirt.selectedStyle}`
    //   );
    // }
  }
  ////////////////////////////////////////////////////////

  clearAllCards() {
    document.querySelectorAll(".card").forEach((card) => card.remove());
  }

  renderStock() {
    const stock = this.state.game.stock;
    const stockElement = this.domElements.stockContainer.firstChild;

    if (stock.isEmpty()) {
      stockElement.classList.add("empty");
      return;
    }

    stockElement.classList.remove("empty");
    stockElement.className = "stock " + this.state.state.settings.cardBack;
  }

  renderWaste() {
    const waste = this.state.game.stock.getWasteCard();
    const wasteElement = this.domElements.wasteContainer.firstChild;
    wasteElement.innerHTML = "";

    if (!waste) {
      wasteElement.classList.add("empty");
      return;
    }

    wasteElement.classList.remove("empty");
    this.renderCard(waste, "waste");
  }

  renderFoundations() {    
    this.state.game.foundations.forEach((foundation, index) => {
      const foundationElement = document.getElementById(`foundation-${index}`);
      foundationElement.innerHTML = "";

      if (foundation.isEmpty()) {
        foundationElement.classList.add("empty");
        return;
      }

      foundationElement.classList.remove("empty");
      const topCard = foundation.getTopCard();
      this.renderCard(topCard, `foundation-${index}`);
    });
  }

  renderTableaus() {
    this.state.game.tableaus.forEach((tableau, index) => {
      const tableauElement = document.getElementById(`tableau-${index}`);
      tableauElement.innerHTML = "";

      tableau.cards.forEach((card, cardIndex) => {
        this.renderCard(card, `tableau-${index}`, cardIndex);
      });
    });
  }

  // после
  renderCard(card, containerId, offset = 0) {
    // console.log('renderCardddddddddddddddddddd');

    const container = document.getElementById(containerId);
    if (!container) return;

    // Используем кэшированный элемент если есть
    if (this.cache.has(card)) {
      const cachedElement = this.cache.get(card);
      container.appendChild(cachedElement);
      this.updateCardPosition(cachedElement, containerId, offset);
      return;
    }

    // Создаем новый элемент карты
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.color}`;
    cardElement.dataset.suit = card.suit;
    cardElement.dataset.value = card.value;

    // Создаем элементы для символов карты
    const topSymbol = document.createElement("div");
    topSymbol.className = "card-symbol top";
    topSymbol.textContent = card.getSymbol();

    const centerSymbol = document.createElement("div");
    centerSymbol.className = "card-symbol center";
    centerSymbol.textContent = card.suit;

    const bottomSymbol = document.createElement("div");
    bottomSymbol.className = "card-symbol bottom";
    bottomSymbol.textContent = card.getSymbol();

    // Собираем карту
    cardElement.append(topSymbol, centerSymbol, bottomSymbol);

    // Настройка рубашки/лица
    if (!card.faceUp) {
      cardElement.classList.add(
        "face-down",
        this.state.state.settings.cardBack
      );
    } else {
      cardElement.classList.add(this.state.state.settings.cardFace);
    }

    // Позиционирование
    this.updateCardPosition(cardElement, containerId, offset);

    // Сохраняем в кэш
    this.cache.set(card, cardElement);

    // Добавляем обработчики
    this.addCardEventListeners(cardElement, card);

    // Добавляем в DOM
    container.appendChild(cardElement);

    // Сохраняем ссылку на DOM элемент в карте
    card.domElement = cardElement;
  }

  updateCardPosition(cardElement, containerId, offset) {
    const isTableau = containerId.startsWith("tableau");
    const offsetPx = offset * UIConfig.layout.card.overlap;

    cardElement.style.transform = isTableau ? `translateY(${offsetPx}px)` : "";

    cardElement.style.zIndex = offset;
  }

  addCardEventListeners(cardElement, card) {
    if (!card.faceUp) return;

    cardElement.addEventListener("click", () => {
      this.events.emit("card:clicked", card);
    });

    // Добавляем обработчики для drag and drop
    // cardElement.addEventListener("mousedown", (e) => {
    //   this.handleDragStart(e, card, cardElement);
    // });

    // cardElement.addEventListener(
    //   "touchstart",
    //   (e) => {
    //     this.handleDragStart(e, card, cardElement);
    //   },
    //   { passive: true }
    // );
  }

  handleDragStart(e, card, cardElement) {
    if (this.state.game.isPaused) return;

    this.events.emit("card:drag:start", {
      card,
      element: cardElement,
      clientX: e.clientX || e.touches[0].clientX,
      clientY: e.clientY || e.touches[0].clientY,
    });
  }

  animateCardMove({ card, from, to }) {
    console.log('заход в анимацию');
    
    const cardElement = card.domElement;
    if (!cardElement) return;

    const fromElement = document.getElementById(from);
    const toElement = document.getElementById(to);

    if (!fromElement || !toElement) return;

    // Animator.moveCard({
      Animator.animateCardMove({
      element: cardElement,
      from: fromElement,
      to: toElement,
      duration: UIConfig.animations.cardMoveDuration,
      onComplete: () => {
        this.cache.delete(card);
        // this.renderFullGame();
        this.renderCards();
      },
    });
  }

  animateCardFlip(card) {
    const cardElement = card.domElement;
    if (!cardElement) return;

    Animator.flipCard({
      element: cardElement,
      duration: UIConfig.animations.cardFlipDuration,
      onComplete: () => {
        cardElement.classList.remove(
          "face-down",
          this.state.state.settings.cardBack
        );
        cardElement.classList.add(this.state.state.settings.cardFace);
        this.addCardEventListeners(cardElement, card);
      },
    });
  }

  animateUndoMove({ card, from, to }) {
    // Анимация обратного перемещения
    this.animateCardMove({ card, from: to, to: from });
  }

  showHint(hint) {
    const { card, target } = hint;
    const cardElement = card.domElement;
    const targetElement = document.getElementById(target);

    if (!cardElement || !targetElement) return;

    // Подсвечиваем карту и цель
    Animator.highlightElement(cardElement, {
      color: "#ffeb3b",
      duration: 2000,
    });
    Animator.highlightElement(targetElement, {
      color: "#4caf50",
      duration: 2000,
    });

    // Показываем подсказку в UI
    this.events.emit("ui:hint:show", hint);
  }

  applyTheme(themeName) {
    const theme = UIConfig.themes[themeName] || UIConfig.themes.default;

    // Применяем цвета темы
    document.documentElement.style.setProperty(
      "--primary-color",
      theme.colors.primary
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      theme.colors.secondary
    );
    document.documentElement.style.setProperty(
      "--background-color",
      theme.colors.background
    );
    document.documentElement.style.setProperty(
      "--text-color",
      theme.colors.text
    );

    // Применяем шрифты
    document.documentElement.style.setProperty("--main-font", theme.fonts.main);
    document.documentElement.style.setProperty(
      "--title-font",
      theme.fonts.title
    );
  }

  clearCache() {
    this.cache.clear();
  }
}

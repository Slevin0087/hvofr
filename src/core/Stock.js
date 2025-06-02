export class Stock {
  constructor() {
    this.cards = [];
    this.waste = [];
    this.position = 0; // Текущая позиция в стоке
    this.element = this.createStockElement();
    this.wasteElement = this.createWasteElement();
  }

  createStockElement() {
    const element = document.createElement("div");
    element.className = "stock";
    element.id = "stock";
    // element.style.left = "20px";
    // element.style.top = "20px";
    return element;
  }

  createWasteElement() {
    const element = document.createElement("div");
    // element.className = "card-placeholder";
    element.className = "card-waste";
    element.id = "waste";
    // element.style.left = "110px";
    // element.style.top = "20px";
    return element;
  }

  addCards(cards) {
    this.cards = cards;
    this.position = 0;
    this.waste = [];
  }

  deal() {
    if (this.position >= this.cards.length) {
      if (this.waste.length === 0) return null;
      this.recycleWaste();
      return null;
    }

    const card = this.cards[this.position];
    card.faceUp = false; // Карты в стоке рубашкой вверх
    this.position++;
    return card;
  }

  moveToWaste(card) {
    card.faceUp = true;
    this.waste.push(card);
  }

  getWasteCard() {
    return this.waste.length > 0 ? this.waste[this.waste.length - 1] : null;
  }

  takeFromWaste() {
    return this.waste.pop();
  }

  recycleWaste() {
    this.cards = [...this.waste.reverse()];
    this.waste = [];
    this.position = 0;
    this.cards.forEach((card) => (card.faceUp = false));
  }

  isEmpty() {
    return this.cards.length === 0 && this.waste.length === 0;
  }

  serialize() {
    return {
      cards: this.cards.map((card) => card.serialize()),
      waste: this.waste.map((card) => card.serialize()),
      position: this.position,
    };
  }

  static deserialize(data) {
    const stock = new Stock();
    stock.cards = data.cards.map((cardData) => Card.deserialize(cardData));
    stock.waste = data.waste.map((cardData) => Card.deserialize(cardData));
    stock.position = data.position;
    return stock;
  }
}

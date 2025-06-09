import { Helpers } from "../utils/Helpers.js";

export class Tableau {
  constructor(index) {
    this.index = index;
    this.cards = [];
    this.element = this.createTableauElement();
  }

  createTableauElement() {
    const element = document.createElement("div");
    const span = document.createElement("span");
    element.className = "card-placeholder";
    element.id = `tableau-${this.index}`;
    span.textContent = "K";
    span.classList.add("card-placeholder-span");
    element.appendChild(span);
    return element;
  }

  canAccept(card) {
    if (!card.faceUp) return false;

    // Пустой tableau принимает только королей
    if (this.isEmpty()) {
      return card.value === "K";
    }

    // Проверяем последовательность и цвет
    const topCard = this.getTopCard();
    // console.log("topCard:", topCard);

    return card.isOppositeColor(topCard) && card.isNextInSequence(topCard);
  }

  addCard(card) {
    // console.log('добавляется в tableau:', card);
    const position = this.cards.length;
    card.positionData = {
      parent: `tableau-${this.index}`,
      index: position,
      offset: position * 20, // Смещение для каскадного отображения
      zIndex: position,
    };
    this.cards.push(card);
  }

  addCards(cards) {
    cards.forEach((card) => this.addCard(card));
  }

  getTopCard() {
    return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  flipTopCard() {
    const topCard = this.getTopCard();
    if (topCard && !topCard.faceUp) {
      return topCard.flip();
    }
    return false;
  }

  removeCard(card) {
    // console.log('удаление карты из tableau:', card);
    const index = this.cards.indexOf(card);
    if (index >= 0) {
      this.cards.splice(index, 1);
      this.updatePositions();
      return true;
    }
    return false;
  }

  removeCardsFrom(card) {
    const index = this.cards.indexOf(card);
    if (index >= 0) {
      const removedCards = this.cards.splice(index);
      this.updatePositions();
      return removedCards;
    }
    return [];
  }

  updatePositions() {
    this.cards.forEach((card, index) => {
      card.positionData.index = index;
      card.positionData.offset = index * 20;
      card.positionData.zIndex = index;
    });
  }

  serialize() {
    return {
      index: this.index,
      cards: this.cards.map((card) => card.serialize()),
    };
  }

  static deserialize(data) {
    const tableau = new Tableau(data.index);
    tableau.cards = data.cards.map((cardData) => Card.deserialize(cardData));
    return tableau;
  }
}

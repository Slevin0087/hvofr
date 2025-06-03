import { GameEvents } from "../utils/Constants.js";
import { Animator } from "../utils/Animator.js";
import { Helpers } from "../utils/Helpers.js";

export class CardSystem {
  constructor(stateManager, eventManager) {
    this.state = stateManager;
    this.events = eventManager;
    this.dragState = null;
    this.selectedCard = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.events.on(GameEvents.CARD_CLICK, (card) => this.handleCardClick(card));
    this.events.on(GameEvents.CARD_DRAG_START, (card, element) =>
      this.handleDragStart(card, element)
    );
    this.events.on(GameEvents.CARD_DRAG_END, () => this.handleDragEnd());
    this.events.on(GameEvents.CARD_DROP, (target) => this.handleDrop(target));
    this.events.on("game:undo", () => this.handleUndo());
  }

  handleCardClick(card) {
    if (this.state.game.isPaused) return;

    // Если карта уже выбрана - снимаем выделение
    if (this.selectedCard === card) {
      this.deselectCard();
      return;
    }

    // Выделяем новую карту
    this.selectCard(card);
  }

  selectCard(card) {
    this.deselectCard();
    this.selectedCard = card;

    // Визуальное выделение карты
    this.events.emit("card:select", card);

    // Подсветка возможных ходов
    this.highlightValidTargets(card);
  }

  deselectCard() {
    if (!this.selectedCard) return;

    this.events.emit("card:deselect", this.selectedCard);
    this.events.emit("ui:clear:highlights");
    this.selectedCard = null;
  }

  highlightValidTargets(card) {
    const { foundations, tableaus } = this.state.game;

    // Проверка foundation
    foundations.forEach((foundation, index) => {
      if (foundation.canAccept(card)) {
        this.events.emit("ui:highlight:foundation", index);
      }
    });

    // Проверка tableau
    tableaus.forEach((tableau, index) => {
      if (tableau.canAccept(card)) {
        this.events.emit("ui:highlight:tableau", index);
      }
    });
  }

  handleDragStart(card, element) {
    if (this.state.game.isPaused) return;

    this.dragState = {
      card,
      element,
      source: card.positionData.parent,
      startX: element.getBoundingClientRect().left,
      startY: element.getBoundingClientRect().top,
      offsetX: 0,
      offsetY: 0,
      validTargets: this.getValidTargets(card),
    };

    this.events.emit("ui:drag:start", element);
  }

  handleDragEnd() {
    if (!this.dragState) return;

    this.events.emit("ui:drag:end");
    this.dragState = null;
  }

  handleDrop(target) {
    if (!this.dragState || !target) {
      this.handleDragEnd();
      return;
    }

    const { card, source, validTargets } = this.dragState;

    // Проверяем, является ли цель валидной
    if (validTargets.includes(target)) {
      this.moveCard(card, source, target);
    } else {
      this.events.emit("ui:animate:return", this.dragState);
    }

    this.handleDragEnd();
  }

  moveCard(card, source, target) {
    this.events.emit("game:move:start", { card, source, target });

    // Определяем тип цели (foundation или tableau)
    const [targetType, targetIndex] = this.parseTargetId(target);

    if (targetType === "foundation") {
      this.events.emit("card:to:foundation", {
        card,
        foundationIndex: targetIndex,
      });
    } else if (targetType === "tableau") {
      this.events.emit("card:to:tableau", {
        card,
        tableauIndex: targetIndex,
      });
    }
  }

  getValidTargets(card) {
    const { foundations, tableaus } = this.state.game;
    const targets = [];

    foundations.forEach((foundation, index) => {
      if (foundation.canAccept(card)) {
        targets.push(`foundation-${index}`);
      }
    });

    tableaus.forEach((tableau, index) => {
      if (tableau.canAccept(card)) {
        targets.push(`tableau-${index}`);
      }
    });

    return targets;
  }

  parseTargetId(targetId) {
    const [type, index] = targetId.split("-");
    return [type, parseInt(index)];
  }

  handleUndo() {
    if (!this.state.game.lastMove) return;

    const { card, from, to } = this.state.game.lastMove;
    this.events.emit("ui:animate:undo", { card, from, to }, () => {
      this.reverseMove(card, from, to);
    });
  }

  reverseMove(card, from, to) {
    const [fromType, fromIndex] = this.parseTargetId(from);

    if (fromType === "tableau") {
      this.events.emit("card:to:tableau", {
        card,
        tableauIndex: fromIndex,
      });
    } else if (fromType === "foundation") {
      this.events.emit("card:to:foundation", {
        card,
        foundationIndex: fromIndex,
      });
    } else if (fromType === "waste") {
      this.events.emit("card:to:waste", { card });
    }
  }
}

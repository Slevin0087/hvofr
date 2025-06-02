import { Animator } from "../utils/Animator.js";

export class AnimationSystem {
  constructor(stateManager, eventManager) {
    this.state = stateManager;
    this.events = eventManager;
    this.animationsQueue = [];
    this.isAnimating = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.events.on("ui:animate:move", (card, from, to, callback) =>
      this.animateCardMove(card, from, to, callback)
    );

    this.events.on("ui:animate:flip", (card, callback) =>
      this.animateCardFlip(card, callback)
    );

    this.events.on("ui:animate:return", (dragState) =>
      this.animateReturnToSource(dragState)
    );

    this.events.on("ui:animate:undo", (moveData, callback) =>
      this.animateUndoMove(moveData, callback)
    );

    this.events.on("ui:animate:win", () => this.playWinAnimation());

    this.events.on("card:select", (card) => this.highlightCard(card));

    this.events.on("card:deselect", (card) => this.unhighlightCard(card));
  }

  animateCardMove(card, fromId, toId, callback) {
    const animation = async () => {
      this.isAnimating = true;

      const fromElement = document.getElementById(fromId);
      const toElement = document.getElementById(toId);
      const cardElement = card.cardEl;

      if (!fromElement || !toElement || !cardElement) {
        console.error("Animation elements not found");
        this.isAnimating = false;
        return;
      }

      // Сохраняем исходное положение
      const originalPosition = {
        parent: cardElement.parentNode,
        zIndex: cardElement.style.zIndex,
        transform: cardElement.style.transform,
      };

      // Подготовка к анимации
      cardElement.style.zIndex = "1000";
      document.body.appendChild(cardElement);

      // Анимация перемещения
      await Animator.move({
        element: cardElement,
        from: fromElement,
        to: toElement,
        duration: 300,
      });

      // Возвращаем карту в DOM
      if (callback) callback();

      // Восстанавливаем исходные стили
      cardElement.style.zIndex = originalPosition.zIndex;
      cardElement.style.transform = originalPosition.transform;

      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  animateCardFlip(card, callback) {
    const animation = async () => {
      this.isAnimating = true;

      await Animator.flip(card.cardEl, 250);
      if (callback) callback();

      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  animateReturnToSource(dragState) {
    const animation = async () => {
      this.isAnimating = true;

      const { element, startX, startY } = dragState;
      const rect = element.getBoundingClientRect();

      await Animator.animate({
        element,
        from: { x: rect.left, y: rect.top },
        to: { x: startX, y: startY },
        duration: 300,
        easing: "ease-out",
      });

      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  animateUndoMove(moveData, callback) {
    const animation = async () => {
      this.isAnimating = true;

      const { card, from, to } = moveData;
      await this.animateCardMove(card, to, from, callback);

      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  playWinAnimation() {
    const animation = async () => {
      this.isAnimating = true;

      const cards = document.querySelectorAll(".card");
      const animations = [];

      // Анимация для каждой карты
      cards.forEach((card, index) => {
        animations.push(
          Animator.animate({
            element: card,
            from: { rotate: 0, scale: 1 },
            to: { rotate: 360, scale: 1.2 },
            duration: 1000,
            delay: index * 50,
            easing: "ease-in-out",
          }).then(() =>
            Animator.animate({
              element: card,
              from: { rotate: 360, scale: 1.2 },
              to: { rotate: 720, scale: 1 },
              duration: 1000,
              easing: "ease-in-out",
            })
          )
        );
      });

      await Promise.all(animations);
      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  highlightCard(card) {
    if (!card.cardEl) return;

    Animator.pulse(card.cardEl, 1000);
    card.cardEl.style.boxShadow = "0 0 15px gold";
  }

  unhighlightCard(card) {
    if (!card.cardEl) return;

    Animator.stop(card.cardEl);
    card.cardEl.style.boxShadow = "";
  }

  addToQueue(animationFn) {
    this.animationsQueue.push(animationFn);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.animationsQueue.length > 0 && !this.isAnimating) {
      const nextAnimation = this.animationsQueue.shift();
      nextAnimation();
    }
  }
}

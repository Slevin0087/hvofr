export class Animator {
  static animateCardMove(cardElement, targetElement, duration = 300) {
    return new Promise((resolve) => {
      const startRect = cardElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      const deltaX = targetRect.left - startRect.left;
      const deltaY = targetRect.top - startRect.top;

      cardElement.style.transition = "none";
      cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      cardElement.style.zIndex = "1000";

      requestAnimationFrame(() => {
        cardElement.style.transition = `transform ${duration}ms ease-in-out`;
        cardElement.style.transform = "translate(0, 0)";

        setTimeout(() => {
          cardElement.style.zIndex = "";
          resolve();
        }, duration);
      });
    });
  }

  static flipCard(cardElement, duration = 200) {
    return new Promise((resolve) => {
      cardElement.style.transform = "rotateY(90deg)";

      setTimeout(() => {
        cardElement.style.transform = "rotateY(0deg)";
        setTimeout(resolve, duration);
      }, duration);
    });
  }

  static fadeIn(element, display, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "0";
    //   element.style.display = "block";
    element.style.display = display;
      element.style.transition = `opacity ${duration}ms ease-out`;

      // requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        element.style.opacity = "1";
        setTimeout(resolve, duration);
      });
    });
  }

  static fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "1";
      element.style.transition = `opacity ${duration}ms ease-out`;
      element.style.opacity = "0";

      setTimeout(() => {
        element.style.display = "none";
        resolve();
      }, duration);
    });
  }

  static pulse(element, duration = 1000, repeat = true) {
    element.style.animation = `pulse ${duration}ms infinite`;

    if (!repeat) {
      setTimeout(() => {
        element.style.animation = "";
      }, duration);
    }
  }
}

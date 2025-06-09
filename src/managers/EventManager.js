export class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    // console.log(`${event}: ${callback}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, ...args) {
    // console.log("event:", event);

    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners
        .get(event)
        .filter((cb) => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }


   // Очистка всех подписок
  clear() {
    this.events.clear();
    this.onceCallbacks.clear();
  }
}

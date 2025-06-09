export class Validator {
  constructor() {
    this.errorMessages = {
      name: "Имя должно содержать от 2 до 16 символов (буквы, цифры, пробелы)",
      email: "Некорректный email адрес",
      password: "Пароль должен содержать минимум 8 символов",
      number: "Некорректное числовое значение",
      required: "Это поле обязательно для заполнения",
    };
  }

  isNameValid(name) {
    if (!name) return false;
    // Разрешаем буквы, цифры, пробелы и некоторые спецсимволы
    const regex = /^[a-zA-Zа-яА-Я0-9\s\-_]{2,16}$/;
    return regex.test(name);
  }

  isEmailValid(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isPasswordValid(password) {
    return password && password.length >= 8;
  }

  isNumberValid(number, options = {}) {
    if (isNaN(number)) return false;
    if (options.min !== undefined && number < options.min) return false;
    if (options.max !== undefined && number > options.max) return false;
    return true;
  }

  isPositiveNumber(number) {
    return this.isNumberValid(number, { min: 0 });
  }

  isInRange(number, min, max) {
    return this.isNumberValid(number, { min, max });
  }

  isEmpty(value) {
    return !value || (typeof value === "string" && value.trim() === "");
  }

  isGameStateValid(state) {
    console.log('ssssssssssssss:', state);
    
    try {
      // Проверяем основные поля состояния игры
      const requiredFields = ["score", "moves", "time", "isRunning"];
      console.log('в isGameStateValid:', requiredFields.every((field) => field in state.game));
      return requiredFields.every((field) => field in state);
    } catch {
      return false;
    }
  }

  getErrorMessage(type) {
    return this.errorMessages[type] || "Некорректное значение";
  }

  validateForm(data, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (rule.required && this.isEmpty(value)) {
        errors[field] = this.getErrorMessage("required");
        continue;
      }

      if (rule.type === "name" && !this.isNameValid(value)) {
        errors[field] = this.getErrorMessage("name");
      }

      if (rule.type === "email" && !this.isEmailValid(value)) {
        errors[field] = this.getErrorMessage("email");
      }

      if (rule.type === "password" && !this.isPasswordValid(value)) {
        errors[field] = this.getErrorMessage("password");
      }

      if (rule.type === "number" && !this.isNumberValid(value, rule.options)) {
        errors[field] = rule.errorMessage || this.getErrorMessage("number");
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

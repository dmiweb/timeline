import "./geolocation.css";

export default class Geolication {
  static get markupFormError() {
    return `
      <div class="form-error">
        <h3 class="form-error__title">Что-то пошло не так</h3>
        <p class="form-error__description">К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.</p>
        <span class="form-error__input-title">Широта и долгота через запятую</span>
        <input type="text" class="form-error__input">
        <div class="form-error__btn-group form-btns">
          <button class="form-btns__cancel-btn form-btns__btns">Отмена</button>
          <button class="form-btns__send-btn form-btns__btns">Ok</button>
        </div>
      </div>
    `;
  }

  static get markupValidErrorTooltip() {
    return `
      <span class="form-error__valid-error-message">Неправильный формат данных!<br>
      Пример координат: [12.12331, 21.123213] или 12.12331, -21.123213</span>
    `;
  }

  renderFormError() {
    if (document.querySelector(".form-error")) return;

    document.body.insertAdjacentHTML(
      "beforeBegin",
      Geolication.markupFormError
    );

    const input = document.querySelector(".form-error__input");
    const cancelBtn = document.querySelector(".form-btns__cancel-btn");

    input.focus();

    cancelBtn.addEventListener("click", this.removeFormError);
  }

  removeFormError() {
    document.querySelector(".form-error").remove();
  }

  requestPosition() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
            this.getPosition(position);
          },
          (error) => {
            resolve(error);
            this.renderFormError();
          }
        );
      } else {
        resolve();
        this.renderFormError();
      }
    });
  }

  getPosition(position) {
    const { coords } = position;

    return coords;
  }

  inputPosition() {
    return new Promise((resolve) => {
      const sendBtn = document.querySelector(".form-btns__send-btn");
      const input = document.querySelector(".form-error__input");

      sendBtn.addEventListener("click", () => {
        const inputValue = this.handlerInputValue(input.value);

        if (!inputValue) return;

        const coords = inputValue.split(",", 2);

        const position = {
          coords: {
            latitude: coords[0],
            longitude: coords[1],
          },
          timestamp: Date.now(),
        };

        resolve(position);

        this.removeFormError();
      });
    });
  }

  handlerInputValue(value) {
    value = value.trim();

    if (!value) return;

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1);
    }

    const validCoords =
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

    if (!validCoords.test(value)) {
      if (document.querySelector(".form-error__valid-error-message")) return;

      const container = document.querySelector(".form-error__input");
      container.insertAdjacentHTML(
        "afterEnd",
        Geolication.markupValidErrorTooltip
      );

      return;
    }

    value = value.split(",").join(", ");
    value = value.replace(/ +/g, " ");

    return value;
  }

  getDate(timestamp) {
    const receivedDate = new Date(timestamp);
    const date = receivedDate.toLocaleDateString();
    const time = receivedDate.toLocaleTimeString();
    const currentDate = date + " " + time.slice(0, 5);

    return currentDate;
  }
}

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// CONCATENATED MODULE: ./src/js/components/post/Post.js

class Post {
  static murkup(timestamp, content, coords) {
    return `
      <div class="timeline__post post">
        <div class="post__decorative-circle"></div>
        <span class="post__timestamp">${timestamp}</span>
        <div class="post__content">${content}</div>
        <div class="post__coordinates">${coords}</div>
      </div>
    `;
  }
  createPost(timestamp, content, coords) {
    return Post.murkup(timestamp, content, coords);
  }
}
;// CONCATENATED MODULE: ./src/js/api/Geolocation/Geolocation.js

class Geolication {
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
    document.body.insertAdjacentHTML("beforeBegin", Geolication.markupFormError);
    const input = document.querySelector(".form-error__input");
    const cancelBtn = document.querySelector(".form-btns__cancel-btn");
    input.focus();
    cancelBtn.addEventListener("click", this.removeFormError);
  }
  removeFormError() {
    document.querySelector(".form-error").remove();
  }
  requestPosition() {
    return new Promise(resolve => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position);
          this.getPosition(position);
        }, error => {
          resolve(error);
          this.renderFormError();
        });
      } else {
        resolve();
        this.renderFormError();
      }
    });
  }
  getPosition(position) {
    const {
      coords
    } = position;
    return coords;
  }
  inputPosition() {
    return new Promise(resolve => {
      const sendBtn = document.querySelector(".form-btns__send-btn");
      const input = document.querySelector(".form-error__input");
      sendBtn.addEventListener("click", () => {
        const inputValue = this.handlerInputValue(input.value);
        if (!inputValue) return;
        const coords = inputValue.split(",", 2);
        const position = {
          coords: {
            latitude: coords[0],
            longitude: coords[1]
          },
          timestamp: Date.now()
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
    const validCoords = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (!validCoords.test(value)) {
      if (document.querySelector(".form-error__valid-error-message")) return;
      const container = document.querySelector(".form-error__input");
      container.insertAdjacentHTML("afterEnd", Geolication.markupValidErrorTooltip);
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
;// CONCATENATED MODULE: ./src/js/api/AudioRecord/AudioRecord.js

class AudioRecord {
  constructor() {
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.audioRecordUrl = null;
  }
  createAudio(url) {
    return `
      <div class="audio">
        <audio class="audio__content" src="${url}" controls></audio>
      </div>
    `;
  }
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.addEventListener("dataavailable", e => {
        this.chunks.push(e.data);
      });
      this.recorder.start();
    } catch (e) {
      if (e.message === "Permission denied") {
        this.showErrorMessage("Разрешите доступ к микрофону");
        return "error";
      } else {
        this.showErrorMessage("Ваш браузер устарел. Попробуйте использовать другой браузер");
        return "error";
      }
    }
  }
  stop() {
    return new Promise(resolve => {
      this.recorder.addEventListener("stop", () => {
        const blob = new Blob(this.chunks);
        const url = URL.createObjectURL(blob);
        this.audioRecordUrl = url;
        const audioElement = this.createAudio(this.audioRecordUrl);
        resolve(audioElement);
      });
      this.recorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      this.chunks = [];
    });
  }
  remove() {
    this.recorder.stop();
    this.stream.getTracks().forEach(track => track.stop());
    this.chunks = [];
  }
  showErrorMessage(text) {
    const message = `
      <div class='error-message'>
        <span class="error-message__text">${text}</span>
        <button class="error-message__close-btn">Закрыть</button>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeEnd", message);
    const closeErrorMessageBtn = document.querySelector(".error-message__close-btn");
    closeErrorMessageBtn.addEventListener("click", this.removeErrorMassage);
  }
  removeErrorMassage() {
    document.querySelector(".error-message").remove();
  }
}
;// CONCATENATED MODULE: ./src/js/api/VideoRecord/VideoRecord.js

class VideoRecord {
  constructor() {
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.videorecordUrl = null;
  }
  static renderWidgetVideoStream() {
    return `
      <div class="widget-video-stream">
       <video class="video-stream" muted></video>
      </div>
    `;
  }
  createVideo(url) {
    return `
      <div class="video">
        <video class="video__content" src="${url}" controls></video>
      </div>
    `;
  }
  playVideoStream(container) {
    if (!this.stream) return;
    container.insertAdjacentHTML("afterBegin", VideoRecord.renderWidgetVideoStream());
    const videoPlayer = document.querySelector(".video-stream");
    videoPlayer.srcObject = this.stream;
    videoPlayer.addEventListener("canplay", () => {
      videoPlayer.play();
    });
  }
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
          facingMode: "user"
        }
      });
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.addEventListener("dataavailable", e => {
        this.chunks.push(e.data);
      });
      this.recorder.start();
    } catch (e) {
      if (e.message === "Permission denied") {
        this.showErrorMessage("Разрешите доступ к видеокамере и микрофону");
        return "error";
      }
      if (e.message === "Requested device not found") {
        this.showErrorMessage("Видеокамера не обнаружена");
        return "error";
      }
      this.showErrorMessage("Ваш браузер устарел. Попробуйте использовать другой браузер");
      return "error";
    }
  }
  stop() {
    return new Promise(resolve => {
      this.recorder.addEventListener("stop", () => {
        const blob = new Blob(this.chunks);
        const url = URL.createObjectURL(blob);
        this.videorecordUrl = url;
        const videoElement = this.createVideo(this.videorecordUrl);
        resolve(videoElement);
      });
      this.recorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      this.chunks = [];
    });
  }
  remove() {
    this.recorder.stop();
    this.stream.getTracks().forEach(track => track.stop());
    this.chunks = [];
  }
  showErrorMessage(text) {
    const message = `
      <div class='error-message'>
        <span class="error-message__text">${text}</span>
        <button class="error-message__close-btn">Закрыть</button>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeEnd", message);
    const closeErrorMessageBtn = document.querySelector(".error-message__close-btn");
    closeErrorMessageBtn.addEventListener("click", this.removeErrorMassage);
  }
  removeErrorMassage() {
    document.querySelector(".error-message").remove();
  }
}
;// CONCATENATED MODULE: ./src/js/timer.js
const timer = (container, btnCancel, btnSend) => {
  let minutes = 0;
  let seconds = 0;
  const idTimer = setInterval(() => {
    seconds += 1;
    if (seconds === 59) {
      seconds = 0;
      minutes += 1;
    }
    if (minutes === 1 && seconds > 0) {
      btnCancel.click();
    }
    container.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
  btnCancel.addEventListener("click", () => clearInterval(idTimer), {
    once: true
  });
  btnSend.addEventListener("click", () => clearInterval(idTimer), {
    once: true
  });
};
/* harmony default export */ const js_timer = (timer);
;// CONCATENATED MODULE: ./src/js/components/timeline/Timeline.js






class Timeline {
  constructor(parentEl) {
    this.parentEl = parentEl;
    this.post = new Post();
    this.geolocation = new Geolication();
    this.audioRecord = new AudioRecord();
    this.videoRecord = new VideoRecord();
    this.handlerTextPost = this.handlerTextPost.bind(this);
    this.posting = this.posting.bind(this);
    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.cancelRecord = this.cancelRecord.bind(this);
  }
  static get markupTimeline() {
    return `
      <div class="timeline">
        <div class="timeline__wrap">
          <div class="timeline__vertical-stripe"></div>
          <div class="timeline__posts"></div>
        </div>
        <div class="timeline_add-panel add-panel">
          <textarea class="add-panel__input-text"></textarea>
        </div>
      </div>
    `;
  }
  static get markupRecordInterface() {
    return `
      <div class="add-panel__record-interface record__interface">
        <button class="record-interface__record-audio-btn record-interface__btns">&#127897;</button>
        <button class="record-interface__record-video-btn record-interface__btns ">&#128249;</button>
      </div>
    `;
  }
  static get markupStartRecord() {
    return `
      <div class="add-panel__start-record-interface start-record-interface">
        <div class="start-record-interface__send-btn start-record-interface-btns">&#10004;</div>
        <div class="start-record-interface__timer">00:00</div>
        <div class="start-record-interface__cancel-btn start-record-interface-btns">x</div>
      </div>
    `;
  }
  init() {
    this.bindToDOM();
  }
  bindToDOM() {
    this.renderTimeline();
    this.renderRecordInterface();
  }
  renderTimeline() {
    this.parentEl.insertAdjacentHTML("beforeEnd", Timeline.markupTimeline);
    const input = document.querySelector(".add-panel__input-text");
    input.addEventListener("keydown", this.addLineBreaks);
    input.addEventListener("keypress", this.handlerTextPost);
  }
  renderRecordInterface() {
    const addPanel = document.querySelector(".timeline_add-panel");
    addPanel.insertAdjacentHTML("beforeEnd", Timeline.markupRecordInterface);
    const audioRecordBtn = document.querySelector(".record-interface__record-audio-btn");
    const videoRecordBtn = document.querySelector(".record-interface__record-video-btn");
    audioRecordBtn.addEventListener("click", this.startRecord);
    videoRecordBtn.addEventListener("click", this.startRecord);
  }
  removeRecordInteface() {
    const recordInterface = document.querySelector(".add-panel__record-interface");
    recordInterface.remove();
  }
  async startRecord({
    currentTarget
  }) {
    if (document.querySelector(".error-message")) return;
    let recorderResponse = null;
    if (currentTarget.classList.contains("record-interface__record-audio-btn")) {
      recorderResponse = await this.audioRecord.start();
    }
    if (currentTarget.classList.contains("record-interface__record-video-btn")) {
      recorderResponse = await this.videoRecord.start();
      const container = document.querySelector(".timeline_add-panel");
      this.videoRecord.playVideoStream(container);
    }
    if (recorderResponse === "error") return;
    const addPanel = document.querySelector(".timeline_add-panel");
    const audioRecordBtn = document.querySelector(".record-interface__record-audio-btn");
    const videoRecordBtn = document.querySelector(".record-interface__record-video-btn");
    audioRecordBtn.removeEventListener("click", this.startRecord);
    videoRecordBtn.removeEventListener("click", this.startRecord);
    this.removeRecordInteface();
    addPanel.insertAdjacentHTML("beforeEnd", Timeline.markupStartRecord);
    const sendRecordBtn = addPanel.querySelector(".start-record-interface__send-btn");
    const cancelRecordBtn = addPanel.querySelector(".start-record-interface__cancel-btn");
    const timerContainer = document.querySelector(".start-record-interface__timer");
    sendRecordBtn.addEventListener("click", this.stopRecord, {
      once: true
    });
    cancelRecordBtn.addEventListener("click", this.cancelRecord, {
      once: true
    });
    js_timer(timerContainer, cancelRecordBtn, sendRecordBtn);
  }
  cancelRecord() {
    const startRecordInterface = document.querySelector(".add-panel__start-record-interface");
    startRecordInterface.remove();
    this.renderRecordInterface();
    if (document.querySelector(".widget-video-stream")) {
      this.videoRecord.remove();
      document.querySelector(".widget-video-stream").remove();
    } else {
      this.audioRecord.remove();
    }
  }
  async stopRecord() {
    let content = null;
    if (document.querySelector(".widget-video-stream")) {
      content = await this.videoRecord.stop();
      document.querySelector(".widget-video-stream").remove();
    } else {
      content = await this.audioRecord.stop();
    }
    const startRecordInterface = document.querySelector(".add-panel__start-record-interface");
    startRecordInterface.remove();
    this.renderRecordInterface();
    await this.posting(content);
  }
  handlerTextPost(e) {
    const input = document.querySelector(".add-panel__input-text");
    const content = input.value.trim();
    if (!content) return;
    if (e.keyCode === 13) {
      this.posting(content);
      e.preventDefault();
      input.value = "";
    }
  }
  async posting(content) {
    let position = await this.geolocation.requestPosition();
    if (position.code === 1 || position.code === 2) {
      position = await this.geolocation.inputPosition();
    }
    const timestamp = this.geolocation.getDate(position.timestamp);
    const coords = `[${position.coords.latitude}, ${position.coords.longitude}]`;
    const postsContainer = document.querySelector(".timeline__posts");
    postsContainer.insertAdjacentHTML("afterBegin", this.post.createPost(timestamp, content, coords));
  }
  addLineBreaks(e) {
    if (e.shiftKey && e.key === "Enter") {
      this.value += "\n";
      e.target.scrollTop = e.target.scrollHeight;
      e.preventDefault();
    }
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

// import Post from "./components/post/Post";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#root");
  const timeline = new Timeline(container);
  timeline.init();
});
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;
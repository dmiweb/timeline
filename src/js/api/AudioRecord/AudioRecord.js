import "./audio-record.css";

export default class AudioRecord {
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
        audio: true,
      });

      this.recorder = new MediaRecorder(this.stream);

      this.recorder.addEventListener("dataavailable", (e) => {
        this.chunks.push(e.data);
      });

      this.recorder.start();
    } catch (e) {
      if (e.message === "Permission denied") {
        this.showErrorMessage("Разрешите доступ к микрофону");
        return "error";
      } else {
        this.showErrorMessage(
          "Ваш браузер устарел. Попробуйте использовать другой браузер"
        );
        return "error";
      }
    }
  }

  stop() {
    return new Promise((resolve) => {
      this.recorder.addEventListener("stop", () => {
        const blob = new Blob(this.chunks);
        const url = URL.createObjectURL(blob);

        this.audioRecordUrl = url;

        const audioElement = this.createAudio(this.audioRecordUrl);

        resolve(audioElement);
      });

      this.recorder.stop();
      this.stream.getTracks().forEach((track) => track.stop());

      this.chunks = [];
    });
  }

  remove() {
    this.recorder.stop();
    this.stream.getTracks().forEach((track) => track.stop());

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

    const closeErrorMessageBtn = document.querySelector(
      ".error-message__close-btn"
    );
    closeErrorMessageBtn.addEventListener("click", this.removeErrorMassage);
  }

  removeErrorMassage() {
    document.querySelector(".error-message").remove();
  }
}

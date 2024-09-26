import "./video-record.css";

export default class VideoRecord {
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

    container.insertAdjacentHTML(
      "afterBegin",
      VideoRecord.renderWidgetVideoStream()
    );

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
          facingMode: "user",
        },
      });

      this.recorder = new MediaRecorder(this.stream);

      this.recorder.addEventListener("dataavailable", (e) => {
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

      this.showErrorMessage(
        "Ваш браузер устарел. Попробуйте использовать другой браузер"
      );

      return "error";
    }
  }

  stop() {
    return new Promise((resolve) => {
      this.recorder.addEventListener("stop", () => {
        const blob = new Blob(this.chunks);
        const url = URL.createObjectURL(blob);

        this.videorecordUrl = url;

        const videoElement = this.createVideo(this.videorecordUrl);

        resolve(videoElement);
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

import "./timeline.css";
import Post from "../post/Post";
import Geolication from "../../api/Geolocation/Geolocation";
import AudioRecord from "../../api/AudioRecord/AudioRecord";
import VideoRecord from "../../api/VideoRecord/VideoRecord";
import timer from "../../timer";

export default class Timeline {
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

    const audioRecordBtn = document.querySelector(
      ".record-interface__record-audio-btn"
    );
    const videoRecordBtn = document.querySelector(
      ".record-interface__record-video-btn"
    );

    audioRecordBtn.addEventListener("click", this.startRecord);
    videoRecordBtn.addEventListener("click", this.startRecord);
  }

  removeRecordInteface() {
    const recordInterface = document.querySelector(
      ".add-panel__record-interface"
    );

    recordInterface.remove();
  }

  async startRecord({ currentTarget }) {
    if (document.querySelector(".error-message")) return;

    let recorderResponse = null;

    if (
      currentTarget.classList.contains("record-interface__record-audio-btn")
    ) {
      recorderResponse = await this.audioRecord.start();
    }

    if (
      currentTarget.classList.contains("record-interface__record-video-btn")
    ) {
      recorderResponse = await this.videoRecord.start();

      const container = document.querySelector(".timeline_add-panel");
      this.videoRecord.playVideoStream(container);
    }

    if (recorderResponse === "error") return;

    const addPanel = document.querySelector(".timeline_add-panel");
    const audioRecordBtn = document.querySelector(
      ".record-interface__record-audio-btn"
    );
    const videoRecordBtn = document.querySelector(
      ".record-interface__record-video-btn"
    );

    audioRecordBtn.removeEventListener("click", this.startRecord);
    videoRecordBtn.removeEventListener("click", this.startRecord);

    this.removeRecordInteface();

    addPanel.insertAdjacentHTML("beforeEnd", Timeline.markupStartRecord);

    const sendRecordBtn = addPanel.querySelector(
      ".start-record-interface__send-btn"
    );
    const cancelRecordBtn = addPanel.querySelector(
      ".start-record-interface__cancel-btn"
    );
    const timerContainer = document.querySelector(
      ".start-record-interface__timer"
    );

    sendRecordBtn.addEventListener("click", this.stopRecord, { once: true });
    cancelRecordBtn.addEventListener("click", this.cancelRecord, {
      once: true,
    });

    timer(timerContainer, cancelRecordBtn, sendRecordBtn);
  }

  cancelRecord() {
    const startRecordInterface = document.querySelector(
      ".add-panel__start-record-interface"
    );

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

    const startRecordInterface = document.querySelector(
      ".add-panel__start-record-interface"
    );
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

    postsContainer.insertAdjacentHTML(
      "afterBegin",
      this.post.createPost(timestamp, content, coords)
    );
  }

  addLineBreaks(e) {
    if (e.shiftKey && e.key === "Enter") {
      this.value += "\n";
      e.target.scrollTop = e.target.scrollHeight;
      e.preventDefault();
    }
  }
}

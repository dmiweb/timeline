import Timeline from "./components/timeline/Timeline";
// import Post from "./components/post/Post";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#root");

  const timeline = new Timeline(container);

  timeline.init();
});

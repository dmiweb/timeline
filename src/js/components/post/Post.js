import "./post.css";

export default class Post {
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

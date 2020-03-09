const makeHotspot = e => {
  document.getElementById(e).classList.add("hotspot");
};

function logout() {
  fetch("logout").then(() => {
    location.reload();
  });
}

const userprefs = document.getElementsByClassName("userprefs")[0];
const anonprefs = document.getElementsByClassName("anonprefs")[0];
fetch("/user")
  .then(e => e.json())
  .then(user => {
    if (user.user) {
      username = user.user;
      userprefs.style.display = "flex";
      $("newpost").style.display = "block";
      $("viewdoc").href = "/@" + user.user;
      $("header").innerText = `Welcome, ${user.user}!`;
      document.title = "Welcome, " + user.user + "!";
    } else {
      anonprefs.style.display = "flex";
    }
    next();
  });

function next() {
  fetch("/get/posts")
    .then(res => res.json())
    .then(res => {
      createPosts(res, $("posts"));
      initScroll("/get/posts/", $("posts"));
    });
}
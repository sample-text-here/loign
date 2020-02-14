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
      console.log("/u/" + user.user);
      userprefs.style.display = "flex";
      $("newpost").style.display = "block";
      $("viewdoc").href = "/@" + user.user;
      $("header").innerText = `Welcome, ${user.user}!`;
      document.title = "Welcome, " + user.user + "!";
      makeHotspot("edit");
      makeHotspot("viewdoc");
      makeHotspot("logout");
    } else {
      anonprefs.style.display = "flex";
      makeHotspot("login");
      makeHotspot("signup");
    }
    next();
  });

function next() {
  fetch("/get/posts")
    .then(res => res.json())
    .then(res => {
      $("posts").innerHTML = "";
      createPosts(res, $("posts"));
      initScroll("", $("posts"));
    });
}

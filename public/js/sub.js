const sub = window.location.pathname.split("~")[1];
console.log(sub);
fetch("/user")
  .then((r) => r.json())
  .then((u) => {
    username = u.user;
  });
if (sub) {
  fetch("/get/posts/" + sub)
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if (res[0]) {
        $("title").innerText = sub;
        document.title = "loign | " + sub;
        $("posts").innerHTML = "";
        createPosts(res, $("posts"));
        initScroll("/get/posts/" + sub, $("posts"));
      } else {
        noSub();
      }
    });
} else {
  noSub();
}

function noSub() {
  document.title = "loign";
  $("title").innerText = 'No posts with tag "' + sub + '"!';
  $("posts").innerHTML = "";
}

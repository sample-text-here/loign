const user = window.location.pathname.split("@")[1];
fetch("/user")
  .then(r => r.json())
  .then(u => {
    username = u.user;
  });
fetch("/get/users/" + user)
  .then(e => e.json())
  .then(res => {
    if (res.joined) {
      $("user").innerText = res.user;
      $("memo").innerText = res.status;
      $("joined").innerText = "Joined " + timeSince(res.joined);
      document.title = "loign | " + res.user;
    } else {
      document.title = "loign";
      $("user").innerText = "User does not exist!";
    }
  });
fetch("/get/posts?user=" + user)
  .then(res => res.json())
  .then(res => {
    createPosts(res, $("posts"));
    initScroll("/get/posts?user=" + user, $("posts"));
  });

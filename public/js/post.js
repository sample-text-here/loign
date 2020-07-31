const id = window.location.pathname.split("-")[1];
if (id) {
  fetch("/user")
    .then((r) => r.json())
    .then((u) => {
      username = u.user;
    });
  fetch("/get/post/" + id)
    .then((res) => res.json())
    .then((res) => {
      fetch("/t/card")
        .then((res) => res.text())
        .then((card) => {
          if (res.votes == null || !res.votes) {
            res.votes = "0";
          }
          $("post").innerHTML = buildTemplate(card, getCardStruct(res));
        });
      document.title = res.title;
      res.comments = JSON.parse(res.comments).reverse();
      if (res.comments != null) {
        fetch("/t/comment")
          .then((c) => c.text())
          .then((com) => {
            for (var i = 0; i < res.comments.length; i++) {
              $("comments").innerHTML += buildTemplate(com, [
                res.comments[i].by,
                res.comments[i].by,
                res.comments[i].comment,
              ]);
            }
          });
      }
    });
}

fetch("/user")
  .then((res) => res.json())
  .then((res) => {
    if (!res.user) {
      $("commentForm").remove();
    }
  });

$("commentForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    id: id,
    comment: $("comment").value,
  };
  if (data.comment) {
    fetch("/post/comment", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.text())
      .then((res) => {
        location.reload();
      });
  }
});

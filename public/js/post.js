const id = window.location.pathname.split("-")[1];
if (id) {
  fetch("/get/post/" + id)
    .then(res => res.json())
    .then(res => {
      fetch("/t/card")
        .then(res => res.text())
        .then(card => {
          $("post").innerHTML = buildTemplate(card, [
            res.id,
            res.by,
            res.by,
            res.title,
            timeSince(res.date),
            res.post,
            res.tag,
            res.tag
          ]);
        });
      document.title = res.title;
      res.comments = JSON.parse(res.comments).reverse();

      fetch("/t/comment")
        .then(res => res.text())
        .then(com => {
          for (var i = 0; i < res.comments.length; i++) {
            $("comments").innerHTML += buildTemplate(com, [
              res.comments[i].by,
              res.comments[i].comment
            ]);
          }
        });
    });
}

fetch("/user")
  .then(res => res.json())
  .then(res => {
    if (!res.user) {
      $("commentForm").remove();
    }
  });

$("commentForm").addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    id: id,
    comment: $("comment").value
  };
  if (data.comment) {
    fetch("/post/comment", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.text())
      .then(res => {
        location.reload();
      });
  } else {
  }
});

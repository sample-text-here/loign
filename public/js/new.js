fetch("/conf.json")
  .then(res => res.json())
  .then(res => {
    res.tags.forEach(tag => {
      $("sub").innerHTML += "<option>" + tag + "</option>";
    });
  });
$("form").onsubmit = e => {
  e.preventDefault();
  const data = {
    title: $("title").value,
    post: $("post").value,
    tag: $("sub").value
  };

  if (!data.title) {
    parseError("Title is empty!");
    return false;
  }

  if (!data.post) {
    parseError("There's no post!");
    return false;
  }

  fetch("/post/submitPost", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(res => {
      if (!res.error) {
        goto("..");
      } else {
        parseError(res.message);
      }
    });
};

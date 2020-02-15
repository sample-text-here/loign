$("form").onsubmit = e => {
  e.preventDefault();

  const data = {
    username: $("username").value,
    password: $("password").value
  };

  fetch("/user/login", {
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
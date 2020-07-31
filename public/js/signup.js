$("form").onsubmit = (e) => {
  e.preventDefault();

  const data = {
    username: $("username").value,
    password: $("password").value,
    confpass: $("confpass").value,
  };

  if (data.username == "null") {
    return 0;
  }

  if (!data.username) {
    parseError("Username is empty!");
    return false;
  }

  if (data.username.length < 4) {
    parseError("Username too short!");
    return false;
  }

  if (data.username.length > 20) {
    parseError("Username too long!");
    return false;
  }

  if (!data.username.match(/^[a-z0-9\-]+$/i)) {
    parseError("Username can only contain letters, numbers, and dashes!");
    return false;
  }

  if (!data.password) {
    parseError("Password is empty!");
    return false;
  }

  if (data.password != data.confpass) {
    parseError("Passwords do not match!");
    return false;
  }

  fetch("/user/addUser", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.error) {
        goto("..");
      } else {
        parseError(res.message);
      }
    });
};

function parseError(e) {
  $("error").innerText = e;
}

fetch("/user")
  .then(e => e.json())
  .then(res => {
    $("status").value = res.status;
  });

$("form").onsubmit = e => {
  e.preventDefault();

  const data = {
    oldpass: $("oldpass").value,
    newpass: $("newpass").value,
    confpass: $("confpass").value
  };

  if (data.newpass != data.confpass) {
    console.log("newpass!=confpass");
    parseError("Passwords do not match");
    return false;
  }

  fetch("/user/updatePass", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(res => {
      if (res.error) {
        parseError(res.message);
      } else {
        goto("..");
      }
    });
};

function deluser() {
  var res = confirm("Are you 100% sure?");
  if (res) {
    res = confirm("This cannot be reversed!");
    if (res) {
      fetch("/user/deleteUser", {
        method: "POST"
      })
        .then(e => e.text())
        .then(e => {
          if (!e.error) {
            fetch("/logout").then(() => {
              goto("..");
            });
          } else {
            parseError(e.message);
          }
        });
    }
  }
}

let typingTimer;
$("status").addEventListener("keyup", () => {
  clearTimeout(typingTimer);
  if ($("status").value) {
    typingTimer = setTimeout(update, 100);
  }
});

function update() {
  var data = {
    status: $("status").value
  };

  fetch("user/updateStatus", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(res => {
      console.log(res);
    });
}
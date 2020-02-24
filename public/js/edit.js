fetch("../user")
  .then(e => e.json())
  .then(res => {
    $("status").value = res.status;
    $("pic").src = "https://loign.glitch.me/get/userpic/" + res.user;
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
/*
$("profilepic").addEventListener("submit", e => {
  e.preventDefault();
  var data = $("profilepic")["file"].files[0];
  if (data) {
    var type = data.type.split("/");
    if (type[0] == "image") {
      if (data.size <= 30000) {
        console.log(data);
        var pic;
        data.text().then(e => {
          console.log(e);
          pic = new Blob([e], { type: "image/" + type[1] });
          fetch("user/photo", {
            method: "POST",
            files: data,
            headers: { "Content-Type": "application/json" }
          })
            .then(res => res.json())
            .then(res => {
              console.log(res);
            });
        });
      } else {
        alert("File too big!");
      }
    } else {
      alert("Not an image!");
    }
  }
});
*/

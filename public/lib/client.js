const $ = e => document.getElementById(e);
var username;
const queue = e => {
  x = setInterval(() => {
    if (e) {
      e();
      delete x;
    }
  }, 100);
};
var scroll = 0;

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) return interval + " years ago";

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    if (interval < 24) {
      return interval + " hours ago";
    } else {
      return "Yesterday";
    }
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    if (interval < 60) {
      return interval + " minutes ago";
    } else {
      return "A hour ago";
    }
  }

  if (seconds < 15) return "Just now";
  return Math.floor(seconds) + " seconds ago";
}

var loading = true;
function createPosts(sub, el) {
  fetch("/user")
    .then(res => res.json())
    .then(user => {
      fetch("/t/card/")
        .then(res => res.text())
        .then(res => {
          if (loading) {
            el.innerHTML = "";
            loading = false;
          }
          if (sub.length > 0) {
            for (var i = 0; i < sub.length; i++) {
              var build = getCardStruct(sub[i], user);
              el.innerHTML += buildTemplate(res, build);
              scroll++;
            }
          }
        });
    });
}

function getCardStruct(obj, user = undefined) {
  ckbx = ["", ""];
  if (obj.votes == null || !obj.votes) {
    obj.votes = "0";
  }
  if (user) {
    if (user.like && user.bad) {
      ckbx[0] = JSON.parse(user.like).indexOf(obj.id);
      if (ckbx[0] == -1) {
        ckbx[0] = "";
      } else {
        ckbx[0] = "checked";
      }
      ckbx[1] = JSON.parse(user.bad).indexOf(obj.id);
      if (ckbx[1] == -1) {
        ckbx[1] = "";
      } else {
        ckbx[1] = "checked";
      }
    }
  }
  return [
    ckbx[0],
    obj.id + "",
    ckbx[1],
    obj.id + "",
    obj.id + "",
    obj.id + "",
    obj.votes + "",
    obj.id + "",
    obj.id + "",
    obj.id + "",
    cleanStr(obj.by + ""),
    cleanStr(obj.by + ""),
    cleanStr(obj.title + ""),
    timeSince(obj.date) + "",
    cleanStr(obj.post + ""),
    obj.tag + "",
    obj.tag + ""
  ];
}

function buildTemplate(template, build) {
  template = template.split("?");
  var res = "";
  for (var i = 0; i < template.length; i++) {
    res += template[i];
    if (build[i]) {
      res += build[i];
    }
  }
  return res;
}

function parseError(e) {
  $("error").innerText = e;
}

function initScroll(sub, el) {
  let x = "?";
  if (sub.match(/\?/g)) {
    x = "&";
  }
  window.addEventListener("scroll", () => {
    if (window.scrollY > document.documentElement.clientHeight - 400) {
      fetch(sub + x + "limit=6&offset=" + scroll)
        .then(res => res.json())
        .then(e => {
          createPosts(e, el);
        });
      scroll += 6;
    }
  });
}

function cleanStr(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var voting = false;

function upvote(id, el) {
  if (username && !voting) {
    voting = true;
    fetch("/post/vote/up", {
      method: "POST",
      body: JSON.stringify({ id: id }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(res => {
        while (el.className != "val") {
          el = el.nextSibling;
        }
        if (!res.error) {
          el.innerText = res.votes;
          checkboxes(res, el);
          voting = false;
        }
      });
  }
}

function downvote(id, el) {
  if (username && !voting) {
    voting = true;

    fetch("/post/vote/down", {
      method: "POST",
      body: JSON.stringify({ id: id }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(res => {
        while (el.className != "val") {
          el = el.previousSibling;
        }
        if (!res.error) {
          el.innerText = res.votes;
          checkboxes(res, el);
          voting = false;
        }
      });
  }
}

function checkboxes(res, el) {
  el = el.parentElement;
  res = res.select;
  if (res == 0) {
    el.querySelector("input[id^=up]").checked = false;
    el.querySelector("input[id^=down]").checked = false;
  } else if (res == 1) {
    el.querySelector("input[id^=up]").checked = true;
    el.querySelector("input[id^=down]").checked = false;
  } else if (res == -1) {
    el.querySelector("input[id^=up]").checked = false;
    el.querySelector("input[id^=down]").checked = true;
  }
}

function shortNumber(n) {
  n = +n;
  if (n >= 1e12) {
    return Math.floor(n / 1e11) / 10 + "t";
  }
  if (n >= 1e9) {
    return Math.floor(n / 1e8) / 10 + "b";
  }
  if (n >= 1e6) {
    return Math.floor(n / 1e5) / 10 + "m";
  }
  if (n >= 1e3) {
    return Math.floor(n / 1e2) / 10 + "k";
  } else return Math.floor(n * 10) / 10 + "";
}

function imgErr(img) {
  img.src = "/get/userpic/@null";
  img.onerror = "";
}

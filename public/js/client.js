const $ = e => document.getElementById(e);
var scroll = 10;

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

function createPosts(sub, el) {
  fetch("/card/")
    .then(res => res.text())
    .then(res => {
      if (sub.length > 0) {
        for (var i = 0; i < res.length; i++) {
          var build = [
            cleanStr(sub[i].by),
            cleanStr(sub[i].title),
            timeSince(sub[i].date),
            cleanStr(sub[i].post),
            '"/~' + sub[i].tag + '"',
            sub[i].tag
          ];
          el.innerHTML += buildTemplate(res, build);
        }
      }
    });
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
  window.addEventListener("scroll", () => {
    if (window.scrollY > document.documentElement.clientHeight - 200) {
      fetch("/get/posts/" + sub+"?limit=3&offset="+scroll)
        .then(res => res.json())
        .then(e => {
          createPosts(e, el);
        });
      scroll+=3;
    }
  });
}

function cleanStr(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

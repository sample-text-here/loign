const $ = e => document.getElementById(e);
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

function start(card,sub,el) {
        fetch("/get/posts/"+sub)
          .then(res => res.json())
          .then(res => {
            if (res.length > 0) {
              for (var i = 0; i < res.length; i++) {
                var post =
                  card[0] +
                  res[i].title +
                  card[1] +
                  res[i].by +
                  card[2] +
                  timeSince(res[i].date) +
                  card[3] +
                  res[i].post +
                  card[3];
                el.innerHTML += post;
              }
            }
          });
      }

function parseError(e) {
  $("error").innerText = e;
}

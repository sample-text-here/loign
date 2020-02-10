const links = document.querySelectorAll("a");
const buttons = document.querySelectorAll("button");
var isBtnClicked = true;
var x, y;

var anim = document.createElement("div");
anim.className = "anim";
document.body.appendChild(anim);
window.onload = () => {
  anim.className = "anim-first anim";
  setTimeout(() => {
    document.body.removeChild(anim);
  }, 300);
};

links.forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    anim.className = "anim-last anim";
    anim.style.left = x + "px";
    anim.style.top = y + "px";
    document.body.appendChild(anim);
    var url = a.href;
    setTimeout(() => {
      window.location.href = url;
    }, 350);
  });
});

buttons.forEach(btn => {
  btn.addEventListener("click", e => {
    if (isBtnClicked && btn.className.match(/link/)) {
      e.preventDefault();
      anim.className = "anim-last anim";
      anim.style.left = x + "px";
      anim.style.top = y + "px";
      document.body.appendChild(anim);
      setTimeout(() => {
        isBtnClicked = false;
        btn.click();
      }, 350);
    }
  });
});

function goto(url) {
  anim.className = "anim-last anim";
  anim.style.left = x + "px";
  anim.style.top = y + "px";
  document.body.appendChild(anim);
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

function updateMousePos(e) {
  x = e.clientX;
  y = e.clientY;
}

document.addEventListener("mousemove", updateMousePos, false);

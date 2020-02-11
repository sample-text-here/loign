//init
const links = document.querySelectorAll("a");
const buttons = document.querySelectorAll("button");
var isBtnClicked = true;
var x, y;

//add styles
var linkstyle = document.createElement("style");
linkstyle.innerHTML = `
.anim {
  background: white;
  border-radius: 50%;
  position: fixed;
  height: 100px;
  width: 100px;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
}

@supports(height: max(200vw, 200vh)) {
.anim {
  height: max(200vw, 200vh);
  width: max(200vw, 200vh);
}
}

.anim-first {
  animation: fade 0.3s forwards;
}

.anim-last {
  height: 0;
  width: 0;
  animation: expand 0.7s forwards;
}

@keyframes expand {
  from {
    height: 0px;
    width: 0px;
  }
  to {
    height: max(200vw, 200vh);
    width: max(200vw, 200vh);
  }
}

@keyframes fade {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
`;
document.head.appendChild(linkstyle);

//make circle
var anim = document.createElement("div");
anim.className = "anim";
document.body.appendChild(anim);

//fade when doc loads
window.onload = () => {
  anim.className = "anim-first anim";
  setTimeout(() => {
    document.body.removeChild(anim);
  }, 300);
};

//make circle expand when links clicked
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
    }, 400);
  });
});

//same, but with buttons with class "link"
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
      }, 400);
    }
  });
});

//function that's the same as window.location.href, but with animation
function goto(url) {
  anim.className = "anim-last anim";
  anim.style.left = x + "px";
  anim.style.top = y + "px";
  document.body.appendChild(anim);
  setTimeout(() => {
    window.location.href = url;
  }, 400);
}

function updateMousePos(e) {
  x = e.clientX;
  y = e.clientY;
}

document.addEventListener("mousemove", updateMousePos, false);

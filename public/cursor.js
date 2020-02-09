var asfd=document.querySelectorAll("a, button"); 

var innerCursor = document.createElement("div");
var outerCursor = document.createElement("div");
innerCursor.className = "innerCursor cursor";
outerCursor.className = "outerCursor cursor";
if (window.innerWidth > 620) {
  document.body.appendChild(innerCursor);
  document.body.appendChild(outerCursor);
}

// set the starting position of the cursor outside of the screen
var clientX = Math.random() * window.innerWidth,
  clientY = Math.random() * window.innerHeight,
  curX = 0,
  curY = 0,
  stuck = false,
  stuckon;

const initCursor = () => {
  document.addEventListener("mousemove", e => {
    clientX = e.clientX;
    clientY = e.clientY;
  });

  document.addEventListener("click", e => {
    stuckon.click();
  });

  const render = () => {
    if (!stuck) {
      curX = (curX * 3 + clientX) / 4;
      curY = (curY * 3 + clientY) / 4;
    } else {
      if (
        Math.sqrt(Math.pow(clientX - curX, 2) + Math.pow(clientY - curY, 2)) >
        20
      ) {
        stuck = false;
      }
    }
    for (var i = 0; i < asfd.length; i++) {
      var top = asfd[i].offsetTop;
      var left = asfd[i].offsetLeft;
      var height = asfd[i].offsetHeight;
      var width = asfd[i].offsetWidth;
      if (calcDist(asfd[i]) < 50) {
        curX = (curX * 3 + left+width/2) / 4;
        curY = (curY * 3 + top+height/2) / 4;
        stuck = true;
        stuckon = asfd[i];
      }
    }
    innerCursor.style.top = `${clientY}px`;
    innerCursor.style.left = `${clientX}px`;
    outerCursor.style.top = `${curY}px`;
    outerCursor.style.left = `${curX}px`;
    outerCursor.style.transform = "translate(-50%,-50%)";
    requestAnimationFrame(render);
  };
  function distTo(x, y) {}
  requestAnimationFrame(render);
};

function calcDist(elem) {
  return Math.sqrt(
    Math.pow(clientX - (elem.offsetLeft + elem.offsetWidth / 2), 2) +
      Math.pow(clientY - (elem.offsetTop + elem.offsetHeight / 2), 2)
  );
}

initCursor();
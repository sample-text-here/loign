var hotspots = document.getElementsByClassName("hotspot");
var linkstyle = document.createElement("style");
linkstyle.innerHTML = `
.cursor {
  left: 0;
  top: 0;
  position: fixed;
  pointer-events: none;
  border-radius: 50%;
  z-index: 11000;
}

.innerCursor {
  width: 0.5em;
  height: 0.5em;
  background: cornflowerblue;
}

.outerCursor {
  width: 2em;
  height: 2em;
  border: solid cornflowerblue 1px;
}

*,
*:hover {
  cursor: none;
}
`;

var innerCursor = document.createElement("div");
var outerCursor = document.createElement("div");
innerCursor.className = "innerCursor cursor";
outerCursor.className = "outerCursor cursor";
if (window.innerWidth > 820) {
  document.head.appendChild(linkstyle);
  document.body.appendChild(innerCursor);
  document.body.appendChild(outerCursor);
}

var clientX = -10000,
  clientY = -10000,
  curX = 0,
  curY = 0,
  stuck = false,
  stuckon;

const initCursor = () => {
  document.addEventListener("mousemove", (e) => {
    clientX = e.clientX;
    clientY = e.clientY;
  });

  document.addEventListener("click", (e) => {
    if (stuckon) {
      stuckon.click();
    }
  });
  if (sessionStorage.getItem("curX") != null)
    curX = sessionStorage.getItem("curX") | -100;
  if (sessionStorage.getItem("curY") != null)
    curX = sessionStorage.getItem("curY") | -100;
  if (sessionStorage.getItem("clientX") != null)
    curX = sessionStorage.getItem("clientX") | -100;
  if (sessionStorage.getItem("clientY") != null)
    curX = sessionStorage.getItem("clientY") | -100;

  const render = () => {
    hotspots = document.getElementsByClassName("hotspot");
    sessionStorage.setItem("curX", curX);
    sessionStorage.setItem("clientX", clientX);
    sessionStorage.setItem("curY", curY);
    sessionStorage.setItem("clientY", clientY);
    if (!stuck) {
      curX = (curX * 3 + clientX) / 4;
      curY = (curY * 3 + clientY) / 4;
    } else {
      if (
        Math.sqrt(Math.pow(clientX - curX, 2) + Math.pow(clientY - curY, 2)) >
        50
      ) {
        stuck = false;
        stuckon = null;
        outerCursor.style.width = "2em";
        outerCursor.style.height = "2em";
      }
    }
    for (var i = 0; i < hotspots.length; i++) {
      var el = hotspots[i].getBoundingClientRect();
      if (calcDist(hotspots[i]) < 50) {
        curX = (curX * 3 + el.left + el.width / 2) / 4;
        curY = (curY * 3 + el.top + el.height / 2) / 4;
        stuck = true;
        stuckon = hotspots[i];
        outerCursor.style.width = "3em";
        outerCursor.style.height = "3em";
      }
    }
    innerCursor.style.top = `${clientY}px`;
    innerCursor.style.left = `${clientX}px`;
    outerCursor.style.top = `${curY}px`;
    outerCursor.style.left = `${curX}px`;
    outerCursor.style.transform = "translate(-50%,-50%)";
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
};

function calcDist(el) {
  var el = el.getBoundingClientRect();
  return Math.sqrt(
    Math.pow(clientX - (el.left + el.width / 2), 2) +
      Math.pow(clientY - (el.top + el.height / 2), 2)
  );
}

initCursor();

//welcome code for home page
let firstname = localStorage.getItem("firstname");
let lastname = localStorage.getItem("lastname");
let welcomeMessage = document.getElementById("welcome");

if (firstname && lastname) {
    welcomeMessage.textContent = `Welcome, ${firstname} ${lastname}!`;
} else {
    welcomeMessage.textContent = "Welcome to the Home Page!";
}

const dvd = document.getElementById("dvd");
const gameWindow = document.getElementById("game-window");

let x = parseFloat(dvd.getAttribute("x")) || 0;
let y = parseFloat(dvd.getAttribute("y")) || 0;

let dx = 5;
let dy = 5;

let canvasWidth = gameWindow.clientWidth;
let canvasHeight = gameWindow.clientHeight;

const dvdWidth = parseFloat(dvd.getAttribute("width"));
const dvdHeight = parseFloat(dvd.getAttribute("height"));

function moveDVD() {
    const canvasWidth = gameWindow.clientWidth;
    const canvasHeight = gameWindow.clientHeight;

    let hitXWall = false;
    let hitYWall = false;

    x += dx;
    y += dy;

    // right wall
    if (x + dvdWidth >= canvasWidth) {
        x = canvasWidth - dvdWidth;
        dx = -dx;
        hitXWall = true;
    }

    // left wall
    if (x <= 0) {
        x = 0;
        dx = -dx;
        hitXWall = true;
    }

    // bottom wall
    if (y + dvdHeight >= canvasHeight) {
        y = canvasHeight - dvdHeight;
        dy = -dy;
        hitYWall = true;
    }

    // top wall
    if (y <= 0) {
        y = 0;
        dy = -dy;
        hitYWall = true;
    }

    // corner detection 🎯
    if (hitXWall && hitYWall) {
        console.log("Corner hit!");
        changeColor(); // optional effect
    }

    dvd.setAttribute("x", x);
    dvd.setAttribute("y", y);
    requestAnimationFrame(moveDVD);
}
function changeColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    dvd.setAttribute("fill", `rgb(${r},${g},${b})`);
}

moveDVD();
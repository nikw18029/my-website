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

let dx = 2;
let dy = 2;

let canvasWidth = gameWindow.clientWidth;
let canvasHeight = gameWindow.clientHeight;

const dvdWidth = parseFloat(dvd.getAttribute("width"));
const dvdHeight = parseFloat(dvd.getAttribute("height"));

function moveDVD() {
    canvasHeight = gameWindow.clientHeight;
    canvasWidth = gameWindow.clientWidth;

    x += dx;
    y += dy;

    console.log(`{canvasWidth: ${canvasWidth}, canvasHeight: ${canvasHeight}, dvdWidth: ${dvdWidth}, dvdHeight: ${dvdHeight}, x: ${x}, y: ${y}}`);

    if (x + dvdWidth >= canvasWidth || x <= 0) {
        dx = -dx;
        x = Math.min(x, canvasWidth - dvdWidth);
    }
    if (y + dvdHeight >= canvasHeight || y <= 0) {
        dy = -dy;
        y = Math.min(y, canvasHeight - dvdHeight);
    }

    dvd.setAttribute("x", x);
    dvd.setAttribute("y", y);

    requestAnimationFrame(moveDVD);
}

moveDVD();
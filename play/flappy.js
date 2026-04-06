let bird = document.getElementById("bird");
let gameWindow = document.getElementById("game-window");
let scoreDisplay = document.getElementById("score-display");

let pipes = [];
let gravity = 0.25;
let jumpStrength = -5;
let velocity = 0;
let pipeSpeed = 2;
let score = 0;
let startTime = Date.now();
let isGameOver = false;
let paused = false;

bird.setAttribute("cy", gameWindow.clientHeight / 2);
bird.setAttribute("cx", 50);
bird.setAttribute("r", 20);

let pipeInterval = setInterval(createPipe, 2000);

function draw() {
    if (!isGameOver && !paused) {
        score = Date.now() - startTime;
        scoreDisplay.textContent = scoreToClock(score);

        MoveBird();
        MovePipes();
    }

    requestAnimationFrame(draw);
}

function MoveBird() {
    velocity += gravity;

    let currentY = parseFloat(bird.getAttribute("cy"));
    bird.setAttribute("cy", currentY + velocity);

    checkCollision();
}

function MovePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        let currentX = parseFloat(pipe.top.getAttribute("x"));
        let newX = currentX - pipeSpeed;

        pipe.top.setAttribute("x", newX);
        pipe.bottom.setAttribute("x", newX);

        let pipeWidth = parseFloat(pipe.top.getAttribute("width"));
        if (newX + pipeWidth < 0) {
            if (pipe.top.parentNode === gameWindow) {
                gameWindow.removeChild(pipe.top);
            }
            if (pipe.bottom.parentNode === gameWindow) {
                gameWindow.removeChild(pipe.bottom);
            }
            pipes.splice(i, 1);
        }
    }
}

function checkCollision() {
    let birdX = parseFloat(bird.getAttribute("cx"));
    let birdY = parseFloat(bird.getAttribute("cy"));
    let birdRadius = parseFloat(bird.getAttribute("r"));
    let windowHeight = gameWindow.clientHeight;

    if (birdY + birdRadius >= windowHeight || birdY - birdRadius <= 0) {
        gameOver();
        return;
    }

    for (let pipe of pipes) {
        let pipeX = parseFloat(pipe.top.getAttribute("x"));
        let pipeWidth = parseFloat(pipe.top.getAttribute("width"));
        let topPipeHeight = parseFloat(pipe.top.getAttribute("height"));
        let bottomPipeY = parseFloat(pipe.bottom.getAttribute("y"));

        let insidePipeX =
            birdX + birdRadius > pipeX &&
            birdX - birdRadius < pipeX + pipeWidth;

        let hitsTopPipe = birdY - birdRadius < topPipeHeight;
        let hitsBottomPipe = birdY + birdRadius > bottomPipeY;

        if (insidePipeX && (hitsTopPipe || hitsBottomPipe)) {
            gameOver();
            return;
        }
    }
}

function createPipe() {
    if (isGameOver || paused) return;

    let topPipe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let bottomPipe = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    let birdRadius = parseFloat(bird.getAttribute("r"));
    let gapHeight = birdRadius * 6;
    let pipeWidth = 50;
    let pipeX = gameWindow.getBoundingClientRect().width;
    let windowHeight = gameWindow.clientHeight;
    let pipeY = Math.random() * (windowHeight - gapHeight - 40) + 20;

    topPipe.setAttribute("x", pipeX);
    topPipe.setAttribute("y", 0);
    topPipe.setAttribute("width", pipeWidth);
    topPipe.setAttribute("height", pipeY);
    topPipe.setAttribute("fill", "green");

    bottomPipe.setAttribute("x", pipeX);
    bottomPipe.setAttribute("y", pipeY + gapHeight);
    bottomPipe.setAttribute("width", pipeWidth);
    bottomPipe.setAttribute("height", windowHeight - (pipeY + gapHeight));
    bottomPipe.setAttribute("fill", "green");

    gameWindow.appendChild(topPipe);
    gameWindow.appendChild(bottomPipe);

    pipes.push({ top: topPipe, bottom: bottomPipe });
}

function DeletePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];

        if (pipe.top.parentNode === gameWindow) {
            gameWindow.removeChild(pipe.top);
        }

        if (pipe.bottom.parentNode === gameWindow) {
            gameWindow.removeChild(pipe.bottom);
        }
    }

    pipes = [];
}

function gameOver() {
    isGameOver = true;
    clearInterval(pipeInterval);
    DeletePipes();

    alert("Game Over! Your score: " + Math.floor((Date.now() - startTime) / 1000) + " seconds");

    velocity = 0;
    bird.setAttribute("cy", gameWindow.clientHeight / 2);
    startTime = Date.now();

    isGameOver = false;
    pipeInterval = setInterval(createPipe, 2000);
}

function scoreToClock(score) {
    let minutes = Math.floor(score / 60000);
    let seconds = Math.floor((score % 60000) / 1000);
    let milliseconds = Math.floor((score % 1000) / 10);
    return `${padZero(minutes)}:${padZero(seconds)}:${padZero(milliseconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, "0");
}

function pause() {
    paused = !paused;

    if (paused) {
        gravity = 0;
        pipeSpeed = 0;
        velocity = 0;
    } else {
        gravity = 0.25;
        pipeSpeed = 2;
    }
}

document.addEventListener("mousedown", function () {
    if (!isGameOver && !paused) {
        velocity = jumpStrength;
    }
});

document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        pause();
    }
});

draw();
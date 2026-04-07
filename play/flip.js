let player = document.getElementById("player");
let scoreDisplay = document.getElementById("score-display");
let gameWindow = document.getElementById("game-window");
let obstacles = [];
let startTime = Date.now();
let gravity = 2;
let obstacleSpeed = 2;
let spawnPos = false;
Start();

function draw() {
    moveObstacles();
    UpdateScore();
    MovePlayer();
    CheckCollision();
    requestAnimationFrame(draw);
}

function MovePlayer() {
    let playerY = parseFloat(player.getAttribute("cy"));
    let radius = parseFloat(player.getAttribute("r"));

    playerY += gravity;

    if (playerY <= radius) {
        playerY = radius;
    }

    if (playerY >= gameWindow.clientHeight - radius) {
        playerY = gameWindow.clientHeight - radius;
    }

    player.setAttribute("cy", playerY);
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        let x = parseFloat(obstacle.getAttribute("x"));
        x -= obstacleSpeed;
        obstacle.setAttribute("x", x);
    });
}

function FlipGravity() {
    gravity = -gravity;
}

function UpdateScore() {
    let elapsedTime = Date.now() - startTime;
    let minutes = Math.floor(elapsedTime / 60000).toString().padStart(2, '0');
    let seconds = Math.floor((elapsedTime % 60000) / 1000).toString().padStart(2, '0');
    let milliseconds = Math.floor((elapsedTime % 1000) / 10).toString().padStart(2, '0');
    scoreDisplay.textContent = `${minutes}:${seconds}:${milliseconds}`;
}

function GetRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function GetOppositeColor(color) {
    let r = 255 - parseInt(color.slice(1, 3), 16);
    let g = 255 - parseInt(color.slice(3, 5), 16);
    let b = 255 - parseInt(color.slice(5, 7), 16);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function SpawnObstacle(time) {
    let obstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let objHeight = GetRandomHeight()+50;
    obstacle.setAttribute("x", gameWindow.clientWidth);
    obstacle.setAttribute("width", 20);
    obstacle.setAttribute("height", objHeight);
    if (spawnPos) {
        obstacle.setAttribute("y", 0);
    } else {
        obstacle.setAttribute("y", gameWindow.clientHeight - obstacle.getAttribute("height"));
    }
    obstacle.setAttribute("fill", "black");
    gameWindow.appendChild(obstacle);
    obstacles.push(obstacle);
    spawnPos = !spawnPos;
    setTimeout(SpawnObstacle, GetRandomInt(objHeight*5,objHeight*10))
}
function GetRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function GetRandomHeight() {
    return GetRandomInt(50, gameWindow.clientHeight - 200);
}
function CheckCollision() {
    let playerX = parseFloat(player.getAttribute("cx"));
    let playerY = parseFloat(player.getAttribute("cy"));
    let radius = parseFloat(player.getAttribute("r"));
    for (let obstacle of obstacles) {
        let obstacleX = parseFloat(obstacle.getAttribute("x"));
        let obstacleY = parseFloat(obstacle.getAttribute("y"));
        let obstacleWidth = parseFloat(obstacle.getAttribute("width"));
        let obstacleHeight = parseFloat(obstacle.getAttribute("height"));
        if (playerX + radius > obstacleX && playerX - radius < obstacleX + obstacleWidth &&
            playerY + radius > obstacleY && playerY - radius < obstacleY + obstacleHeight) {
            EndGame();
            break;
        }
    }
}
function EndGame() {
    alert(`Game Over! Your score: ${scoreDisplay.textContent}`);
    restart();
}
function Start() {
    player.setAttribute("r", 20);
    player.setAttribute("cx", parseFloat(player.getAttribute("r")) * 3);
    player.setAttribute("cy", gameWindow.clientHeight / 2);

    startTime = Date.now();
    player.setAttribute("fill", GetRandomColor());
    gameWindow.style.backgroundColor = GetOppositeColor(player.getAttribute("fill"));
    scoreDisplay.textContent = "00:00:00";

    for (let obstacle of obstacles) {
        gameWindow.removeChild(obstacle);
    }
    obstacles = [];

    gameWindow.addEventListener("click", FlipGravity);
    draw();
    SpawnObstacle(2000)
}
function restart() {
    clearTimeout();
    player.setAttribute("r", 20);
    player.setAttribute("cx", parseFloat(player.getAttribute("r")) * 3);
    player.setAttribute("cy", gameWindow.clientHeight / 2);

    startTime = Date.now();
    player.setAttribute("fill", GetRandomColor());
    gameWindow.style.backgroundColor = GetOppositeColor(player.getAttribute("fill"));
    scoreDisplay.textContent = "00:00:00";

    for (let obstacle of obstacles) {
        gameWindow.removeChild(obstacle);
    }
    obstacles = [];
}
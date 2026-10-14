
let gravity = true;
let score = 0;
let elapsedGameTime = 0;

let gravity_power = 2;
let base_gravity = 2;
let momentum = 1.02;

const canvas = document.getElementById("gameCanvas");
let obstacles = [];
let obstacle_spawn_rate = 1000;
let obstacle_speed = 5;
let pngInt = 0;

let drawCollider = false;
let paused = false;

const canvasWidth = canvas.viewBox.baseVal.width;
const canvasHeight = canvas.viewBox.baseVal.height;

// ==============================
// SCALING SETTINGS
// ==============================

// Original reference resolution
const REFERENCE_WIDTH = 1800;
const REFERENCE_HEIGHT = 950;

// Scale positions and movement
const scaleX = canvasWidth / REFERENCE_WIDTH;
const scaleY = canvasHeight / REFERENCE_HEIGHT;

// Uniform scale for objects
const scaleSize = Math.min(scaleX, scaleY);

const sx = value => value * scaleX;
const sy = value => value * scaleY;
const ss = value => value * scaleSize;

const PLAYER_SIZE = ss(200);
const OBSTACLE_SIZE = ss(100);

// Collision box matches visible otter proportions
function getPlayerCollisionRect() {
    const x = parseFloat(Player.getAttribute("x"));
    const y = parseFloat(Player.getAttribute("y"));
    const w = parseFloat(Player.getAttribute("width"));
    const h = parseFloat(Player.getAttribute("height"));

    return {
        x: x + w * 0.05,
        y: y + h * 0.325,
        width: w * 0.90,
        height: h * 0.35
    };
}

// ==============================
// HTML ELEMENTS
// ==============================

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");
const ScoreText = document.getElementById("scoreText");
const healthBar = document.getElementById("healthBar");

let otterHealth = 3;
let invulnerable = false;
let invulnerabilityTimer = null;
let colorTimer = null;

// ==============================
// FRAME RATE SETTINGS
// ==============================

const TARGET_FPS = 60;
const MAX_DELTA_TIME = 0.05;
let lastFrameTime = null;

// ==============================
// PLAYER
// ==============================

const Player = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
);

Player.setAttribute("x", sx(100));
Player.setAttribute("y", canvasHeight / 2 - PLAYER_SIZE / 2);
Player.setAttribute("width", PLAYER_SIZE);
Player.setAttribute("height", PLAYER_SIZE);

// ==============================
// ANIMATION CLASS
// ==============================

class MyAnimation {
    constructor(frames, speed, obj, loop) {
        this.frames = frames;
        this.speed = speed;
        this.obj = obj;
        this.timer = null;
        this.loop = loop;
        this.currentFrame = 0;
    }

    PlayAnimation(loop = this.loop) {
        this.StopAnimation();

        if (this.frames.length === 0 || this.speed <= 0) {
            return;
        }

        this.currentFrame = 0;

        this.obj.setAttribute(
            "href",
            this.frames[this.currentFrame]
        );

        this.currentFrame++;

        this.timer = setInterval(() => {
            if (paused || document.hidden) return;

            if (this.currentFrame >= this.frames.length) {
                if (loop) {
                    this.currentFrame = 0;
                } else {
                    this.StopAnimation();
                    return;
                }
            }

            this.obj.setAttribute(
                "href",
                this.frames[this.currentFrame]
            );

            this.currentFrame++;
        }, 1000 / this.speed);
    }

    StopAnimation() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

const swimFrame1 = "resources/swim1.png";
const swimFrame2 = "resources/swim2.png";
const swimFrame3 = "resources/swim3.png";
const swimFrame4 = "resources/swim4.png";

const swimAnimation = new MyAnimation(
    [swimFrame1, swimFrame2, swimFrame3, swimFrame4],
    10,
    Player,
    true
);

// ==============================
// PARALLAX BACKGROUND
// ==============================

const numBackgroundLayers = 6;
const backgroundLayers = [];
const backgroundLayers2 = [];

for (let i = 0; i < numBackgroundLayers; i++) {

    const backgroundLayer = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
    );

    backgroundLayer.setAttribute("x", 0);
    backgroundLayer.setAttribute("y", 0);
    backgroundLayer.setAttribute("width", canvasWidth);
    backgroundLayer.setAttribute("height", canvasHeight);
    backgroundLayer.setAttribute("href", `resources/bg${i}.png`);
    backgroundLayer.setAttribute("preserveAspectRatio", "none");

    if (i === 0) {
        backgroundLayer.setAttribute("opacity", "0.5");
    }

    backgroundLayers.push(backgroundLayer);

    const backgroundLayer2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
    );

    backgroundLayer2.setAttribute("x", canvasWidth);
    backgroundLayer2.setAttribute("y", 0);
    backgroundLayer2.setAttribute("width", canvasWidth);
    backgroundLayer2.setAttribute("height", canvasHeight);
    backgroundLayer2.setAttribute("href", `resources/bg${i}.png`);
    backgroundLayer2.setAttribute("preserveAspectRatio", "none");

    if (i === 0) {
        backgroundLayer2.setAttribute("opacity", "0.5");
    }

    backgroundLayers2.push(backgroundLayer2);

    canvas.appendChild(backgroundLayer);
    canvas.appendChild(backgroundLayer2);
}

canvas.appendChild(Player);

// ==============================
// START GAME
// ==============================

requestAnimationFrame(Draw);
SpawnObstaclesAsync();
swimAnimation.PlayAnimation(true);

// ==============================
// PLAYER PHYSICS
// ==============================

function applyPhysics(deltaTime) {
    if (paused) return;

    let currentY = parseFloat(Player.getAttribute("y"));
    const playerHeight = parseFloat(Player.getAttribute("height"));

    const MIN_HEIGHT = sy(18);
    const MAX_HEIGHT = canvasHeight - playerHeight - sy(18);

    const frameScale = deltaTime * TARGET_FPS;

    const accelerationFactor = Math.pow(
        momentum,
        frameScale
    );

    let movement;

    if (momentum === 1) {
        movement = gravity_power * frameScale;
    } else {
        movement = gravity_power *
            (accelerationFactor - 1) /
            (momentum - 1);
    }

    if (gravity) {
        currentY += movement * scaleY;
    } else {
        currentY -= movement * scaleY;
    }

    gravity_power *= accelerationFactor;

    if (currentY < MIN_HEIGHT) {
        currentY = MIN_HEIGHT;
        gravity_power = base_gravity;
    }

    if (currentY > MAX_HEIGHT) {
        currentY = MAX_HEIGHT;
        gravity_power = base_gravity;
    }

    Player.setAttribute("y", currentY);
}

// ==============================
// MAIN GAME LOOP
// ==============================

function Draw(currentTime) {
    if (lastFrameTime === null) {
        lastFrameTime = currentTime;
    }

    let deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    deltaTime = Math.max(
        0,
        Math.min(deltaTime, MAX_DELTA_TIME)
    );

    if (!paused && !document.hidden) {

        elapsedGameTime += deltaTime;
        score = Math.floor(elapsedGameTime * 10);

        ScoreText.textContent = score;

        applyPhysics(deltaTime);
        moveObstacles(deltaTime);
        checkObstacleCollision();
        MoveParralaxBackground(deltaTime);
        drawCollisionBox();
    }

    requestAnimationFrame(Draw);
}

// ==============================
// CONTROLS
// ==============================

function toggleGravity() {
    gravity = !gravity;
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        event.preventDefault();

        if (paused || event.repeat) return;

        toggleGravity();
        gravity_power = base_gravity;
    }
});

canvas.addEventListener("click", function() {
    if (paused) return;

    toggleGravity();
    gravity_power = base_gravity;
});

// ==============================
// RESTART BUTTON
// ==============================

restartButton.addEventListener("click", function() {
    gameOverScreen.style.display = "none";
    resetGame();
});

// ==============================
// COLLISION BOX
// ==============================

function drawCollisionBox() {
    const existingBox = document.getElementById("collisionBox");

    if (!drawCollider) {
        if (existingBox) existingBox.remove();
        return;
    }

    const rect = getPlayerCollisionRect();

    let collisionBox = existingBox;

    if (!collisionBox) {
        collisionBox = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );

        collisionBox.setAttribute("id", "collisionBox");
        collisionBox.setAttribute("fill", "rgba(255, 0, 0, 0.5)");

        canvas.appendChild(collisionBox);
    }

    collisionBox.setAttribute("x", rect.x);
    collisionBox.setAttribute("y", rect.y);
    collisionBox.setAttribute("width", rect.width);
    collisionBox.setAttribute("height", rect.height);
}

// ==============================
// COLLISION DETECTION
// ==============================

function checkObstacleCollision() {
    if (invulnerable || paused) return;

    const {
        x: collisionX,
        y: collisionY,
        width: collisionWidth,
        height: collisionHeight
    } = getPlayerCollisionRect();

    for (const obstacle of obstacles) {

        const obstacleX = parseFloat(obstacle.getAttribute("x"));
        const obstacleY = parseFloat(obstacle.getAttribute("y"));
        const obstacleWidth = parseFloat(obstacle.getAttribute("width"));
        const obstacleHeight = parseFloat(obstacle.getAttribute("height"));

        if (
            collisionX < obstacleX + obstacleWidth &&
            collisionX + collisionWidth > obstacleX &&
            collisionY < obstacleY + obstacleHeight &&
            collisionY + collisionHeight > obstacleY
        ) {

            invulnerable = true;
            Player.setAttribute("opacity", "0.5");
            Player.style.filter = "sepia(1) saturate(100%) hue-rotate(-50deg)";
            clearTimeout(invulnerabilityTimer);
            clearTimeout(colorTimer);

            invulnerabilityTimer = setTimeout(() => {
                invulnerable = false;
                Player.setAttribute("opacity", "1");
                invulnerabilityTimer = null;
            }, 1000);

            colorTimer = setTimeout(() => {
                Player.style.filter = "none";
            }, 200);

            RemoveObstacle(obstacle);

            otterHealth--;

            healthBar.style.width =
                (Math.max(0, otterHealth) / 3 * 100) + "%";

            healthBar.style.backgroundColor =
                otterHealth === 1 ? "rgb(255, 0, 0)" :
                otterHealth === 2 ? "rgb(255, 208, 0)" :
                otterHealth === 3 ? "#2ecc71" :
                "#0e0e0e";

            if (otterHealth <= 0) {
                showGameOver();
            }

            return;
        }
    }
}

// ==============================
// MOVE OBSTACLES
// ==============================

function moveObstacles(deltaTime) {
    if (paused) return;

    const frameScale = deltaTime * TARGET_FPS;
    const movement = obstacle_speed * scaleX * frameScale;

    for (const obstacle of obstacles) {

        let obstacleX = parseFloat(obstacle.getAttribute("x"));

        obstacleX -= movement;
        obstacle.setAttribute("x", obstacleX);

        const y = parseFloat(obstacle.getAttribute("y"));
        const width = parseFloat(obstacle.getAttribute("width"));
        const height = parseFloat(obstacle.getAttribute("height"));

        obstacle.setAttribute(
            "transform",
            `rotate(${obstacle.dataset.rotation} ${obstacleX + width / 2} ${y + height / 2})`
        );
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {

        const obstacle = obstacles[i];
        const obstacleX = parseFloat(obstacle.getAttribute("x"));
        const obstacleWidth = parseFloat(obstacle.getAttribute("width"));

        if (obstacleX + obstacleWidth < 0) {
            RemoveObstacle(obstacle);
        }
    }
}

// ==============================
// GAME OVER
// ==============================

function showGameOver() {
    paused = true;
    gameOverScreen.style.display = "flex";
    finalScore.textContent = "Score: " + score;
}

// ==============================
// REMOVE OBSTACLE
// ==============================

function RemoveObstacle(obstacle) {
    if (obstacle.parentNode === canvas) {
        canvas.removeChild(obstacle);
    }

    const obstacleIndex = obstacles.indexOf(obstacle);

    if (obstacleIndex !== -1) {
        obstacles.splice(obstacleIndex, 1);

        obstacle_spawn_rate = Math.max(
            350,
            obstacle_spawn_rate - 5
        );

        obstacle_speed += 0.05;
    }
}

// ==============================
// SPAWN ONE OBSTACLE
// ==============================

function SpawnObstacle() {
    const MAX_SPAWN_ATTEMPTS = 10;

    for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {

        const obstacleWidth = OBSTACLE_SIZE;
        const obstacleHeight = OBSTACLE_SIZE;

        const obstacleX =
            canvasWidth + Math.random() * sx(100);

        const maxObstacleY = Math.max(
            0,
            canvasHeight - obstacleHeight - sy(50)
        );

        const obstacleY = Math.random() * maxObstacleY;

        let overlaps = false;

        for (const otherObstacle of obstacles) {

            const otherX = parseFloat(otherObstacle.getAttribute("x"));
            const otherY = parseFloat(otherObstacle.getAttribute("y"));
            const otherWidth = parseFloat(otherObstacle.getAttribute("width"));
            const otherHeight = parseFloat(otherObstacle.getAttribute("height"));

            if (
                obstacleX < otherX + otherWidth &&
                obstacleX + obstacleWidth > otherX &&
                obstacleY < otherY + otherHeight &&
                obstacleY + obstacleHeight > otherY
            ) {
                overlaps = true;
                break;
            }
        }

        if (overlaps) continue;

        const obstacle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
        );

        obstacle.setAttribute("x", obstacleX);
        obstacle.setAttribute("y", obstacleY);
        obstacle.setAttribute("width", obstacleWidth);
        obstacle.setAttribute("height", obstacleHeight);

        if (pngInt < 1) {
            obstacle.setAttribute("href", "resources/bag.png");
            obstacle.setAttribute("opacity", "0.8");
            pngInt++;

        } else if (pngInt < 2) {
            obstacle.setAttribute("href", "resources/cup.png");
            pngInt++;

        } else if (pngInt < 3) {
            obstacle.setAttribute("href", "resources/tire.png");
            pngInt++;

        } else {
            obstacle.setAttribute("href", "resources/bottle.png");
            obstacle.setAttribute("opacity", "0.8");
            pngInt = 0;
        }

        obstacle.setAttribute("class", "obstacle");

        obstacle.dataset.rotation = Math.random() * 180;

        obstacle.setAttribute(
            "transform",
            `rotate(${obstacle.dataset.rotation} ${obstacleX + obstacleWidth / 2} ${obstacleY + obstacleHeight / 2})`
        );

        canvas.appendChild(obstacle);
        obstacles.push(obstacle);

        return;
    }
}

// ==============================
// SPAWN MULTIPLE OBSTACLES
// ==============================

function SpawnObstacles(amount) {
    for (let i = 0; i < amount; i++) {
        SpawnObstacle();
    }
}

// ==============================
// RESET GAME
// ==============================

function resetGame() {
    clearTimeout(invulnerabilityTimer);
    invulnerabilityTimer = null;

    for (const obstacle of obstacles) {
        if (obstacle.parentNode === canvas) {
            canvas.removeChild(obstacle);
        }
    }

    obstacles = [];

    score = 0;
    elapsedGameTime = 0;
    ScoreText.textContent = "0";
    lastFrameTime = null;

    gravity = true;
    gravity_power = base_gravity;

    obstacle_spawn_rate = 1000;
    obstacle_speed = 5;

    Player.setAttribute("x", sx(100));
    Player.setAttribute(
        "y",
        canvasHeight / 2 - PLAYER_SIZE / 2
    );

    Player.setAttribute("opacity", "1");
    Player.setAttribute("href", "resources/otter.png");

    invulnerable = false;
    otterHealth = 3;

    healthBar.style.backgroundColor = "#2ecc71";
    healthBar.style.width = "100%";

    for (let i = 0; i < backgroundLayers.length; i++) {
        backgroundLayers[i].setAttribute("x", 0);
        backgroundLayers2[i].setAttribute("x", canvasWidth);
    }

    paused = false;
}

// ==============================
// OBSTACLE SPAWNER
// ==============================

async function SpawnObstaclesAsync() {
    while (true) {

        if (!paused && !document.hidden) {
            SpawnObstacles(
                Math.floor(1 + Math.random() * 3)
            );
        }

        await new Promise(resolve => {
            setTimeout(
                resolve,
                obstacle_spawn_rate +
                Math.random() * obstacle_spawn_rate
            );
        });
    }
}

// ==============================
// PARALLAX BACKGROUND MOVEMENT
// ==============================

function MoveParralaxBackground(deltaTime) {
    const frameScale = deltaTime * TARGET_FPS;

    for (let i = 0; i < backgroundLayers.length; i++) {

        const layer1 = backgroundLayers[i];
        const layer2 = backgroundLayers2[i];

        const speedFactor = (i + 1) * 0.5 * scaleX;
        const movement = speedFactor * frameScale;

        let x1 = parseFloat(layer1.getAttribute("x"));
        let x2 = parseFloat(layer2.getAttribute("x"));

        x1 -= movement;
        x2 -= movement;

        if (x1 <= -canvasWidth) {
            x1 = x2 + canvasWidth;
        }

        if (x2 <= -canvasWidth) {
            x2 = x1 + canvasWidth;
        }

        layer1.setAttribute("x", x1);
        layer2.setAttribute("x", x2);
    }
}

function playerFlashRed() {
    player.setAttribute("opacity", "0.5");
    player.setAttribute("fill", "red");
    setTimeout(() => {
        Player.setAttribute("opacity", "1");
        Player.setAttribute("fill", "white");
    }, 100);
}
function playSound(filepath){
    const audio = new Audio(filepath);
    audio.play();
}
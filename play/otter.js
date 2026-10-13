
let gravity = true;
let score = 0;
let elapsedGameTime = 0;

let gravity_power = 2;
let base_gravity = 2;
let momentum = 1.02;

let canvas = document.getElementById("gameCanvas");

let obstacles = [];

let obstacle_spawn_rate = 1000;
let obstacle_speed = 5;

let pngInt = 0;

let paused = false;

let canvasHeight = canvas.viewBox.baseVal.height;
let canvasWidth = canvas.viewBox.baseVal.width;

let gameOverScreen = document.getElementById("gameOverScreen");
let finalScore = document.getElementById("finalScore");
let restartButton = document.getElementById("restartButton");
let ScoreText = document.getElementById("scoreText");

let otterHealth = 3;
let healthBar = document.getElementById("healthBar");
let invulnerable = false;
let invulnerabilityTimer = null;

// ==============================
// FRAME RATE SETTINGS
// ==============================

// Original game movement was designed for 60 FPS.
const TARGET_FPS = 60;

// Prevent large movement jumps caused by lag.
const MAX_DELTA_TIME = 0.05;

let lastFrameTime = null;


// ==============================
// PLAYER
// ==============================

let Player = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
);

Player.setAttribute("x", 100);
Player.setAttribute("y", canvasHeight / 2 - 50);
Player.setAttribute("width", 100);
Player.setAttribute("height", 100);
Player.setAttribute("href", "resources/otter.png");


// ==============================
// PARALLAX BACKGROUND
// ==============================

let numBackgroundLayers = 6;

let backgroundLayers = [];
let backgroundLayers2 = [];

for (let i = 0; i < numBackgroundLayers; i++) {

    // First copy
    let backgroundLayer = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
    );

    backgroundLayer.setAttribute("x", 0);
    backgroundLayer.setAttribute("y", 0);
    backgroundLayer.setAttribute("width", canvasWidth);
    backgroundLayer.setAttribute("height", canvasHeight);

    backgroundLayer.setAttribute(
        "href",
        `resources/bg${i}.png`
    );

    backgroundLayer.setAttribute(
        "preserveAspectRatio",
        "none"
    );

    if (i === 0) {
        backgroundLayer.setAttribute("opacity", "0.5");
    }

    backgroundLayers.push(backgroundLayer);


    // Second copy
    let backgroundLayer2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
    );

    backgroundLayer2.setAttribute("x", canvasWidth);
    backgroundLayer2.setAttribute("y", 0);
    backgroundLayer2.setAttribute("width", canvasWidth);
    backgroundLayer2.setAttribute("height", canvasHeight);

    backgroundLayer2.setAttribute(
        "href",
        `resources/bg${i}.png`
    );

    backgroundLayer2.setAttribute(
        "preserveAspectRatio",
        "none"
    );

    if (i === 0) {
        backgroundLayer2.setAttribute("opacity", "0.5");
    }

    backgroundLayers2.push(backgroundLayer2);

    // Append pairs in the correct drawing order
    canvas.appendChild(backgroundLayer);
    canvas.appendChild(backgroundLayer2);
}

// Player stays in front of the background
canvas.appendChild(Player);


// ==============================
// START GAME
// ==============================

requestAnimationFrame(Draw);

// Start exactly one obstacle spawning loop.
SpawnObstaclesAsync();


// ==============================
// PLAYER PHYSICS
// ==============================

function applyPhysics(deltaTime) {

    if (paused) return;

    let currentY = parseFloat(Player.getAttribute("y"));
    let playerHeight = parseFloat(Player.getAttribute("height"));

    let MIN_HEIGHT = 18;
    let MAX_HEIGHT = canvasHeight - playerHeight - 18;

    // Number of equivalent 60 FPS frames elapsed
    let frameScale = deltaTime * TARGET_FPS;

    // Time-adjusted acceleration
    let accelerationFactor = Math.pow(
        momentum,
        frameScale
    );

    // Calculate movement while preserving
    // the original acceleration behavior.
    let movement;

    if (momentum === 1) {
        movement = gravity_power * frameScale;
    } else {
        movement = gravity_power *
            (accelerationFactor - 1) /
            (momentum - 1);
    }

    // Apply movement direction
    if (gravity) {
        currentY += movement;
    } else {
        currentY -= movement;
    }

    // Increase speed independently of FPS
    gravity_power *= accelerationFactor;

    // Top boundary
    if (currentY < MIN_HEIGHT) {

        currentY = MIN_HEIGHT;
        gravity_power = base_gravity;

    }

    // Bottom boundary
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

    // Initialize the previous frame timestamp
    if (lastFrameTime === null) {
        lastFrameTime = currentTime;
    }

    // Calculate time elapsed in seconds
    let deltaTime = (
        currentTime - lastFrameTime
    ) / 1000;

    lastFrameTime = currentTime;

    // Prevent large jumps after lag or tab switching
    deltaTime = Math.max(
        0,
        Math.min(deltaTime, MAX_DELTA_TIME)
    );

    // Do not simulate when paused or hidden
    if (!paused && !document.hidden) {

        // Track actual simulated game time
        elapsedGameTime += deltaTime;

        score = Math.floor(
            elapsedGameTime * 10
        );

        ScoreText.textContent = score;

        // Update player movement
        applyPhysics(deltaTime);

        // Update obstacle movement
        moveObstacles(deltaTime);

        // Detect collisions
        checkObstacleCollision();

        // Update parallax scrolling
        MoveParralaxBackground(deltaTime);
    }

    requestAnimationFrame(Draw);
}


// ==============================
// CONTROLS
// ==============================

function toggleGravity() {

    gravity = !gravity;

}


// Spacebar
document.addEventListener("keydown", function(event) {

    if (event.code === "Space") {

        event.preventDefault();

        if (paused) {
            return;
        }

        // Prevent repeated gravity toggling
        // when holding the spacebar.
        if (event.repeat) {
            return;
        }

        toggleGravity();

        gravity_power = base_gravity;
    }

});


// Mouse
canvas.addEventListener("click", function() {

    if (paused) {
        return;
    }

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
// COLLISION
// ==============================

function checkObstacleCollision() {

    if (invulnerable || paused) {
        return;
    }

    let playerX = parseFloat(Player.getAttribute("x"));
    let playerY = parseFloat(Player.getAttribute("y"));

    let playerWidth = parseFloat(
        Player.getAttribute("width")
    );

    let playerHeight = parseFloat(
        Player.getAttribute("height")
    );

    for (let obstacle of obstacles) {

        let obstacleX = parseFloat(
            obstacle.getAttribute("x")
        );

        let obstacleY = parseFloat(
            obstacle.getAttribute("y")
        );

        let obstacleWidth = parseFloat(
            obstacle.getAttribute("width")
        );

        let obstacleHeight = parseFloat(
            obstacle.getAttribute("height")
        );

        // Rectangle-style collision detection
        if (
            playerX < obstacleX + obstacleWidth &&
            playerX + playerWidth > obstacleX &&
            playerY < obstacleY + obstacleHeight &&
            playerY + playerHeight > obstacleY
        ) {

            // Temporary invulnerability
            invulnerable = true;

            Player.setAttribute("opacity", "0.5");

            clearTimeout(invulnerabilityTimer);

            invulnerabilityTimer = setTimeout(() => {

                invulnerable = false;

                Player.setAttribute("opacity", "1");

                invulnerabilityTimer = null;

            }, 1000);

            // Remove the collided obstacle
            RemoveObstacle(obstacle);

            // Decrease player health
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

    if (paused) {
        return;
    }

    // Convert movement into elapsed-time units
    let frameScale = deltaTime * TARGET_FPS;

    let movement = obstacle_speed * frameScale;

    // Move all obstacles
    for (let obstacle of obstacles) {

        let obstacleX = parseFloat(
            obstacle.getAttribute("x")
        );

        obstacleX -= movement;

        obstacle.setAttribute("x", obstacleX);

        // Get obstacle properties for rotation
        let y = parseFloat(obstacle.getAttribute("y"));

        let width = parseFloat(
            obstacle.getAttribute("width")
        );

        let height = parseFloat(
            obstacle.getAttribute("height")
        );

        // Keep rotation centered on obstacle
        obstacle.setAttribute(
            "transform",
            `rotate(${obstacle.dataset.rotation} ${obstacleX + width / 2} ${y + height / 2})`
        );
    }

    // Remove offscreen obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {

        let obstacle = obstacles[i];

        let obstacleX = parseFloat(
            obstacle.getAttribute("x")
        );

        let obstacleWidth = parseFloat(
            obstacle.getAttribute("width")
        );

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

    let obstacleIndex = obstacles.indexOf(obstacle);

    if (obstacleIndex !== -1) {

        obstacles.splice(obstacleIndex, 1);

        // Increase difficulty after removal
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

    for (
        let attempt = 0;
        attempt < MAX_SPAWN_ATTEMPTS;
        attempt++
    ) {

        let obstacleWidth = 100;
        let obstacleHeight = 100;

        let obstacleX =
            canvasWidth + Math.random() * 100;

        let obstacleY =
            Math.random() *
            (canvasHeight - obstacleHeight - 50);

        obstacleY = Math.max(
            0,
            Math.min(
                obstacleY,
                canvasHeight - obstacleHeight - 50
            )
        );

        let overlaps = false;

        // Check existing obstacles
        for (let otherObstacle of obstacles) {

            let otherX = parseFloat(
                otherObstacle.getAttribute("x")
            );

            let otherY = parseFloat(
                otherObstacle.getAttribute("y")
            );

            if (
                Math.abs(obstacleX - otherX) < obstacleWidth &&
                Math.abs(obstacleY - otherY) < obstacleHeight
            ) {

                overlaps = true;
                break;
            }
        }

        if (overlaps) {
            continue;
        }

        // Create obstacle
        let obstacle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
        );

        obstacle.setAttribute("x", obstacleX);
        obstacle.setAttribute("y", obstacleY);
        obstacle.setAttribute("width", obstacleWidth);
        obstacle.setAttribute("height", obstacleHeight);

        // Select a random image
        

        if (pngInt < 1) {

            obstacle.setAttribute(
                "href",
                "resources/bag.png"
            );

            obstacle.setAttribute("opacity", "0.8");
            pngInt++;

        } else if (pngInt < 2) {

            obstacle.setAttribute(
                "href",
                "resources/cup.png"
            );
            pngInt++;

        } else if(pngInt < 3)  {

            obstacle.setAttribute(
                "href",
                "resources/tire.png"
            );
            pngInt++;
        } else{

            obstacle.setAttribute(
                "href",
                "resources/bottle.png"
            );
            obstacle.setAttribute("opacity", "0.8");
            pngInt = 0;
        }

        obstacle.setAttribute("class", "obstacle");

        // Random starting rotation
        obstacle.dataset.rotation = Math.random() * 180;

        // Apply rotation immediately
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

    // Clear any pending invulnerability timer
    clearTimeout(invulnerabilityTimer);
    invulnerabilityTimer = null;

    // Remove obstacles
    for (let obstacle of obstacles) {

        if (obstacle.parentNode === canvas) {
            canvas.removeChild(obstacle);
        }
    }

    obstacles = [];

    // Reset score
    score = 0;
    elapsedGameTime = 0;

    ScoreText.textContent = "0";

    // Reset frame timing
    lastFrameTime = null;

    // Reset gravity
    gravity = true;
    gravity_power = base_gravity;

    // Reset difficulty
    obstacle_spawn_rate = 1000;
    obstacle_speed = 5;

    // Reset player position
    Player.setAttribute("x", 100);
    Player.setAttribute("y", canvasHeight / 2 - 50);

    // Reset player appearance
    Player.setAttribute("opacity", "1");
    Player.setAttribute("href", "resources/otter.png");

    invulnerable = false;

    // Reset health
    otterHealth = 3;

    healthBar.style.backgroundColor = "#2ecc71";
    healthBar.style.width = "100%";

    // Reset background positions
    for (let i = 0; i < backgroundLayers.length; i++) {

        backgroundLayers[i].setAttribute("x", 0);

        backgroundLayers2[i].setAttribute(
            "x",
            canvasWidth
        );
    }

    // Resume game
    paused = false;
}


// ==============================
// OBSTACLE SPAWNER
// ==============================

async function SpawnObstaclesAsync() {

    // Only one spawning loop exists
    while (true) {

        if (!paused && !document.hidden) {

            SpawnObstacles(
                Math.floor(1 + Math.random() * 3)
            );
        }

        // Wait based on spawn rate
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
// ANIMATION CLASS
// ==============================

class Animation {

    constructor(frames, speed) {

        this.frames = frames;
        this.speed = speed;

        this.timer = null;
        this.currentFrame = 0;
    }

    PlayAnimation(loop = false) {

        this.StopAnimation();

        if (this.frames.length === 0 || this.speed <= 0) {
            return;
        }

        this.currentFrame = 0;

        // Display first frame immediately
        Player.setAttribute(
            "href",
            this.frames[this.currentFrame]
        );

        this.currentFrame++;

        this.timer = setInterval(() => {

            if (paused || document.hidden) {
                return;
            }

            if (this.currentFrame >= this.frames.length) {

                if (loop) {
                    this.currentFrame = 0;
                } else {
                    this.StopAnimation();
                    return;
                }
            }

            Player.setAttribute(
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


// ==============================
// PARALLAX BACKGROUND
// ==============================

function MoveParralaxBackground(deltaTime) {

    // Equivalent amount of 60 FPS movement
    let frameScale = deltaTime * TARGET_FPS;

    for (let i = 0; i < backgroundLayers.length; i++) {

        let layer1 = backgroundLayers[i];
        let layer2 = backgroundLayers2[i];

        // Different speeds for depth
        let speedFactor = (i + 1) * 0.5;

        let movement = speedFactor * frameScale;

        let x1 = parseFloat(layer1.getAttribute("x"));
        let x2 = parseFloat(layer2.getAttribute("x"));

        // Move both copies left
        x1 -= movement;
        x2 -= movement;

        // First copy completely offscreen
        if (x1 <= -canvasWidth) {

            // Teleport to the right of second copy
            x1 = x2 + canvasWidth;
        }

        // Second copy completely offscreen
        if (x2 <= -canvasWidth) {

            // Teleport to the right of first copy
            x2 = x1 + canvasWidth;
        }

        layer1.setAttribute("x", x1);
        layer2.setAttribute("x", x2);
    }
}

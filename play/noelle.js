
const canvas = document.getElementById("canvas");

const PLAYER_SIZE = 50;
const GROUND_HEIGHT = 50;

const WIN_SCORE = 40;
const MAX_BLUR = 20;

// Game state
let score = 0;
let gameRunning = false;
let gameWon = false;

// Sprites
const PIG_IDLE = "noelle_resources/pig_1.png";
const PIG_WALK = "noelle_resources/pig_2.png";
const MARG_IMAGE = "noelle_resources/marg.png";
const TOMATO_IMAGE = "noelle_resources/tomato.png";

// Walking animation
const ANIMATION_SPEED = 0.15;

let animationTimer = 0;
let currentFrame = 0;

// Preload artwork
[PIG_IDLE, PIG_WALK, MARG_IMAGE, TOMATO_IMAGE].forEach(src => {
    const img = new Image();
    img.src = src;
});

// Physics
const physics = {
    acceleration: 1800,
    maxSpeed: 500,
    friction: 2200,
    gravity: 1800,
    jumpStrength: 650
};

const playerState = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1
};

const keys = {
    left: false,
    right: false,
    jump: false
};

let player;
let ground;
let canvasWidth;
let canvasHeight;

let lastTime = null;
let animationFrameId = null;

let margSpawnTimeout = null;
let tomatoSpawnTimeout = null;

// Create SVG elements
function createSVGElement(type) {
    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        type
    );
}

// Ground
function createGround() {
    ground = createSVGElement("rect");
    ground.setAttribute("fill", "#216524");
    canvas.appendChild(ground);
}

// Player
function createPlayer() {
    player = createSVGElement("image");

    player.setAttribute("id", "player");
    player.setAttribute("width", PLAYER_SIZE);
    player.setAttribute("height", PLAYER_SIZE);
    player.setAttribute("href", PIG_IDLE);

    canvas.appendChild(player);
}

// Resize
function resizeCanvas() {
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;

    canvas.setAttribute(
        "viewBox",
        `0 0 ${canvasWidth} ${canvasHeight}`
    );

    ground.setAttribute("x", 0);
    ground.setAttribute("y", canvasHeight - GROUND_HEIGHT);
    ground.setAttribute("width", canvasWidth);
    ground.setAttribute("height", GROUND_HEIGHT);

    playerState.x = Math.max(
        0,
        Math.min(playerState.x, canvasWidth - PLAYER_SIZE)
    );

    playerState.y = Math.min(
        playerState.y,
        canvasHeight - GROUND_HEIGHT - PLAYER_SIZE
    );

    renderPlayer();
}

// Physics
function updatePlayer(dt) {
    const p = playerState;

    let direction = 0;

    if (keys.left) direction -= 1;
    if (keys.right) direction += 1;

    if (direction !== 0) {
        p.facing = direction;
        p.vx += direction * physics.acceleration * dt;
    } else {
        const friction = physics.friction * dt;

        if (Math.abs(p.vx) <= friction) {
            p.vx = 0;
        } else {
            p.vx -= Math.sign(p.vx) * friction;
        }
    }

    p.vx = Math.max(
        -physics.maxSpeed,
        Math.min(physics.maxSpeed, p.vx)
    );

    // Jump
    if (keys.jump && p.grounded) {
        p.vy = -physics.jumpStrength;
        p.grounded = false;
    }

    // Gravity
    p.vy += physics.gravity * dt;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Ground collision
    const groundY = canvasHeight - GROUND_HEIGHT;

    if (p.y + PLAYER_SIZE >= groundY) {
        p.y = groundY - PLAYER_SIZE;
        p.vy = 0;
        p.grounded = true;
    }

    // Boundaries
    if (p.x < 0) {
        p.x = 0;
        p.vx = 0;
    }

    if (p.x + PLAYER_SIZE > canvasWidth) {
        p.x = canvasWidth - PLAYER_SIZE;
        p.vx = 0;
    }

    renderPlayer();
}

// Walking animation
function updatePlayerAnimation(dt) {
    const moving = Math.abs(playerState.vx) > 5;

    if (moving) {
        animationTimer += dt;

        if (animationTimer >= ANIMATION_SPEED) {
            animationTimer %= ANIMATION_SPEED;
            currentFrame = 1 - currentFrame;
        }
    } else {
        animationTimer = 0;
        currentFrame = 0;
    }

    const image = currentFrame === 0
        ? PIG_IDLE
        : PIG_WALK;

    if (player.getAttribute("href") !== image) {
        player.setAttribute("href", image);
    }
}

// Render player
function renderPlayer() {
    const p = playerState;

    player.setAttribute("x", p.x);
    player.setAttribute("y", p.y);

    if (p.facing === -1) {
        player.setAttribute(
            "transform",
            `translate(${2 * p.x + PLAYER_SIZE}, 0) scale(-1, 1)`
        );
    } else {
        player.removeAttribute("transform");
    }
}

// Keyboard controls
document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) {
        event.preventDefault();
    }

    if (!gameRunning) return;

    if (key === "arrowleft" || key === "a") {
        keys.left = true;
    }

    if (key === "arrowright" || key === "d") {
        keys.right = true;
    }

    if (key === "arrowup" || key === "w" || key === " ") {
        keys.jump = true;
    }
});

document.addEventListener("keyup", event => {
    const key = event.key.toLowerCase();

    if (key === "arrowleft" || key === "a") {
        keys.left = false;
    }

    if (key === "arrowright" || key === "d") {
        keys.right = false;
    }

    if (key === "arrowup" || key === "w" || key === " ") {
        keys.jump = false;
    }
});

window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;
    keys.jump = false;
});

// Create falling item
function createFallingItem(type, image) {
    const item = createSVGElement("image");

    item.classList.add("falling-item", type);

    item.setAttribute("width", PLAYER_SIZE);
    item.setAttribute("height", PLAYER_SIZE);
    item.setAttribute("href", image);

    item.setAttribute(
        "x",
        Math.random() * Math.max(0, canvasWidth - PLAYER_SIZE)
    );

    item.setAttribute("y", -PLAYER_SIZE);

    canvas.appendChild(item);
}

// Spawn Margs
function margSpawnLoop() {
    if (!gameRunning) return;

    createFallingItem("marg", MARG_IMAGE);

    margSpawnTimeout = setTimeout(
        margSpawnLoop,
        Math.random() * 1000 + 800
    );
}

// Spawn tomatoes
function tomatoSpawnLoop() {
    if (!gameRunning) return;

    createFallingItem("tomato", TOMATO_IMAGE);

    tomatoSpawnTimeout = setTimeout(
        tomatoSpawnLoop,
        Math.random() * 1000 + 500
    );
}

// Sound effects
function playSound(type) {
    let src;

    if (type === "score") {
        src = "noelle_resources/score.mp3";
    } else {
        src = "noelle_resources/splat.mp3";
    }

    const audio = new Audio(src);
    audio.play().catch(() => {});
}

// Update score and blur
function updateScore(amount) {
    if (!gameRunning) return;

    score = Math.max(0, score + amount);

    document.getElementById("score").textContent =
        String(score).padStart(4, "0");

    updateBlur();

    // Check win condition
    if (score >= WIN_SCORE) {
        winGame();
    }
}

// Update blur and vignette
function updateBlur() {
    const progress = Math.min(score / WIN_SCORE, 1);

    const blurAmount = progress * MAX_BLUR;
    const percentage = Math.round(progress * 100);

    // Blur SVG
    canvas.style.filter = `blur(${blurAmount}px)`;

    // Darken vignette as score increases
    const vignette = document.getElementById("vignette");

    vignette.style.opacity = Math.min(
        progress * 0.85,
        0.85
    );

    // Update tipsy meter
    document.getElementById("tipsy-fill").style.width =
        `${percentage}%`;

    document.getElementById("tipsy-percent").textContent =
        `${percentage}%`;
}

// Collision helper
function isColliding(item) {
    const itemX = parseFloat(item.getAttribute("x"));
    const itemY = parseFloat(item.getAttribute("y"));

    return (
        itemX < playerState.x + PLAYER_SIZE &&
        itemX + PLAYER_SIZE > playerState.x &&
        itemY < playerState.y + PLAYER_SIZE &&
        itemY + PLAYER_SIZE > playerState.y
    );
}

// Falling item movement and collision
function updateFallingItems(dt) {
    const items = canvas.querySelectorAll(".falling-item");

    // Keep the original falling speed (~125px/sec)
    const fallSpeed = 125;

    for (const item of items) {
        if (!gameRunning) break;

        const y = parseFloat(item.getAttribute("y"));
        const newY = y + fallSpeed * dt;

        item.setAttribute("y", newY);

        // Player collision
        if (isColliding(item)) {
            const isMarg = item.classList.contains("marg");

            item.remove();

            if (isMarg) {
                playSound("score");
                updateScore(1);
            } else {
                playSound("splat");
                updateScore(-1);
            }

            continue;
        }

        // Ground collision
        if (
            newY + PLAYER_SIZE >=
            canvasHeight - GROUND_HEIGHT
        ) {
            if (item.classList.contains("tomato")) {
                playSound("splat");
            }

            item.remove();
        }
    }
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;

    if (lastTime === null) {
        lastTime = timestamp;
    }

    const dt = Math.min(
        (timestamp - lastTime) / 1000,
        0.033
    );

    lastTime = timestamp;

    updatePlayer(dt);
    updatePlayerAnimation(dt);
    updateFallingItems(dt);

    if (gameRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// WIN CONDITION
function winGame() {
    if (gameWon) return;

    gameWon = true;
    gameRunning = false;

    clearTimeout(margSpawnTimeout);
    clearTimeout(tomatoSpawnTimeout);

    keys.left = false;
    keys.right = false;
    keys.jump = false;

    document.getElementById("final-score").textContent = score;

    // Hide game and show victory
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("win-screen").classList.remove("hidden");

    window.scrollTo(0, 0);
}

// Start or restart game
function startGame() {
    clearTimeout(margSpawnTimeout);
    clearTimeout(tomatoSpawnTimeout);

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    score = 0;
    gameWon = false;
    gameRunning = true;

    lastTime = null;
    animationTimer = 0;
    currentFrame = 0;

    keys.left = false;
    keys.right = false;
    keys.jump = false;

    playerState.x = 100;
    playerState.y = 100;
    playerState.vx = 0;
    playerState.vy = 0;
    playerState.grounded = false;
    playerState.facing = 1;

    // Clear old SVG elements
    canvas.replaceChildren();

    createGround();
    createPlayer();

    // Show game screen before measuring SVG size
    document.getElementById("intro-screen").classList.add("hidden");
    document.getElementById("win-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");

    resizeCanvas();

    document.getElementById("score").textContent = "0000";

    updateBlur();
    renderPlayer();

    // Begin spawning items
    margSpawnTimeout = setTimeout(margSpawnLoop, 2000);
    tomatoSpawnTimeout = setTimeout(tomatoSpawnLoop, 2000);

    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    window.scrollTo(0, 0);
}

// Buttons
document.getElementById("start-button").addEventListener(
    "click",
    startGame
);

document.getElementById("restart-button").addEventListener(
    "click",
    startGame
);

// Handle resizing
window.addEventListener("resize", () => {
    if (gameRunning && ground && player) {
        resizeCanvas();
    }
});

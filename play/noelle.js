
const canvas = document.getElementById("canvas");

let score = 0;

const PLAYER_SIZE = 50;
const GROUND_HEIGHT = 50;

// Player sprites
const PIG_IDLE = "noelle_resources/pig_1.png";
const PIG_WALK = "noelle_resources/pig_2.png";

// Animation settings
const ANIMATION_SPEED = 0.15;
let animationTimer = 0;
let currentFrame = 0;

// Preload images to prevent flickering
[PIG_IDLE, PIG_WALK].forEach((src) => {
    const img = new Image();
    img.src = src;
});

// Physics settings
const physics = {
    acceleration: 1800,
    maxSpeed: 500,
    friction: 2200,
    gravity: 1800,
    jumpStrength: 650
};

// Player state
const playerState = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1
};

// Keyboard input
const keys = {
    left: false,
    right: false,
    jump: false
};

let player;
let ground;
let canvasWidth;
let canvasHeight;

// Create SVG element helper
function createSVGElement(type) {
    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        type
    );
}

// Create ground
function createGround() {
    ground = createSVGElement("rect");

    ground.setAttribute("fill", "#216524");

    canvas.appendChild(ground);
}

// Create player
function createPlayer() {
    player = createSVGElement("image");

    player.setAttribute("id", "player");
    player.setAttribute("width", PLAYER_SIZE);
    player.setAttribute("height", PLAYER_SIZE);
    player.setAttribute("href", PIG_IDLE);

    canvas.appendChild(player);
}

// Resize canvas
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
}

// Update player physics
function updatePlayer(dt) {
    const p = playerState;

    let direction = 0;

    // Horizontal movement
    if (keys.left) direction -= 1;
    if (keys.right) direction += 1;

    // Update facing direction
    if (direction !== 0) {
        p.facing = direction;
    }

    // Acceleration and friction
    if (direction !== 0) {
        p.vx += direction * physics.acceleration * dt;
    } else {
        const frictionAmount = physics.friction * dt;

        if (Math.abs(p.vx) <= frictionAmount) {
            p.vx = 0;
        } else {
            p.vx -= Math.sign(p.vx) * frictionAmount;
        }
    }

    // Limit horizontal speed
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

    // Apply movement
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Ground collision
    const groundY = canvasHeight - GROUND_HEIGHT;

    if (p.y + PLAYER_SIZE >= groundY) {
        p.y = groundY - PLAYER_SIZE;
        p.vy = 0;
        p.grounded = true;
    }

    // Left and right boundaries
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

// Update walking animation
function updatePlayerAnimation(dt) {
    // Animate whenever the pig is moving horizontally
    const moving = Math.abs(playerState.vx) > 5;

    if (moving) {
        animationTimer += dt;

        if (animationTimer >= ANIMATION_SPEED) {
            animationTimer %= ANIMATION_SPEED;

            // Alternate between frame 0 and frame 1
            currentFrame = 1 - currentFrame;
        }
    } else {
        // Return to idle sprite when stopped
        animationTimer = 0;
        currentFrame = 0;
    }

    const newImage = currentFrame === 0
        ? PIG_IDLE
        : PIG_WALK;

    // Only update the image when the frame changes
    if (player.getAttribute("href") !== newImage) {
        player.setAttribute("href", newImage);
    }
}

// Render player and flip sprite
function renderPlayer() {
    const p = playerState;

    player.setAttribute("x", p.x);
    player.setAttribute("y", p.y);

    if (p.facing === -1) {
        // Flip horizontally around player's center
        player.setAttribute(
            "transform",
            `translate(${2 * p.x + PLAYER_SIZE}, 0) scale(-1, 1)`
        );
    } else {
        player.removeAttribute("transform");
    }
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if ([
        "arrowleft",
        "arrowright",
        "arrowup",
        " "
    ].includes(key)) {
        event.preventDefault();
    }

    switch (key) {
        case "arrowleft":
        case "a":
            keys.left = true;
            break;

        case "arrowright":
        case "d":
            keys.right = true;
            break;

        case "arrowup":
        case "w":
        case " ":
            keys.jump = true;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    switch (key) {
        case "arrowleft":
        case "a":
            keys.left = false;
            break;

        case "arrowright":
        case "d":
            keys.right = false;
            break;

        case "arrowup":
        case "w":
        case " ":
            keys.jump = false;
            break;
    }
});

// Stop movement when window loses focus
window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;
    keys.jump = false;
});

// Game loop
let lastTime = null;

function gameLoop(timestamp) {
    if (lastTime === null) {
        lastTime = timestamp;
    }

    const dt = Math.min(
        (timestamp - lastTime) / 1000,
        0.033
    );

    lastTime = timestamp;

    // Update physics
    updatePlayer(dt);

    // Update walking animation
    updatePlayerAnimation(dt);

    requestAnimationFrame(gameLoop);
}

// Spawn Margs
function spawnMarg() {
    const marg = createSVGElement("image");

    marg.setAttribute("id", "marg");
    marg.setAttribute("width", PLAYER_SIZE);
    marg.setAttribute("height", PLAYER_SIZE);
    marg.setAttribute("href", "noelle_resources/marg.png");

    marg.setAttribute(
        "x",
        Math.random() * Math.max(0, canvasWidth - PLAYER_SIZE)
    );

    // Spawn above the screen
    marg.setAttribute("y", -PLAYER_SIZE);

    canvas.appendChild(marg);
}

// Spawn Margs every 2-4 seconds
function margSpawnLoop() {
    spawnMarg();

    setTimeout(
        margSpawnLoop,
        Math.random() * 1000 + 800
    );
}

// Make Margs fall
function margFallLoop() {
    const margs = document.querySelectorAll("#marg");

    margs.forEach((marg) => {
        const y = parseFloat(marg.getAttribute("y"));

        marg.setAttribute("y", y + 2);

        // Remove when below the canvas
        if (y > canvasHeight) {
            marg.remove();
        }
    });
}

// Play sound effects
function playSound(int) {
    if (int === 1) {
        const audio = new Audio("noelle_resources/score.mp3");
        audio.play().catch(() => {});
    } else if (int === 2) {
        const audio = new Audio("noelle_resources/marg.mp3");
        audio.play().catch(() => {});
    }
}

// Check Marg collisions
function checkCollision() {
    const margs = document.querySelectorAll("#marg");

    margs.forEach((marg) => {
        const margX = parseFloat(marg.getAttribute("x"));
        const margY = parseFloat(marg.getAttribute("y"));

        const playerX = playerState.x;
        const playerY = playerState.y;

        // Player collision
        if (
            margX < playerX + PLAYER_SIZE &&
            margX + PLAYER_SIZE > playerX &&
            margY < playerY + PLAYER_SIZE &&
            margY + PLAYER_SIZE > playerY
        ) {
            marg.remove();

            score++;
            playSound(1);
            updateBlur();
            const scoreLabel = document.getElementById("score");

            if (scoreLabel) {
                scoreLabel.textContent =
                    String(score).padStart(4, "0");
            }

            return;
        }

        // Ground collision
        if (
            margY + PLAYER_SIZE >= canvasHeight - GROUND_HEIGHT
        ) {
            marg.remove();
        }
    });
}
function updateBlur() {
    // Increase blur by 0.1px for every point
    const blurAmount = Math.min(score * 0.1, 20);

    canvas.style.filter = `blur(${blurAmount}px)`;
    // make darkness increase with blur
    const darkness = Math.min(score * 0.02, 0.5);
    canvas.style.backgroundColor = `rgba(135, 206, 235, ${1 - darkness})`;
}

// Initialize game
function start() {
    createGround();
    createPlayer();

    resizeCanvas();
    renderPlayer();

    // Start spawning Margs after 2 seconds
    setTimeout(margSpawnLoop, 2000);

    // Marg falling and collision detection
    setInterval(margFallLoop, 16);
    setInterval(checkCollision, 16);

    // Handle resizing
    window.addEventListener("resize", resizeCanvas);

    // Start game loop
    requestAnimationFrame(gameLoop);
}

start();

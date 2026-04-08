let playerPaddle = document.getElementById("player-paddle");
let enemyPaddle = document.getElementById("enemy-paddle");
let gameWindow = document.getElementById("game-window");
let ball = document.getElementById("ball");
let scoreDisplay = document.getElementById("score-display");
let countdownDisplay = document.getElementById("countdown");
let paddleWidth = gameWindow.clientWidth * 0.2;
let paddleHeight = paddleWidth * 0.2;
let ballRadius = gameWindow.clientWidth * 0.03;
let ballSpeedX = 0;
let ballSpeedY = 0;
let score = 0;
let previousPlayerPaddleX = parseFloat(playerPaddle.getAttribute("x"));
let previousEnemyPaddleX = parseFloat(enemyPaddle.getAttribute("x"));
let hue = 0;
let startTime = Date.now();
let playing = false;
function Start() {
    playerPaddle.setAttribute("width", paddleWidth);
    playerPaddle.setAttribute("height", paddleHeight);
    enemyPaddle.setAttribute("width", paddleWidth);
    enemyPaddle.setAttribute("height", paddleHeight);
    ball.setAttribute("r", ballRadius);
    playerPaddle.setAttribute("x", gameWindow.clientWidth / 2 - playerPaddle.getAttribute("width") / 2);
    playerPaddle.setAttribute("y", gameWindow.clientHeight - playerPaddle.getAttribute("height") - 10);
    enemyPaddle.setAttribute("x", gameWindow.clientWidth / 2 - enemyPaddle.getAttribute("width") / 2);
    enemyPaddle.setAttribute("y", 10);
    ball.setAttribute("cx", gameWindow.clientWidth / 2);
    ball.setAttribute("cy", gameWindow.clientHeight / 2);
    countdownDisplay.textContent = "";
    score = 0;
    UpdateScore();
    countdownDisplay.setAttribute("x", gameWindow.clientWidth / 2 - 10);
    countdownDisplay.setAttribute("y", gameWindow.clientHeight / 2 + 10);
    ball.setAttribute("fill", "blue");
    ball.setAttribute("stroke", "cyan");
    ball.setAttribute("stroke-width", "2");
    playerPaddle.setAttribute("fill", "rgb(0, 165, 14)");
    playerPaddle.setAttribute("stroke", "rgb(0, 255, 0)");
    playerPaddle.setAttribute("stroke-width", "2");
    enemyPaddle.setAttribute("fill", "rgb(214, 0, 0)");
    enemyPaddle.setAttribute("stroke", "rgb(255, 0, 0)");
    enemyPaddle.setAttribute("stroke-width", "2");
    gameWindow.style.backgroundColor = "black";
    addEventListener("mousemove", MovePlayerPaddle);
    StartBall();
    requestAnimationFrame(Draw);
}
function Draw(){
    CheckBallCollision();
    MoveBall();
    MoveEnemyPaddle();
    BallColorShift();
    previousPlayerPaddleX = parseFloat(playerPaddle.getAttribute("x"));
    previousEnemyPaddleX = parseFloat(enemyPaddle.getAttribute("x"));
    UpdateScore();
    requestAnimationFrame(Draw);
}
function MovePlayerPaddle(event) {
    if(!playing) return;
    let rect = gameWindow.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let paddleX = mouseX - playerPaddle.getAttribute("width") / 2;
    if (paddleX < 0) {
        paddleX = 0;
    }
    if (paddleX > gameWindow.clientWidth - playerPaddle.getAttribute("width")) {
        paddleX = gameWindow.clientWidth - playerPaddle.getAttribute("width");
    }
    playerPaddle.setAttribute("x", paddleX);
}
function MoveEnemyPaddle() {
    let ballX = parseFloat(ball.getAttribute("cx"));
    let paddleX = parseFloat(enemyPaddle.getAttribute("x"));
    enemyPaddle.setAttribute("x", paddleX + (ballX - (paddleX + enemyPaddle.getAttribute("width") / 2)) * 0.1);
}
function MoveBall() {
    let ballX = parseFloat(ball.getAttribute("cx"));
    let ballY = parseFloat(ball.getAttribute("cy"));

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballX <= ballRadius) {
        ballX = ballRadius;
        ballSpeedX = -ballSpeedX;
    }
    else if (ballX >= gameWindow.clientWidth - ballRadius) {
        ballX = gameWindow.clientWidth - ballRadius;
        ballSpeedX = -ballSpeedX;
    }
    if (ballY <= ballRadius) {
        score *= 1000000000;
        ballY = gameWindow.clientHeight / 2;
        ballX = gameWindow.clientWidth / 2;
        ballSpeedY = 0;
        ballSpeedX = 0;
        playing = false;
        StartBall();
    }
    else if (ballY >= gameWindow.clientHeight - ballRadius) {
        startTime = Date.now();
        ballY = gameWindow.clientHeight / 2;
        ballX = gameWindow.clientWidth / 2;
        ballSpeedY = 0;
        ballSpeedX = 0;
        playing = false;
        startTime = Date.now();
        StartBall();
    }

    ball.setAttribute("cx", ballX);
    ball.setAttribute("cy", ballY);
}
function StartBall(){
    playerPaddle.setAttribute("x", gameWindow.clientWidth / 2 - playerPaddle.getAttribute("width") / 2);
    let countdown = 3;
    let countdownInterval = setInterval(() => {
        if(countdown === 3){
            countdownDisplay.textContent = "Get Ready!";
            countdownDisplay.setAttribute("x", gameWindow.clientWidth / 2 - countdownDisplay.getComputedTextLength() / 2);
            countdownDisplay.setAttribute("fill", "red");
        }
        if(countdown === 2){
            countdownDisplay.textContent = "Set!";
            countdownDisplay.setAttribute("x", gameWindow.clientWidth / 2 - countdownDisplay.getComputedTextLength() / 2);
            countdownDisplay.setAttribute("fill", "yellow");
        }
        if(countdown === 1){
            countdownDisplay.textContent = "Go!";
            countdownDisplay.setAttribute("x", gameWindow.clientWidth / 2 - countdownDisplay.getComputedTextLength() / 2);
            countdownDisplay.setAttribute("fill", "rgb(0, 255, 0)");
        }
        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = "";
            ballSpeedX = 3;
            ballSpeedY = 3;
            playing = true;
        }
        countdown--;
    }, 1000);
    
}
function UpdateScore() {
    if(playing){
        score = parseInt((Date.now() - startTime) / 1000) - 4;
        scoreDisplay.textContent = score;
        scoreDisplay.setAttribute("x", 0);
        scoreDisplay.setAttribute("y", gameWindow.clientHeight / 2);
        scoreDisplay.setAttribute("fill", `hsl(${hue}, 100%, 50%)`);
    }
    else{
        scoreDisplay.textContent = "";
    }
}
function CheckBallCollision() {
    let ballX = parseFloat(ball.getAttribute("cx"));
    let ballY = parseFloat(ball.getAttribute("cy"));

    let paddleX = parseFloat(playerPaddle.getAttribute("x"));
    let paddleY = parseFloat(playerPaddle.getAttribute("y"));
    let paddleWidth = parseFloat(playerPaddle.getAttribute("width"));
    let paddleHeight = parseFloat(playerPaddle.getAttribute("height"));

    let enemyPaddleX = parseFloat(enemyPaddle.getAttribute("x"));
    let enemyPaddleY = parseFloat(enemyPaddle.getAttribute("y"));
    let enemyPaddleWidth = parseFloat(enemyPaddle.getAttribute("width"));
    let enemyPaddleHeight = parseFloat(enemyPaddle.getAttribute("height"));

    let playerPaddleVelocityX = paddleX - previousPlayerPaddleX;
    let enemyPaddleVelocityX = enemyPaddleX - previousEnemyPaddleX;

    if (
        ballX + ballRadius > paddleX &&
        ballX - ballRadius < paddleX + paddleWidth &&
        ballY + ballRadius > paddleY &&
        ballY - ballRadius < paddleY + paddleHeight &&
        ballSpeedY > 0
    ) {
        ballY = paddleY - ballRadius;
        ballSpeedY = -Math.abs(ballSpeedY);

        ballSpeedX += playerPaddleVelocityX * 0.4;

        let hitOffset = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        ballSpeedX += hitOffset * 2;

        LimitBallSpeed();
    }
    else if (
        ballX + ballRadius > enemyPaddleX &&
        ballX - ballRadius < enemyPaddleX + enemyPaddleWidth &&
        ballY + ballRadius > enemyPaddleY &&
        ballY - ballRadius < enemyPaddleY + enemyPaddleHeight &&
        ballSpeedY < 0
    ) {
        ballY = enemyPaddleY + enemyPaddleHeight + ballRadius;
        ballSpeedY = Math.abs(ballSpeedY);

        ballSpeedX += enemyPaddleVelocityX * 0.4;

        let hitOffset = (ballX - (enemyPaddleX + enemyPaddleWidth / 2)) / (enemyPaddleWidth / 2);
        ballSpeedX += hitOffset * 2;

        LimitBallSpeed();
    }

    ball.setAttribute("cy", ballY);
}
function LimitBallSpeed() {
    let maxXSpeed = 4;
    let maxYSpeed = 4;

    if (ballSpeedX > maxXSpeed) ballSpeedX = maxXSpeed;
    if (ballSpeedX < -maxXSpeed) ballSpeedX = -maxXSpeed;
    if (ballSpeedY > maxYSpeed) ballSpeedY = maxYSpeed;
    if (ballSpeedY < -maxYSpeed) ballSpeedY = -maxYSpeed;
}

function BallColorShift() {
    hue = (hue + 2) % 360;
    ball.setAttribute("fill", `hsl(${hue}, 100%, 50%)`);
    ball.setAttribute("stroke", `hsl(${(hue + 180) % 360}, 100%, 50%)`);
}
Start();
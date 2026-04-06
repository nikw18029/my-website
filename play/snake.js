let snakeHead = document.getElementById("snake-head");
let snakeBody = [];
let food = document.getElementById("food");
let direction = "none";
let canvas = document.getElementById("game-window");

const gridSize = 20;
const boardSize = 400;
const cellSize = boardSize / gridSize;
const snakeRadius = cellSize / 2;

canvas.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
canvas.setAttribute("width", boardSize);
canvas.setAttribute("height", boardSize);

let canvasWidth = boardSize;
let canvasHeight = boardSize;
let rainbowMode = false;
if(getRandomNumber(1, 100) == 2) {
    rainbowMode = true;
}
SpawnSnakeHead();
MoveFood();

function draw() {
    MoveSnakeBody();
    let headX = parseFloat(snakeHead.getAttribute("cx"));
    let headY = parseFloat(snakeHead.getAttribute("cy"));

    if (direction === "right") {
        headX += cellSize;
    } 
    else if (direction === "left") {
        headX -= cellSize;
    } 
    else if (direction === "down") {
        headY += cellSize;
    } 
    else if (direction === "up") {
        headY -= cellSize;
    }

    snakeHead.setAttribute("cx", headX);
    snakeHead.setAttribute("cy", headY);

    if (checkForWallCollision(headX, headY)) {
        resetGame("Hit the wall! Game over!");
        return;
    }
    if(checkForSelfCollision()){
        resetGame("Collided with self! Game over!");
        return;
    }
    if (checkForFoodCollision()) {
        MoveFood();
        GrowSnake();
    }
    
}

function changeDirection(event) {
    if (event.key === "d" && direction !== "left") {
        direction = "right";
    }
    else if (event.key === "a" && direction !== "right") {
        direction = "left";
    }
    else if (event.key === "s" && direction !== "up") {
        direction = "down";
    }
    else if (event.key === "w" && direction !== "down") {
        direction = "up";
    }
}

function checkForFoodCollision() {
    let headX = parseFloat(snakeHead.getAttribute("cx"));
    let headY = parseFloat(snakeHead.getAttribute("cy"));
    let foodX = parseFloat(food.getAttribute("cx"));
    let foodY = parseFloat(food.getAttribute("cy"));
    for(let segment of snakeBody){
        let segX = parseFloat(segment.getAttribute("cx"));
        let segY = parseFloat(segment.getAttribute("cy"));
        if(foodX === segX && foodY === segY){
            return true;
        }
    }
    return headX === foodX && headY === foodY;
}

function checkForWallCollision(x, y) {
    return (
        x < snakeRadius ||
        x > canvasWidth - snakeRadius ||
        y < snakeRadius ||
        y > canvasHeight - snakeRadius
    );
}

function checkForSelfCollision() {
    let headX = parseFloat(snakeHead.getAttribute("cx"));
    let headY = parseFloat(snakeHead.getAttribute("cy"));
    for (let segment of snakeBody) {
        let segX = parseFloat(segment.getAttribute("cx"));
        let segY = parseFloat(segment.getAttribute("cy"));
        if (headX === segX && headY === segY) {
            return true;
        }
    }
    return false;
}
function MoveFood() {
    let foodX = Math.floor(Math.random() * gridSize) * cellSize + snakeRadius;
    let foodY = Math.floor(Math.random() * gridSize) * cellSize + snakeRadius;

    food.setAttribute("cx", foodX);
    food.setAttribute("cy", foodY);
}

function SpawnSnakeHead() {
    let startX = Math.floor(gridSize / 2) * cellSize + snakeRadius;
    let startY = Math.floor(gridSize / 2) * cellSize + snakeRadius;

    snakeHead.setAttribute("cx", startX);
    snakeHead.setAttribute("cy", startY);
    snakeHead.setAttribute("r", snakeRadius);

    food.setAttribute("r", snakeRadius);
}
function GrowSnake(){
    let newSegment = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    newSegment.setAttribute("r", snakeRadius);
    newSegment.setAttribute("fill", snakeHead.getAttribute("fill"));
    newSegment.setAttribute("cx", 1000);
    newSegment.setAttribute("cy", 1000);
    canvas.appendChild(newSegment);
    snakeBody.push(newSegment);
}
function MoveSnakeBody() {
    if(snakeBody.length === 0) return;
    for (let i = snakeBody.length - 1; i > 0; i--) {
        let prevX = snakeBody[i - 1].getAttribute("cx");
        let prevY = snakeBody[i - 1].getAttribute("cy");
        snakeBody[i].setAttribute("cx", prevX);
        snakeBody[i].setAttribute("cy", prevY);
    }
    snakeBody[0].setAttribute("cx", snakeHead.getAttribute("cx"));
    snakeBody[0].setAttribute("cy", snakeHead.getAttribute("cy"));
}

function resetGame(reason) {
    direction = "none";
    for (let segment of snakeBody) {
        canvas.removeChild(segment);
    }
    snakeBody = [];
    SpawnSnakeHead();
    MoveFood();
    alert(reason || "Game over!");
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function changeColors(){
    food.setAttribute("fill", getRandomColor());
    snakeHead.setAttribute("fill", getRandomColor());
    for(let segment of snakeBody){
        segment.setAttribute("fill", getRandomColor());
    }
    requestAnimationFrame(changeColors);
}

document.addEventListener("keydown", changeDirection);
if(rainbowMode) {
    console.log("Rainbow mode activated! 🌈");
    changeColors();
}
setInterval(draw, 200);
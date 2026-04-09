let gameWindow = document.getElementById('game-window');
let ids = [];
let minAliveTime = 800;
let maxAliveTime = 2000;
let targetsHit = 0;
let targetsMissed = 0;
let score = 0;
function generateTarget() {
    let target = document.createElementNS("http://www.w3.org/2000/svg", "image");
    let id = RandomIntExcluding(1, 1000, ids);
    ids.push(id);
    target.setAttributeNS(null, "id", id);
    target.setAttributeNS(null, "href", "img/target-obj.png");
    targetWidth = RandomInt(gameWindow.clientWidth * 0.05, gameWindow.clientWidth * 0.15);
    target.setAttributeNS(null, "width", targetWidth);
    target.setAttributeNS(null, "height", targetWidth);
    target.setAttributeNS(null, "x", Math.random() * (gameWindow.clientWidth - parseInt(target.getAttribute("width"))));
    target.setAttributeNS(null, "y", Math.random() * (gameWindow.clientHeight - parseInt(target.getAttribute("height"))));
    gameWindow.appendChild(target);
    if(targetWidth <= gameWindow.clientWidth * 0.1) {
        timeAlive = RandomInt(minAliveTime, Average(minAliveTime, maxAliveTime));
    } else {
        timeAlive = RandomInt(Average(minAliveTime, maxAliveTime), maxAliveTime);
    }
    target.addEventListener('click', () => {
        removeTargetHit(id);
        targetsHit++;
        updateScore();
    });
    console.log(`Target ${id} will be alive for ${timeAlive}ms with width ${targetWidth}px`);
    setTimeout(() => removeTarget(id), timeAlive);
}
function RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function Average(min, max) {
    return (min + max) / 2;
}
function RandomIntExcluding(min, max, exclude) {
    let num;

    do {
        num = RandomInt(min, max);
    } while (exclude.includes(num));

    return num;
}
function removeTarget(id) {
    let target = document.getElementById(id);
    if (target) {
        gameWindow.removeChild(target);
        ids = ids.filter(existingId => existingId !== id);
        targetsMissed++;
        generateTarget();
        updateScore();
    }
}
function removeTargetHit(id){
    let target = document.getElementById(id);
    if (target) {
        gameWindow.removeChild(target);
        ids = ids.filter(existingId => existingId !== id);
    }
    updateScore();
    generateTarget();
}
function updateScore() {
    console.log(`${ids.length} targets currently on screen. ${targetsHit} hit, ${targetsMissed} missed.`);
    score = targetsHit / (targetsHit + targetsMissed) * 100;
    let scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = `Score: ${score.toFixed(2)}%`;
    scoreDisplay.setAttributeNS(null, "fill", `rgb(${Math.min(255, (100-score) * 2.55)}, ${Math.min(255, score * 2.55)}, 0)`);
    scoreDisplay.setAttributeNS(null, "width", CalculateTextWidth(scoreDisplay.textContent, "20px Orbitron") + 10);
}
function CalculateTextWidth(text, font) {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
}
function ChanceToSpawnNewTarget() {
    let chance = 0.3;
    if (Math.random() < chance) {
        generateTarget();
    }
}
generateTarget();
setTimeout(() => generateTarget(), 2000);
setInterval(ChanceToSpawnNewTarget, 10000);

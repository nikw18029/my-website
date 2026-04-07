let gameCards = document.querySelectorAll(".game-card");

gameCards.forEach(card => {
    let randomColor = getRandomColor();
    card.style.backgroundColor = randomColor;
    card.style.color = getOppositeColor(randomColor);
    card.childNodes.forEach(child => {
        if (child.classList && child.classList.contains("play-button")) {
            child.style.backgroundColor = getOppositeColor(randomColor);
            child.style.color = randomColor;
        }
        if(child.classList && child.classList.contains("game-description")){
            child.style.color = getOppositeColor(randomColor);
            child.style.textShadow = "2px 2px 4px " + randomColor;
        }
    });
});

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

function getOppositeColor(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const oppositeR = 255 - r;
    const oppositeG = 255 - g;
    const oppositeB = 255 - b;
    return `rgb(${oppositeR},${oppositeG},${oppositeB})`;
}
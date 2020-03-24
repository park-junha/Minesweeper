const gridWidth = 30;
const gridHeight = 16;
const tileSize = 20;
const maxMines = 99;

const totalTiles = gridWidth * gridHeight;

const tileBomb = -1;

const tileDefault = 0;
const tileFlagged = 1;
const tileUnsure = 2;
const tileClicked = 3;

let gridClicked = [];
let gameState = [];
let gameStarted = false;
let gameOver = false;

let timer = 0;
let minesLeft = maxMines;
let tilesToClick = totalTiles - maxMines;

window.onload = function () {
    canv = document.getElementById("gameController");
    rect = canv.getBoundingClientRect();
    ctx = canv.getContext("2d");
    canv.addEventListener("click", tileClick);
    canv.addEventListener("mousedown", tileMouseDown);
    canv.addEventListener("contextmenu", tileRightClick);
    setInterval(gameTimer, 1000);
    ctx.font = "20px Arial";

    resetGame();
}

function resetGame () {
    gridClicked = [];
    gameStarted = false;
    gameOver = false;
    timer = 0;
    minesLeft = maxMines;
    tilesToClick = totalTiles - maxMines;
    document.getElementById("gameTimer").innerHTML = timer;
    document.getElementById("gameMines").innerHTML = minesLeft;
    document.getElementById("gameEmote").innerHTML = ":-)";
    ctx.fillStyle="black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle="grey";
    for (var row = 0; row < gridHeight; row++) {
        gridClicked[row] = []
        for (var col = 0; col < gridWidth; col++) {
            gridClicked[row][col] = tileDefault;
            ctx.fillRect(col*tileSize+1, row*tileSize+1, tileSize-1, tileSize-1);
        }
    }
}

function startGame (initX, initY) {
    gameState = [];
    for (var row = 0; row < gridHeight; row++) {
        gameState[row] = []
        for (var col = 0; col < gridWidth; col++) {
            gameState[row][col] = 0;
        }
    }

    let minesToPlace = maxMines;
    while (minesToPlace > 0) {
        mineX = Math.floor(Math.random()*gridWidth);
        mineY = Math.floor(Math.random()*gridHeight);
        if (gameState[mineY][mineX] != tileBomb && (Math.abs(initX - mineX) > 1 || Math.abs(initY - mineY) > 1) ){
            gameState[mineY][mineX] = tileBomb;
            for (var j = Math.max(mineY-1, 0); j <= Math.min(mineY+1, gridHeight-1); j++) {
                for (var i = Math.max(mineX-1, 0); i <= Math.min(mineX+1, gridWidth-1); i++) {
                    if (gameState[j][i] != tileBomb){
                        gameState[j][i] += 1;
                    }
                }
            }
            minesToPlace -= 1;
        }
    }
}

function gameTimer () {
    if (gameStarted == true && gameOver == false) {
        timer++;
        document.getElementById("gameTimer").innerHTML = timer;
    }
}

function tileMouseDown (event) {
    if (event.which != 1 || gameOver == true) {
        return;
    }
    document.getElementById("gameEmote").innerHTML = ":-O";
}

function tileClick (event) {
    if (gameOver == true) {
        return;
    }

    let x = Math.floor((event.clientX - rect.left - 1) / tileSize);
    let y = Math.floor((event.clientY - rect.top - 1) / tileSize);

    if (gameStarted == false){
        gameStarted = true;
        startGame(x, y);
    }

    document.getElementById("gameEmote").innerHTML = ":-)";
    checkTile(x, y);
}

function tileRightClick (event) {
    event.preventDefault();

    if (gameOver == true || gameStarted == false) {
        return;
    }

    let x = Math.floor((event.clientX - rect.left - 1) / tileSize);
    let y = Math.floor((event.clientY - rect.top - 1) / tileSize);

    markTile(x, y);
}

function checkSurroundingTiles (x, y) {
    for (var j = Math.max(y-1, 0); j <= Math.min(y+1, gridHeight-1); j++) {
        for (var i = Math.max(x-1, 0); i <= Math.min(x+1, gridWidth-1); i++) {
            if (gridClicked[j][i] != tileClicked) {
                checkTile(i, j);
            }
        }
    }
}

function markTile (x, y) {
    if (gridClicked[y][x] == tileClicked) {
        return;
    }

    gridClicked[y][x] = (gridClicked[y][x] + 1) % 3;

    ctx.fillStyle="black";
    ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize, tileSize);
    ctx.fillStyle="grey";
    ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize-1, tileSize-1);

    switch (gridClicked[y][x]) {
        case tileDefault:
            break;
        case tileFlagged:
            ctx.fillStyle="red";
            ctx.fillText("O", x*tileSize+3, (y+1)*tileSize-2);
            minesLeft -= 1;
            document.getElementById("gameMines").innerHTML = minesLeft;
            break;
        case tileUnsure:
            ctx.fillStyle="black";
            ctx.fillText("?", x*tileSize+5, (y+1)*tileSize-2);
            minesLeft += 1;
            document.getElementById("gameMines").innerHTML = minesLeft;
            break;
    }
}

function checkTile (x, y) {
    if (gridClicked[y][x] == tileFlagged) {
        return;
    }

    if (gridClicked[y][x] != tileClicked) {
        gridClicked[y][x] = tileClicked;
        tilesToClick -= 1;
    }

    ctx.fillStyle="grey";
    ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize, tileSize);
    ctx.fillStyle="silver";
    ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize-1, tileSize-1);

    if (gameState[y][x] == 0) {
        checkSurroundingTiles(x, y);
    }
    else if (gameState[y][x] < 0) {
        endGame(x, y);
    }
    else {
        switch (gameState[y][x]) {
            case 1:
                ctx.fillStyle="blue";
                break;
            case 2:
                ctx.fillStyle="green";
                break;
            case 3:
                ctx.fillStyle="red";
                break;
            case 4:
                ctx.fillStyle="navy";
                break;
            case 5:
                ctx.fillStyle="brown";
                break;
            case 6:
                ctx.fillStyle="cyan";
                break;
            case 7:
                ctx.fillStyle="black";
                break;
            default:
                ctx.fillStyle="grey";
        }
        ctx.fillText(gameState[y][x], x*tileSize+5, (y+1)*tileSize-2);
    }

    if (tilesToClick <= 0) {
        winGame();
    }
}

function endGame(x, y) {
    gameOver = true;
    document.getElementById("gameEmote").innerHTML = "X-(";

    ctx.fillStyle="brown";
    ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize, tileSize);
    ctx.fillStyle="red";
    ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize-1, tileSize-1);
    
    ctx.fillStyle="black";
    ctx.fillText("*", x*tileSize+7, (y+1)*tileSize+2);

    for (var j = 0; j < gameState.length; j++) {
        for (var i = 0; i < gameState[j].length; i++) {
            if (gameState[j][i] != tileBomb && (gridClicked[j][i] == tileFlagged || gridClicked[j][i] == tileUnsure) ) {
                ctx.fillText("X", i*tileSize+4, (j+1)*tileSize-2);
            }
            if (gameState[j][i] == tileBomb && gridClicked[j][i] == tileDefault && (x != i || y != j) ) {
                ctx.fillStyle="grey";
                ctx.fillRect(i*tileSize+1, j*tileSize+1, tileSize-1, tileSize-1);
                ctx.fillStyle="black";
                ctx.fillText("*", i*tileSize+7, (j+1)*tileSize+2);
            }
        }
    }
}

function winGame() {
    gameOver = true;
    document.getElementById("gameEmote").innerHTML = "B-)";
}

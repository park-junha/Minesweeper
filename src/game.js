const defaultSetting = 'beginner';
const defaultSize = 'medium';
const gameSettings = {
  'beginner': {
    'gridWidth': 9,
    'gridHeight': 9,
    'maxMines': 10,
  },
  'intermediate': {
    'gridWidth': 16,
    'gridHeight': 16,
    'maxMines': 40,
  },
  'advanced': {
    'gridWidth': 30,
    'gridHeight': 16,
    'maxMines': 99,
  }
};
const textOffsetSettings = {
  'small': {
    'tileSize': 24,
    'hOffset': 6,
    'vOffset': -3,
    'hOffsetMine': 8,
    'vOffsetMine': 3,
    'hOffsetFlag': 3,
    'vOffsetFlag': -3,
    'hOffsetX': 5,
    'vOffsetX': -3
  },
  'medium': {
    'tileSize': 36,
    'hOffset': 8,
    'vOffset': -4,
    'hOffsetMine': 11,
    'vOffsetMine': 3,
    'hOffsetFlag': 4,
    'vOffsetFlag': -4,
    'hOffsetX': 6,
    'vOffsetX': -4
  }
};

var gridWidth;
var gridHeight;
var maxMines;
var maxGameMines;
var totalTiles;
var minesLeft;
var tilesToClick;
var tileSize;
var textOffsets;

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

let selectedTextSize = defaultSize;

window.onload = function () {
  canv = document.getElementById("gameController");
  canv.addEventListener("click", tileClick);
  canv.addEventListener("mousedown", tileMouseDown);
  canv.addEventListener("contextmenu", tileRightClick);
  canv.addEventListener("dblclick", tileDblClick);

  setInterval(gameTimer, 1000);

  setDifficulty();
}

function setTextOffsets (size) {
  if (!textOffsetSettings.hasOwnProperty(size) ) {
    size = defaultSize;
  }

  selectedTextSize = size;

  tileSize = textOffsetSettings[size].tileSize;
  textOffsets = textOffsetSettings[size];

  canv.width = gridWidth * tileSize + 1;
  canv.height = gridHeight * tileSize + 1;

  document.getElementById("gameBar").style.width = (canv.width - 2) + "px";

  rect = canv.getBoundingClientRect();
  ctx = canv.getContext("2d");
  ctx.font = tileSize + "px Arial";

  resetGame();
}

function setDifficulty (difficulty) {
  if (!gameSettings.hasOwnProperty(difficulty) ) {
    difficulty = defaultSetting;
  }

  gridWidth = gameSettings[difficulty].gridWidth;
  gridHeight = gameSettings[difficulty].gridHeight;
  maxMines = gameSettings[difficulty].maxMines;
  totalTiles = gridWidth * gridHeight;

  setTextOffsets(selectedTextSize);
}

function resetGame () {
  gridClicked = [];
  gameStarted = false;
  gameOver = false;
  timer = 0;
  minesLeft = maxMines;
  maxGameMines = maxMines;
  tilesToClick = totalTiles - maxMines;
  document.getElementById("gameTimer").style.color = "black";
  document.getElementById("gameTimer").innerHTML = timer;
  document.getElementById("gameEmote").innerHTML = ":-)";
  document.getElementById("gameMines").innerHTML = minesLeft + " / " + maxGameMines;
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
  document.getElementById("gameTimer").style.color = "brown";
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

  let x = Math.floor((event.pageX - rect.left - 1) / tileSize);
  let y = Math.floor((event.pageY - rect.top - 1) / tileSize);

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

  let x = Math.floor((event.pageX - rect.left - 1) / tileSize);
  let y = Math.floor((event.pageY - rect.top - 1) / tileSize);

  markTile(x, y);
}

function tileDblClick (event) {
  if (gameOver == true || gameStarted == false) {
    return;
  }

  let x = Math.floor((event.pageX - rect.left - 1) / tileSize);
  let y = Math.floor((event.pageY - rect.top - 1) / tileSize);

  document.getElementById("gameEmote").innerHTML = ":-)";

  if (gridClicked[y][x] != tileClicked) {
    return;
  }

  if (countSurroundingTiles(x, y) != gameState[y][x]) {
    return;
  }

  checkSurroundingTiles(x, y);
}

function countSurroundingTiles (x, y) {
  count = 0;
  for (var j = Math.max(y-1, 0); j <= Math.min(y+1, gridHeight-1); j++) {
    for (var i = Math.max(x-1, 0); i <= Math.min(x+1, gridWidth-1); i++) {
      switch (gridClicked[j][i]) {
        case tileFlagged:
          count++;
          break;
      }
    }
  }
  return count;
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
      ctx.fillText("O", x*tileSize+textOffsets.hOffsetFlag, (y+1)*tileSize+textOffsets.vOffsetFlag);
      minesLeft -= 1;
      document.getElementById("gameMines").innerHTML = minesLeft + " / " + maxGameMines;
      break;
    case tileUnsure:
      ctx.fillStyle="black";
      ctx.fillText("?", x*tileSize+textOffsets.hOffset, (y+1)*tileSize+textOffsets.vOffset);
      minesLeft += 1;
      document.getElementById("gameMines").innerHTML = minesLeft + " / " + maxGameMines;
      break;
  }
}

function fillTile (x, y, outerColor, innerColor) {
  ctx.fillStyle = outerColor;
  ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize, tileSize);
  ctx.fillStyle = innerColor;
  ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize-1, tileSize-1);
}

function checkTile (x, y) {
  if (gridClicked[y][x] == tileFlagged || gridClicked[y][x] == tileClicked) {
    return;
  }

  if (gridClicked[y][x] != tileClicked) {
    gridClicked[y][x] = tileClicked;
    tilesToClick -= 1;
  }

  tileOuter="grey";
  tileInner="silver";

  if (gameState[y][x] == 0) {
    fillTile(x, y, tileOuter, tileInner);
    checkSurroundingTiles(x, y);
  }
  else if (gameState[y][x] < 0) {
    endGame(x, y);
    return;
  }
  else {
    switch (gameState[y][x]) {
      case 1:
        textColor="blue";
        break;
      case 2:
        textColor="green";
        break;
      case 3:
        textColor="red";
        break;
      case 4:
        textColor="navy";
        break;
      case 5:
        textColor="brown";
        break;
      case 6:
        textColor="cyan";
        break;
      case 7:
        tileInner="black";
        textColor="white";
        break;
      case 8:
        tileInner="white";
        textColor="lightgray";
        break;
      default:
        textColor="grey";
    }
    fillTile(x, y, tileOuter, tileInner);
    ctx.fillStyle = textColor;
    ctx.fillText(gameState[y][x], x*tileSize+textOffsets.hOffset, (y+1)*tileSize+textOffsets.vOffset);
  }

  if (tilesToClick <= 0) {
    winGame();
  }
}

function endGame(x, y) {
  gameOver = true;
  document.getElementById("gameTimer").style.color = "black";
  document.getElementById("gameEmote").innerHTML = "X-(";

  ctx.fillStyle="brown";
  ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize, tileSize);
  ctx.fillStyle="red";
  ctx.fillRect(x*tileSize+1, y*tileSize+1, tileSize-1, tileSize-1);
  
  ctx.fillStyle="black";
  ctx.fillText("*", x*tileSize+textOffsets.hOffsetMine, (y+1)*tileSize+textOffsets.vOffsetMine);

  for (var j = 0; j < gameState.length; j++) {
    for (var i = 0; i < gameState[j].length; i++) {
      if (gameState[j][i] != tileBomb && (gridClicked[j][i] == tileFlagged || gridClicked[j][i] == tileUnsure) ) {
        ctx.fillStyle="black";
        ctx.fillText("X", i*tileSize+textOffsets.hOffsetX, (j+1)*tileSize+textOffsets.vOffsetX);
      }
      if (gameState[j][i] == tileBomb && gridClicked[j][i] == tileDefault && (x != i || y != j) ) {
        ctx.fillStyle="grey";
        ctx.fillRect(i*tileSize+1, j*tileSize+1, tileSize-1, tileSize-1);
        ctx.fillStyle="black";
        ctx.fillText("*", i*tileSize+textOffsets.hOffsetMine, (j+1)*tileSize+textOffsets.vOffsetMine);
      }
    }
  }
}

function winGame() {
  gameOver = true;
  document.getElementById("gameTimer").style.color = "black";
  document.getElementById("gameEmote").innerHTML = "B-)";
  document.getElementById("gameMines").innerHTML = "0 / " + maxGameMines;
  for (var j = 0; j < gameState.length; j++) {
    for (var i = 0; i < gameState[j].length; i++) {
      if (gridClicked[j][i] != tileClicked) {
        ctx.fillStyle="grey";
        ctx.fillRect(i*tileSize+1, j*tileSize+1, tileSize, tileSize);
        ctx.fillStyle="aliceblue";
        ctx.fillRect(i*tileSize+1, j*tileSize+1, tileSize-1, tileSize-1);
        ctx.fillStyle="powderblue";
        ctx.fillText("*", i*tileSize+textOffsets.hOffsetMine, (j+1)*tileSize+textOffsets.vOffsetMine);
      }
    }
  }
}

//  -----------------
//  Custom Game Modal
//  -----------------

function openModal () {
  document.getElementById("customGameModal").style.display = "block";
  document.getElementById("modal-msg").innerHTML = "";
} 

function closeModal () {
  document.getElementById("customGameModal").style.display = "none";
} 

function applyCustomGame () {
  try {
    const customGridWidth = document.getElementById("customGameWidth").value;
    const customGridHeight = document.getElementById("customGameHeight").value;
    const customMaxMines = document.getElementById("customGameMines").value;

    var hasNonDigits = /[^0-9]/;

    if (hasNonDigits.test(customGridWidth)) {
      document.getElementById("modal-msg").innerHTML = "Please enter a valid width.";
      return;
    }
    if (hasNonDigits.test(customGridHeight)) {
      document.getElementById("modal-msg").innerHTML = "Please enter a valid height.";
      return;
    }
    if (hasNonDigits.test(customMaxMines)) {
      document.getElementById("modal-msg").innerHTML = "Please enter a valid number of mines.";
      return;
    }

    if (customGridWidth < 6) {
      document.getElementById("modal-msg").innerHTML = "Please enter a larger width.";
      return;
    }
    if (customGridHeight < 6) {
      document.getElementById("modal-msg").innerHTML = "Please enter a larger height.";
      return;
    }
    if (customGridWidth > 64) {
      document.getElementById("modal-msg").innerHTML = "Please enter a smaller width.";
      return;
    }
    if (customGridHeight > 64) {
      document.getElementById("modal-msg").innerHTML = "Please enter a smaller width.";
      return;
    }

    if (customMaxMines > customGridWidth * customGridHeight - 9) {
      document.getElementById("modal-msg").innerHTML = "Too many mines!";
      return;
    }
    if (customMaxMines < 1) {
      document.getElementById("modal-msg").innerHTML = "Too few mines!";
      return;
    }

    gridWidth = customGridWidth;
    gridHeight = customGridHeight;
    maxMines = customMaxMines;
    totalTiles = gridWidth * gridHeight;

    setTextOffsets(selectedTextSize);

    closeModal();
  } catch (err) {
    document.getElementById("modal-msg").innerHTML = "An unexpected error occurred.";
    console.log(err);
  }
}

window.onclick = function(event) {
  if (event.target == document.getElementById("customGameModal")) {
    closeModal();
  } 
}

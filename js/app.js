var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var GAMER_GLUED_IMG = '<img src="img/gamer-purple.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.png" />';
var COLLECT_AUDIO = new Audio('sound/collect.wav');

var gBoard;
var gGamerPos;
var gNumBallsPlaced;
var gBallCount;
var gBallInterval;
var gGlueInterval;
var gGlueTimout;
var gIsGameOver = false;
var gIsPlayerGlued = false;
var gElBallCount = document.querySelector('.ball-count');
var gElGameOver = document.querySelector('.game-over');

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gNumBallsPlaced = 0;
	gBallCount = 0;
	gElBallCount.innerText = `You collected ${gBallCount} balls`;
	gBoard = buildBoard();
	gElGameOver.style.display = 'none';
	gIsGameOver = false;
	gIsPlayerGlued = false;
	renderBoard(gBoard);
	gBallInterval = setInterval(placeBall, 2000);
	gGlueInterval = setInterval(placeGlue, 5000);
}

function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				if (i !== 5 && j !== 5) cell.type = WALL; // Passages
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;
	gNumBallsPlaced += 2;

	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})" >\n`;

			// TODO - change to short if statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGameOver) return;
	if (gIsPlayerGlued) return;

	// Handle travel through passages
	var isPassage = false;
	if (i === -1 && j === 5) {
		i = gBoard.length - 1;
		isPassage = true;
	} else if (i === gBoard.length && j === 5) {
		i = 0;
		isPassage = true;
	} else if (i === 5 && j === gBoard[0].length) {
		j = 0;
		isPassage = true;
	} else if (i === 5 && j === -1) {
		j = gBoard[0].length - 1;
		isPassage = true;
	}

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (isPassage === true)) {

		if (targetCell.gameElement === BALL) {
			gBallCount++;
			gElBallCount.innerText = `You collected ${gBallCount} balls`;
			COLLECT_AUDIO.play();
			gBoard[i][j].gameElement = null;
			if (gBallCount === gNumBallsPlaced) { // If all balls were collected - GAME OVER
				gIsGameOver = true;
				clearInterval(gBallInterval);
				clearInterval(gGlueInterval);
				gElGameOver.style.display = 'block';
			}
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		if (gBoard[i][j].gameElement === GLUE) {
			gIsPlayerGlued = true;
		}

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

		if (!gIsPlayerGlued) {
			// Dom:
			renderCell(gGamerPos, GAMER_IMG);
		} else {
			// Handle gamer getting stuck in glue
			gIsPlayerGlued = true;
			// Dom:
			renderCell(gGamerPos, GAMER_GLUED_IMG);
			if (gGlueTimout) clearTimeout(gGlueTimout);
			setTimeout(function () {
				gIsPlayerGlued = false;
				// Dom:
				renderCell(gGamerPos, GAMER_IMG);
			}, 3000);
		}

	}
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = `.${getClassName(location)}`;
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
	case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = `cell-${location.i}-${location.j}`;
	return cellClass;
}

// Places a game element (ball or glue) at a random position
function placeGameElement(element, elementImg) {
	var emptyPoses = [];
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			if (gBoard[i][j].type === FLOOR && !gBoard[i][j].gameElement) {
				emptyPoses.push({ i: i, j: j });
			}
		}
	}
	if (!emptyPoses.length) return;
	var randIdx = getRandomInt(0, emptyPoses.length);
	var posI = emptyPoses[randIdx].i;
	var posJ = emptyPoses[randIdx].j;
	gBoard[posI][posJ].gameElement = element;
	renderCell({ i: posI, j: posJ }, elementImg);
	return { i: posI, j: posJ };
}

// Place ball (using placeGameElement) and setup timout to remove it
function placeBall() {
	placeGameElement(BALL, BALL_IMG);
	gNumBallsPlaced++;
}

// Place glue (using placeGameElement) and setup timout to remove it
function placeGlue() {
	var gluePos = placeGameElement(GLUE, GLUE_IMG);
	if (!gluePos) return;
	gGlueTimout = setTimeout(function () {
		if (gBoard[gluePos.i][gluePos.j].gameElement === GLUE) {
			gBoard[gluePos.i][gluePos.j].gameElement = '';
			renderCell(gluePos, '');
		}
	}, 3000)
}
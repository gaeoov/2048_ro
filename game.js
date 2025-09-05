const boardSize = 5;
let board = [];
let score = 0;

const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');

function initializeGame() {
    board = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
    score = 0;
    updateScore();
    addRandomTile();
    addRandomTile();
    drawBoard();
}

function drawBoard() {
    gameBoard.innerHTML = '';
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const tileValue = board[r][c];
            const tile = document.createElement('div');
            tile.classList.add('tile');
            if (tileValue > 0) {
                tile.textContent = tileValue;
                tile.classList.add(`tile-${tileValue}`);
            }
            gameBoard.appendChild(tile);
        }
    }
}

function addRandomTile() {
    let emptyTiles = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === 0) {
                emptyTiles.push({ r, c });
            }
        }
    }

    if (emptyTiles.length > 0) {
        const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        if (window.nextSpawnForceFour && window.nextSpawnForceFour > 0) {
            board[r][c] = 4;
            window.nextSpawnForceFour--;
            console.log(`Forced 4 spawn. Remaining: ${window.nextSpawnForceFour}`);
        } else {
            let spawnValue = 2;
            let spawnChanceFour = 0.1; // Default 10% chance of 4

            // Apply passive biases
            if (window.fourSpawnBias) {
                spawnChanceFour += window.fourSpawnBias;
            }
            if (window.twoSpawnBias) {
                spawnChanceFour -= window.twoSpawnBias;
            }
            spawnChanceFour = Math.max(0, Math.min(1, spawnChanceFour)); // Clamp between 0 and 1

            if (Math.random() < spawnChanceFour) {
                spawnValue = 4;
            }
            board[r][c] = spawnValue;
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    let zeros = Array(boardSize - arr.length).fill(0);
    return zeros.concat(arr);
}

function combine(row) {
    for (let i = boardSize - 1; i > 0; i--) {
        if (row[i] === row[i - 1]) {
            row[i] *= 2;
            score += row[i] * (window.scoreMultiplier || 1);
            row[i - 1] = 0;

            // Simplified Adjacent Merge Bonus
            if (window.adjacentMergeBonusActive) {
                console.log("인접 병합 보너스 활성: 완전한 구현은 복잡합니다.");
            }
        }
    }
    return row;
}

function operate(row) {
    row = slide(row);
    row = combine(row);
    row = slide(row);
    return row;
}

function move(direction) {
    let originalBoard = JSON.parse(JSON.stringify(board)); // Deep copy
    let moved = false;

    if (direction === 'up') {
        for (let c = 0; c < boardSize; c++) {
            let col = [];
            for (let r = 0; r < boardSize; r++) col.push(board[r][c]);
            col.reverse(); // To slide up, treat as sliding right then reverse
            col = operate(col);
            col.reverse();
            for (let r = 0; r < boardSize; r++) board[r][c] = col[r];
        }
    } else if (direction === 'down') {
        for (let c = 0; c < boardSize; c++) {
            let col = [];
            for (let r = 0; r < boardSize; r++) col.push(board[r][c]);
            col = operate(col);
            for (let r = 0; r < boardSize; r++) board[r][c] = col[r];
        }
    } else if (direction === 'left') {
        for (let r = 0; r < boardSize; r++) {
            let row = board[r];
            row.reverse(); // To slide left, treat as sliding right then reverse
            row = operate(row);
            row.reverse();
            board[r] = row;
        }
    } else if (direction === 'right') {
        for (let r = 0; r < boardSize; r++) {
            let row = board[r];
            row = operate(row);
            board[r] = row;
        }
    }

    if (JSON.stringify(originalBoard) !== JSON.stringify(board)) {
        if (window.extraMoves && window.extraMoves > 0) {
            window.extraMoves--;
            console.log(`Extra move used. Remaining: ${window.extraMoves}`);
        } else {
            addRandomTile();
        }
        // Tile Value Decay Passive Effect
        if (window.tileDecayActive) {
            window.movesSinceLastDecay++;
            if (window.movesSinceLastDecay >= 5) { // Decay after 5 moves
                console.log("타일 값 감소 효과 발동!");
                for (let r = 0; r < boardSize; r++) {
                    for (let c = 0; c < boardSize; c++) {
                        if (board[r][c] === 2 || board[r][c] === 4) {
                            board[r][c] = 0;
                        }
                    }
                }
                window.movesSinceLastDecay = 0; // Reset counter
            }
        }
        // Score on Move Passive Effect
        if (window.scoreOnMoveActive) {
            score += 10;
            console.log("이동 시 점수 획득: +10점");
        }
        // Empty Tile Bonus Passive Effect
        if (window.emptyTileBonusActive) {
            let emptyTileCount = 0;
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === 0) {
                        emptyTileCount++;
                    }
                }
            }
            score += emptyTileCount * 5; // 5 points per empty tile
            console.log(`빈 타일 보너스: ${emptyTileCount}개 빈 타일, +${emptyTileCount * 5}점`);
        }
        drawBoard();
        updateScore();
        moved = true;
    }
    return moved;
}

function isGameOver() {
    // Check for empty tiles
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === 0) {
                return false; // There are empty tiles, so not game over
            }
        }
    }

    // Check for possible merges (horizontal and vertical)
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const currentValue = board[r][c];
            // Check right
            if (c < boardSize - 1 && currentValue === board[r][c + 1]) {
                return false; // Merge possible
            }
            // Check down
            if (r < boardSize - 1 && currentValue === board[r + 1][c]) {
                return false; // Merge possible
            }
        }
    }

    return true; // No empty tiles and no possible merges
}

document.addEventListener('keydown', (e) => {
    let moved = false;
    if (e.key === 'ArrowUp') {
        moved = move('up');
    } else if (e.key === 'ArrowDown') {
        moved = move('down');
    } else if (e.key === 'ArrowLeft') {
        moved = move('left');
    } else if (e.key === 'ArrowRight') {
        moved = move('right');
    }

    if (moved) {
        checkForMilestones();
        if (isGameOver()) {
            showGameOverScreen(); // New function to display game over
        }
    }
});

function showGameOverScreen() {
    const rewardModal = document.getElementById('reward-modal');
    const rewardOptionsContainer = document.getElementById('reward-options');
    rewardOptionsContainer.innerHTML = '';

    const gameOverDiv = document.createElement('div');
    gameOverDiv.innerHTML = `
        <h2>게임 오버!</h2>
        <p>점수: ${score}</p>
        <button id="retry-button">다시 시도</button>
    `;
    rewardOptionsContainer.appendChild(gameOverDiv);

    document.getElementById('retry-button').addEventListener('click', () => {
        rewardModal.style.display = 'none';
        initializeGame();
        // Reset any game state variables that persist across games (e.g., passive effects)
        // For now, we'll just re-initialize the board and score.
        // More robust reset for roguelike elements might be needed later.
        reachedBigMilestones = new Set();
        reachedSmallMilestones = new Set();
        activePassiveEffects = [];
        updateActivePassivesDisplay();
        window.extraMoves = 0;
        window.nextSpawnForceFour = 0;
        window.fourSpawnBias = 0;
        window.twoSpawnBias = 0;
        window.scoreMultiplier = 1;
        window.adjacentMergeBonusActive = false;
        window.tileDecayActive = false;
        window.movesSinceLastDecay = 0;
        window.scoreOnMoveActive = false;
    });

    rewardModal.style.display = 'block';
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

gameBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

gameBoard.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
}, false);

gameBoard.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
}, false);

function handleGesture() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let moved = false;

    if (absDx > absDy) { // Horizontal swipe
        if (dx > 0) {
            moved = move('right');
        } else {
            moved = move('left');
        }
    } else { // Vertical swipe
        if (dy > 0) {
            moved = move('down');
        } else {
            moved = move('up');
        }
    }

    if (moved) {
        checkForMilestones();
        if (isGameOver()) {
            showGameOverScreen();
        }
    }
}

initializeGame();
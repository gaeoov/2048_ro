// one_time_effects.js

const oneTimeEffects = {
    clearSmallTiles: {
        name: "작은 타일 제거",
        description: "2 또는 4 값을 가진 무작위 타일 2개를 제거합니다.",
        apply: function() {
            let smallTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === 2 || board[r][c] === 4) {
                        smallTiles.push({ r, c });
                    }
                }
            }
            if (smallTiles.length > 0) {
                for (let i = 0; i < Math.min(2, smallTiles.length); i++) {
                    const { r, c } = smallTiles.splice(Math.floor(Math.random() * smallTiles.length), 1)[0];
                    board[r][c] = 0;
                }
                drawBoard();
                console.log("Applied: 작은 타일 제거");
            }
        }
    },
    clearMediumTile: {
        name: "중간 타일 제거",
        description: "16 이하의 값을 가진 무작위 타일 1개를 제거합니다.",
        apply: function() {
            let mediumTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] > 0 && board[r][c] <= 16) {
                        mediumTiles.push({ r, c });
                    }
                }
            }
            if (mediumTiles.length > 0) {
                const { r, c } = mediumTiles[Math.floor(Math.random() * mediumTiles.length)];
                board[r][c] = 0;
                drawBoard();
                console.log("Applied: 중간 타일 제거");
            }
        }
    },
    clearAnyTile: {
        name: "임의 타일 제거",
        description: "모든 값을 가진 무작위 타일 1개를 제거합니다.",
        apply: function() {
            let filledTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] !== 0) {
                        filledTiles.push({ r, c });
                    }
                }
            }
            if (filledTiles.length > 0) {
                const { r, c } = filledTiles[Math.floor(Math.random() * filledTiles.length)];
                board[r][c] = 0;
                drawBoard();
                console.log("Applied: 임의 타일 제거");
            }
        }
    },
    spawnFour: {
        name: "4 생성",
        description: "무작위 빈 공간에 4 타일을 생성합니다.",
        apply: function() {
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
                board[r][c] = 4;
                drawBoard();
                console.log("Applied: 4 생성");
            }
        }
    },
    spawnEight: {
        name: "8 생성",
        description: "무작위 빈 공간에 8 타일을 생성합니다.",
        apply: function() {
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
                board[r][c] = 8;
                drawBoard();
                console.log("Applied: 8 생성");
            }
        }
    },
    spawnSixteen: {
        name: "16 생성",
        description: "무작위 빈 공간에 16 타일을 생성합니다.",
        apply: function() {
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
                board[r][c] = 16;
                drawBoard();
                console.log("Applied: 16 생성");
            }
        }
    },
    nextThreeSpawnsFour: {
        name: "다음 3회 4 생성",
        description: "다음 3번의 타일 생성 시, 항상 4 타일만 생성됩니다.",
        apply: function() {
            window.nextSpawnForceFour = 3;
            console.log("Applied: 다음 3회 4 생성");
        }
    },
    swapTwoTiles: {
        name: "두 타일 위치 교환",
        description: "무작위로 선택된 두 타일의 위치를 교환합니다.",
        apply: function() {
            let filledTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] !== 0) {
                        filledTiles.push({ r, c });
                    }
                }
            }
            if (filledTiles.length >= 2) {
                const idx1 = Math.floor(Math.random() * filledTiles.length);
                let { r: r1, c: c1 } = filledTiles[idx1];
                filledTiles.splice(idx1, 1);

                const idx2 = Math.floor(Math.random() * filledTiles.length);
                let { r: r2, c: c2 } = filledTiles[idx2];

                let temp = board[r1][c1];
                board[r1][c1] = board[r2][c2];
                board[r2][c2] = temp;
                drawBoard();
                console.log("Applied: 두 타일 위치 교환");
            }
        }
    },
    upgradeRandomTile: {
        name: "무작위 타일 업그레이드",
        description: "무작위 타일 하나를 다음 단계의 값으로 업그레이드합니다.",
        apply: function() {
            let filledTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] !== 0) {
                        filledTiles.push({ r, c });
                    }
                }
            }
            if (filledTiles.length > 0) {
                const { r, c } = filledTiles[Math.floor(Math.random() * filledTiles.length)];
                board[r][c] *= 2;
                drawBoard();
                console.log("Applied: 무작위 타일 업그레이드");
            }
        }
    },
    downgradeRandomTile: {
        name: "무작위 타일 다운그레이드",
        description: "무작위 타일 하나를 이전 단계의 값으로 다운그레이드합니다 (최소 2).",
        apply: function() {
            let filledTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] > 2) { // Only downgrade tiles > 2
                        filledTiles.push({ r, c });
                    }
                }
            }
            if (filledTiles.length > 0) {
                const { r, c } = filledTiles[Math.floor(Math.random() * filledTiles.length)];
                board[r][c] /= 2;
                drawBoard();
                console.log("Applied: 무작위 타일 다운그레이드");
            }
        }
    },
    extraMove: {
        name: "추가 이동",
        description: "새로운 타일 생성 없이 한 번 더 이동할 수 있습니다.",
        apply: function() {
            window.extraMoves = (window.extraMoves || 0) + 1;
            console.log("Applied: 추가 이동");
        }
    },
    shuffleBoard: {
        name: "보드 섞기",
        description: "보드 위의 모든 타일을 무작위로 섞습니다.",
        apply: function() {
            let allTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    allTiles.push(board[r][c]);
                }
            }
            // Fisher-Yates shuffle
            for (let i = allTiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
            }
            let k = 0;
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    board[r][c] = allTiles[k++];
                }
            }
            drawBoard();
            console.log("Applied: 보드 섞기");
        }
    },
    removeLowestValueTile: {
        name: "최소값 타일 제거",
        description: "현재 보드에서 가장 낮은 값을 가진 모든 타일을 제거합니다.",
        apply: function() {
            let minVal = Infinity;
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] !== 0 && board[r][c] < minVal) {
                        minVal = board[r][c];
                    }
                }
            }
            if (minVal !== Infinity) {
                for (let r = 0; r < boardSize; r++) {
                    for (let c = 0; c < boardSize; c++) {
                        if (board[r][c] === minVal) {
                            board[r][c] = 0;
                        }
                    }
                }
                drawBoard();
                console.log("Applied: 최소값 타일 제거");
            }
        }
    },
    duplicateRandomTile: {
        name: "무작위 타일 복제",
        description: "무작위 타일 하나를 인접한 빈 공간에 복제합니다.",
        apply: function() {
            let filledTiles = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] !== 0) {
                        filledTiles.push({ r, c });
                    }
                }
            }
            if (filledTiles.length > 0) {
                const { r, c } = filledTiles[Math.floor(Math.random() * filledTiles.length)];
                const valueToDuplicate = board[r][c];
                
                let emptyAdjacent = [];
                const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[nr][nc] === 0) {
                        emptyAdjacent.push({ r: nr, c: nc });
                    }
                }

                if (emptyAdjacent.length > 0) {
                    const { r: er, c: ec } = emptyAdjacent[Math.floor(Math.random() * emptyAdjacent.length)];
                    board[er][ec] = valueToDuplicate;
                    drawBoard();
                    console.log("Applied: 무작위 타일 복제");
                }
            }
        }
    },
    scoreBoost: {
        name: "점수 부스트",
        description: "즉시 500점을 획득합니다.",
        apply: function() {
            score += 500;
            updateScore();
            console.log("Applied: 점수 부스트");
        }
    }
};
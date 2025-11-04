function flipPieces(x, y, color) {
    let opponent = (color === "b") ? "w" : "b"; // 相手の色
    let directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },  // 左・右
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },  // 上・下
        { dx: -1, dy: -1 }, { dx: 1, dy: 1 }, // 左上・右下
        { dx: -1, dy: 1 }, { dx: 1, dy: -1 }  // 左下・右上
    ];

    for (let { dx, dy } of directions) {
        let flipList = [];
        let nx = x + dx;
        let ny = y + dy;

        // 相手の駒がある場合のみ探索開始
        while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[ny][nx] === opponent) {
            flipList.push({ nx, ny });
            nx += dx;
            ny += dy;
        }

        // 挟めるか確認（相手の駒の先に自分の駒がある場合）
        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[ny][nx] === color) {
            // 挟んだ駒をすべて自分の色に変更
            for (let { nx, ny } of flipList) {
                board[ny][nx] = color;
            }
        }
    }
}

function placePiece(x, y, color) {
    if (isValidMove(x, y, color)) {
        board[y][x] = color; // 盤面データを更新
        flipPieces(x, y, color);
        updateBoard(); // 画面の更新
        updateScore();
        return true;
    }
    return false;
}

function isValidMove(x, y, color) {
    const size = 8;

    if (x < 0 || y < 0 || x >= size || y >= size) return false;
    if (board[y][x] !== "g") return false;

    const opponent = (color === "b") ? "w" : "b";
    const directions = [
        [-1, -1], [0, -1], [1, -1], // 左上・上・右上
        [-1, 0], [1, 0], // 左・右
        [-1, 1], [0, 1], [1, 1]  // 左下・下・右下
    ];

    for (let [dx, dy] of directions) {
        let nx = x + dx;
        let ny = y + dy;
        let foundOpponent = false;

        while (nx >= 0 && ny >= 0 && nx < size && ny < size) {

            if (board[ny][nx] === opponent) {
                foundOpponent = true;
            } else if (board[ny][nx] === color && foundOpponent) {
                return true;
            } else {
                break;
            }

            nx += dx;
            ny += dy;
        }
    }

    return false;
}

function isInBoard(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function getOpponent(color) {
    return color === "b" ? "w" : "b";
}

// 位置ごとの重みマップ（8x8）
const WEIGHT_MAP = [
  [100, -50, 10, 5, 5, 10, -50, 100],
  [-50, -80, 1, 1, 1, 1, -80, -50],
  [10, 1, 5, 2, 2, 5, 1, 10],
  [5, 1, 2, 0, 0, 2, 1, 5],
  [5, 1, 2, 0, 0, 2, 1, 5],
  [10, 1, 5, 2, 2, 5, 1, 10],
  [-50, -80, 1, 1, 1, 1, -80, -50],
  [100, -50, 10, 5, 5, 10, -50, 100],
];

// ================================
// 🧠 高度戦術対応 CPU (ver.強化Hard)
// ================================

// 位置ごとの基本重みマップ（8x8）
const BASE_WEIGHT_MAP = [
    [100, -50, 10, 5, 5, 10, -50, 100],
    [-50, -80, 1, 1, 1, 1, -80, -50],
    [10, 1, 5, 2, 2, 5, 1, 10],
    [5, 1, 2, 0, 0, 2, 1, 5],
    [5, 1, 2, 0, 0, 2, 1, 5],
    [10, 1, 5, 2, 2, 5, 1, 10],
    [-50, -80, 1, 1, 1, 1, -80, -50],
    [100, -50, 10, 5, 5, 10, -50, 100],
];

// ターン数に応じて重みを動的に変化
function getDynamicWeightMap(turnCount) {
    if (turnCount < 20) {
        // 序盤：潜伏重視（角優先、中央は危険）
        return [
            [120, -40, 10, 5, 5, 10, -40, 120],
            [-40, -80, 0, 0, 0, 0, -80, -40],
            [10, 0, 2, 2, 2, 2, 0, 10],
            [5, 0, 2, 0, 0, 2, 0, 5],
            [5, 0, 2, 0, 0, 2, 0, 5],
            [10, 0, 2, 2, 2, 2, 0, 10],
            [-40, -80, 0, 0, 0, 0, -80, -40],
            [120, -40, 10, 5, 5, 10, -40, 120],
        ];
    } else if (turnCount < 50) {
        // 中盤：通常
        return BASE_WEIGHT_MAP;
    } else {
        // 終盤：石数重視（均一）
        return Array(8).fill().map(() => Array(8).fill(1));
    }
}

// X打ち・C打ちの危険マスチェック
function isDangerousMove(x, y) {
    const X_POS = [[1, 1], [1, 6], [6, 1], [6, 6]];
    const C_POS = [[0, 1], [1, 0], [0, 6], [1, 7], [6, 0], [7, 1], [6, 7], [7, 6]];
    return X_POS.some(([cx, cy]) => x === cx && y === cy) ||
        C_POS.some(([cx, cy]) => x === cx && y === cy);
}

// 確定石（端・角の安定石）の簡易カウント
function countStableStones(tempBoard, color) {
    let stable = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (tempBoard[y][x] === color) {
                if (x === 0 || y === 0 || x === 7 || y === 7) stable++;
            }
        }
    }
    return stable;
}

// 改良版評価関数：モビリティ・安定石・危険マス・重み対応
function evaluateBoard(tempBoard, turnCount = 0) {
    const weightMap = getDynamicWeightMap(turnCount);
    let score = 0;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = tempBoard[y][x];
            if (cell === "w") score += 1 + weightMap[y][x] / 10;
            if (cell === "b") score -= 1 + weightMap[y][x] / 10;
        }
    }

    // モビリティ評価
    const myMoves = getAllValidMoves(tempBoard, "w").length;
    const oppMoves = getAllValidMoves(tempBoard, "b").length;
    score += (myMoves - oppMoves) * 5;

    // 安定石加点
    score += countStableStones(tempBoard, "w") * 3;
    score -= countStableStones(tempBoard, "b") * 3;

    return score;
}

// ===========================
// 🎮 CPUメイン思考ルーチン
// ===========================
function cpuMove(difficulty = 1) {
    if (currentTurn !== "w") return;

    const turnCount = board.flat().filter(c => c !== "g").length;
    const weightMap = getDynamicWeightMap(turnCount);

    // 合法手を取得
    let validMoves = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isValidMove(x, y, "w")) {
                const flipped = countFlippable(x, y, "w");
                const weight = weightMap[y][x];
                const score = flipped + weight;
                validMoves.push({ x, y, flipped, weight, score });
            }
        }
    }

    if (validMoves.length === 0) return;

    let move;

    switch (difficulty) {
        case 1: // EASY：完全ランダム
            move = validMoves[Math.floor(Math.random() * validMoves.length)];
            break;

        case 2: // NORMAL：危険マスを避けて多く取る
            const safeMoves = validMoves.filter(m => m.weight > -50);
            const pool = safeMoves.length > 0 ? safeMoves : validMoves;
            pool.sort((a, b) => b.flipped - a.flipped);
            move = pool[0];
            break;

        case 3: // HARD：2手読み＋戦術評価
            let bestScore = -Infinity;
            let bestMove = null;

            for (const m of validMoves) {
                const tempBoard = JSON.parse(JSON.stringify(board));
                simulateMove(tempBoard, m.x, m.y, "w");

                // 危険マスはペナルティ（角未取得時）
                if (isDangerousMove(m.x, m.y)) m.score -= 150;

                // 序盤は少なく取るほど有利
                if (turnCount < 20) m.score -= m.flipped * 3;

                const oppMoves = getAllValidMoves(tempBoard, "b");
                let worstScore = Infinity;

                for (const o of oppMoves) {
                    const temp2 = JSON.parse(JSON.stringify(tempBoard));
                    simulateMove(temp2, o.x, o.y, "b");

                    const evalScore = evaluateBoard(temp2, turnCount + 2);
                    if (evalScore < worstScore) worstScore = evalScore;
                }

                const totalScore = worstScore + m.score;

                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestMove = m;
                }
            }

            move = bestMove || validMoves[0];
            break;
    }

    // 実際に配置
    placePiece(move.x, move.y, "w");
    updateBoard();
    changeTurn();
    checkPass();
}

function countFlippable(x, y, color) {
  const directions = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
  ];

  let total = 0;
  for (const { dx, dy } of directions) {
    let nx = x + dx, ny = y + dy, count = 0;
    while (isInBoard(nx, ny) && board[ny][nx] === getOpponent(color)) {
      nx += dx;
      ny += dy;
      count++;
    }
    if (isInBoard(nx, ny) && board[ny][nx] === color && count > 0) {
      total += count;
    }
  }
  return total;
}

function getAllValidMoves(tempBoard, color) {
  const moves = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (isValidMoveOnBoard(tempBoard, x, y, color)) {
        const flipped = countFlippableOnBoard(tempBoard, x, y, color);
        const weight = WEIGHT_MAP[y][x];
        const score = flipped + weight;
        moves.push({ x, y, flipped, score });
      }
    }
  }
  return moves;
}

function simulateMove(tempBoard, x, y, color) {
  tempBoard[y][x] = color;
  const directions = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
  ];

  for (const { dx, dy } of directions) {
    let nx = x + dx, ny = y + dy;
    const toFlip = [];
    while (isInBoard(nx, ny) && tempBoard[ny][nx] === getOpponent(color)) {
      toFlip.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
    if (isInBoard(nx, ny) && tempBoard[ny][nx] === color) {
      for (const [fx, fy] of toFlip) {
        tempBoard[fy][fx] = color;
      }
    }
  }
}

function isValidMoveOnBoard(tempBoard, x, y, color) {
  if (!isInBoard(x, y) || tempBoard[y][x] !== "g") return false;
  const opponent = getOpponent(color);
  const directions = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
  ];

  for (let [dx, dy] of directions) {
    let nx = x + dx, ny = y + dy;
    let foundOpponent = false;
    while (isInBoard(nx, ny)) {
      if (tempBoard[ny][nx] === opponent) {
        foundOpponent = true;
      } else if (tempBoard[ny][nx] === color && foundOpponent) {
        return true;
      } else {
        break;
      }
      nx += dx; ny += dy;
    }
  }
  return false;
}

function countFlippableOnBoard(tempBoard, x, y, color) {
  const dirs = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
  ];
  let total = 0;
  for (const { dx, dy } of dirs) {
    let nx = x + dx, ny = y + dy, count = 0;
    while (isInBoard(nx, ny) && tempBoard[ny][nx] === getOpponent(color)) {
      nx += dx; ny += dy; count++;
    }
    if (isInBoard(nx, ny) && tempBoard[ny][nx] === color && count > 0) {
      total += count;
    }
  }
  return total;
}

function hasValidMove(color) {

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board[y][x] === "g" && isValidMove(x, y, color)) {
                return true;
            }
        }
    }

    return false;
}

function getValidMoves(color) {
    let validMoves = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board[y][x] === "g" && isValidMove(x, y, color)) {
                validMoves.push({ x, y }); // 置ける座標をリストに追加
            }
        }
    }

    return validMoves; // 置ける座標のリストを返す
}

function showValidMoves(color) {
    let validMoves = getValidMoves(color);
    validMoves.forEach(({ x, y }) => {
        let cell = document.querySelector(`#board tr:nth-child(${y + 1}) td:nth-child(${x + 1})`);
        cell.classList.add("hint"); // CSSでヒントをスタイリング
    });
}

function changeTurn() {
    currentTurn = (currentTurn === "b") ? "w" : "b";
    updateTurnDisplay(); // ターン表示の更新

    if (currentTurn === "w") {
        setTimeout(() => {
            if (easySwitch === true) {
                cpuMove(1);
            } else if (normalSwitch === true) {
                cpuMove(2);
            } else if (hardSwitch === true) {
                cpuMove(3);
            }
        }, 500);
    }
}
function checkPass() {
    if (!hasValidMove(currentTurn)) {

        const turnInfo = document.getElementById("turn-info");
        turnInfo.innerHTML = `${currentTurn === "b" ? "⚫" : "⚪"} は置けないのでパスです`;

        // 相手もパスなら、結果発表
        let nextTurn = currentTurn === "b" ? "w" : "b";
        if (!hasValidMove(nextTurn)) {
            endGame();
            return true;
        }

        // OK ボタンを作成
        const passButton = document.createElement("button");
        passButton.textContent = "了解";
        passButton.id = "pass-button";

        // OK ボタンが押されたらターンを切り替える
        passButton.addEventListener("click", () => {
            passButton.remove(); // ボタンを消す
            changeTurn();
        });

        // メッセージの後ろにボタンを追加
        turnInfo.appendChild(passButton);
        return true;
    }
    playSound('se/put.mp3');
    return false;
}

function countStones() {
    let blackCount = 0;
    let whiteCount = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] === "b") {
                blackCount++;
            } else if (board[row][col] === "w") {
                whiteCount++;
            }
        }
    }

    return { blackCount, whiteCount };
}

function updateScore() {
    const { blackCount, whiteCount } = countStones();
    document.getElementById("black-score").textContent = blackCount;
    document.getElementById("white-score").textContent = whiteCount;
}

function resetGame() {

    createBoardHTML();
    initializeBoard();

    // ターンを黒から再スタート
    currentTurn = "b";

    // スコアをリセット
    updateScore();
    enableMoveHints();

    // メッセージをリセット
    document.getElementById("turn-info").innerHTML = "⚫ のターンです";

    menuScreen.style.display = 'none';
}

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
        playSound('se/put.mp3');
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
        [-1,  0],         [1,  0], // 左・右
        [-1,  1], [0,  1], [1,  1]  // 左下・下・右下
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

function checkPass() {
    if (!hasValidMove(currentTurn)) {

        const turnInfo = document.getElementById("turn-info");// 効果音

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

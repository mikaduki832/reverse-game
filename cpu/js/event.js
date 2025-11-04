document.getElementById("board").addEventListener("click", function (event) {
    let cell = event.target.closest("td");
    if (!cell) return;

    let x = cell.cellIndex;
    let y = cell.parentElement.rowIndex;

    // CPUのターン（白）なら何もしない
    if (currentTurn === "w") return;

    if (isValidMove(x, y, currentTurn)) {
        placePiece(x, y, currentTurn);
        updateBoard();
        changeTurn();
        checkPass();
    }

});

function handleMouseEnter(event) {
    let cell = event.target;
    let x = cell.cellIndex;
    let y = cell.parentElement.rowIndex;

    // CPUのターン（白）ならヒントを表示しない
    if (currentTurn === "w") return;

    if (isValidMove(x, y, currentTurn)) {
        cell.classList.add("hint"); // CSSでヒントのスタイル適用
    }
}

function handleMouseLeave(event) {
    event.target.classList.remove("hint"); // マウスが離れたら削除
}

function enableMoveHints() {
    document.querySelectorAll("#board td").forEach(cell => {
        cell.addEventListener("mouseenter", handleMouseEnter);
        cell.addEventListener("mouseleave", handleMouseLeave);
    });
}

const menuScreen = document.getElementById('menu-screen');
const menuButton = document.getElementById('menu');
const backButton = document.getElementById('back');

menuButton.addEventListener('click', () => {
    menuScreen.style.display = 'flex';
})

backButton.addEventListener('click', () => {
    menuScreen.style.display = 'none';
})


const easyBtn = document.getElementById('easy-btn');

easyBtn.addEventListener('click', () => {
    if (easySwitch === false) {
        easySwitch = !easySwitch;
    }
    if (normalSwitch === true) {
        normalSwitch = !normalSwitch;
    }
    if (hardSwitch === true) {
        hardSwitch = !hardSwitch;
    }
    changeDifficulty();
})

const normalButton = document.getElementById('normal-btn');

normalButton.addEventListener('click', () => {
    if (easySwitch === true) {
        easySwitch = !easySwitch;
    }
    if (normalSwitch === false) {
        normalSwitch = !normalSwitch;
    }
    if (hardSwitch === true) {
        hardSwitch = !hardSwitch;
    }
    changeDifficulty();
})

const hardButton = document.getElementById('hard-btn');

hardButton.addEventListener('click', () => {
    if (easySwitch === true) {
        easySwitch = !easySwitch;
    }
    if (normalSwitch === true) {
        normalSwitch = !normalSwitch;
    }
    if (hardSwitch === false) {
        hardSwitch = !hardSwitch;
    }
    changeDifficulty();
})

// リセットボタンにイベントリスナーをセット
document.getElementById("reset-button").addEventListener("click", resetGame);

document.addEventListener("DOMContentLoaded", () => {
    createBoardHTML();   // UI に反映
    initializeBoard();  // 盤面のデータをセット
    updateBoard();
    updateTurnDisplay();
});

document.addEventListener("DOMContentLoaded", () => {
    enableMoveHints(); // ヒント機能を有効化
});

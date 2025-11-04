const boardData = []; // 盤面データ用
window.GRID_SIZE = 8;

// 8 × 8 のボード
let board = [
    ["g", "g", "g", "g", "g", "g", "g", "g"],
    ["g", "g", "g", "g", "g", "g", "g", "g"],
    ["g", "g", "g", "g", "g", "g", "g", "g"],
    ["g", "g", "g", "w", "b", "g", "g", "g"],
    ["g", "g", "g", "b", "w", "g", "g", "g"],
    ["g", "g", "g", "g", "g", "g", "g", "g"],
    ["g", "g", "g", "g", "g", "g", "g", "g"],
    ["g", "g", "g", "g", "g", "g", "g", "g"],
    ["g", "g", "g", "g", "g", "g", "g", "g"],
]

function initializeBoard() {
    const boardElement = document.getElementById("board");
    const cells = boardElement.getElementsByTagName("td");
    boardData.length = 0;

    // まず board のデータをリセット
    board = [
        ["g", "g", "g", "g", "g", "g", "g", "g"],
        ["g", "g", "g", "g", "g", "g", "g", "g"],
        ["g", "g", "g", "g", "g", "g", "g", "g"],
        ["g", "g", "g", "w", "b", "g", "g", "g"],
        ["g", "g", "g", "b", "w", "g", "g", "g"],
        ["g", "g", "g", "g", "g", "g", "g", "g"],
        ["g", "g", "g", "g", "g", "g", "g", "g"],
        ["g", "g", "g", "g", "g", "g", "g", "g"]
    ];

    for (let i = 0; i < cells.length; i++) {
        let x = i % 8;
        let y = Math.floor(i / 8);
 
        // ⚠️ セルの中身を完全リセット
        cells[i].innerHTML = "";  
        cells[i].removeAttribute("data-stone");

        let stone = document.createElement("div"); // 石の `div` 作成
        stone.classList.add("stone");

        if ((x === 3 && y === 3) || (x === 4 && y === 4)) {
            stone.classList.add("white"); // 白石
            cells[i].setAttribute("data-stone", "w");
            boardData.push("w");
        } else if ((x === 3 && y === 4) || (x === 4 && y === 3)) {
            stone.classList.add("black"); // 黒石
            cells[i].setAttribute("data-stone", "b");
            boardData.push("b");
        } else {
            boardData.push("g"); 
            continue; // 何もないセルは `div` なしでスキップ
        }

        cells[i].appendChild(stone); // 石の `div` を追加
    }
}

// 盤面の初期化
function createBoardHTML() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // 初期化

    for (let y = 0; y < 8; y++) {
        let row = document.createElement("tr");
        for (let x = 0; x < 8; x++) {
            let cell = document.createElement("td");
            cell.dataset.x = x;
            cell.dataset.y = y;
            let stone = board[y][x]; // board 配列のデータを取得

            if (stone === "w") {
                cell.textContent = "⚪";
                cell.setAttribute("data-stone", "w");
            } else if (stone === "b") {
                cell.textContent = "⚫";
                cell.setAttribute("data-stone", "b");
            } else {
                cell.textContent = "";
                cell.setAttribute("data-stone", "g");
            }

            row.appendChild(cell);
        }
        boardElement.appendChild(row);
    }
}

let currentTurn = "b"; // 黒から開始
const blackTurn = document.getElementById("black-turn");
const whiteTurn = document.getElementById("white-turn");

function updateBoard() {
   const cells = document.querySelectorAll("#board td");

   for (let i = 0; i < cells.length; i++) {
      let x = i % 8;  // X座標（列）
      let y = Math.floor(i / 8);  // Y座標（行）
      let cell = cells[i];

       // 既存のクラスをクリア
      cell.classList.remove("black", "white");

       // 盤面の状態に応じてクラスを付与
      if (board[y][x] === "b") {
         let piece = document.createElement("div");
         piece.classList.add("black");
         cell.innerHTML = "";
         cell.appendChild(piece);
      } else if (board[y][x] === "w") {
         let piece = document.createElement("div");
         piece.classList.add("white");
         cell.innerHTML = "";
         cell.appendChild(piece);
      } else {
         // 空きマス（g）の場合はセルを空にする
         cell.innerHTML = "";
      }
   }
}

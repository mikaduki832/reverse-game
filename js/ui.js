function getTurnSymbol(color) {
   return color === "b" ? "⚫" : "⚪";
}

function changeTurn() {
   currentTurn = (currentTurn === "b") ? "w" : "b";
   updateTurnDisplay(); // ターン表示の更新

}

function updateTurnDisplay() {
   document.getElementById("turn-info").textContent = getTurnSymbol(currentTurn) + " のターンです";
}

function getWinner() {
   const { blackCount, whiteCount } = countStones();

   if (blackCount > whiteCount) {
      return `⚫ ${blackCount} 対 ⚪ ${whiteCount} で ⚫ の勝ちです`;
   } else if (whiteCount > blackCount) {
      return `⚫ ${blackCount} 対 ⚪ ${whiteCount} で ⚪ の勝ちです`;
   } else {
      return `⚫ ${blackCount} 対 ⚪ ${whiteCount} で 引き分けです`;
   }
}

function endGame() {
   const resultMessage = getWinner(); // getWinner() を呼び出して勝敗を取得
   const turnInfo = document.getElementById("turn-info");
   turnInfo.innerHTML = resultMessage; // 結果を turn-info に表示
}

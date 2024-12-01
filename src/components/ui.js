export const UI = (() => {
  const initUI = (player1, player2) => {
    const players = [player1, player2];

    const h1 = document.createElement("h1");
    h1.textContent = "Battleship";
    document.body.appendChild(h1);

    const gameDiv = document.createElement("div");
    gameDiv.id = "game";

    for (let i = 0; i < players.length; i++) {
      const playerDiv = document.createElement("div");
      playerDiv.classList.add("player-section");

      const playerTitle = document.createElement("h2");

      playerTitle.textContent = players[i].getName();

      const playerBoardDiv = document.createElement("div");
      playerBoardDiv.classList.add("board");
      playerBoardDiv.id = `player${i + 1}-board`;

      playerDiv.appendChild(playerTitle);
      playerDiv.appendChild(playerBoardDiv);
      gameDiv.appendChild(playerDiv);
    }

    const messageDiv = document.createElement("div");
    messageDiv.id = "message";
    gameDiv.appendChild(messageDiv);

    document.body.appendChild(gameDiv);
  };

  const renderBoard = (board, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear previous content

    board.forEach((row, y) => {
      const rowElement = document.createElement("div");
      rowElement.classList.add("board-row");

      row.forEach((cell, x) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("board-cell");
        cellElement.dataset.x = x;
        cellElement.dataset.y = y;

        // Display ship and status
        if (cell.ship) {
          cellElement.classList.add("ship");
        }
        if (cell.status === "hit") {
          cellElement.classList.add("hit");
        } else if (cell.status === "miss") {
          cellElement.classList.add("miss");
        }

        rowElement.appendChild(cellElement);
      });

      container.appendChild(rowElement);
    });
  };

  const displayMessage = (message) => {
    const messageContainer = document.getElementById("message");
    messageContainer.textContent = message;
  };

  return { initUI, renderBoard, displayMessage };
})();

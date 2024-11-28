export const UI = (() => {
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

  return { renderBoard, displayMessage };
})();

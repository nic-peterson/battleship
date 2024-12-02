export const UI = (() => {
  // Helper to create and append an element
  const createElement = (tag, options = {}) => {
    const element = document.createElement(tag);
    if (options.id) element.id = options.id;
    if (options.classes) element.classList.add(...options.classes);
    if (options.textContent) element.textContent = options.textContent;
    if (options.parent) options.parent.appendChild(element);
    return element;
  };

  // Private
  const setHeading = () => {
    createElement("h1", {
      textContent: "Battleship",
      parent: document.body,
    });
  };

  const createPlayerSection = (player, index, parent) => {
    const playerDiv = createElement("div", {
      classes: ["player-section"],
      parent,
    });

    createElement("h2", {
      textContent: player.getName(),
      parent: playerDiv,
    });

    createElement("div", {
      id: `player${index + 1}-board`,
      classes: ["board"],
      parent: playerDiv,
    });
  };

  // Public
  const initUI = (player1, player2) => {
    const players = [player1, player2];

    setHeading();

    setScore(player1, 0, player2, 0);

    setCurrentPlayer(player1.getName());

    const gameDiv = createElement("div", {
      id: "game",
      parent: document.body,
    });

    players.forEach((player, index) => {
      createPlayerSection(player, index, gameDiv);
    });

    createElement("div", {
      id: "message",
      parent: gameDiv,
    });
  };

  const renderBoard = (board, containerId) => {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error("Container not found"); // Explicit error for invalid container ID
    }

    container.innerHTML = ""; // Clear previous content

    board.forEach((row, y) => {
      const rowElement = createElement("div", {
        classes: ["board-row"],
        parent: container,
      });

      row.forEach((cell, x) => {
        const cellElement = createElement("div", {
          classes: ["board-cell"],
          parent: rowElement,
        });

        cellElement.dataset.x = x;
        cellElement.dataset.y = y;

        if (cell.ship) cellElement.classList.add("ship");
        if (cell.status === "hit") cellElement.classList.add("hit");
        if (cell.status === "miss") cellElement.classList.add("miss");
      });
    });
  };

  const displayMessage = (message) => {
    const messageDiv = document.getElementById("message");
    if (messageDiv) messageDiv.textContent = message;
  };

  const setScore = (player1, player1Score, player2, player2Score) => {
    const scoreDiv =
      document.getElementById("score") ||
      createElement("div", { id: "score", parent: document.body });

    scoreDiv.textContent = `${player1.getName()}: ${player1Score} | ${player2.getName()}: ${player2Score}`;
  };

  const setCurrentPlayer = (playerName) => {
    const currentPlayerDiv =
      document.getElementById("current-player") ||
      createElement("div", { id: "current-player", parent: document.body });

    currentPlayerDiv.textContent = `Current Player: ${playerName}`;
  };

  const addBoardEventListeners = (boardContainerId, handleAttack) => {
    const container = document.getElementById(boardContainerId);
    container.addEventListener("click", (event) => {
      const cell = event.target;
      if (cell.classList.contains("board-cell")) {
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        handleAttack(x, y);
      }
    });
  };

  return {
    initUI,
    renderBoard,
    displayMessage,
    setScore,
    setCurrentPlayer,
    addBoardEventListeners,
  };
})();

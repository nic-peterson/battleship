// ui.js
import { CellStatus } from "../helpers/constants";

export const UI = () => {
  // Helper to create and append an element
  const createElement = (tag, options = {}) => {
    const element = document.createElement(tag);
    if (options.id) element.id = options.id;
    if (options.classes) element.classList.add(...options.classes);
    if (options.textContent) element.textContent = options.textContent;
    if (options.parent) options.parent.appendChild(element);
    return element;
  };

  // Private methods
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

  // Public methods
  const initUI = (player1, player2) => {
    const players = [player1, player2];

    setHeading();

    updateScore(player1, 0, player2, 0);

    updateCurrentPlayer(player1.getName());

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

    renderBoard(player1.getGameboard().getBoard(), "player1-board", true);
    renderBoard(player2.getGameboard().getBoard(), "player2-board", false);

    displayMessage("Game started");
  };

  const resetUI = () => {
    // Remove the game container without affecting #message
    const gameContainer = document.getElementById("game");
    if (gameContainer) {
      // Remove all child elements except #message
      const messageDiv = document.getElementById("message");
      gameContainer.innerHTML = ""; // Clear all children
      if (messageDiv) {
        gameContainer.appendChild(messageDiv); // Re-add messageDiv if necessary
      }
    }

    // Remove the heading
    const heading = document.querySelector("h1");
    if (heading) {
      heading.remove();
    }

    // Remove the score div
    const scoreDiv = document.getElementById("score");
    if (scoreDiv) {
      scoreDiv.remove();
    }

    // Remove the current player div
    const currentPlayerDiv = document.getElementById("current-player");
    if (currentPlayerDiv) {
      currentPlayerDiv.remove();
    }

    // Clear the message div's text content without removing it
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
      messageDiv.textContent = "";
      // Optionally, reset other properties if needed
      // e.g., messageDiv.className = "message info";
    }
  };

  const renderBoard = (board, containerId, isOwnBoard = false) => {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error("Container not found");
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

        if (cell.ship && isOwnBoard) {
          cellElement.classList.add(CellStatus.SHIP);

          if (cell.ship.isSunk()) {
            cellElement.classList.add(CellStatus.SUNK);
          }
        }

        if (cell.status === CellStatus.HIT)
          cellElement.classList.add(CellStatus.HIT);
        if (cell.status === CellStatus.MISS)
          cellElement.classList.add(CellStatus.MISS);
      });
    });
  };

  const displayMessage = (message, type = "info", duration = 0) => {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;

      if (duration > 0) {
        setTimeout(() => {
          messageDiv.textContent = "";
          messageDiv.className = "message";
        }, duration);
      }
    }
  };

  const updateScore = (player1, player1Score, player2, player2Score) => {
    const scoreDiv =
      document.getElementById("score") ||
      createElement("div", { id: "score", parent: document.body });

    scoreDiv.textContent = `${player1.getName()}: ${player1Score} | ${player2.getName()}: ${player2Score}`;
  };

  const updateCurrentPlayer = (playerName) => {
    const currentPlayerDiv =
      document.getElementById("current-player") ||
      createElement("div", { id: "current-player", parent: document.body });

    currentPlayerDiv.textContent = `Current Player: ${playerName}`;
    // Highlight the current player's section
    document.querySelectorAll(".player-section").forEach((section) => {
      section.classList.toggle(
        "current",
        section.querySelector("h2").textContent === playerName
      );
    });
  };

  const addBoardEventListeners = (boardContainerId, handleAttack) => {
    const container = document.getElementById(boardContainerId);

    if (!container) {
      throw new Error("Container not found");
    }

    container.addEventListener("click", (event) => {
      const cell = event.target;
      if (
        cell.classList.contains("board-cell") &&
        !cell.classList.contains("hit") &&
        !cell.classList.contains("miss")
      ) {
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        handleAttack(x, y);
      }
    });
  };

  const enableBoardInteraction = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);
    container.classList.remove("disabled");
  };

  const disableBoardInteraction = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);
    container.classList.add("disabled");
  };

  const showGameOverScreen = (winnerName) => {
    const gameOverDiv = createElement("div", {
      id: "game-over",
      classes: ["overlay"],
      parent: document.body,
    });

    createElement("h2", {
      textContent: `${winnerName} wins!`,
      parent: gameOverDiv,
    });

    const restartButton = createElement("button", {
      textContent: "Play Again",
      parent: gameOverDiv,
    });

    restartButton.addEventListener("click", () => {
      // Logic to restart the game
      location.reload(); // Simple way to reload the page
    });
  };

  return {
    initUI,
    resetUI,
    renderBoard,
    displayMessage,
    updateScore,
    updateCurrentPlayer,
    addBoardEventListeners,
    showGameOverScreen,
    enableBoardInteraction,
    disableBoardInteraction,
  };
};

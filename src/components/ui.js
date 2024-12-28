// ui.js
import { CELL_STATUS } from "../helpers/constants/boardConstants";
import { CSS_CLASSES, CSS_IDS } from "../helpers/constants/cssConstants";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../helpers/constants/messageConstants";

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
      classes: [CSS_CLASSES.BOARD],
      parent: playerDiv,
    });
  };

  // Public methods
  const initUI = (player1, player2) => {
    const players = [player1, player2];

    setHeading();

    updateScore(player1, 0, player2, 0);

    updateCurrentPlayer(player1);

    // Create message div here, before the game div
    createElement("div", {
      id: CSS_IDS.MESSAGE,
      parent: document.body,
    });

    const gameDiv = createElement("div", {
      id: CSS_IDS.GAME,
      parent: document.body,
    });

    // Create player sections
    players.forEach((player, index) => {
      createPlayerSection(player, index, gameDiv);
    });

    renderBoard(player1.getGameboard().getBoard(), CSS_IDS.PLAYER1_BOARD, true);
    renderBoard(
      player2.getGameboard().getBoard(),
      CSS_IDS.PLAYER2_BOARD,
      false
    );

    displayMessage(SUCCESS_MESSAGES.GAME_STARTED);
  };

  const resetUI = () => {
    // Remove the game container without affecting #message
    const gameContainer = document.getElementById(CSS_IDS.GAME);
    if (gameContainer) {
      // Remove all child elements except #message
      const messageDiv = document.getElementById(CSS_IDS.MESSAGE);
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
    const scoreDiv = document.getElementById(CSS_IDS.SCORE);
    if (scoreDiv) {
      scoreDiv.remove();
    }

    // Remove the current player div
    const currentPlayerDiv = document.getElementById(CSS_IDS.CURRENT_PLAYER);
    if (currentPlayerDiv) {
      currentPlayerDiv.remove();
    }

    // Clear the message div's text content without removing it
    const messageDiv = document.getElementById(CSS_IDS.MESSAGE);
    if (messageDiv) {
      messageDiv.textContent = "";
      // Optionally, reset other properties if needed
      // e.g., messageDiv.className = "message info";
    }
  };

  const renderBoard = (board, containerId, isOwnBoard = false) => {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }

    // Store the current handleAttack function if it exists
    const existingHandler = container._handleAttack;

    container.innerHTML = ""; // Clear previous content

    board.forEach((row, y) => {
      const rowElement = createElement("div", {
        classes: [CSS_CLASSES.BOARD_ROW],
        parent: container,
      });

      row.forEach((cell, x) => {
        const cellElement = createElement("div", {
          classes: [CSS_CLASSES.BOARD_CELL],
          parent: rowElement,
        });

        cellElement.dataset.x = x;
        cellElement.dataset.y = y;

        // Show ships only on player's own board
        if (cell.ship && isOwnBoard) {
          cellElement.classList.add(CSS_CLASSES.SHIP);

          if (cell.ship.isSunk()) {
            cellElement.classList.add(CSS_CLASSES.SUNK);
          }
        }
        // Add hit/miss classes
        if (cell.status === CELL_STATUS.HIT) {
          cellElement.classList.add(CSS_CLASSES.HIT);
          // Add sunk class if the ship is sunk (for both boards)
          if (cell.ship && cell.ship.isSunk()) {
            cellElement.classList.add(CSS_CLASSES.SUNK);
          }
        }

        if (cell.status === CELL_STATUS.MISS)
          cellElement.classList.add(CSS_CLASSES.MISS);

        // Re-add click handler if it existed
        if (existingHandler) {
          cellElement.addEventListener("click", (event) => {
            if (
              !cellElement.classList.contains(CSS_CLASSES.HIT) &&
              !cellElement.classList.contains(CSS_CLASSES.MISS) &&
              !cellElement.classList.contains(CSS_CLASSES.SUNK)
            ) {
              console.log(`Board clicked: ${x},${y}`);
              existingHandler(x, y);
            }
          });
        }
      });
    });
  };

  const displayMessage = (message, type = "info", duration = 0) => {
    const messageDiv = document.getElementById(CSS_IDS.MESSAGE);
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;

      if (duration > 0) {
        setTimeout(() => {
          messageDiv.textContent = "";
          messageDiv.className = CSS_CLASSES.MESSAGE;
        }, duration);
      }
    }
  };

  const updateScore = (player1, player1Score, player2, player2Score) => {
    if (!player1 || !player2) {
      console.error("Missing player information for score update");
      return;
    }
    const scoreDiv =
      document.getElementById(CSS_IDS.SCORE) ||
      createElement("div", { id: CSS_IDS.SCORE, parent: document.body });

    scoreDiv.textContent = `${player1.getName()}: ${player1Score} | ${player2.getName()}: ${player2Score}`;
  };

  const updateCurrentPlayer = (player) => {
    const currentPlayerDiv =
      document.getElementById(CSS_IDS.CURRENT_PLAYER) ||
      createElement("div", {
        id: CSS_IDS.CURRENT_PLAYER,
        parent: document.body,
      });

    currentPlayerDiv.textContent = `Current Player: ${player.getName()}`;
    // Highlight the current player's section
    document.querySelectorAll(".player-section").forEach((section) => {
      section.classList.toggle(
        "current",
        section.querySelector("h2").textContent === player.getName()
      );
    });
  };

  const addBoardEventListeners = (boardContainerId, clickHandler) => {
    const boardContainer = document.getElementById(boardContainerId);
    if (!boardContainer) {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }

    const cells = boardContainer.getElementsByClassName(CSS_CLASSES.BOARD_CELL);
    Array.from(cells).forEach((cell) => {
      cell.addEventListener("click", () => {
        if (
          !cell.classList.contains(CSS_CLASSES.HIT) &&
          !cell.classList.contains(CSS_CLASSES.MISS) &&
          !cell.classList.contains(CSS_CLASSES.SUNK)
        ) {
          const x = parseInt(cell.dataset.x);
          const y = parseInt(cell.dataset.y);
          clickHandler(x, y);
        }
      });
    });
  };

  const enableBoardInteraction = (boardContainerId) => {
    const boardContainer = document.getElementById(boardContainerId);
    if (!boardContainer) {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }
    boardContainer.classList.remove(CSS_CLASSES.DISABLED);
    boardContainer.style.pointerEvents = "auto";
  };

  const disableBoardInteraction = (boardContainerId) => {
    const boardContainer = document.getElementById(boardContainerId);
    if (!boardContainer) {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }
    boardContainer.classList.add(CSS_CLASSES.DISABLED);
    boardContainer.style.pointerEvents = "none";
  };

  const showGameOverScreen = (winnerName) => {
    // First, clear any existing game over messages
    const existingGameOver = document.getElementById(CSS_IDS.GAME_OVER);
    if (existingGameOver) {
      existingGameOver.remove();
    }

    const gameOverDiv = createElement("div", {
      id: CSS_IDS.GAME_OVER,
      classes: [CSS_CLASSES.OVERLAY],
      parent: document.body,
    });

    // Create a container for the content
    const contentDiv = createElement("div", {
      classes: ["game-over-content"],
      parent: gameOverDiv,
    });

    createElement("h2", {
      textContent: `${winnerName} wins!`,
      parent: contentDiv,
    });

    const restartButton = createElement("button", {
      textContent: "Play Again",
      classes: ["play-again-button"],
      parent: contentDiv,
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

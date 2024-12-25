// ui.js
import { CELL_STATUS } from "../helpers/constants/boardConstants";
import { PLAYER_BOARDS } from "../helpers/constants/boardConstants";
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

    const gameDiv = createElement("div", {
      id: CSS_IDS.GAME,
      parent: document.body,
    });

    players.forEach((player, index) => {
      createPlayerSection(player, index, gameDiv);
    });

    createElement("div", {
      id: CSS_IDS.MESSAGE,
      parent: gameDiv,
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

        if (cell.ship && isOwnBoard) {
          cellElement.classList.add(CSS_CLASSES.SHIP);

          if (cell.ship.isSunk()) {
            cellElement.classList.add(CSS_CLASSES.SUNK);
          }
        }

        if (cell.status === CELL_STATUS.HIT)
          cellElement.classList.add(CSS_CLASSES.HIT);
        if (cell.status === CELL_STATUS.MISS)
          cellElement.classList.add(CSS_CLASSES.MISS);
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

  const addBoardEventListeners = (boardContainerId, handleAttack) => {
    const container = document.getElementById(boardContainerId);

    if (!container) {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }

    // Select all cells inside the container
    const cells = container.querySelectorAll(`.${CSS_CLASSES.BOARD_CELL}`);

    cells.forEach((cell) => {
      cell.addEventListener("click", (event) => {
        // Extract x, y from cell's data attributes
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);

        // Prevent attacking a cell that's already marked
        if (
          !cell.classList.contains(CSS_CLASSES.HIT) &&
          !cell.classList.contains(CSS_CLASSES.MISS) &&
          !cell.classList.contains(CSS_CLASSES.SUNK)
        ) {
          handleAttack(x, y);
        }
      });
    });

    /*
    container.addEventListener("click", (event) => {
      console.log("STEPPING INTO ADD EVENT LISTENER");
      const cell = event.target.closest(`.${CSS_CLASSES.BOARD_CELL}`);
      console.log("Event target:", event.target);
      console.log("Cell:", cell);

      if (cell) {
        console.log("Cell Classes:", cell.classList);
        console.log("Cell dataset:", cell.dataset);
        console.log(
          "Is board-cell:",
          cell?.classList.contains(CSS_CLASSES.BOARD_CELL)
        );
        console.log("Is not hit:", !cell?.classList.contains(CSS_CLASSES.HIT));
        console.log(
          "Is not miss:",
          !cell?.classList.contains(CSS_CLASSES.MISS)
        );
        console.log(
          "Is not sunk:",
          !cell?.classList.contains(CSS_CLASSES.SUNK)
        );
      }

      if (
        cell & cell.classList.contains(CSS_CLASSES.BOARD_CELL) &&
        !cell.classList.contains(CSS_CLASSES.HIT) &&
        !cell.classList.contains(CSS_CLASSES.MISS) &&
        !cell.classList.contains(CSS_CLASSES.SUNK)
      ) {
        console.log("Cell clicked:", cell);
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        console.log("Event target:", event.target);
        console.log("Cell coordinates:", x, y);
        handleAttack(x, y);
      } else {
        console.log("Conditional failed. Cell is invalid or already marked.");
      }
    });
    */
  };

  const enableBoardInteraction = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);

    if (container) {
      container.classList.remove(CSS_CLASSES.DISABLED);
    } else {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }
  };

  const disableBoardInteraction = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);

    if (container) {
      container.classList.add(CSS_CLASSES.DISABLED);
    } else {
      throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    }
  };

  const showGameOverScreen = (winnerName) => {
    const gameOverDiv = createElement("div", {
      id: CSS_IDS.GAME_OVER,
      classes: [CSS_CLASSES.OVERLAY],
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

// * ui.test.js
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require("jsdom");
const { UI } = require("../src/components/ui");
import { Gameboard } from "../src/components/gameboard";
import { Player } from "../src/components/player";
import { CSS_CLASSES, CSS_IDS } from "../src/helpers/constants/cssConstants";
import { PLAYERS } from "../src/helpers/constants/playerConstants";
import { BOARD_SIZE } from "../src/helpers/constants/boardConstants";
import { BATTLESHIPS } from "../src/helpers/constants/shipConstants";
import { Ship } from "../src/components/ship";
import { ERROR_MESSAGES } from "../src/helpers/constants/messageConstants";

describe("UI", () => {
  let dom;
  let container;

  let player1;
  let player2;
  let player1Gameboard;
  let player2Gameboard;

  let ui;

  beforeEach(() => {
    dom = new JSDOM(
      '<!DOCTYPE html><div id="board"></div><div id="message"></div>'
    );
    container = dom.window.document;
    global.document = container;

    // Reset the DOM
    document.body.innerHTML = "";

    player1 = Player(
      PLAYERS.PLAYER1.TYPE,
      PLAYERS.PLAYER1.NAME,
      PLAYERS.PLAYER1.ID
    );
    player2 = Player(
      PLAYERS.PLAYER1.TYPE,
      PLAYERS.PLAYER2.NAME,
      PLAYERS.PLAYER2.ID
    );

    player1Gameboard = Gameboard(BOARD_SIZE, ...BATTLESHIPS);
    player2Gameboard = Gameboard(BOARD_SIZE, ...BATTLESHIPS);

    // Associate gameboards with players
    player1.setGameboard(player1Gameboard);
    player2.setGameboard(player2Gameboard);

    ui = UI();
    // Initialize the UI
    ui.initUI(player1, player2);
  });

  afterEach(() => {
    global.document = undefined;
  });

  describe("UI Initialization", () => {
    test("should initialize UI elements correctly", () => {
      expect(document.querySelector("h1").textContent).toBe("Battleship");
      expect(document.getElementById(CSS_IDS.SCORE)).not.toBeNull();
      expect(document.getElementById(CSS_IDS.CURRENT_PLAYER)).not.toBeNull();
      expect(document.getElementById(CSS_IDS.GAME)).not.toBeNull();
      expect(document.getElementById(CSS_IDS.MESSAGE)).not.toBeNull();
    });

    test("should initialize UI with dynamic player names", () => {
      // Reset the DOM again to avoid interference from beforeEach
      document.body.innerHTML = "";

      player1 = Player(
        PLAYERS.PLAYER1.TYPE,
        "Dynamic Player 1",
        PLAYERS.PLAYER1.ID
      );
      player2 = Player(
        PLAYERS.PLAYER1.TYPE,
        "Dynamic Player 2",
        PLAYERS.PLAYER2.ID
      );

      player1.setGameboard(player1Gameboard);
      player2.setGameboard(player2Gameboard);

      ui.initUI(player1, player2);

      const playerSections = document.querySelectorAll(
        `.${CSS_CLASSES.PLAYER_SECTION} h2`
      );
      expect(playerSections[0].textContent).toBe("Dynamic Player 1");
      expect(playerSections[1].textContent).toBe("Dynamic Player 2");
    });
  });

  describe("UI Updates", () => {
    test("should update score", () => {
      ui.updateScore(player1, 5, player2, 3);
      const scoreDiv = document.getElementById(CSS_IDS.SCORE);
      expect(scoreDiv.textContent).toBe(
        `${player1.getName()}: 5 | ${player2.getName()}: 3`
      );
    });

    test("should update current player", () => {
      ui.updateCurrentPlayer(player2);
      const currentPlayerDiv = document.getElementById(CSS_IDS.CURRENT_PLAYER);
      expect(currentPlayerDiv.textContent).toBe(
        `Current Player: ${player2.getName()}`
      );
    });

    test("should display messages", () => {
      ui.displayMessage("Test message");
      const messageDiv = document.getElementById(CSS_IDS.MESSAGE);
      expect(messageDiv.textContent).toBe("Test message");
    });
  });

  describe("UI Player Board Interactions", () => {
    beforeEach(() => {
      // Manually place ships for testing
      const carrier = Ship(BATTLESHIPS.type, BATTLESHIPS[0].length);
      const battleship = Ship(BATTLESHIPS.type, BATTLESHIPS[1].length);

      player1Gameboard.placeShip(carrier, 0, 0, "horizontal");
      player1Gameboard.placeShip(battleship, 2, 2, "vertical");

      player2Gameboard.placeShip(carrier, 0, 0, "horizontal");
      player2Gameboard.placeShip(battleship, 3, 3, "vertical");
    });

    test("should render board correctly", () => {
      ui.renderBoard(player1Gameboard.getBoard(), CSS_IDS.PLAYER1_BOARD, true);
      const boardContainer = document.getElementById(CSS_IDS.PLAYER1_BOARD);

      expect(boardContainer).not.toBeNull();
      const cells = boardContainer.querySelectorAll(
        `.${CSS_CLASSES.BOARD_CELL}`
      );
      expect(cells.length).toBe(BOARD_SIZE * BOARD_SIZE);

      const cellArray = Array.from(cells);

      expect(cellArray[0].classList.contains(CSS_CLASSES.SHIP)).toBe(true);
      expect(cellArray[0].classList.contains(CSS_CLASSES.HIT)).toBe(false);
      expect(cellArray[0].classList.contains(CSS_CLASSES.MISS)).toBe(false);

      expect(cellArray[1].classList.contains(CSS_CLASSES.SHIP)).toBe(true);
      expect(cellArray[1].classList.contains(CSS_CLASSES.HIT)).toBe(false);
      expect(cellArray[1].classList.contains(CSS_CLASSES.SUNK)).toBe(false);

      const lastCell = cellArray[cellArray.length - 1];
      expect(lastCell.classList.contains(CSS_CLASSES.SHIP)).toBe(false);
      expect(lastCell.classList.contains(CSS_CLASSES.HIT)).toBe(false);
      expect(lastCell.classList.contains(CSS_CLASSES.MISS)).toBe(false);
    });
  });

  describe("UI - resetUI", () => {
    beforeEach(() => {
      // Simulate DOM elements

      document.body.innerHTML = `
        <h1>Battleship</h1>
        <div id="${
          CSS_IDS.SCORE
        }">${player1.getName()}: 0 | ${player2.getName()}: 0</div>
        <div id="${
          CSS_IDS.CURRENT_PLAYER
        }">Current Player: ${player1.getName()}</div>
        <div id="${CSS_IDS.GAME}">
          <div class="${CSS_CLASSES.BOARD}"></div>
        </div>
        <div id="${CSS_IDS.MESSAGE}" class="${
        CSS_CLASSES.MESSAGE
      }">Game started</div>
      `;
    });

    test("should reset the UI correctly", () => {
      ui.resetUI();

      expect(document.querySelector("h1")).toBeNull();
      expect(document.getElementById(CSS_IDS.SCORE)).toBeNull();
      expect(document.getElementById(CSS_IDS.CURRENT_PLAYER)).toBeNull();
      const gameContainer = document.getElementById(CSS_IDS.GAME);
      expect(gameContainer).not.toBeNull();
      expect(gameContainer.querySelectorAll("*").length).toBe(1); // Only #message remains
      expect(document.getElementById(CSS_IDS.MESSAGE).textContent).toBe("");
    });
  });

  describe("enableBoardInteraction and disableBoardInteraction", () => {
    let board;

    beforeEach(() => {
      document.body.innerHTML = ""; // Clean up the DOM

      const board = document.createElement("div");
      board.id = CSS_IDS.PLAYER1_BOARD;
      board.classList.add(CSS_CLASSES.DISABLED); // Initial state is disabled
      document.body.appendChild(board);
    });

    afterEach(() => {
      document.body.innerHTML = ""; // Clean up DOM
    });

    test("should enable board interaction", () => {
      // Arrange
      const board = document.getElementById(CSS_IDS.PLAYER1_BOARD);
      expect(board).not.toBeNull(); // Ensure the element exists
      expect(board.classList.contains(CSS_CLASSES.DISABLED)).toBe(true); // Verify initial state

      // Act
      ui.enableBoardInteraction(CSS_IDS.PLAYER1_BOARD);

      // Assert
      expect(board.classList.contains(CSS_CLASSES.DISABLED)).toBe(false); // Verify class is removed
    });

    test("should disable board interaction", () => {
      const board = document.getElementById(CSS_IDS.PLAYER1_BOARD);
      board.classList.remove(CSS_CLASSES.DISABLED); // Ensure the initial state is enabled

      // Act
      ui.disableBoardInteraction(CSS_IDS.PLAYER1_BOARD);

      // Assert
      expect(board.classList.contains(CSS_CLASSES.DISABLED)).toBe(true); // DISABLED class added
    });

    test("should throw an error if board container is not found", () => {
      // Act & Assert
      expect(() => ui.enableBoardInteraction("invalid-id")).toThrow(
        "Container not found"
      );
      expect(() => ui.disableBoardInteraction("invalid-id")).toThrow(
        "Container not found"
      );
    });
  });

  describe("addBoardEventListeners", () => {
    let mockHandleAttack;

    beforeEach(() => {
      // Setup the DOM
      document.body.innerHTML = `
        <div id="player2-board" class="board">
          <div class="board-row">
            <div class="board-cell" data-x="0" data-y="0"></div>
            <div class="board-cell" data-x="1" data-y="0"></div>
          </div>
          <div class="board-row">
            <div class="board-cell" data-x="0" data-y="1"></div>
            <div class="board-cell" data-x="1" data-y="1"></div>
          </div>
        </div>
      `;

      ui = UI();
      container = document.getElementById("player2-board");
      mockHandleAttack = jest.fn();
    });

    afterEach(() => {
      document.body.innerHTML = "";
      jest.clearAllMocks();
    });

    test("should add click listeners to all cells", () => {
      ui.addBoardEventListeners("player2-board", mockHandleAttack);

      // Click first cell
      const firstCell = container.querySelector(".board-cell");
      firstCell.click();

      expect(mockHandleAttack).toHaveBeenCalledWith(0, 0);
    });

    test("should not trigger attack on already attacked cells", () => {
      ui.addBoardEventListeners("player2-board", mockHandleAttack);

      const cell = container.querySelector(".board-cell");

      // Mark cell as hit
      cell.classList.add(CSS_CLASSES.HIT);

      // Try to click the cell
      cell.click();

      expect(mockHandleAttack).not.toHaveBeenCalled();
    });

    test("should throw error if board container not found", () => {
      expect(() => {
        ui.addBoardEventListeners("non-existent-id", mockHandleAttack);
      }).toThrow(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
    });

    test("should not invoke handleAttack on invalid cell clicks", () => {
      ui.addBoardEventListeners(CSS_IDS.PLAYER2_BOARD, mockHandleAttack);

      const invalidCell = document.createElement("div");
      container.appendChild(invalidCell);
      invalidCell.click();

      expect(mockHandleAttack).not.toHaveBeenCalled();
    });

    test("should invoke handleAttack on valid cell clicks", () => {
      // Arrange: attach the event listeners
      ui.addBoardEventListeners(CSS_IDS.PLAYER2_BOARD, mockHandleAttack);

      // Act: query the cell & click it
      const cell = document.querySelector(`.${CSS_CLASSES.BOARD_CELL}`);
      cell.click();

      // Assert
      expect(mockHandleAttack).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("showGameOverScreen", () => {
    test("should display game-over overlay with correct winner", () => {
      ui.showGameOverScreen(PLAYERS.PLAYER1.NAME);

      const overlay = document.getElementById(CSS_IDS.GAME_OVER);
      expect(overlay).not.toBeNull();
      expect(overlay.classList.contains(CSS_CLASSES.OVERLAY)).toBe(true);

      const message = overlay.querySelector("h2");
      expect(message.textContent).toBe(`${PLAYERS.PLAYER1.NAME} wins!`);

      const button = overlay.querySelector("button");
      expect(button.textContent).toBe("Play Again");
    });

    test("should reload the page when restart button is clicked", () => {
      // Mock reload by replacing the entire location object
      const mockLocation = { reload: jest.fn() };
      delete window.location;
      window.location = mockLocation;

      ui.showGameOverScreen(player1.getName());
      const button = document.querySelector(`#${CSS_IDS.GAME_OVER} button`);
      button.click();

      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe("renderBoard", () => {
    test("should throw an error for invalid container ID", () => {
      expect(() => ui.renderBoard([], "invalid-id")).toThrow(
        ERROR_MESSAGES.CONTAINER_NOT_FOUND
      );
    });

    test("should render an empty board", () => {
      const boardContainer = document.createElement("div");
      boardContainer.id = CSS_IDS.PLAYER1_BOARD;
      document.body.appendChild(boardContainer);

      ui.renderBoard([], CSS_IDS.PLAYER1_BOARD);

      expect(boardContainer.children.length).toBe(0);
    });
  });
  describe("UI - Game Over", () => {});
});

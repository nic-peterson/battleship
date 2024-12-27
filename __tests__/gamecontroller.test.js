// * gamecontroller.test.js

// * 1. Mock modules at the top
import { GameController } from "../src/components/gameController";
import { Game } from "../src/components/game";
import { UI } from "../src/components/ui";
import { Player } from "../src/components/player";
import { Gameboard } from "../src/components/gameboard";
import { BATTLESHIPS } from "../src/helpers/constants/shipConstants";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../src/helpers/constants/messageConstants";
import { PLAYER_BOARDS } from "../src/helpers/constants/boardConstants";
import { PLAYERS } from "../src/helpers/constants/playerConstants";
import { Ship } from "../src/components/ship";

import { createMockGameboard, createMockPlayer } from "./mocks";

jest.mock("../src/components/game");
jest.mock("../src/components/ui");
jest.mock("../src/components/player");
jest.mock("../src/components/gameboard");
jest.mock("../src/components/ship");

// 2. Mock Factory Functions
const createMockUI = () => ({
  renderBoard: jest.fn(),
  displayMessage: jest.fn(),
  updateScore: jest.fn(),
  showGameOverScreen: jest.fn(),
  addBoardEventListeners: jest.fn(),
  disableBoardInteraction: jest.fn(),
  enableBoardInteraction: jest.fn(),
  initUI: jest.fn(),
  resetUI: jest.fn(),
  updateCurrentPlayer: jest.fn(),
});

const createMockGame = () => ({
  initializeGame: jest.fn(),
  resetGame: jest.fn(),
  attack: jest.fn(),
  switchTurn: jest.fn(),
  isGameOver: jest.fn().mockReturnValue(false),
  isGameStarted: jest.fn().mockReturnValue(false),
  getCurrentPlayer: jest.fn(),
  getOpponent: jest.fn(),
});

// 3. Test Suite Structure
describe("GameController Factory", () => {
  let gameController;
  let mockUI;
  let mockGame;
  let mockPlayer1;
  let mockPlayer2;

  beforeEach(() => {
    // Mock DOM first
    document.body.innerHTML = `<div id="${PLAYER_BOARDS.PLAYER2}" class="board-container"></div>`;

    // Setup fresh mocks for each test
    mockUI = createMockUI();
    mockGame = createMockGame();

    // Create mock gameboards
    const mockGameboard1 = createMockGameboard();
    const mockGameboard2 = createMockGameboard();

    mockPlayer1 = createMockPlayer(
      PLAYERS.PLAYER1.TYPE,
      PLAYERS.PLAYER1.NAME,
      PLAYERS.PLAYER1.ID
    );
    mockPlayer2 = createMockPlayer(
      PLAYERS.PLAYER2.TYPE,
      PLAYERS.PLAYER2.NAME,
      PLAYERS.PLAYER2.ID
    );

    // Add makeSmartMove explicitly
    mockPlayer1.makeSmartMove = jest.fn();
    mockPlayer2.makeSmartMove = jest.fn();

    // Set up both setGameboard and getGameboard
    mockGameboard1.placeShip = jest.fn();
    mockGameboard2.placeShip = jest.fn();
    mockPlayer1.setGameboard(mockGameboard1);
    mockPlayer2.setGameboard(mockGameboard2);

    gameController = GameController(
      mockGame,
      mockUI,
      [mockPlayer1, mockPlayer2],
      [mockGameboard1, mockGameboard2]
    );
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Initialization", () => {
    test("creates controller with valid dependencies", () => {
      expect(gameController).toBeDefined();
      expect(gameController.startGame).toBeDefined();
      expect(gameController.handleAttack).toBeDefined();
    });

    test("throws when missing required dependencies", () => {
      expect(() => GameController(null, mockUI)).toThrow(
        ERROR_MESSAGES.GAME_REQUIRED
      );
      expect(() => GameController(mockGame, null)).toThrow(
        ERROR_MESSAGES.UI_REQUIRED
      );
    });

    test("throws when invalid number of players is provided", () => {
      expect(() => GameController(mockGame, mockUI, [mockPlayer1])).toThrow(
        ERROR_MESSAGES.INVALID_PLAYERS_COUNT
      );
    });

    test("should display error message and rethrow error when game initialization fails", () => {
      // Arrange
      const expectedError = new Error("Game initialization failed");
      mockGame.initializeGame.mockImplementation(() => {
        throw expectedError;
      });

      const mockGameboard1 = createMockGameboard();
      const mockGameboard2 = createMockGameboard();

      gameController = GameController(
        mockGame,
        mockUI,
        [mockPlayer1, mockPlayer2],
        [mockGameboard1, mockGameboard2]
      );

      // Act & Assert
      expect(() => {
        gameController.startGame();
      }).toThrow(expectedError);

      expect(mockUI.displayMessage).toHaveBeenCalledWith(expectedError.message);
    });

    test("throws when invalid number of gameboards is provided", () => {
      // Arrange
      const mockGameboard1 = createMockGameboard();

      // Act & Assert
      // Try to create with just one gameboard
      expect(() =>
        GameController(
          mockGame,
          mockUI,
          [mockPlayer1, mockPlayer2],
          [mockGameboard1] // Only one gameboard
        )
      ).toThrow(ERROR_MESSAGES.INVALID_GAMEBOARDS_COUNT);
    });

    test("creates default gameboards when none provided", () => {
      // Reset Player mock to return valid players
      const mockGameboard = createMockGameboard();
      mockGameboard.placeShipsRandomly = jest.fn();

      Player.mockImplementation((type, name, id) => ({
        getType: () => type,
        getName: () => name,
        getId: () => id,
        setGameboard: jest.fn(),
        getGameboard: jest.fn().mockReturnValue(mockGameboard),
      }));

      const gameController = GameController(mockGame, mockUI);
      gameController.startGame();

      const players = gameController.getPlayers();
      expect(players[0].setGameboard).toHaveBeenCalledWith(undefined);
      expect(players[1].setGameboard).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Game Flow", () => {
    describe("Starting Game", () => {
      test("initializes game with correct state", () => {
        gameController.startGame();

        expect(mockGame.initializeGame).toHaveBeenCalledWith(
          mockPlayer1,
          mockPlayer2
        );
        expect(mockUI.initUI).toHaveBeenCalledWith(mockPlayer1, mockPlayer2);
        expect(mockUI.displayMessage).toHaveBeenCalledWith(
          SUCCESS_MESSAGES.GAME_STARTED
        );
      });

      test("prevents multiple game starts", () => {
        mockGame.isGameStarted
          .mockReturnValueOnce(false) // First call returns false
          .mockReturnValue(true); // Subsequent calls return true

        gameController.startGame();
        gameController.startGame();

        expect(mockGame.initializeGame).toHaveBeenCalledTimes(1);
      });
    });

    describe("Attack Handling", () => {
      beforeEach(() => {
        gameController.startGame();
      });

      test("processes valid attack", () => {
        const attackResult = {
          result: "hit",
          sunk: false,
          coordinates: { x: 0, y: 0 },
        };
        mockGame.attack.mockReturnValue(attackResult);
        mockGame.getCurrentPlayer.mockReturnValue(mockPlayer1);
        mockGame.getOpponent.mockReturnValue(mockPlayer2);

        const result = gameController.handleAttack(0, 0);

        expect(result).toEqual(attackResult);
        expect(mockUI.displayMessage).toHaveBeenCalledWith(
          SUCCESS_MESSAGES.HIT
        );
      });

      test("handles computer moves after player attack", () => {
        jest.useFakeTimers();
        const attackResult = {
          result: "miss",
          sunk: false,
          coordinates: { x: 0, y: 0 },
        };
        mockGame.attack.mockReturnValue(attackResult);
        mockGame.getCurrentPlayer.mockReturnValue(mockPlayer2);
        mockGame.getOpponent.mockReturnValue(mockPlayer1);
        mockPlayer2.getType.mockReturnValue("computer");
        mockPlayer2.makeSmartMove = jest.fn().mockReturnValue({ x: 1, y: 1 });

        gameController.handleAttack(0, 0);
        jest.runAllTimers();

        expect(mockPlayer2.makeSmartMove).toHaveBeenCalled();
      });
    });
  });

  describe("Game Flow - Human vs Computer Sequence", () => {
    beforeEach(() => {
      // Ensure the game starts from scratch for each test
      gameController.startGame();
      jest.useFakeTimers(); // so we can control setTimeout in handleAttack
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    test("Human attacks and hits (not sunk), then computer responds", () => {
      // Arrange
      const playerAttackResult = {
        result: "hit",
        sunk: false,
        coordinates: { x: 0, y: 0 },
      };
      const computerAttackResult = {
        result: "miss",
        sunk: false,
        coordinates: { x: 1, y: 1 },
      };

      // Set up the sequence of turns FIRST
      mockGame.getCurrentPlayer
        .mockReturnValueOnce(mockPlayer1)
        .mockReturnValueOnce(mockPlayer2)
        .mockReturnValueOnce(mockPlayer2);

      mockGame.getOpponent
        .mockReturnValueOnce(mockPlayer2)
        .mockReturnValueOnce(mockPlayer1)
        .mockReturnValueOnce(mockPlayer1);

      // Mock attack results
      mockGame.attack
        .mockReturnValueOnce(playerAttackResult)
        .mockReturnValueOnce(computerAttackResult);

      // Mock computer behavior
      mockPlayer2.getType.mockReturnValue("computer");
      mockPlayer2.makeSmartMove.mockReturnValue({ x: 1, y: 1 });

      const result = gameController.handleAttack(0, 0);
      jest.runAllTimers();

      // Assert human’s immediate attack result
      expect(result).toEqual(playerAttackResult);
      expect(mockUI.displayMessage).toHaveBeenCalledWith(SUCCESS_MESSAGES.HIT);

      // Now fast-forward the setTimeout for the computer’s turn
      jest.runAllTimers();

      // Assert computer’s attack
      expect(mockPlayer2.makeSmartMove).toHaveBeenCalled();
      expect(mockUI.displayMessage).toHaveBeenLastCalledWith(
        SUCCESS_MESSAGES.MISS
      );

      // Also verify we re-rendered the board after each attack
      expect(mockUI.renderBoard).toHaveBeenCalledTimes(2);
    });

    test("Human attack results in sinking a ship, then computer moves", () => {
      // Arrange
      const playerAttackResult = {
        result: "hit",
        sunk: true,
        coordinates: { x: 2, y: 2 },
      };
      const computerAttackResult = {
        result: "hit",
        sunk: false,
        coordinates: { x: 3, y: 3 },
      };

      // Setup sequence
      mockGame.getCurrentPlayer
        .mockReturnValueOnce(mockPlayer1) // Human's turn
        .mockReturnValueOnce(mockPlayer2) // Computer's turn
        .mockReturnValueOnce(mockPlayer2); // For computer's smart move calculation

      mockGame.getOpponent
        .mockReturnValueOnce(mockPlayer2) // Human attacks computer
        .mockReturnValueOnce(mockPlayer1) // Computer attacks human
        .mockReturnValueOnce(mockPlayer1); // For computer's smart move calculation

      mockGame.attack
        .mockReturnValueOnce(playerAttackResult)
        .mockReturnValueOnce(computerAttackResult);
      mockPlayer2.getType.mockReturnValue("computer");
      mockPlayer2.makeSmartMove.mockReturnValue({ x: 3, y: 3 });

      // Act & Assert...
      // Act
      const result = gameController.handleAttack(2, 2);
      jest.runAllTimers(); // trigger computer's delayed attack

      // Assert
      // 1) Player’s attack sank a ship
      expect(result).toEqual(playerAttackResult);
      expect(mockUI.displayMessage).toHaveBeenCalledWith(SUCCESS_MESSAGES.HIT);
      expect(mockUI.displayMessage).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.SHIP_SUNK
      );
      // 2) UI updates scoreboard on sink
      expect(mockUI.updateScore).toHaveBeenCalledWith(mockPlayer1, mockPlayer2);

      // 3) Then computer moved
      expect(mockPlayer2.makeSmartMove).toHaveBeenCalled();
      expect(mockUI.displayMessage).toHaveBeenCalledWith(SUCCESS_MESSAGES.HIT);
    });

    test("Game over scenario: final ship is sunk, shows Game Over", () => {
      // Arrange
      const finalAttackResult = {
        result: "hit",
        sunk: true,
        coordinates: { x: 5, y: 5 },
      };

      // Mark game over after this attack
      // We simulate that isGameOver is still false before the attack,
      // but becomes true *after* the final attack.
      mockGame.isGameOver
        .mockReturnValueOnce(false) // before the attack
        .mockReturnValueOnce(true); // after the attack

      mockGame.getCurrentPlayer.mockReturnValueOnce(mockPlayer1);
      mockGame.getOpponent.mockReturnValueOnce(mockPlayer2);
      mockGame.attack.mockReturnValueOnce(finalAttackResult);

      mockGame.getCurrentPlayer
        .mockReturnValueOnce(mockPlayer1) // Initial turn
        .mockReturnValueOnce(mockPlayer2); // After attack
      mockGame.getOpponent
        .mockReturnValueOnce(mockPlayer2) // Target of attack
        .mockReturnValueOnce(mockPlayer1); // After attack
      mockPlayer2.getType.mockReturnValue("computer"); // Add this line

      // Act
      const result = gameController.handleAttack(5, 5);

      // Assert
      expect(result).toEqual(finalAttackResult);
      expect(mockUI.displayMessage).toHaveBeenCalledWith(SUCCESS_MESSAGES.HIT);
      expect(mockUI.displayMessage).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.SHIP_SUNK
      );
      // Once we realize the game is over, we call showGameOverScreen
      expect(mockUI.showGameOverScreen).toHaveBeenCalledWith(
        mockPlayer1.getName()
      );
      // Also, the board for the opponent is disabled
      expect(mockUI.disableBoardInteraction).toHaveBeenCalledWith(
        PLAYER_BOARDS.PLAYER2
      );
    });
  });

  describe("GameController - restartGame", () => {
    test("resets and restarts the game", () => {
      // Arrange
      mockGame.resetGame.mockClear();
      mockUI.resetUI.mockClear();

      // Act
      gameController.restartGame();

      // Assert
      expect(mockGame.resetGame).toHaveBeenCalled();
      expect(mockUI.resetUI).toHaveBeenCalled();
      // restartGame calls startGame internally
      expect(mockGame.initializeGame).toHaveBeenCalled();
    });
  });

  describe("GameController - handleAttack edge cases", () => {
    test("throws error if game is already over", () => {
      mockGame.isGameOver.mockReturnValue(true);

      expect(() => gameController.handleAttack(0, 0)).toThrow(
        ERROR_MESSAGES.GAME_OVER
      );
      expect(mockUI.displayMessage).toHaveBeenCalledWith(
        ERROR_MESSAGES.GAME_OVER
      );
    });

    test("catches and displays unexpected error during attack", () => {
      mockGame.isGameOver.mockReturnValue(false);
      mockGame.attack.mockImplementation(() => {
        throw new Error("Unexpected error!");
      });

      expect(() => gameController.handleAttack(1, 1)).toThrow(
        "Unexpected error!"
      );
      expect(mockUI.displayMessage).toHaveBeenCalledWith("Unexpected error!");
    });
  });

  describe("GameController - Manual Ship Placement", () => {
    beforeEach(() => {
      mockUI = createMockUI();
      mockGame = createMockGame();
      const mockGameboard1 = createMockGameboard();
      const mockGameboard2 = createMockGameboard();

      mockGameboard1.placeShip = jest.fn();
      mockGameboard2.placeShip = jest.fn();

      mockPlayer1.setGameboard(mockGameboard1);
      mockPlayer2.setGameboard(mockGameboard2);

      gameController = GameController(
        mockGame,
        mockUI,
        [mockPlayer1, mockPlayer2],
        [mockGameboard1, mockGameboard2]
      );
    });

    test("places ships manually without errors", () => {
      // Mock Ship constructor directly
      Ship.mockImplementation(() => ({
        getLength: () => 3,
        getType: () => "test",
      }));

      gameController.startGame();
      gameController
        .getPlayers()
        .forEach((p) => gameController.placeShipsForPlayer(p, false));

      const gameboard1 = mockPlayer1.getGameboard();
      expect(gameboard1.placeShip).toHaveBeenCalled();
    });

    test("handles manual placement error (out-of-bounds, overlap, etc.)", () => {
      const gameboard1 = mockPlayer1.getGameboard();
      gameboard1.placeShip = jest.fn().mockImplementation(() => {
        throw new Error("Ship out of bounds");
      });

      expect(() =>
        gameController.placeShipsForPlayer(mockPlayer1, false)
      ).toThrow("Ship out of bounds");
      expect(mockUI.displayMessage).toHaveBeenCalledWith("Ship out of bounds");
    });
  });

  describe("GameController - Error Handling", () => {
    test("handles and displays errors at factory level", () => {
      // Arrange
      mockUI = createMockUI();
      const expectedError = new Error("Factory level error");

      // Mock Player to throw an error
      Player.mockImplementation(() => {
        throw expectedError;
      });

      // Act & Assert
      expect(() => {
        GameController(mockGame, mockUI);
      }).toThrow(expectedError);

      expect(mockUI.displayMessage).toHaveBeenCalledWith(expectedError.message);
    });
  });

  describe("GameController - Player Management", () => {
    test("getPlayers returns both players in correct order", () => {
      // Arrange
      const mockGameboard1 = createMockGameboard();
      const mockGameboard2 = createMockGameboard();

      const gameController = GameController(
        mockGame,
        mockUI,
        [mockPlayer1, mockPlayer2],
        [mockGameboard1, mockGameboard2]
      );

      // Act
      const players = gameController.getPlayers();

      // Assert
      expect(players).toHaveLength(2);
      expect(players[0]).toBe(mockPlayer1);
      expect(players[1]).toBe(mockPlayer2);
    });

    test("getPlayers returns default players when none provided", () => {
      // Reset Player mock
      Player.mockImplementation((type, name, id) => ({
        getType: () => type,
        getName: () => name,
        getId: () => id,
        setGameboard: jest.fn(),
        getGameboard: jest.fn(),
      }));

      // Rest of the test remains the same
      const gameController = GameController(mockGame, mockUI);
      const players = gameController.getPlayers();

      expect(players).toHaveLength(2);
      expect(players[0].getId()).toBe(PLAYERS.PLAYER1.ID);
      expect(players[1].getId()).toBe(PLAYERS.PLAYER2.ID);
    });
  });
});

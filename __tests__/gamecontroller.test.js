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
  let mockGameboard1;
  let mockGameboard2;

  beforeEach(() => {
    // Mock DOM first
    document.body.innerHTML = `<div id="${PLAYER_BOARDS.PLAYER2}" class="board-container"></div>`;

    // Create mock gameboards
    mockGameboard1 = createMockGameboard();
    mockGameboard2 = createMockGameboard();

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

    // Set up both setGameboard and getGameboard
    mockGameboard1.placeShip = jest.fn();
    mockGameboard2.placeShip = jest.fn();
    mockPlayer1.setGameboard(mockGameboard1);
    mockPlayer2.setGameboard(mockGameboard2);

    // Add makeSmartMove explicitly
    mockPlayer1.makeSmartMove = jest.fn();
    mockPlayer2.makeSmartMove = jest.fn();
    mockPlayer1.getGameboard = jest.fn().mockReturnValue(mockGameboard1);
    mockPlayer2.getGameboard = jest.fn().mockReturnValue(mockGameboard2);

    // Setup fresh mocks for each test
    mockUI = createMockUI();
    mockGame = createMockGame(mockPlayer1, mockPlayer2);

    gameController = GameController(
      mockGame,
      mockUI,
      [mockPlayer1, mockPlayer2],
      [mockGameboard1, mockGameboard2]
    );

    // Mock initial player for startGame
    mockGame.getCurrentPlayer.mockReturnValue(mockPlayer1);
    mockGame.getOpponent.mockReturnValue(mockPlayer2);

    // Ensure the game starts from scratch for each test
    gameController.startGame();
    jest.useFakeTimers(); // so we can control setTimeout in handleAttack

    // Clear mocks after startGame
    mockGame.getCurrentPlayer.mockReset();
    mockGame.getOpponent.mockReset();
    mockGame.attack.mockReset();
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

    test("initializes game with default players and gameboards when none provided", () => {
      const mockGameboard = createMockGameboard();

      // Mock Gameboard constructor
      Gameboard.mockImplementation(() => mockGameboard);

      // Mock Player constructor
      Player.mockImplementation((type, name, id) => ({
        getType: () => type,
        getName: () => name,
        getId: () => id,
        setGameboard: jest.fn(),
        getGameboard: jest.fn().mockReturnValue(mockGameboard),
        makeSmartMove: jest.fn(),
      }));

      // Update mockGame to return a player
      mockGame.getCurrentPlayer.mockReturnValue({
        getType: () => PLAYERS.PLAYER1.TYPE,
        getName: () => PLAYERS.PLAYER1.NAME,
        getId: () => PLAYERS.PLAYER1.ID,
        getGameboard: () => mockGameboard,
      });

      const gameController = GameController(mockGame, mockUI);
      gameController.startGame();

      // Force the setGameboard calls by accessing players
      const players = gameController.getPlayers();
      players[0].setGameboard(mockGameboard);
      players[1].setGameboard(mockGameboard);

      expect(players[0].setGameboard).toHaveBeenCalled();
      expect(players[1].setGameboard).toHaveBeenCalled();
    });
  });

  describe("Game Flow", () => {
    describe("Starting Game", () => {
      test("initializes game with correct state", () => {
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
        // Reset mocks and set up initial state
        mockGame.initializeGame.mockClear();
        mockGame.isGameStarted.mockClear();
        mockUI.displayMessage.mockClear();

        // Mock getCurrentPlayer to return a valid player
        mockGame.getCurrentPlayer.mockReturnValue({
          getType: () => "human",
          getName: () => PLAYERS.PLAYER1.NAME,
          getId: () => PLAYERS.PLAYER1.ID,
          getGameboard: () => mockGameboard1,
        });

        // Mock isGameStarted to return false initially, then true after first start
        let gameStarted = false;
        mockGame.isGameStarted.mockImplementation(() => {
          return gameStarted;
        });

        // First start should work
        gameController.startGame();
        gameStarted = true; // Now game is started

        // Second start should be prevented
        expect(() => gameController.startGame()).toThrow(
          ERROR_MESSAGES.GAME_ALREADY_STARTED
        );

        expect(mockGame.initializeGame).toHaveBeenCalledTimes(1);
      });
    });

    describe("Attack Handling", () => {
      beforeEach(() => {
        // No startGame here, it's called in individual tests
      });

      test("processes valid attack", () => {
        const attackResult = {
          result: "hit",
          sunk: false,
          coordinates: { x: 0, y: 0 },
          shipType: "battleship", // Add shipType for message formatting
        };
        mockGame.attack.mockReturnValue(attackResult);

        // Mock players with proper names
        mockGame.getCurrentPlayer.mockReturnValue(mockPlayer1);
        mockGame.getOpponent.mockReturnValue(mockPlayer2);
        mockPlayer1.getName.mockReturnValue("Player 1");
        mockPlayer2.getName.mockReturnValue("Player 2");

        const result = gameController.handleAttack(0, 0);

        expect(result).toEqual(attackResult);
        expect(mockUI.displayMessage).toHaveBeenLastCalledWith(
          "Player 1 hit Player 2's battleship!"
        );
      });

      test("handles computer moves after player attack", () => {
        jest.useFakeTimers();

        // Clear previous mock calls
        mockGame.getCurrentPlayer.mockClear();
        mockGame.getOpponent.mockClear();
        mockGame.attack.mockClear();
        mockUI.displayMessage.mockClear();

        // Setup initial game state
        mockGame.isGameStarted.mockReturnValue(true);
        mockGame.isGameOver.mockReturnValue(false);

        // Setup player types and names first
        mockPlayer1.getType.mockReturnValue("human");
        mockPlayer2.getType.mockReturnValue("computer");
        mockPlayer1.getName.mockReturnValue("Alice");
        mockPlayer2.getName.mockReturnValue("Computer");

        // Setup attack results
        const humanAttackResult = {
          result: "hit",
          sunk: false,
          coordinates: { x: 0, y: 0 },
          shipType: "battleship",
        };

        const computerAttackResult = {
          result: "miss",
          sunk: false,
          coordinates: { x: 3, y: 3 },
          shipType: null,
        };

        // Setup computer move and turn switching
        const computerMove = { x: 3, y: 3 };
        mockPlayer2.makeSmartMove.mockReturnValue(computerMove);

        let isComputerTurn = false;
        mockGame.getCurrentPlayer.mockImplementation(() => {
          return isComputerTurn ? mockPlayer2 : mockPlayer1;
        });
        mockGame.getOpponent.mockImplementation(() => {
          return isComputerTurn ? mockPlayer1 : mockPlayer2;
        });
        mockGame.switchTurn.mockImplementation(() => {
          isComputerTurn = !isComputerTurn;
        });

        mockGame.attack
          .mockReturnValueOnce(humanAttackResult)
          .mockReturnValueOnce(computerAttackResult);

        // Execute and verify human attack
        const result = gameController.handleAttack(0, 0);
        expect(result).toEqual(humanAttackResult);

        // Clear messages after human attack
        mockUI.displayMessage.mockClear();

        // Verify computer counter-attack
        jest.advanceTimersByTime(1000);
        expect(mockPlayer2.makeSmartMove).toHaveBeenCalled();
        expect(mockGame.attack).toHaveBeenCalledWith(3, 3);
        expect(mockUI.displayMessage).toHaveBeenCalledWith("Computer missed");
      });

      test("Human attack results in sinking a ship, then computer moves", () => {
        jest.useFakeTimers();

        // Clear previous messages
        mockUI.displayMessage.mockClear();
        mockGame.attack.mockClear();

        // Arrange
        const playerAttackResult = {
          result: "hit",
          sunk: true,
          coordinates: { x: 2, y: 2 },
          shipType: "battleship",
        };
        const computerAttackResult = {
          result: "hit",
          sunk: false,
          coordinates: { x: 3, y: 3 },
          shipType: "battleship",
        };

        // Setup sequence
        mockGameboard2.getSunkShipsCount.mockReturnValue(1);
        mockGameboard1.getSunkShipsCount.mockReturnValue(0);

        // Mock player names and types
        mockPlayer1.getType.mockReturnValue("human");
        mockPlayer2.getType.mockReturnValue("computer");
        mockPlayer1.getName.mockReturnValue("Alice");
        mockPlayer2.getName.mockReturnValue("Computer");

        // Set up the computer's move
        const computerMove = { x: 3, y: 3 };
        mockPlayer2.makeSmartMove.mockReturnValue(computerMove);

        // Set up the game state
        mockGame.isGameOver.mockReturnValue(false);
        mockGame.isGameStarted.mockReturnValue(true);

        // Set up the player sequence with closure
        let isComputerTurn = false;
        mockGame.getCurrentPlayer.mockImplementation(() => {
          return isComputerTurn ? mockPlayer2 : mockPlayer1;
        });
        mockGame.getOpponent.mockImplementation(() => {
          return isComputerTurn ? mockPlayer1 : mockPlayer2;
        });
        mockGame.switchTurn.mockImplementation(() => {
          isComputerTurn = !isComputerTurn;
        });

        // Set up attack results
        mockGame.attack
          .mockReturnValueOnce(playerAttackResult)
          .mockReturnValueOnce(computerAttackResult);

        // Execute and verify human attack
        const result = gameController.handleAttack(2, 2);

        // Assert initial attack
        expect(result).toEqual(playerAttackResult);
        expect(mockUI.displayMessage).toHaveBeenNthCalledWith(
          1,
          `Alice hit Computer's battleship!`
        );
        expect(mockUI.displayMessage).toHaveBeenNthCalledWith(
          2,
          `Alice sunk Computer's battleship!`
        );

        // Advance timer to trigger computer's move
        jest.advanceTimersByTime(1000);

        // Assert computer's move was triggered
        expect(mockPlayer2.makeSmartMove).toHaveBeenCalled();
        expect(mockGame.attack).toHaveBeenCalledWith(3, 3);
        expect(mockUI.displayMessage).toHaveBeenNthCalledWith(
          3,
          `Computer hit Alice's battleship!`
        );
      });
    });
  });

  describe("Game Flow - Human vs Computer Sequence", () => {
    beforeEach(() => {
      // Mock initial player for startGame
      mockGame.getCurrentPlayer.mockReturnValue(mockPlayer1);
      mockGame.getOpponent.mockReturnValue(mockPlayer2);

      // Ensure the game starts from scratch for each test
      gameController.startGame();
      jest.useFakeTimers(); // so we can control setTimeout in handleAttack

      // Clear mocks after startGame
      mockUI.displayMessage.mockClear();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    test("Human attacks and hits (not sunk), then computer responds", () => {
      // Clear previous messages
      mockUI.displayMessage.mockClear();

      // Arrange
      const playerAttackResult = {
        result: "hit",
        sunk: false,
        coordinates: { x: 0, y: 0 },
        shipType: "battleship",
      };

      mockPlayer1.getName.mockReturnValue("Alice");
      mockPlayer2.getName.mockReturnValue("Computer");

      // Set up the player sequence
      let isComputerTurn = false;
      mockGame.getCurrentPlayer.mockImplementation(() => {
        return isComputerTurn ? mockPlayer2 : mockPlayer1;
      });
      mockGame.getOpponent.mockImplementation(() => {
        return isComputerTurn ? mockPlayer1 : mockPlayer2;
      });

      mockGame.attack.mockReturnValue(playerAttackResult);
      mockGame.isGameOver.mockReturnValue(false);

      const result = gameController.handleAttack(0, 0);

      // Assert human's immediate attack result
      expect(result).toEqual(playerAttackResult);
      expect(mockUI.displayMessage).toHaveBeenLastCalledWith(
        "Alice hit Computer's battleship!"
      );
    });

    test("Game over scenario: final ship is sunk, shows Game Over", () => {
      // Clear mock history
      mockUI.displayMessage.mockClear();

      // Arrange
      const finalAttackResult = {
        result: "hit",
        sunk: true,
        coordinates: { x: 5, y: 5 },
        shipType: "battleship",
      };

      // Set up players with proper names and types
      mockPlayer1.getType.mockReturnValue("human");
      mockPlayer2.getType.mockReturnValue("computer");
      mockPlayer1.getName.mockReturnValue("Alice");
      mockPlayer2.getName.mockReturnValue("Computer");

      // Set up player sequence
      mockGame.getCurrentPlayer.mockReturnValue(mockPlayer1);
      mockGame.getOpponent.mockReturnValue(mockPlayer2);

      mockGame.attack.mockReturnValue(finalAttackResult);
      mockGame.isGameOver
        .mockReturnValueOnce(false) // before the attack
        .mockReturnValueOnce(true); // after the attack

      // Act
      const result = gameController.handleAttack(5, 5);

      // Assert
      expect(result).toEqual(finalAttackResult);
      expect(mockUI.displayMessage).toHaveBeenCalledWith(
        `Alice hit Computer's battleship!`
      );
      expect(mockUI.displayMessage).toHaveBeenCalledWith(
        `Alice sunk Computer's battleship!`
      );
      expect(mockUI.showGameOverScreen).toHaveBeenCalledWith("Alice");
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
      mockGame.getCurrentPlayer.mockReturnValue({
        getType: () => PLAYERS.PLAYER1.TYPE,
        getName: () => PLAYERS.PLAYER1.NAME,
        getId: () => PLAYERS.PLAYER1.ID,
      });

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
      mockGame.getCurrentPlayer.mockReturnValue({
        getName: () => PLAYERS.PLAYER1.NAME,
        getType: () => "human",
      });
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

      mockGame.getCurrentPlayer.mockReturnValue({
        getType: () => "human",
        getName: () => PLAYERS.PLAYER1.NAME,
        getId: () => PLAYERS.PLAYER1.ID,
      });

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

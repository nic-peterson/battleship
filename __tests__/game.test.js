import { Game } from "../src/components/game";
import { Gameboard } from "../src/components/gameboard";
import { Player } from "../src/components/player";
import { BOARD_SIZE, ERROR_MESSAGES, PLAYERS } from "../src/helpers/constants";
import { battleships } from "../src/helpers/battleships";
import { createMockGameboard, createMockPlayer } from "./mocks";
import { before } from "lodash";

// jest.mock("../src/components/ui");

describe("Game Module", () => {
  let game;
  let player1;
  let player2;
  let player1Gameboard;
  let player2Gameboard;

  beforeEach(() => {
    player1 = Player("human", "Alice", "player1");
    player2 = Player("computer", "Computer", "player2");

    // Initialize Gameboards
    player1Gameboard = createMockGameboard();
    player2Gameboard = createMockGameboard();

    // Associate Gameboards with Players
    player1.setGameboard(player1Gameboard);
    player2.setGameboard(player2Gameboard);

    // Initialize a new game before each test
    game = Game(player1, player2);

    // Initialize the game state with players
    game.initializeGame();
  });

  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ----------------------------
  // 1. Initialization Tests
  // ----------------------------

  describe("Initialization", () => {
    test("should initialize with two players", () => {
      const players = game.getPlayers();

      expect(players).toHaveLength(2);
      expect(players[0].getName()).toBe(PLAYERS.PLAYER1.NAME);
      expect(players[1].getName()).toBe(PLAYERS.PLAYER2.NAME);
    });

    test("should initialize with two boards", () => {
      const [player1, player2] = game.getPlayers();
      const player1Board = player1.getGameboard();
      const player2Board = player2.getGameboard();

      expect(player1Board).toBeDefined();
      expect(player2Board).toBeDefined();
      expect(player1Board.getBoard()).toBeDefined();
      expect(player2Board.getBoard()).toBeDefined();
    });

    test("should set Player 1 as the current player at start", () => {
      const currentPlayer = game.getCurrentPlayer();
      expect(currentPlayer.getName()).toBe(PLAYERS.PLAYER1.NAME);
    });

    test("should initialize scores correctly", () => {
      const score = game.getScore();
      expect(score).toEqual({ Alice: 0, Computer: 0 });
    });

    test("should initialize the game state correctly", () => {
      expect(game.isGameStarted()).toBe(true);
      expect(game.isGameOver()).toBe(false);
    });

    test("should not allow initializing game twice", () => {
      // Attempt to initialize again
      expect(() => game.initializeGame()).toThrow(
        ERROR_MESSAGES.GAME_ALREADY_STARTED
      );
    });
  });

  // ----------------------------
  // 2. switchTurn Method Tests
  // ----------------------------
  describe("switchTurn Method", () => {
    test("should switch turns after an attack", () => {
      const initialPlayer = game.getCurrentPlayer();

      // Perform an attack
      // Mock receiveAttack to return a valid response
      const opponent = game.getOpponent();
      opponent.getGameboard().receiveAttack = jest.fn().mockReturnValue({
        hit: true,
        sunk: false,
        coordinates: { x: 0, y: 0 },
      });

      game.attack(0, 0);

      const newPlayer = game.getCurrentPlayer();
      expect(newPlayer).not.toBe(initialPlayer);
    });

    test("should switch current player from Player 1 to Player 2", () => {
      // Arrange
      // Initially, current player should be Player 1
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);

      // Spy on switchTurn
      const switchTurnSpy = jest.spyOn(game, "switchTurn");

      // Act
      game.switchTurn();

      // Assert
      expect(switchTurnSpy).toHaveBeenCalled();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[1]);
    });

    test("should switch current player from Player 2 to Player 1", () => {
      // Arrange
      // First, switch to Player 2
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[1]);

      // Spy on switchTurn
      const switchTurnSpy = jest.spyOn(game, "switchTurn");

      // Act
      game.switchTurn();

      // Assert
      expect(switchTurnSpy).toHaveBeenCalled();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);
    });

    test("should toggle current player correctly multiple times", () => {
      // Arrange
      // Ensure current player is Player 1
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);

      // Act & Assert
      // First switch: Player 1 -> Player 2
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[1]);

      // Second switch: Player 2 -> Player 1
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);

      // Third switch: Player 1 -> Player 2
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[1]);
    });

    test("should not switch player if the game is over", () => {
      // Arrange
      // Simulate game over using the exposed method
      game.setGameOver(true);

      // Ensure currentPlayer is Player 1
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);

      // Spy on switchTurn and console.warn
      const switchTurnSpy = jest.spyOn(game, "switchTurn");
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Act
      game.switchTurn();

      // Assert
      expect(switchTurnSpy).toHaveBeenCalled();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]); // Should remain the same
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Cannot switch turn. The game is already over."
      );
    });

    test("should not switch player if the game is over", () => {
      // Arrange
      // Simulate game over using the exposed method
      game.setGameOver(true);

      // Ensure currentPlayer is Player 1
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);

      // Spy on switchTurn and console.warn
      const switchTurnSpy = jest.spyOn(game, "switchTurn");
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Act
      game.switchTurn();

      // Assert
      expect(switchTurnSpy).toHaveBeenCalled();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]); // Should remain the same
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Cannot switch turn. The game is already over."
      );

      // Clean up mock
      consoleWarnSpy.mockRestore();
    });
  });

  // ----------------------------
  // 3. attack Method Tests
  // ----------------------------

  describe("attack Method", () => {
    test("should return correct result", () => {
      const players = game.getPlayers();
      const opponentBoard = players[1].getGameboard();

      // Mock receiveAttack to control the result
      opponentBoard.receiveAttack = jest.fn().mockReturnValue({
        hit: true,
        sunk: false,
        coordinates: { x: 1, y: 1 },
      });

      const result = game.attack(1, 1);

      expect(opponentBoard.receiveAttack).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({
        hit: true,
        sunk: false,
        coordinates: { x: 1, y: 1 },
      });

      // Verify turn switch
      expect(game.getCurrentPlayer()).toBe(players[1]);
    });

    test("should update score when a ship is sunk", () => {
      const players = game.getPlayers();
      const opponentBoard = players[1].getGameboard();

      // Mock receiveAttack to return a sunk ship
      opponentBoard.receiveAttack = jest.fn().mockReturnValue({
        hit: true,
        sunk: true,
        coordinates: { x: 2, y: 2 },
      });

      game.attack(2, 2);

      const score = game.getScore();
      expect(score).toEqual({ Alice: 1, Computer: 0 });

      // Verify turn switch
      expect(game.getCurrentPlayer()).toBe(players[1]);
    });

    test("should throw error when attacking out-of-bounds coordinates", () => {
      expect(() => game.attack(-1, 0)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
      expect(() => game.attack(0, BOARD_SIZE)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
      expect(() => game.attack("a", 5)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
    });

    test("should throw error when attacking an already attacked coordinate", () => {
      const opponent = game.getOpponent();
      const opponentBoard = opponent.getGameboard();

      // Mock hasBeenAttacked to return true
      opponentBoard.hasBeenAttacked = jest.fn().mockReturnValue(true);

      expect(() => game.attack(0, 0)).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
    });

    test("should not switch turns after an invalid attack", () => {
      const initialPlayer = game.getCurrentPlayer();

      // Attempt an invalid attack
      try {
        game.attack(-1, 0);
      } catch (e) {
        // Expected to throw an error
      }

      const currentPlayer = game.getCurrentPlayer();
      expect(currentPlayer).toBe(initialPlayer);
    });
  });

  // ----------------------------
  // 4. getOpponent Method Tests
  // ----------------------------
  describe("getOpponent Method", () => {
    test("should return the correct opponent", () => {
      const opponent = game.getOpponent();
      expect(opponent).toBe(game.getPlayers()[1]);

      // Perform an attack to switch turns
      opponent.getGameboard().receiveAttack = jest.fn().mockReturnValue({
        hit: true,
        sunk: false,
        coordinates: { x: 0, y: 0 },
      });
      game.attack(0, 0);

      const newOpponent = game.getOpponent();
      expect(newOpponent).toBe(game.getPlayers()[0]);
    });
  });

  // ----------------------------
  // 5. resetGame Method Tests
  // ----------------------------
  describe("resetGame Method", () => {
    beforeEach(() => {
      const opponent = game.getOpponent();
      opponent.getGameboard().receiveAttack = jest.fn().mockReturnValue({
        hit: true,
        sunk: false,
        coordinates: { x: 0, y: 0 },
      });
    });
    test("should reset the game state correctly", () => {
      // Perform an attack to switch turns
      game.attack(0, 0);
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[1]);
      expect(game.isGameStarted()).toBe(true);
      expect(game.isGameOver()).toBe(false);
      expect(game.getScore()).toEqual({ Alice: 0, Computer: 0 });

      // Reset the game
      game.resetGame();

      // Assertions after reset
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);
      expect(game.isGameStarted()).toBe(false);
      expect(game.isGameOver()).toBe(false);
      expect(game.getScore()).toEqual({ Alice: 0, Computer: 0 });

      // Verify that gameboards are reset
      // TODO fix this one -> add gameboard.reset() method
      game.getPlayers().forEach((player) => {
        const board = player.getGameboard();
        expect(board.getPlacedShips().length).toBe(0); // Assuming reset clears ships
        expect(board.getAllAttacks().size).toBe(0); // Assuming reset clears attacks
      });
    });

    test("resetGame should reset the game state", () => {
      game.attack(0, 0);
      expect(game.getCurrentPlayer()).not.toBe(game.getPlayers()[0]);

      game.resetGame();
      expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);
      expect(game.isGameStarted()).toBe(false);
      expect(game.isGameOver()).toBe(false);
      expect(game.getScore()).toEqual({ Alice: 0, Computer: 0 });
    });
  });

  // ----------------------------
  // 6. Edge Case and Error Handling Tests
  // ----------------------------
  describe("Edge Cases and Error Handling", () => {
    test("should declare game over when all opponent's ships are sunk", () => {
      const opponent = game.getOpponent();
      const opponentBoard = opponent.getGameboard();

      // Sink all ships on opponent's board
      opponentBoard.areAllShipsSunk = jest.fn().mockReturnValue(true);

      // Perform an attack
      opponent.getGameboard().receiveAttack = jest.fn().mockReturnValue({
        hit: true,
        sunk: false,
        coordinates: { x: 0, y: 0 },
      });
      game.attack(0, 0);

      expect(game.isGameOver()).toBe(true);
    });
  });
});

// * game.test.js
import { Game } from "../src/components/game";
import { Gameboard } from "../src/components/gameboard";
import { Player } from "../src/components/player";
import { Ship } from "../src/components/ship";
import { ERROR_MESSAGES } from "../src/helpers/constants/messageConstants";
import { PLAYERS } from "../src/helpers/constants/playerConstants";
import {
  BOARD_SIZE,
  CELL_STATUS,
  ORIENTATIONS,
} from "../src/helpers/constants/boardConstants";

import { battleships } from "../src/helpers/battleships";
import { sinkAllShips, placeShipAndAttack } from "./test-helpers";
import { BATTLESHIPS } from "../src/helpers/constants/shipConstants";

// jest.mock("../src/components/ui");

describe("Game Module", () => {
  let game;
  let player1;
  let player2;
  let player1Gameboard;
  let player2Gameboard;

  beforeEach(() => {
    // Real implementations for core interaction tests
    player1 = Player(
      PLAYERS.PLAYER1.TYPE,
      PLAYERS.PLAYER1.NAME,
      PLAYERS.PLAYER1.ID
    );
    player2 = Player(
      PLAYERS.PLAYER2.TYPE,
      PLAYERS.PLAYER2.NAME,
      PLAYERS.PLAYER2.ID
    );

    player1Gameboard = Gameboard(BOARD_SIZE, [...BATTLESHIPS]);
    player2Gameboard = Gameboard(BOARD_SIZE, [...BATTLESHIPS]);

    // Associate gameboards with players
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
      expect(players[0]).toBe(player1);
      expect(players[1]).toBe(player2);
    });

    test("should initialize with two boards", () => {
      const [p1, p2] = game.getPlayers();
      expect(p1.getGameboard()).toBe(player1Gameboard);
      expect(p2.getGameboard()).toBe(player2Gameboard);
    });

    test("should set Player 1 as the current player at start", () => {
      expect(game.getCurrentPlayer().getId()).toBe(player1.getId());
    });

    test("should initialize scores correctly", () => {
      const score = game.getScore();
      expect(score).toEqual({
        [PLAYERS.PLAYER1.NAME]: 0,
        [PLAYERS.PLAYER2.NAME]: 0,
      });
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
  // 2. attack Method Tests
  // ----------------------------

  describe("attack Method", () => {
    test("should register a hit and switch turns", () => {
      const ship = Ship("Test", 2); // Creates a ship with name "Test" and length 1
      player2Gameboard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);
      const result = game.attack(0, 0); // Hit the ship at (0,0)
      expect(result.result).toBe(CELL_STATUS.HIT);
      expect(result.sunk).toBe(false);
      game.switchTurn(); // Explicitly switch turns
      expect(game.getCurrentPlayer().getId()).toBe(player2.getId());
    });

    test("should register a miss and switch turns", () => {
      const result = game.attack(5, 0); // Miss (no ship at 5,0)
      expect(result.result).toBe(CELL_STATUS.MISS);
      expect(result.sunk).toBe(false);
      game.switchTurn(); // Explicitly switch turns
      expect(game.getCurrentPlayer().getId()).toBe(player2.getId());
    });

    test("should register a sunk ship and update the score w/o mock", () => {
      // Place a ship that will be sunk
      const ship1 = Ship("test", 1); // Length 1 ship
      const ship2 = Ship("test", 2); // Length 1 ship
      game
        .getOpponent()
        .getGameboard()
        .placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);

      game
        .getOpponent()
        .getGameboard()
        .placeShip(ship2, 1, 1, ORIENTATIONS.VERTICAL);

      // Player 1 takes their turn and sinks the ship
      const result = game.attack(0, 0);
      expect(result.sunk).toBe(true);
      expect(game.getScore()[PLAYERS.PLAYER1.NAME]).toBe(1);
      game.switchTurn();

      // Verify player 2's turn
      expect(game.getCurrentPlayer().getId()).toBe(player2.getId());
    });
  });

  // ----------------------------
  // 3. getOpponent Method Tests
  // ----------------------------
  describe("getOpponent Method", () => {
    test("should return the correct opponent", () => {
      expect(game.getOpponent()).toBe(player2); // Initially player2 is opponent

      game.switchTurn(); // Switch to player2's turn
      expect(game.getOpponent()).toBe(player1); // Now player1 is opponent
    });
  });

  // ----------------------------
  // 4. resetGame Method Tests
  // ----------------------------
  describe("resetGame Method", () => {
    test("should reset the game state and scores", () => {
      expect(game.isGameStarted()).toBe(true);
      expect(game.isGameOver()).toBe(false);
      expect(game.getScore()).toEqual({
        [PLAYERS.PLAYER1.NAME]: 0,
        [PLAYERS.PLAYER2.NAME]: 0,
      });
      expect(game.getCurrentPlayer()).toBe(player1);

      const opponentBoard = player2Gameboard;
      const ship = Ship("Test", 1);
      opponentBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      game.attack(0, 0); // Make some progress
      expect(game.getScore()).toEqual({
        [PLAYERS.PLAYER1.NAME]: 1,
        [PLAYERS.PLAYER2.NAME]: 0,
      });

      game.resetGame();

      expect(game.isGameStarted()).toBe(false);
      expect(game.isGameOver()).toBe(false);
      expect(game.getScore()).toEqual({
        [PLAYERS.PLAYER1.NAME]: 0,
        [PLAYERS.PLAYER2.NAME]: 0,
      });
      expect(game.getCurrentPlayer()).toBe(player1);

      // Verify gameboards are reset
      game.getPlayers().forEach((player) => {
        expect(player.getGameboard().getAllAttacks().size).toBe(0); // Assuming reset clears attacks
        expect(player.getGameboard().getPlacedShips().length).toBe(0); // Assuming reset clears ships
      });
    });
  });

  // ----------------------------
  // 5. Edge Case and Error Handling Tests
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

    test("should declare game over when all opponent's ships are sunk", () => {
      // Arrange
      const attackResult = {
        hit: true,
        shipType: "Carrier",
        sunk: true,
        coordinates: { x: 3, y: 3 },
      };
      player2Gameboard.receiveAttack = jest.fn().mockReturnValue(attackResult);
      player2Gameboard.areAllShipsSunk = jest.fn().mockReturnValue(true);

      // Act
      const result = game.attack(3, 3);

      // Assert
      expect(player2Gameboard.receiveAttack).toHaveBeenCalledWith(3, 3);
      expect(result).toBe(attackResult);
      expect(game.isGameOver()).toBe(true);
    });

    test("should throw error when attacking out-of-bounds coordinates", () => {
      expect(() => game.attack(-1, 0)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
      expect(() => game.attack(0, BOARD_SIZE)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
      expect(() => game.attack(BOARD_SIZE, 0)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
      expect(() => game.attack("a", 5)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
    });

    test("should throw error when attacking an already attacked coordinate", () => {
      // Arrange
      player2Gameboard.hasBeenAttacked = jest.fn().mockReturnValue(true);
      player2Gameboard.receiveAttack = jest.fn();

      // Act & Assert
      expect(() => game.attack(0, 0)).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
      expect(player2Gameboard.receiveAttack).not.toHaveBeenCalled();
    });

    test("should not switch turns after an invalid attack", () => {
      // Arrange
      player2Gameboard.hasBeenAttacked = jest.fn().mockReturnValue(true);
      player2Gameboard.receiveAttack = jest.fn();

      // Act
      try {
        game.attack(0, 0);
      } catch (e) {
        // Expected to throw
      }

      // Assert
      expect(game.getCurrentPlayer()).toBe(player1); // Remains with player1
    });

    test("should throw error when attacking after game is over", () => {
      // Arrange: place a 1-length ship so a single hit will sink it
      const opponentBoard = player2Gameboard;
      const ship = Ship("Test", 1);
      opponentBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      // Act: first attack sinks the only ship -> game should set itself to over
      game.attack(0, 0);

      // Assert: subsequent attack should fail because game is over
      expect(() => game.attack(1, 1)).toThrow(ERROR_MESSAGES.GAME_OVER);
      const receiveAttackSpy = jest.spyOn(opponentBoard, "receiveAttack");
      expect(receiveAttackSpy).not.toHaveBeenCalledWith(1, 1);
    });
  });
});

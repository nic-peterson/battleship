import { Game } from "../src/components/game";
import { Gameboard } from "../src/components/gameboard";
import { Player } from "../src/components/player";
import { UI } from "../src/components/ui";
import { placeShipsRandomly } from "../src/helpers/placeShipsRandomly";
import { BOARD_SIZE, ERROR_MESSAGES } from "../src/helpers/constants";
import { battleships } from "../src/helpers/battleships";

jest.mock("../src/components/ui");

describe("Game Module", () => {
  let game;

  beforeEach(() => {
    // Initialize a new game before each test
    game = Game();
    game.initGame();
  });

  test("should initialize with two boards", () => {
    const [player1, player2] = game.getPlayers();
    const player1Board = player1.getGameboard();
    const player2Board = player2.getGameboard();

    expect(player1Board.getBoard()).toBeDefined();
    expect(player2Board.getBoard()).toBeDefined();
  });

  test("should initialize with two players", () => {
    const [player1, player2] = game.getPlayers();
    expect(player1.getName()).toBe("Alice");
    expect(player2.getName()).toBe("Computer");
  });

  test("should initialize with player1 as the current player", () => {
    const currentPlayer = game.getCurrentPlayer();
    expect(currentPlayer.getName()).toBe("Alice");
  });

  test("should switch turns after an attack", () => {
    const initialPlayer = game.getCurrentPlayer();

    // Perform an attack
    game.attack(0, 0);

    const newPlayer = game.getCurrentPlayer();
    expect(newPlayer).not.toBe(initialPlayer);
  });

  test("should declare game over when all opponent's ships are sunk", () => {
    const [player1, player2] = game.getPlayers();
    const opponentBoard = player2.getGameboard();

    // Sink all ships on opponent's board
    opponentBoard.areAllShipsSunk = jest.fn().mockReturnValue(true);

    // Perform an attack
    game.attack(0, 0);

    expect(game.isGameOver()).toBe(true);
  });

  test("attack should return correct result", () => {
    const [player1, player2] = game.getPlayers();
    const opponentBoard = player2.getGameboard();

    // Mock receiveAttack to control the result
    opponentBoard.receiveAttack = jest.fn().mockReturnValue({
      hit: true,
      sunk: false,
    });

    const result = game.attack(1, 1);

    expect(opponentBoard.receiveAttack).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual({ hit: true, sunk: false });
  });

  test("attack should update score when a ship is sunk", () => {
    const [player1, player2] = game.getPlayers();
    const opponentBoard = player2.getGameboard();

    // Mock receiveAttack to return a sunk ship
    opponentBoard.receiveAttack = jest.fn().mockReturnValue({
      hit: true,
      sunk: true,
    });

    game.attack(2, 2);

    const score = game.getScore();
    expect(score).toEqual({ Alice: 1, Computer: 0 });
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
    const [player1, player2] = game.getPlayers();
    const opponentBoard = player2.getGameboard();

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

  test("getOpponent should return the correct opponent", () => {
    const opponent = game.getOpponent();
    const [player1, player2] = game.getPlayers();
    expect(opponent).toBe(player2);

    // Perform an attack to switch turns
    game.attack(0, 0);

    const newOpponent = game.getOpponent();
    expect(newOpponent).toBe(player1);
  });

  test("resetGame should reset the game state", () => {
    game.attack(0, 0);
    expect(game.getCurrentPlayer()).not.toBe(game.getPlayers()[0]);

    game.resetGame();
    expect(game.getCurrentPlayer()).toBe(game.getPlayers()[0]);
    expect(game.isGameOver()).toBe(false);
    expect(game.getScore()).toEqual({ Alice: 0, Computer: 0 });
  });

  test.skip("should declare game over when all opponent ships are sunk without mocks", () => {
    const [player1, player2] = game.getPlayers();
    const opponentBoard = player2.getGameboard();

    // Get all ship positions
    const ships = opponentBoard.getShips();
    ships.forEach((ship) => {
      const positions = ship.getPositions();
      positions.forEach(({ x, y }) => {
        game.attack(x, y);
      });
    });

    expect(game.isGameOver()).toBe(true);
  });

  test("score should initialize correctly", () => {
    const score = game.getScore();
    expect(score).toEqual({ Alice: 0, Computer: 0 });
  });
});

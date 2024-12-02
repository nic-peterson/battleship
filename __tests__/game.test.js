import { Game } from "../src/components/game";
import { Gameboard } from "../src/components/gameboard";
import { Player } from "../src/components/player";
import { UI } from "../src/components/ui";
import { placeShipsRandomly } from "../src/helpers/placeShipsRandomly";
import { BOARD_SIZE } from "../src/helpers/constants";
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

  test("score should initialize correctly", () => {
    const score = game.getScore();
    expect(score).toEqual({ player1: 0, player2: 0 });
  });
});

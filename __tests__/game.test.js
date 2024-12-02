import { createGame } from "../src/components/game";
import { Gameboard } from "../src/components/gameboard";
import { Player } from "../src/components/player";
import { UI } from "../src/components/ui";
import { placeShipsRandomly } from "../src/helpers/placeShipsRandomly";
import { BOARD_SIZE } from "../src/helpers/constants";
import { battleships } from "../src/helpers/battleships";

/*
describe("createGame", () => {
  let game;
  beforeEach(() => {
    game = createGame(
      { name: "player1", type: "human" },
      { name: "player2", type: "computer" }
    );
  });
  describe("start game", () => {
    beforeEach(() => {
      game.startGame();
    });

    test("ships are placed", () => {
      const [player1, player2] = game.getPlayers();
      const player1Gameboard = player1.getGameboard();
      const player2Gameboard = player2.getGameboard();

      const player1AllShipPlaced = player1Gameboard.allShipsPlaced().allPlaced;
      const player2AllShipPlaced = player2Gameboard.allShipsPlaced().allPlaced;

      expect(player1AllShipPlaced).toBe(true);
      expect(player2AllShipPlaced).toBe(true);
    });

    test("isGameOver === false", () => {
      expect(game.isGameOver()).toBe(false);
    });
    test("getCurrentPlayer === player 1", () => {
      expect(game.getCurrentPlayer().getName()).toBe("player1");
    });
    test("getScore === {player1: 0, player2: 0}", () => {
      expect(game.getScore().player1).toEqual(0);
      expect(game.getScore().player2).toEqual(0);
    });
  });

  describe("during game", () => {
    beforeEach(() => {
      game.startGame();
    });

    test.skip("playerMove", () => {
      const [player1, player2] = game.getPlayers();
      const player1Gameboard = player1.getGameboard();
      const player2Gameboard = player2.getGameboard();

      // placeShips(player1Gameboard);
    });
  });

  describe("end game", () => {
    beforeEach(() => {
      game.startGame();
    });

    test("isGameOver === true", () => {
      const ships = game.getCurrentPlayer().getGameboard().getShips();

      for (let ship of ships) {
        for (let i = 0; i < ship.ship.getLength(); i++) {
          ship.ship.hit();
        }
      }

      const isGameOver = game.isGameOver();
      expect(isGameOver).toBe(true);
    });
  });
});
*/

jest.mock("../src/components/gameboard");
jest.mock("../src/components/player");
jest.mock("../src/components/ui");
jest.mock("../src/helpers/placeShipsRandomly");

describe("createGame Methods", () => {
  describe("initGame", () => {});
});

describe("createGame", () => {
  let game;
  let mockGameboard;

  beforeEach(() => {
    jest.resetAllMocks();

    mockGameboard = {
      getBoard: jest.fn().mockReturnValue([]),
      placeShip: jest.fn(),
      getShips: jest
        .fn()
        .mockReturnValue([{ ship: { hit: jest.fn(), isSunk: jest.fn() } }]),
      receiveAttack: jest.fn().mockReturnValue({ hit: true, sunk: false }),
      areAllShipsSunk: jest.fn().mockReturnValue(false),
    };

    // Setup mocks
    Gameboard.mockReturnValue(mockGameboard);
    placeShipsRandomly.mockReturnValue(true);

    Player.mockImplementation((type, name, gameboard) => ({
      getName: jest.fn().mockReturnValue(name),
      getGameboard: jest.fn().mockReturnValue(gameboard),
    }));

    // Create the game object
    game = createGame();

    // Create mock players
    const mockPlayer1 = {
      getName: jest.fn().mockReturnValue("Alice"),
      getGameboard: jest.fn().mockReturnValue(mockGameboard),
    };

    const mockPlayer2 = {
      getName: jest.fn().mockReturnValue("Computer"),
      getGameboard: jest.fn().mockReturnValue(mockGameboard),
    };

    // Mock game.getPlayers() to return the mock players
    game.getPlayers = jest.fn().mockReturnValue([mockPlayer1, mockPlayer2]);
  });

  describe("initGame", () => {
    beforeEach(() => {
      /*
      Gameboard.mockClear();
      Player.mockClear();
      UI.renderBoard.mockClear();
      UI.displayMessage.mockClear();
      placeShipsRandomly.mockClear();
      */

      game.initGame();
    });

    test("initializes gameboards", () => {
      expect(Gameboard).toHaveBeenCalledTimes(2);
      expect(Gameboard).toHaveBeenCalledWith(BOARD_SIZE, battleships);
    });

    test("places ships randomly", () => {
      expect(placeShipsRandomly).toHaveBeenCalledTimes(2);
      expect(placeShipsRandomly).toHaveBeenCalledWith(mockGameboard);
    });

    test("initializes players", () => {
      expect(Player).toHaveBeenCalledTimes(2);
      expect(Player).toHaveBeenCalledWith("human", "Alice", expect.any(Object));
      expect(Player).toHaveBeenCalledWith(
        "computer",
        "Computer",
        expect.any(Object)
      );
    });

    test("returns game objects", () => {
      const gameObjects = game.initGame();
      expect(gameObjects).toEqual({
        player1Gameboard: expect.any(Object),
        player2Gameboard: expect.any(Object),
        player1: expect.any(Object),
        player2: expect.any(Object),
        currentPlayer: expect.any(Object),
      });
    });

    test("assigns gameboards to players", () => {
      const gameObjects = game.initGame();
      const [player1, player2] = game.getPlayers();
      expect(player1.getGameboard()).toBe(mockGameboard);
      expect(player2.getGameboard()).toBe(mockGameboard);
    });

    test("sets current player to Alice", () => {
      const currentPlayer = game.getCurrentPlayer();
      expect(currentPlayer.getName()).toBe("Alice");
    });

    test("initial game state is not over", () => {
      expect(game.isGameOver()).toBe(false);
    });

    test("initial scores are zero", () => {
      const score = game.getScore();
      expect(score).toEqual({ player1: 0, player2: 0 });
    });

    test("switchTurn changes the current player", () => {
      const initialPlayer = game.getCurrentPlayer();
      game.switchTurn();
      const newPlayer = game.getCurrentPlayer();
      expect(newPlayer).not.toBe(initialPlayer);
    });
  });

  describe("attack", () => {
    /*
    let game;
    let mockOpponentBoard;

    beforeEach(() => {
      mockOpponentBoard = {
        receiveAttack: jest.fn(),
        areAllShipsSunk: jest.fn(),
      };

      const mockPlayer1 = {
        getName: jest.fn().mockReturnValue("Alice"),
        getGameboard: jest.fn().mockReturnValue(mockOpponentBoard),
      };

      const mockPlayer2 = {
        getName: jest.fn().mockReturnValue("Computer"),
        getGameboard: jest.fn().mockReturnValue(mockOpponentBoard),
      };

      game.getPlayers = jest.fn().mockReturnValue([mockPlayer1, mockPlayer2]);
      game.getCurrentPlayer = jest.fn().mockReturnValue(mockPlayer1);
    });
    */

    test.skip("calls receiveAttack on opponent's board", () => {
      const x = 1;
      const y = 2;
      game.attack(x, y);
      expect(mockOpponentBoard.receiveAttack).toHaveBeenCalledWith(x, y);
    });

    test.skip("checks if all ships are sunk", () => {
      game.attack(1, 2);
      expect(mockOpponentBoard.areAllShipsSunk).toHaveBeenCalled();
    });

    test.skip("sets gameOver to true if all ships are sunk", () => {
      mockOpponentBoard.areAllShipsSunk.mockReturnValue(true);
      game.attack(1, 2);
      expect(game.isGameOver()).toBe(true);
    });

    test.skip("sets gameOver to false if not all ships are sunk", () => {
      mockOpponentBoard.areAllShipsSunk.mockReturnValue(false);
      game.attack(1, 2);
      expect(game.isGameOver()).toBe(false);
    });

    test.skip("returns the result of receiveAttack", () => {
      const attackResult = { hit: true, sunk: false };
      mockOpponentBoard.receiveAttack.mockReturnValue(attackResult);
      const result = game.attack(1, 2);
      expect(result).toBe(attackResult);
    });
  });
});

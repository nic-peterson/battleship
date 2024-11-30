import { createGame } from "../src/components/game";
import { createGameboard } from "../src/components/gameboard";
import { createPlayer } from "../src/components/player";
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

describe("createGame", () => {
  let game;

  beforeEach(() => {
    game = createGame();
  });

  describe("initGame", () => {
    beforeEach(() => {
      createGameboard.mockClear();
      createPlayer.mockClear();
      UI.renderBoard.mockClear();
      UI.displayMessage.mockClear();
      placeShipsRandomly.mockClear();

      game.initGame();
    });

    test("initializes gameboards", () => {
      expect(createGameboard).toHaveBeenCalledTimes(2);
      expect(createGameboard).toHaveBeenCalledWith(BOARD_SIZE, battleships);
    });

    test.skip("places ships randomly", () => {
      expect(placeShipsRandomly).toHaveBeenCalledTimes(2);
    });

    test.skip("initializes players", () => {
      expect(createPlayer).toHaveBeenCalledTimes(2);
      expect(createPlayer).toHaveBeenCalledWith(
        "human",
        "Alice",
        expect.any(Object)
      );
      expect(createPlayer).toHaveBeenCalledWith(
        "computer",
        "Computer",
        expect.any(Object)
      );
    });

    test.skip("renders boards", () => {
      expect(UI.renderBoard).toHaveBeenCalledTimes(2);
      expect(UI.renderBoard).toHaveBeenCalledWith(
        expect.any(Array),
        "player1-board"
      );
      expect(UI.renderBoard).toHaveBeenCalledWith(
        expect.any(Array),
        "player2-board"
      );
    });

    test.skip("displays game started message", () => {
      expect(UI.displayMessage).toHaveBeenCalledWith("Game started");
    });
  });
});

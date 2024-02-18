const { createPlayer } = require("../src/player");
const { createGameboard } = require("../src/gameboard");
const { createShip } = require("../src/ship");
const { before } = require("lodash");
const { createGame } = require("../src/game");
import battleships from "../src/battleships";

describe("Game", () => {
  describe("start game", () => {
    /*
        let game;
        beforeEach(() => {
          const player1Gameboard = createGameboard();
          const player1 = createPlayer("human", "player1", player1Gameboard);
          const player2Gameboard = createGameboard();
          const player2 = createPlayer("computer", "player2", player2Gameboard);
          game = createGame(player1, player2);
        });
        */
    test.skip("startGame", () => {
      const game = createGame(
        { name: "player1", type: "human" },
        { name: "player2", type: "computer" },
        battleships
      );
      expect(game.startGame()).toBe(true);
    });
    test.skip("isGameOver", () => {
      expect(game.isGameOver()).toBe(false);
    });
  });
});

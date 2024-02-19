const { createGame } = require("../src/game");

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

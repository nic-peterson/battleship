const { createGameboard } = require("../src/gameboard"); // replace with the path to your createGameboard function
const { createShip } = require("../src/ship"); // replace with the path to your createShip function

describe("Gameboard", () => {
  describe("checking isGameBoardNull", () => {
    test("returns true if the board is empty", () => {
      const gameboard = createGameboard();
      expect(gameboard.isGameBoardNull()).toBe(true);
    });

    test("returns false if the board is not empty", () => {
      const gameboard = createGameboard();
      const ship = createShip(3);
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.isGameBoardNull()).toBe(false);
    });
  });

  test("can place ships", () => {
    const gameboard = createGameboard();
    const ship = createShip(3);
    gameboard.placeShip(ship, 0, 0);
    // Check if the ship exists on the board
    const shipOnBoard = gameboard.getShipAt(0, 0);
    expect(shipOnBoard).toBe(ship);
  });

  test("can receive attacks", () => {
    const gameboard = createGameboard();
    const ship = createShip(3);
    gameboard.placeShip(ship, 0, 0);
    gameboard.receiveAttack(0, 0);
    expect(ship.getHits()).toBe(1);
  });

  test("tracks missed attacks", () => {
    const gameboard = createGameboard();
    gameboard.receiveAttack(0, 0);
    expect(gameboard.getMissedAttacks()).toEqual([{ x: 0, y: 0 }]);
  });

  test("reports when all ships are sunk", () => {
    const gameboard = createGameboard();
    const ship = createShip(3);
    gameboard.placeShip(ship, 0, 0);
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 0);
    expect(gameboard.areAllShipsSunk()).toBe(true);
  });
});

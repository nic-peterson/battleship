const createGameboard = require("../src/gameboard"); // replace with the path to your createGameboard function
const createShip = require("../src/ship"); // replace with the path to your createShip function

describe("Gameboard", () => {
  test.skip("can place ships", () => {
    const gameboard = createGameboard();
    const ship = createShip(3);
    gameboard.placeShip(ship, 0, 0);
    expect(gameboard.areAllShipsSunk()).toBe(false);
  });

  test.skip("can receive attacks", () => {
    const gameboard = createGameboard();
    const ship = createShip(3);
    gameboard.placeShip(ship, 0, 0);
    gameboard.receiveAttack(0, 0);
    expect(ship.getHits()).toBe(1);
  });

  test.skip("tracks missed attacks", () => {
    const gameboard = createGameboard();
    gameboard.receiveAttack(0, 0);
    expect(gameboard.getMissedAttacks()).toEqual([{ x: 0, y: 0 }]);
  });

  test.skip("reports when all ships are sunk", () => {
    const gameboard = createGameboard();
    const ship = createShip(3);
    gameboard.placeShip(ship, 0, 0);
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 0);
    expect(gameboard.areAllShipsSunk()).toBe(true);
  });
});

const { createGameboard } = require("../src/gameboard"); // replace with the path to your createGameboard function
const { createShip } = require("../src/ship"); // replace with the path to your createShip function
const ships = [
  {
    type: "carrier",
    length: 5,
  },
  {
    type: "battleship",
    length: 4,
  },
  {
    type: "cruiser",
    length: 3,
  },
  {
    type: "submarine",
    length: 3,
  },
  {
    type: "destroyer",
    length: 2,
  },
];

describe("Gameboard", () => {
  describe("checking isGameBoardNull", () => {
    test("returns true if the board is empty", () => {
      const gameboard = createGameboard();
      expect(gameboard.isGameBoardNull()).toBe(true);
    });

    test("returns false if the board is not empty", () => {
      const gameboard = createGameboard();
      const ship = createShip(3, "horizontal");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.isGameBoardNull()).toBe(false);
    });
  });

  describe("placing ships", () => {
    describe("successfully placing ships", () => {
      test("can place ships -> horizontal", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "horizontal");
        gameboard.placeShip(ship, 0, 0);
        expect(gameboard.getOccupied()).toContain("0,0");
        expect(gameboard.getOccupied()).toContain("1,0");
        expect(gameboard.getOccupied()).toContain("2,0");
        expect(gameboard.getShipAt(0, 0)).toBe(ship);
        expect(gameboard.getShipAt(1, 0)).toBe(ship);
        expect(gameboard.getShipAt(2, 0)).toBe(ship);
      });
      test("can place ships -> vertical", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "vertical");
        gameboard.placeShip(ship, 0, 0);
        expect(gameboard.getOccupied()).toContain("0,0");
        expect(gameboard.getOccupied()).toContain("0,1");
        expect(gameboard.getOccupied()).toContain("0,2");
        expect(gameboard.getShipAt(0, 0)).toBe(ship);
        expect(gameboard.getShipAt(0, 1)).toBe(ship);
        expect(gameboard.getShipAt(0, 2)).toBe(ship);
      });
    });

    describe("unsuccessfully placing ships", () => {
      test("throws an error if the ship is placed on top of another ship", () => {
        const gameboard = createGameboard();
        const ship1 = createShip(3, "horizontal");
        const ship2 = createShip(3, "horizontal");
        gameboard.placeShip(ship1, 0, 0);
        expect(() => gameboard.placeShip(ship2, 0, 0)).toThrow();
      });
      test("throws an error if the ship is placed outside the gameboard - horizontal", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "horizontal");
        expect(() => gameboard.placeShip(ship, 8, 8)).toThrow();
      });
      test("throws an error if the ship is placed outside the gameboard - vertical", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "vertical");
        expect(() => gameboard.placeShip(ship, 8, 8)).toThrow();
      });
    });
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

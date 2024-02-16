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
        expect(ship.getOrientation()).toBe("horizontal");
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
        expect(ship.getOrientation()).toBe("vertical");
      });

      test("throws an error if the attack is outside the gameboard", () => {
        const gameboard = createGameboard();
        expect(() => gameboard.receiveAttack(10, 10)).toThrow();
      });

      test("can get the occupied coordinates", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "horizontal", "cruiser");
        gameboard.placeShip(ship, 0, 0);
        expect(gameboard.getOccupied()).toEqual(["0,0", "1,0", "2,0"]);
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

  describe("attacking & sinking", () => {
    describe("attacks", () => {
      test("can receive attacks", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "horizontal");
        gameboard.placeShip(ship, 0, 0);
        gameboard.receiveAttack(0, 0);
        expect(ship.getHits()).toBe(1);
      });

      test("tracks missed attacks", () => {
        const gameboard = createGameboard();
        gameboard.receiveAttack(0, 0);
        const missedAttacks = Array.from(
          gameboard.getMissedAttacks(),
          (coord) => {
            const [x, y] = coord.split(",").map(Number);
            return { x, y };
          }
        );
        expect(missedAttacks).toEqual([{ x: 0, y: 0 }]);
        // expect(gameboard.getMissedAttacks()).toEqual([{ x: 0, y: 0 }]);
      });

      test("throws an error if the attack is outside the gameboard", () => {
        const gameboard = createGameboard();
        expect(() => gameboard.receiveAttack(10, 10)).toThrow();
      });

      test("throws an error if the attack is repeated", () => {
        const gameboard = createGameboard();
        gameboard.receiveAttack(0, 0);
        expect(() => gameboard.receiveAttack(0, 0)).toThrow();
      });

      test("can check if a specific coordinate has been attacked", () => {
        const gameboard = createGameboard();
        gameboard.receiveAttack(0, 0);
        expect(gameboard.hasBeenAttacked(0, 0)).toBe(true);
      });
    });

    describe("sinking ships", () => {
      test("reports when all ships are sunk", () => {
        const gameboard = createGameboard();
        const ship = createShip(3, "horizontal", "cruiser");
        gameboard.placeShip(ship, 0, 0);
        gameboard.receiveAttack(0, 0);
        gameboard.receiveAttack(1, 0);
        gameboard.receiveAttack(2, 0);
        expect(gameboard.areAllShipsSunk()).toBe(true);
      });

      test("reports when not all ships are sunk", () => {
        const gameboard = createGameboard();
        const ship1 = createShip(3, "horizontal", "battleship");
        const ship2 = createShip(3, "vertical", "cruiser");
        gameboard.placeShip(ship1, 0, 0);
        gameboard.placeShip(ship2, 0, 1);
        gameboard.receiveAttack(0, 0);
        gameboard.receiveAttack(1, 0);
        gameboard.receiveAttack(2, 0);
        expect(gameboard.areAllShipsSunk()).toBe(false);
      });
    });
  });

  describe("gameboard properties", () => {
    test("reports the size of the gameboard", () => {
      const gameboard = createGameboard();
      expect(gameboard.getSize()).toBe(10);
    });

    test("prints the gameboard", () => {
      const gameboard = createGameboard();
      const ship = createShip(3, "horizontal", "cruiser");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.print()).toBe(
        "X X X - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -"
      );
    });
  });

  /*
  test("can remove a ship", () => {
    const gameboard = createGameboard();
    const ship = createShip(3, "horizontal", "cruiser");
    gameboard.placeShip(ship, 0, 0);
    gameboard.removeShip(ship);
    expect(gameboard.getOccupied()).toEqual([]);
  });
  */
});

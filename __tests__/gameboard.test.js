const { createGameboard } = require("../src/gameboard"); // replace with the path to your createGameboard function
const { createShip } = require("../src/ship"); // replace with the path to your createShip function
const { placeShips } = require("../src/helper"); // replace with the path to your placeShip function

describe("Gameboard Methods", () => {
  let gameboard;

  beforeEach(() => {
    gameboard = createGameboard();
  });

  describe("allShipsPlaced", () => {
    test("returns false when no ships have been placed", () => {
      const result = gameboard.allShipsPlaced();
      expect(result).toEqual({ allPlaced: false, placed: 0 });
    });

    test("returns false when not all ships have been placed", () => {
      const ship = createShip(3, "horizontal", "Cruiser");
      gameboard.placeShip(ship, 0, 0);
      const result = gameboard.allShipsPlaced();
      expect(result).toEqual({ allPlaced: false, placed: 3 });
    });

    test("returns true when all ships have been placed", () => {
      placeShips(gameboard); // Assuming placeShips places all required ships
      const result = gameboard.allShipsPlaced();
      expect(result).toEqual({ allPlaced: true, placed: 17 }); // Adjust the placed value based on your battleships configuration
    });
  });

  describe("areAllShipsSunk", () => {
    test("returns true when all ships are sunk", () => {
      const ship = createShip(3, "horizontal", "Cruiser");
      gameboard.placeShip(ship, 0, 0);
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 0);
      gameboard.receiveAttack(2, 0);
      expect(gameboard.areAllShipsSunk()).toBe(true);
    });

    test("returns false when not all ships are sunk", () => {
      const ship1 = createShip(3, "horizontal", "Cruiser");
      const ship2 = createShip(3, "vertical", "Destroyer");
      gameboard.placeShip(ship1, 0, 0);
      gameboard.placeShip(ship2, 0, 1);
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 0);
      gameboard.receiveAttack(2, 0);
      expect(gameboard.areAllShipsSunk()).toBe(false);
    });
  });

  describe("display", () => {
    test("displays an empty gameboard", () => {
      expect(gameboard.display()).toBe(
        "- - - - - - - - - -\n" +
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

    test("displays the gameboard with a horizontal ship", () => {
      const ship = createShip(3, "horizontal", "Cruiser");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.display()).toBe(
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

    test("displays the gameboard with a vertical ship", () => {
      const ship = createShip(3, "vertical", "Cruiser");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.display()).toBe(
        "X - - - - - - - - -\n" +
          "X - - - - - - - - -\n" +
          "X - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -"
      );
    });

    test("displays the gameboard with multiple ships", () => {
      const ship1 = createShip(3, "horizontal", "Cruiser");
      const ship2 = createShip(2, "vertical", "Destroyer");
      gameboard.placeShip(ship1, 0, 0);
      gameboard.placeShip(ship2, 5, 5);
      expect(gameboard.display()).toBe(
        "X X X - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - X - - - -\n" +
          "- - - - - X - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -\n" +
          "- - - - - - - - - -"
      );
    });

    /*
    test("displays the gameboard with hits and misses", () => {
      const ship = createShip(3, "horizontal", "Cruiser");
      gameboard.placeShip(ship, 0, 0);
      gameboard.receiveAttack(0, 0); // Hit
      gameboard.receiveAttack(1, 1); // Miss
      expect(gameboard.display()).toBe(
        "H X X - - - - - - -\n" +
          "- M - - - - - - - -\n" +
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
    */
  });

  describe("getAllAttacks", () => {
    test("returns all attacks made on the gameboard", () => {
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 1);
      expect(Array.from(gameboard.getAllAttacks())).toEqual(["0,0", "1,1"]);
    });
  });

  describe("getBoard", () => {
    test("returns the gameboard", () => {
      expect(gameboard.getBoard()).toEqual(
        Array(10).fill(Array(10).fill(null))
      );
    });
  });

  describe("getMissedAttacks", () => {
    test("returns all missed attacks", () => {
      gameboard.receiveAttack(0, 0);
      expect(Array.from(gameboard.getMissedAttacks())).toEqual(["0,0"]);
    });
  });

  describe("getOccupied", () => {
    test("returns all occupied coordinates", () => {
      const ship = createShip(3, "horizontal", "cruiser");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.getOccupied()).toEqual(["0,0", "1,0", "2,0"]);
    });
  });

  describe("getShipAt", () => {
    test("returns the ship at a given coordinate", () => {
      const ship = createShip(3, "horizontal", "cruiser");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.getShipAt(0, 0)).toBe(ship);
    });

    test("returns undefined if no ship is at the given coordinate", () => {
      expect(gameboard.getShipAt(0, 0)).toBeUndefined();
    });
  });

  describe("getShips", () => {
    test("returns all ships placed on the gameboard", () => {
      const ship1 = createShip(3, "horizontal", "cruiser");
      const ship2 = createShip(2, "vertical", "destroyer");
      gameboard.placeShip(ship1, 0, 0);
      gameboard.placeShip(ship2, 5, 5);
      expect(gameboard.getShips()).toEqual([
        { ship: ship1, coordinates: ["0,0", "1,0", "2,0"] },
        { ship: ship2, coordinates: ["5,5", "5,6"] },
      ]);
    });
  });

  describe("getSize", () => {
    test("returns the size of the gameboard", () => {
      expect(gameboard.getSize()).toBe(10);
    });
  });

  describe("hasBeenAttacked", () => {
    test("returns true if the coordinate has been attacked", () => {
      gameboard.receiveAttack(0, 0);
      expect(gameboard.hasBeenAttacked(0, 0)).toBe(true);
    });

    test("returns false if the coordinate has not been attacked", () => {
      expect(gameboard.hasBeenAttacked(0, 0)).toBe(false);
    });
  });

  describe("isGameBoardNull", () => {
    test("returns true if the gameboard is empty", () => {
      expect(gameboard.isGameBoardNull()).toBe(true);
    });

    test("returns false if the gameboard is not empty", () => {
      const ship = createShip(3, "horizontal", "cruiser");
      gameboard.placeShip(ship, 0, 0);
      expect(gameboard.isGameBoardNull()).toBe(false);
    });
  });

  describe("placeShip", () => {
    describe("SUCCESS", () => {
      test("places a ship horizontally within bounds", () => {
        const ship = createShip(3, "horizontal", "destroyer");
        gameboard.placeShip(ship, 0, 0);
        expect(gameboard.getOccupied()).toEqual(["0,0", "1,0", "2,0"]);
      });

      test("places a ship vertically within bounds", () => {
        const ship = createShip(3, "vertical", "submarine");
        gameboard.placeShip(ship, 0, 0);
        expect(gameboard.getOccupied()).toEqual(["0,0", "0,1", "0,2"]);
      });

      test("places a ship at the edge of the gameboard successfully", () => {
        const ship = createShip(3, "horizontal", "cruiser");
        gameboard.placeShip(ship, 7, 0);
        expect(gameboard.getShips()).toEqual([
          { ship, coordinates: ["7,0", "8,0", "9,0"] },
        ]);
      });
    });
    describe("ERROR", () => {
      test("throws an error if the ship is placed outside the gameboard horizontally", () => {
        const ship = createShip(3, "horizontal", "destroyer");
        expect(() => gameboard.placeShip(ship, 8, 0)).toThrow(
          "Cannot place ship. Coordinates (8, 0) are outside the gameboard."
        );
      });

      test("throws an error if the ship is placed outside the gameboard vertically", () => {
        const ship = createShip(3, "vertical", "submarine");
        expect(() => gameboard.placeShip(ship, 0, 8)).toThrow(
          "Cannot place ship. Coordinates (0, 8) are outside the gameboard."
        );
      });

      test("throws an error if the ship overlaps with another ship", () => {
        const ship1 = createShip(3, "horizontal", "destroyer");
        const ship2 = createShip(3, "horizontal", "submarine");
        gameboard.placeShip(ship1, 0, 0);
        expect(() => gameboard.placeShip(ship2, 1, 0)).toThrow(
          "Cannot place ship. Overlaps with another ship."
        );
      });
    });
  });

  describe("receiveAttack", () => {
    test("registers a hit on a ship", () => {
      const ship = createShip(3, "horizontal", "cruiser");
      gameboard.placeShip(ship, 0, 0);
      gameboard.receiveAttack(0, 0);
      expect(ship.getHits()).toBe(1);
    });

    test("registers a missed attack", () => {
      gameboard.receiveAttack(0, 0);
      expect(Array.from(gameboard.getMissedAttacks())).toEqual(["0,0"]);
    });

    test("throws an error if the attack is outside the gameboard", () => {
      expect(() => gameboard.receiveAttack(10, 10)).toThrow(
        "Attack is outside the gameboard."
      );
    });

    test("throws an error if the attack is repeated", () => {
      gameboard.receiveAttack(0, 0);
      expect(() => gameboard.receiveAttack(0, 0)).toThrow(
        "You've already attacked this position!"
      );
    });
  });
});

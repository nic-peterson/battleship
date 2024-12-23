// * ship.test.js
const { Ship } = require("../src/components/ship");
const { BATTLESHIPS } = require("../src/helpers/constants");

describe("Ship", () => {
  describe("Error handling", () => {
    test("throws an error if length is not a positive integer", () => {
      const shipType = "Carrier";
      expect(() => Ship(shipType, -1)).toThrow(
        "Length must be a positive integer."
      );
      expect(() => Ship(shipType, 0)).toThrow(
        "Length must be a positive integer."
      );
      expect(() => Ship(shipType, "4")).toThrow(
        "Length must be a positive integer."
      );
    });
  });

  describe("Ship Methods", () => {
    let ship;
    let type;
    let length;

    beforeEach(() => {
      ({ type, length } = BATTLESHIPS[0]);
      ship = Ship(type, length);
    });

    test("should have a length and a type", () => {
      expect(ship.getType()).toBe(type);
      expect(ship.getLength()).toBe(length);
    });
    test("tracks the number of times it has been hit", () => {
      ship.hit();
      ship.hit();
      expect(ship.getHits()).toBe(2);
    });

    test("is not sunk if hits are less than length", () => {
      ship.hit();
      expect(ship.isSunk()).toBe(false);
    });

    test("is sunk if hits are equal to length", () => {
      for (let i = 0; i < length; i++) {
        ship.hit();
      }
      expect(ship.isSunk()).toBe(true);
    });

    test("does not increase hit count beyond ship length", () => {
      for (let i = 0; i < length + 1; i++) {
        ship.hit();
      }
      expect(ship.getHits()).toBe(length); // Should not exceed length
    });

    test("does not throw an error for redundant hit calls", () => {
      for (let i = 0; i < length; i++) {
        ship.hit();
      }
      expect(() => ship.hit()).not.toThrow();
    });
  });
});

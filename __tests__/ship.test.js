const { createShip } = require("../src/components/ship");

describe("Ship", () => {
  test("throws an error if length is not a positive integer", () => {
    expect(() => createShip(-1)).toThrow("Length must be a positive integer.");
    expect(() => createShip(0)).toThrow("Length must be a positive integer.");
    expect(() => createShip("4")).toThrow("Length must be a positive integer.");
  });

  test("has a length", () => {
    const ship = createShip(4);
    expect(ship.getLength()).toBe(4);
  });

  test("tracks the number of times it has been hit", () => {
    const ship = createShip(3);
    ship.hit();
    ship.hit();
    expect(ship.getHits()).toBe(2);
  });

  test("is not sunk if hits are less than length", () => {
    const ship = createShip(3);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test("is sunk if hits are equal to length", () => {
    const ship = createShip(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test("does not increase hit count beyond ship length", () => {
    const ship = createShip(3);
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit(); // Extra hit
    expect(ship.getHits()).toBe(3); // Should not exceed 3
  });

  test("does not throw an error for redundant hit calls", () => {
    const ship = createShip(2);
    ship.hit();
    ship.hit();
    expect(() => ship.hit()).not.toThrow();
  });
});

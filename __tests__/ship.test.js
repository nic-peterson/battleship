const { createShip } = require("../src/ship");

describe("Ship", () => {
  test("has a length", () => {
    const ship = createShip(4);
    expect(ship.length).toBe(4);
  });

  test("returns the orientation of the ship", () => {
    const ship = createShip(3, "horizontal");
    expect(ship.getOrientation()).toBe("horizontal");
  });

  test("returns the type of the ship", () => {
    const ship = createShip(3, "horizontal", "battleship");
    expect(ship.getType()).toBe("battleship");
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
});

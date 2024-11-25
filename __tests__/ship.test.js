const { createShip } = require("../src/ship");
// const { createGameboard } = require("../src/gameboard");

describe("Ship", () => {
  const ship = createShip(4, "horizontal", "battleship");

  test.each([
    [-1, "horizontal", "battleship", "Length must be a positive integer."],
    [0, "vertical", "destroyer", "Length must be a positive integer."],
    [
      4,
      "diagonal",
      "submarine",
      "Orientation must be 'horizontal' or 'vertical'.",
    ],
    [3, "horizontal", 123, "Type must be a string."],
  ])(
    "throws error for invalid input: length=%i, orientation=%s, type=%s",
    (length, orientation, type, expectedError) => {
      expect(() => createShip(length, orientation, type)).toThrow(
        expectedError
      );
    }
  );

  test("ensures state can only change through hit method", () => {
    const ship = createShip(3, "horizontal", "battleship");
    ship.hits = 5; // No error but does not affect internal state
    expect(ship.getHits()).toBe(0);
  });

  test("has a length", () => {
    const length = ship.getLength();
    expect(length).toBe(4);
  });

  test("returns the orientation of the ship", () => {
    expect(ship.getOrientation()).toBe("horizontal");
  });

  test("returns the type of the ship", () => {
    expect(ship.getType()).toBe("battleship");
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
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test("does not increase hit count beyond ship length", () => {
    const ship = createShip(3, "vertical", "submarine");
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit(); // Extra hit
    expect(ship.getHits()).toBe(3); // Should not exceed 3
  });

  test("does not throw an error for redundant hit calls", () => {
    const ship = createShip(2, "horizontal", "destroyer");
    ship.hit();
    ship.hit();
    expect(() => ship.hit()).not.toThrow();
  });

  test("throws an error if length is not a positive integer", () => {
    expect(() => createShip(-1)).toThrow("Length must be a positive integer.");
    expect(() => createShip(0)).toThrow("Length must be a positive integer.");
    expect(() => createShip("4")).toThrow("Length must be a positive integer.");
  });

  test("throws an error if orientation is invalid", () => {
    expect(() => createShip(3, "diagonal")).toThrow(
      "Orientation must be 'horizontal' or 'vertical'."
    );
  });

  test("throws an error if type is not a string", () => {
    expect(() => createShip(3, "horizontal", 123)).toThrow(
      "Type must be a string."
    );
  });

  test("throws an error if type is omitted", () => {
    expect(() => createShip(3, "horizontal")).toThrow("Type must be a string.");
  });

  test("returns the state of the ship", () => {
    const ship = createShip(3, "vertical", "destroyer");
    ship.hit();
    const state = ship.getState();
    expect(state).toEqual({
      length: 3,
      hits: 1,
      isSunk: false,
      orientation: "vertical",
      type: "destroyer",
    });
  });

  test("returns the correct state after hits and sinking", () => {
    const ship = createShip(2, "vertical", "cruiser");
    ship.hit();
    let state = ship.getState();
    expect(state).toEqual({
      length: 2,
      hits: 1,
      isSunk: false,
      orientation: "vertical",
      type: "cruiser",
    });

    ship.hit();
    state = ship.getState();
    expect(state).toEqual({
      length: 2,
      hits: 2,
      isSunk: true,
      orientation: "vertical",
      type: "cruiser",
    });
  });
});

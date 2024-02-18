import { placeShips } from "../src/helper";
import { createGameboard } from "../src/gameboard";
import { createShip } from "../src/ship";

describe("Helper", () => {
  describe("placeShips", () => {
    test("should place all ships on the gameboard", () => {
      const gameboard = createGameboard();
      const battleships = [
        { type: "Carrier", length: 5 },
        { type: "Battleship", length: 4 },
        { type: "Cruiser", length: 3 },
        { type: "Submarine", length: 3 },
        { type: "Destroyer", length: 2 },
      ];

      placeShips(gameboard);

      for (let battleship of battleships) {
        const shipsOfType = gameboard
          .getShips()
          .filter((ship) => ship.type === battleship.type);
        expect(shipsOfType.length).toBe(1);
        expect(shipsOfType[0].length).toBe(battleship.length);
      }
    });

    test("should not overlap ships on the gameboard", () => {
      const gameboard = createGameboard();

      placeShips(gameboard);

      const ships = gameboard.getShips();
      const size = gameboard.getSize();
      const occupiedCoordinates = new Set();

      for (let ship of ships) {
        const { x, y, length, orientation } = ship.getPosition();
        for (let i = 0; i < length; i++) {
          const occupiedCoordinate =
            orientation === "horizontal" ? `${x + i},${y}` : `${x},${y + i}`;
          expect(occupiedCoordinates.has(occupiedCoordinate)).toBe(false);
          occupiedCoordinates.add(occupiedCoordinate);
        }
      }

      expect(occupiedCoordinates.size).toBe(
        ships.reduce((total, ship) => total + ship.length, 0)
      );
    });
  });
});

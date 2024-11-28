import { placeShips } from "../src/helper";
import { createGameboard } from "../src/gameboard";

/*
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
          .map((shipData) => shipData.ship) // Extract the ship object from each shipData
          .filter((ship) => ship.getType() === battleship.type);
        expect(shipsOfType.length).toBe(1);
        expect(shipsOfType[0].length).toBe(battleship.length);
      }
    });

    test("should not overlap ships on the gameboard", () => {
      const gameboard = createGameboard();
      placeShips(gameboard);

      const ships = gameboard.getShips();
      const occupiedCoordinates = new Set();

      for (let ship of ships) {
        const [x, y] = ship.coordinates[0].split(",").map(Number);
        const length = ship.ship.length;
        const orientation = ship.ship.getOrientation();

        for (let i = 0; i < length; i++) {
          const occupiedCoordinate =
            orientation === "horizontal" ? `${x + i},${y}` : `${x},${y + i}`;
          expect(occupiedCoordinates.has(occupiedCoordinate)).toBe(false);
          occupiedCoordinates.add(occupiedCoordinate);
        }
      }

      expect(occupiedCoordinates.size).toBe(
        ships.reduce((total, ship) => total + ship.ship.length, 0)
      );
    });
  });
});
*/

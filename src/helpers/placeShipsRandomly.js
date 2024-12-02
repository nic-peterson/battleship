import { Ship } from "../components/ship";

export const placeShipsRandomly = (gameboard) => {
  const orientations = ["horizontal", "vertical"];
  const size = gameboard.getSize();

  const battleships = gameboard.getShips();

  for (let battleship of battleships) {
    let placed = false;

    while (!placed) {
      // Generate random starting coordinates and orientation
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const shipOrientation =
        orientations[Math.floor(Math.random() * orientations.length)];

      const ship = Ship(battleship.length);

      // Try to place the ship
      try {
        gameboard.placeShip(ship, x, y, shipOrientation);
        placed = true;
      } catch (error) {
        // If the ship can't be placed, ignore the error and try again
        // This is because the randomly chosen coordinates or orientation might be invalid or overlap with another ship.
        // By catching the error and continuing the loop, we ensure that the ship placement is retried until successful.
      }
    }
  }
};

import battleships from "./battleships";
import { createShip } from "../components/ship";

export const placeShipsRandomly = (gameboard) => {
  const orientations = ["horizontal", "vertical"];
  const size = gameboard.getSize();

  for (let battleship of battleships) {
    // console.log(`Placing a ${battleship.type}...`);
    let placed = false;

    while (!placed) {
      // Generate random starting coordinates and orientation
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const orientation =
        orientations[Math.floor(Math.random() * orientations.length)];

      const ship = createShip(battleship.length, orientation, battleship.type);

      // Try to place the ship
      try {
        gameboard.placeShip(ship, x, y);
        placed = true;
      } catch (error) {
        // If the ship can't be placed, ignore the error and try again
      }
    }
  }
};

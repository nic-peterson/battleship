import battleships from "./battleships";
import { createShip } from "./ship";

export const placeShips = (gameboard) => {
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
      //console.log(ship);
      //console.log(`Trying to place a ${ship.type} at (${x}, ${y})`);
      // Try to place the ship
      try {
        gameboard.placeShip(ship, x, y);
        placed = true;
        //console.log(`Placed a ${ship.type} at (${ship.x}, ${ship.y})`);
      } catch (error) {
        // If the ship can't be placed, ignore the error and try again
      }

      /*
      // Try to place the ship
      try {
        gameboard.placeShip(ship, x, y);
        placed = true;
      } catch (error) {
        const { allPlaced, placed } = gameboard.allShipsPlaced();
        if (allPlaced) {
          break;
        } else {
          console.log(
            `Placed ${placed} out of ${battleship.size} parts of the ship. Trying again...`
          );
        }
        // If the ship can't be placed, ignore the error and try again
      }
      */

      // Try to place the ship
      // !placed = gameboard.placeShip(ship, x, y);
    }
  }
};
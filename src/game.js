import { createPlayer } from "./player";
import { createGameboard } from "./gameboard";
import { createShip } from "./ship";
import battleships from "./battleships";

// player1, player2, battleships

export const createGame = (
  { name: player1Name, type: player1Type },
  { name: player2Name, type: player2Type }
) => {
  const startGame = () => {
    // Create players
    // * Player 1
    const player1Gameboard = createGameboard();
    placeShips(player1Gameboard);
    const player1 = createPlayer(player1Type, player1Name, player1Gameboard);
    // * Player 2
    const player2Gameboard = createGameboard();
    placeShips(player2Gameboard);
    const player2 = createPlayer(player2Type, player2Name, player2Gameboard);

    return true;
  };
  const placeShips = (gameboard) => {
    const orientations = ["horizontal", "vertical"];
    const size = gameboard.getSize();

    for (let battleship of battleships) {
      let placed = false;

      while (!placed) {
        // Generate random starting coordinates and orientation
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const orientation =
          orientations[Math.floor(Math.random() * orientations.length)];

        const ship = createShip(
          battleship.length,
          orientation,
          battleship.type
        );

        // Try to place the ship
        try {
          gameboard.placeShip(ship, x, y);
          placed = true;
        } catch (error) {
          // If the ship can't be placed, ignore the error and try again
        }
        // Try to place the ship
        // !placed = gameboard.placeShip(ship, x, y);
      }
    }
  };

  return { startGame };
};

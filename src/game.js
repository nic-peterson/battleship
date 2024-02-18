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

  return { startGame };
};

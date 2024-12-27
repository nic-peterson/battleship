// This helper function forces all ships on a board to be sunk

/**
 * sinkAllShips
 *
 * Calls receiveAttack on every coordinate of each ship in the board,
 * ensuring the board's ships end up fully sunk.
 *
 * @param {Object} board - Instance of Gameboard
 */

export const sinkAllShips = (board) => {
  const placedShips = board.getPlacedShips();
  placedShips.forEach((ship) => {
    const positions = ship.getPositions(); // [{ x: number, y: number }, ...]
    positions.forEach(({ x, y }) => {
      board.receiveAttack(x, y);
    });
  });
};

/**
 * placeShipAndAttack
 * Places a given ship on the board at the specified coordinates with the given orientation,
 * then calls game.attack on the specified coordinates for the attack.
 *
 * @param {Object} params
 * @param {Object} params.game - Instance of your Game
 * @param {Object} params.board - The opponent's Gameboard
 * @param {Object} params.ship - The Ship object to place (e.g. { length: 3, ... })
 * @param {number} params.x - The starting x-coordinate to place the ship
 * @param {number} params.y - The starting y-coordinate to place the ship
 * @param {boolean} params.orientation - Orientation of the ship (e.g., false = horizontal, true = vertical)
 * @param {Array<Array<number>>} params.coordinatesToAttack - Attack coordinates (e.g. [ [1,1], [2,2] ])
 *
 * @returns {Array} An array of results for each attack call
 */
export const placeShipAndAttack = ({
  game,
  board,
  ship,
  x,
  y,
  orientation,
  coordinatesToAttack,
}) => {
  // Place the ship on the board
  board.placeShip(ship, x, y, orientation);

  // Attack each set of coordinates
  const results = coordinatesToAttack.map(([attackX, attackY]) => {
    return game.attack(attackX, attackY);
  });

  return results;
};

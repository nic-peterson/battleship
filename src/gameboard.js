export const createGameboard = () => {
  const boardSize = 10;
  const board = Array(boardSize)
    .fill()
    .map(() => Array(boardSize).fill(null));
  const ships = [];
  const missedAttacks = [];

  const placeShip = (ship, x, y) => {
    ships.push({ ship, x, y });
    board[y][x] = ship;
  };

  const getShipAt = (x, y) => {
    const found = ships.find((ship) => ship.x === x && ship.y === y);
    return found ? found.ship : null;
  };

  const receiveAttack = (x, y) => {
    const ship = getShipAt(x, y);
    if (ship) {
      ship.hit();
    } else {
      missedAttacks.push({ x, y });
    }
  };

  const areAllShipsSunk = () => {
    return ships.every(({ ship }) => ship.isSunk());
  };

  const getMissedAttacks = () => missedAttacks;

  const isGameBoardNull = () => {
    return board.every((row) => row.every((cell) => cell === null));
  };

  return {
    placeShip,
    getShipAt,
    isGameBoardNull,
    receiveAttack,
    areAllShipsSunk,
    getMissedAttacks,
  };
};

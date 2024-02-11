import { create } from "lodash";

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
    // return ships.find((s) => s.x === x && s.y === y);
    const found = ships.find((ship) => ship.x === x && ship.y === y);
    return found ? found.ship : null;
  };

  const receiveAttack = (x, y) => {
    if (board[y][x]) {
      board[y][x].hit();
    } else {
      missedAttacks.push({ x, y });
    }
    /*
    const ship = ships.find((s) => s.x === x && s.y === y);
    if (ship) {
      ship.ship.hit();
    } else {
      missedAttacks.push({ x, y });
    }
    */
  };

  const areAllShipsSunk = () => {
    //ships.every((s) => s.ship.isSunk())
    return ships.every(({ ship }) => ship.isSunk());
  };

  const getMissedAttacks = () => missedAttacks;

  return {
    placeShip,
    getShipAt,
    receiveAttack,
    areAllShipsSunk,
    getMissedAttacks,
  };
};

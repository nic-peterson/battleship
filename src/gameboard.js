import { battleships } from "./battleships.js";
import { createCell } from "./cell.js";
import { CellStatus } from "./constants.js";
import { ORIENTATIONS, ERROR_MESSAGES, BOARD_SIZE } from "./constants.js";

export const createGameboard = () => {
  // const size = BOARD_SIZE;
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => createCell())
  );

  const ships = []; // Array to keep track of all ships placed

  const getBoard = () => board;

  const placeShip = (ship, x, y, orientation) => {
    const length = ship.getLength();
    const allowedOrientations = [
      ORIENTATIONS.HORIZONTAL,
      ORIENTATIONS.VERTICAL,
    ];

    if (!allowedOrientations.includes(orientation)) {
      throw new Error(ERROR_MESSAGES.INVALID_ORIENTATION);
    }

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
    }

    // Check for out-of-bounds placement
    if (orientation === ORIENTATIONS.HORIZONTAL && x + length > BOARD_SIZE) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_HORIZONTAL);
    }
    if (orientation === ORIENTATIONS.VERTICAL && y + length > BOARD_SIZE) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_VERTICAL);
    }

    // Check for overlap with existing ships
    for (let i = 0; i < length; i++) {
      const posX = orientation === ORIENTATIONS.HORIZONTAL ? x + i : x;
      const posY = orientation === ORIENTATIONS.VERTICAL ? y + i : y;

      if (board[posY][posX].ship !== null) {
        throw new Error(ERROR_MESSAGES.OVERLAPPING_SHIP);
      }
    }

    // Place the ship
    for (let i = 0; i < length; i++) {
      const posX = orientation === ORIENTATIONS.HORIZONTAL ? x + i : x;
      const posY = orientation === ORIENTATIONS.VERTICAL ? y + i : y;

      board[posY][posX].ship = ship;
      board[posY][posX].status = CellStatus.SHIP;
    }

    ships.push(ship); // Add ship to the ships array
  };

  const receiveAttack = (x, y) => {
    const cell = board[y][x];

    if (cell.isHit) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    cell.isHit = true;

    if (cell.ship) {
      cell.ship.hit();
      cell.status = CellStatus.HIT;
      return { result: CellStatus.HIT, shipSunk: cell.ship.isSunk() };
    } else {
      cell.status = CellStatus.MISS;
      return { result: CellStatus.MISS };
    }
  };

  const getMissedAttacks = () => {
    const misses = [];
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.status === CellStatus.MISS) {
          misses.push({ x, y });
        }
      });
    });
    return misses;
  };

  const getHits = () => {
    const hits = [];
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.status === CellStatus.HIT) {
          hits.push({ x, y });
        }
      });
    });
    return hits;
  };

  const areAllShipsSunk = () => {
    return ships.every((ship) => ship.isSunk());
  };

  const allShipsPlaced = () => {
    // Assuming you have a predefined list of ships in 'battleships.js'
    const expectedTotal = battleships.reduce(
      (total, ship) => total + ship.length,
      0
    );

    let actualTotal = 0;
    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.ship !== null) {
          actualTotal++;
        }
      });
    });

    return { allPlaced: actualTotal === expectedTotal, placed: actualTotal };
  };

  return {
    getBoard,
    placeShip,
    receiveAttack,
    getMissedAttacks,
    getHits,
    areAllShipsSunk,
    allShipsPlaced,
  };
};

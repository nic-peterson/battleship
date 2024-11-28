import { battleships } from "./battleships.js";
import { createCell } from "./cell.js";
import { CellStatus } from "./constants.js";
import { ORIENTATIONS, ERROR_MESSAGES, BOARD_SIZE } from "./constants.js";

/**
 * Creates a gameboard with the specified size.
 * @param {number} boardSize - The size of the gameboard (default is BOARD_SIZE).
 * @param {Array} expectedShips - The list of expected ships to be placed on the board.
 * returns {Object} - The gameboard object.
 */

export const createGameboard = (boardSize = BOARD_SIZE, expectedShips = []) => {
  const size = boardSize;
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => createCell())
  );

  const placedShips = []; // Array to keep track of all ships placed

  const getBoard = () => board;

  const placeShip = (ship, x, y, orientation) => {
    if (ship === null) {
      throw new Error(ERROR_MESSAGES.INVALID_SHIP);
    }

    const length = ship.getLength();
    const allowedOrientations = [
      ORIENTATIONS.HORIZONTAL,
      ORIENTATIONS.VERTICAL,
    ];

    if (!allowedOrientations.includes(orientation)) {
      throw new Error(ERROR_MESSAGES.INVALID_ORIENTATION);
    }

    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x < 0 ||
      x >= size ||
      y < 0 ||
      y >= size
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
    }

    // Check for out-of-bounds placement
    if (orientation === ORIENTATIONS.HORIZONTAL && x + length > size) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_HORIZONTAL);
    }
    if (orientation === ORIENTATIONS.VERTICAL && y + length > size) {
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

    if (!placedShips.includes(ship)) {
      placedShips.push(ship);
    }

    // ships.push(ship); // Add ship to the ships array
  };

  const receiveAttack = (x, y) => {
    const cell = board[y][x];

    if (cell.isHit) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    cell.isHit = true;

    if (cell.ship !== null) {
      cell.ship.hit();
      cell.status = CellStatus.HIT;
      return {
        result: CellStatus.HIT,
        shipSunk: cell.ship.isSunk(),
        coordinates: { x, y },
      };
    } else {
      cell.status = CellStatus.MISS;
      return { result: CellStatus.MISS, coordinates: { x, y } };
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
    if (placedShips.length === 0) return false;
    return placedShips.every((ship) => ship.isSunk());
  };

  const allShipsPlaced = () => {
    // Assuming you have a predefined list of ships in 'battleships.js'
    const expectedTotal = expectedShips.reduce(
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

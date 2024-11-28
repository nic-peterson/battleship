import { battleships } from "./battleships.js";
import { createCell } from "./cell.js";
import { CellStatus } from "./constants.js";
import { ORIENTATIONS, BOARD_SIZE } from "./constants.js";

const HORIZONTAL = ORIENTATIONS.HORIZONTAL;
const VERTICAL = ORIENTATIONS.VERTICAL;

export const createGameboard = () => {
  const size = BOARD_SIZE;
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => createCell())
  );

  const ships = []; // Array to keep track of all ships placed

  const getBoard = () => board;

  const placeShip = (ship, x, y, orientation) => {
    const length = ship.getLength();
    const allowedOrientations = [HORIZONTAL, VERTICAL];

    if (!allowedOrientations.includes(orientation)) {
      throw new Error("Invalid orientation. Use 'horizontal' or 'vertical'.");
    }

    if (x < 0 || x >= size || y < 0 || y >= size) {
      throw new Error("Ship placement coorindates are out of bounds [0-9].");
    }

    // Check for out-of-bounds placement
    if (orientation === HORIZONTAL && Math.abs(x) + length > size) {
      throw new Error("Ship placement is out of bounds horizontally.");
    }
    if (orientation === VERTICAL && Math.abs(y) + length > size) {
      throw new Error("Ship placement is out of bounds vertically.");
    }

    // Check for overlap with existing ships
    for (let i = 0; i < length; i++) {
      const posX = orientation === HORIZONTAL ? x + i : x;
      const posY = orientation === VERTICAL ? y + i : y;

      if (board[posY][posX].ship !== null) {
        throw new Error("Cannot place ship; position is already occupied.");
      }
    }

    // Place the ship
    for (let i = 0; i < length; i++) {
      const posX = orientation === HORIZONTAL ? x + i : x;
      const posY = orientation === VERTICAL ? y + i : y;

      board[posY][posX].ship = ship;
      board[posY][posX].status = CellStatus.SHIP;
    }

    ships.push(ship); // Add ship to the ships array
  };

  const receiveAttack = (x, y) => {
    const cell = board[y][x];

    if (cell.isHit) {
      throw new Error("Position has already been attacked.");
    }

    cell.isHit = true;

    if (cell.ship) {
      cell.ship.hit();
      cell.status = CellStatus.HIT;
      return { result: "hit", shipSunk: cell.ship.isSunk() };
    } else {
      cell.status = CellStatus.MISS;
      return { result: "miss" };
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

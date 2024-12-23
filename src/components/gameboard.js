// * gameboard.js
import { Ship } from "./ship.js";
import {
  CELL_STATUS,
  ORIENTATIONS,
  BOARD_SIZE,
} from "../helpers/constants/boardConstants.js";
import { ERROR_MESSAGES } from "../helpers/constants/messageConstants.js";
import { createBoard, createCell } from "../helpers/gameboardUtils.js";

/**
 * Creates a gameboard for the Battleship game.
 *
 * @param {number} [size=BOARD_SIZE] - The size of the game board (default is BOARD_SIZE).
 * @param {Array<Object>} [ships=[]] - An array of expected ship objects to be placed on the board.
 * @returns {Object} The gameboard object with the following methods:
 *   - `getBoard()`: Retrieves the current state of the game board.
 *   - `placeShip(ship, x, y, orientation)`: Places a ship on the game board at the specified coordinates and orientation.
 *   - `receiveAttack(x, y)`: Handles an attack on the game board at the specified coordinates.
 *   - `getMissedAttacks()`: Retrieves the coordinates of missed attacks on the game board.
 *   - `getHits()`: Retrieves the coordinates of all cells that have been hit.
 *   - `areAllShipsSunk()`: Checks if all placed ships are sunk.
 *   - `allShipsPlaced()`: Checks if all ships have been placed on the game board.
 */

export const Gameboard = (size = BOARD_SIZE, ships = []) => {
  // * Private Variables
  let board = [];
  let placedShips = [];
  let hits = [];
  let misses = [];
  let allAttacks = new Set();

  // * Initialize
  /**
   * Initializes the game board by creating a new board with the specified size and cell creation function.
   *
   * @function
   * @name initializeBoard
   * @returns {void}
   */
  const initializeBoard = () => {
    board = createBoard(size, createCell);
  };

  /**
   * Resets the game board to its initial state.
   * Clears all placed ships, hits, misses, and all recorded attacks.
   */
  const reset = () => {
    initializeBoard();
    placedShips = [];
    hits = [];
    misses = [];
    allAttacks.clear();
  };

  const getBoard = () => board;
  const getSize = () => size;

  // * Placing Ships
  const getShips = () => ships;
  const getPlacedShips = () => placedShips;
  const allShipsPlaced = () => {
    const expectedTotal = ships.reduce((total, ship) => total + ship.length, 0);

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

  // ? Placing Ships
  const placeShipOnBoard = (ship, x, y, orientation) => {
    const shipLength = ship.getLength();
    const positions = [];

    for (let i = 0; i < shipLength; i++) {
      const posX = orientation === ORIENTATIONS.HORIZONTAL ? x + i : x;
      const posY = orientation === ORIENTATIONS.VERTICAL ? y + i : y;

      board[posY][posX].ship = ship;
      board[posY][posX].shipType = ship.getType();
      board[posY][posX].status = CELL_STATUS.SHIP;
      positions.push({ x: posX, y: posY });
    }

    if (!placedShips.includes(ship)) {
      placedShips.push({ ship, positions });
    }
  };

  const placeShip = (ship, x, y, orientation) => {
    validateShipPlacement(ship, x, y, orientation);
    checkOutOfBounds(ship, x, y, orientation);
    checkOverlap(ship, x, y, orientation);
    placeShipOnBoard(ship, x, y, orientation);
  };

  const placeShipsRandomly = () => {
    if (!ships || !Array.isArray(ships) || ships.length === 0) {
      throw new Error("No ships provided for random placement");
    }

    validateShipsCanFit();

    const orientations = [ORIENTATIONS.HORIZONTAL, ORIENTATIONS.VERTICAL];
    const MAX_ATTEMPTS = 100; // Prevent infinite loops

    for (let battleship of ships) {
      let placed = false;
      let attempts = 0;
      const ship = Ship(battleship.type, battleship.length);

      while (!placed && attempts < MAX_ATTEMPTS) {
        attempts++;

        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const orientation =
          orientations[Math.floor(Math.random() * orientations.length)];

        try {
          placeShip(ship, x, y, orientation);
          placed = true;
        } catch (error) {
          // Ignore error and try again
          if (attempts >= MAX_ATTEMPTS) {
            throw new Error(
              `Unable to place ship length ${battleship.length} after ${MAX_ATTEMPTS} attempts`
            );
          }
        }
      }
    }
  };

  // ? Error Checking
  /**
   * Validates whether the total ship space fits within the board.
   * @param {Array<Object>} ships - The array of ships to be placed.
   * @param {number} boardSize - The total board size.
   * @throws {Error} If the ships cannot fit on the board.
   */
  const validateShipsCanFit = () => {
    const totalShipSpace = ships.reduce((sum, ship) => sum + ship.length, 0);
    const boardSpace = size * size;

    if (totalShipSpace > boardSpace) {
      throw new Error(
        `Ships require ${totalShipSpace} spaces but board only has ${boardSpace} spaces`
      );
    }
  };

  const validateShipPlacement = (ship, x, y, orientation) => {
    if (!ship) {
      throw new Error(ERROR_MESSAGES.INVALID_SHIP);
    }

    if (
      orientation !== ORIENTATIONS.HORIZONTAL &&
      orientation !== ORIENTATIONS.VERTICAL
    ) {
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
  };

  const checkOutOfBounds = (ship, x, y, orientation) => {
    const shipLength = ship.getLength();

    if (orientation === ORIENTATIONS.HORIZONTAL && x + shipLength > size) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_HORIZONTAL);
    }
    if (orientation === ORIENTATIONS.VERTICAL && y + shipLength > size) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_VERTICAL);
    }
  };

  const checkOverlap = (ship, x, y, orientation) => {
    const shipLength = ship.getLength();

    for (let i = 0; i < shipLength; i++) {
      const posX = orientation === ORIENTATIONS.HORIZONTAL ? x + i : x;
      const posY = orientation === ORIENTATIONS.VERTICAL ? y + i : y;

      if (board[posY][posX].ship !== null) {
        throw new Error(ERROR_MESSAGES.OVERLAPPING_SHIP);
      }
    }
  };

  // * Attacks
  const getHits = () => hits;
  const getMissedAttacks = () => misses;

  const receiveAttack = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size) {
      throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
    }
    const cell = board[y][x];
    if (cell.hasBeenAttacked) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    cell.hasBeenAttacked = true;

    if (cell.ship !== null) {
      cell.ship.hit();
      cell.status = CELL_STATUS.HIT;
      hits.push({ x, y });
      return {
        result: CELL_STATUS.HIT,
        shipType: cell.shipType,
        sunk: cell.ship.isSunk(),
        coordinates: { x, y },
      };
    } else {
      cell.status = CELL_STATUS.MISS;
      misses.push({ x, y });
      return {
        result: CELL_STATUS.MISS,
        shipType: null,
        sunk: false,
        coordinates: { x, y },
      };
    }
  };

  const hasBeenAttacked = (x, y) => board[y][x].hasBeenAttacked;

  const getAllAttacks = () => {
    hits.forEach(({ x, y }) => {
      allAttacks.add(`${x},${y}`);
    });

    misses.forEach(({ x, y }) => {
      allAttacks.add(`${x},${y}`);
    });

    return allAttacks;
  };

  const areAllShipsSunk = () => {
    if (placedShips.length === 0) return false;
    return placedShips.every((ship) => ship.ship.isSunk());
  };

  // ? Instantiate the gameboard object
  initializeBoard();
  return {
    getBoard,
    getSize,
    getShips,
    getPlacedShips,
    placeShip,
    placeShipsRandomly,
    receiveAttack,
    hasBeenAttacked,
    getAllAttacks,
    getMissedAttacks,
    getHits,
    areAllShipsSunk,
    allShipsPlaced,
    reset,
  };
};

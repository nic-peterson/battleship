import { Ship } from "./ship.js";
import {
  CellStatus,
  ORIENTATIONS,
  ERROR_MESSAGES,
  BOARD_SIZE,
} from "../helpers/constants.js";

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
  // ? Private Variables
  let board = [];
  let placedShips = [];
  let hits = []; // Array to keep track of all hits
  let misses = []; // Array to keep track of all misses
  let allAttacks = new Set();

  // ? Private methods
  // Private board creation
  const createBoard = () => {
    return Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => createCell())
      );
  };
  // Private cell factory
  const createCell = () => ({
    ship: null,
    isHit: false,
    status: CellStatus.EMPTY,
  });
  // Validate ships can fit on board
  const validateShipsCanFit = () => {
    const totalShipSpace = ships.reduce((sum, ship) => sum + ship.length, 0);
    const boardSpace = size * size;

    if (totalShipSpace > boardSpace) {
      throw new Error(
        `Ships require ${totalShipSpace} spaces but board only has ${boardSpace} spaces`
      );
    }
  };

  const initialize = () => {
    board = createBoard();
    //placeShipsRandomly();
  };

  /**
   * Validates the placement of a ship on the game board.
   *
   * @param {Object} ship - The ship object to be placed.
   * @param {number} x - The x-coordinate for the ship's placement.
   * @param {number} y - The y-coordinate for the ship's placement.
   * @param {string} orientation - The orientation of the ship (either 'HORIZONTAL' or 'VERTICAL').
   * @throws {Error} Throws an error if the ship is null.
   * @throws {Error} Throws an error if the orientation is invalid.
   * @throws {Error} Throws an error if the coordinates are invalid.
   */
  const validateShipPlacement = (ship, x, y, orientation) => {
    if (ship === null) {
      throw new Error(ERROR_MESSAGES.INVALID_SHIP);
    }

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
  };

  /**
   * Checks if the ship placement is out of bounds on the game board.
   *
   * @param {Object} ship - The ship object to be placed.
   * @param {number} x - The x-coordinate of the ship's starting position.
   * @param {number} y - The y-coordinate of the ship's starting position.
   * @param {string} orientation - The orientation of the ship ('HORIZONTAL' or 'VERTICAL').
   * @throws {Error} Throws an error if the ship placement is out of bounds horizontally or vertically.
   */
  const checkOutOfBounds = (ship, x, y, orientation) => {
    const shipLength = ship.getLength();

    if (orientation === ORIENTATIONS.HORIZONTAL && x + shipLength > size) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_HORIZONTAL);
    }
    if (orientation === ORIENTATIONS.VERTICAL && y + shipLength > size) {
      throw new Error(ERROR_MESSAGES.OUT_OF_BOUNDS_VERTICAL);
    }
  };

  /**
   * Checks if placing a ship at the given coordinates and orientation would overlap with an existing ship.
   *
   * @param {Object} ship - The ship object to be placed.
   * @param {number} x - The x-coordinate where the ship is to be placed.
   * @param {number} y - The y-coordinate where the ship is to be placed.
   * @param {string} orientation - The orientation of the ship, either 'HORIZONTAL' or 'VERTICAL'.
   * @throws {Error} Throws an error if the ship overlaps with an existing ship.
   */
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

  /**
   * Places a ship on the game board at the specified coordinates and orientation.
   *
   * @param {Object} ship - The ship object to be placed on the board.
   * @param {number} x - The x-coordinate where the ship's placement starts.
   * @param {number} y - The y-coordinate where the ship's placement starts.
   * @param {string} orientation - The orientation of the ship, either 'HORIZONTAL' or 'VERTICAL'.
   */
  const placeShipOnBoard = (ship, x, y, orientation) => {
    const shipLength = ship.getLength();
    const positions = [];

    for (let i = 0; i < shipLength; i++) {
      const posX = orientation === ORIENTATIONS.HORIZONTAL ? x + i : x;
      const posY = orientation === ORIENTATIONS.VERTICAL ? y + i : y;

      board[posY][posX].ship = ship;
      board[posY][posX].status = CellStatus.SHIP;
      positions.push({ x: posX, y: posY });
    }

    if (!placedShips.includes(ship)) {
      placedShips.push({ ship, positions });
    }
  };

  // ? Public methods

  const getBoard = () => board;

  const getSize = () => size;

  const getShips = () => ships;

  const getPlacedShips = () => placedShips;

  /**
   * Places a ship on the gameboard at the specified coordinates and orientation.
   *
   * @param {Object} ship - The ship object to be placed.
   * @param {number} x - The x-coordinate where the ship's placement starts.
   * @param {number} y - The y-coordinate where the ship's placement starts.
   * @param {string} orientation - The orientation of the ship ('horizontal' or 'vertical').
   * @throws {Error} If the ship placement is invalid, out of bounds, or overlaps with another ship.
   */
  const placeShip = (ship, x, y, orientation) => {
    validateShipPlacement(ship, x, y, orientation);
    checkOutOfBounds(ship, x, y, orientation);
    checkOverlap(ship, x, y, orientation);
    placeShipOnBoard(ship, x, y, orientation);
  };

  /**
   * Randomly places all ships on the game board.
   * @throws {Error} If no ships are provided for placement
   * @throws {Error} If ships cannot fit on the board based on board size
   * @throws {Error} If a ship cannot be placed after maximum attempts (100)
   */
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

      while (!placed && attempts < MAX_ATTEMPTS) {
        attempts++;

        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const orientation =
          orientations[Math.floor(Math.random() * orientations.length)];

        try {
          const ship = Ship(battleship.length);

          placeShip(ship, x, y, orientation);
          placed = true;
        } catch (error) {
          // Ignore error and try again
          if (attempts >= MAX_ATTEMPTS) {
            throw new Error(
              `Failed to place ship after ${MAX_ATTEMPTS} attempts`
            );
          }
        }
      }
    }
  };

  /**
   * Handles an attack on the game board at the specified coordinates.
   *
   * @param {number} x - The x-coordinate of the attack.
   * @param {number} y - The y-coordinate of the attack.
   * @throws {Error} If the coordinates are out of bounds.
   * @throws {Error} If the cell has already been attacked.
   * @returns {Object} The result of the attack.
   * @returns {string} result.result - The status of the cell after the attack (HIT or MISS).
   * @returns {boolean} [result.shipSunk] - Whether the ship at the attacked cell is sunk (only present if a ship was hit).
   * @returns {Object} result.coordinates - The coordinates of the attack.
   * @returns {number} result.coordinates.x - The x-coordinate of the attack.
   * @returns {number} result.coordinates.y - The y-coordinate of the attack.
   */
  const receiveAttack = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size) {
      throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
    }
    const cell = board[y][x];
    if (cell.isHit) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    cell.isHit = true;

    if (cell.ship !== null) {
      cell.ship.hit();
      cell.status = CellStatus.HIT;
      hits.push({ x, y });
      return {
        result: CellStatus.HIT,
        sunk: cell.ship.isSunk(),
        coordinates: { x, y },
      };
    } else {
      cell.status = CellStatus.MISS;
      misses.push({ x, y });
      return { result: CellStatus.MISS, coordinates: { x, y } };
    }
  };

  const hasBeenAttacked = (x, y) => {
    return (
      board[y][x].status === CellStatus.HIT ||
      board[y][x].status === CellStatus.MISS
    );
  };

  const getAllAttacks = () => {
    // const attacks = new Set();

    hits.forEach(({ x, y }) => {
      allAttacks.add(`${x},${y}`);
    });

    misses.forEach(({ x, y }) => {
      allAttacks.add(`${x},${y}`);
    });

    return allAttacks;
  };

  /**
   * Retrieves the coordinates of missed attacks on the game board.
   *
   * @returns {Array<{x: number, y: number}>} An array of objects representing the coordinates of missed attacks.
   */
  const getMissedAttacks = () => {
    return misses;
  };

  /**
   * Retrieves the coordinates of all cells that have been hit.
   *
   * @returns {Array<{x: number, y: number}>} An array of objects representing the coordinates of hit cells.
   */
  const getHits = () => {
    return hits;
  };

  /**
   * Checks if all placed ships are sunk.
   *
   * @returns {boolean} True if all placed ships are sunk, false otherwise.
   */
  const areAllShipsSunk = () => {
    if (placedShips.length === 0) return false;
    return placedShips.every((ship) => ship.ship.isSunk());
  };

  /**
   * Checks if all ships have been placed on the game board.
   *
   * @returns {Object} An object containing:
   * - `allPlaced` {boolean}: True if all ships are placed, false otherwise.
   * - `placed` {number}: The total number of ship cells placed on the board.
   */
  const allShipsPlaced = () => {
    // Assuming you have a predefined list of ships in 'battleships.js'
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

  /**
   * Resets the game board to its initial state.
   * Creates a new empty board and clears all placed ships.
   * @returns {void}
   */
  const reset = () => {
    board = createBoard();
    placedShips = [];
    // placeShipsRandomly();
  };

  // ! Initialize immediately on creation
  initialize();

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

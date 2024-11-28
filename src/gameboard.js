import battleships from "./battleships.js";
import { createCell } from "./cell.js";
import { CellStatus } from "./constants.js";

const HORIZONTAL = "horizontal";
const VERTICAL = "vertical";
const BOARD_SIZE = 10; // Example size

const parseCoordinates = (coord) => coord.split(",").map(Number);

export const createGameboard = () => {
  const size = BOARD_SIZE;
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => createCell())
  );

  const ships = []; // Array to keep track of all ships placed

  const getBoard = () => board;

  const placeShip = (ship, x, y, orientation) => {
    const length = ship.getLength();

    // Check for out-of-bounds placement
    if (orientation === HORIZONTAL && x + length > size) {
      throw new Error("Ship placement is out of bounds horizontally.");
    }
    if (orientation === VERTICAL && y + length > size) {
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
      board[posY][posX].status = "ship";
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
      cell.status = "hit";
      return { result: "hit", shipSunk: cell.ship.isSunk() };
    } else {
      cell.status = "miss";
      return { result: "miss" };
    }
  };

  const getMissedShots = () => {
    const misses = [];
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.status === "miss") {
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
        if (cell.status === "hit") {
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
    getMissedShots,
    getHits,
    areAllShipsSunk,
    allShipsPlaced,
  };
};
/*
export const createGameboard = () => {
  const size = BOARD_SIZE;
  const board = Array(size)
    .fill()
    .map(() => Array(size).fill(null));
  const ships = [];
  const missedAttacks = new Set(); // changed array to set
  const allAttacks = new Set(); // changed array to set
  const occupied = new Map();

  const allShipsPlaced = () => {
    const expectedTotal = battleships.reduce(
      (total, ship) => total + ship.length,
      0
    );

    let actualTotal = 0;
    for (let row of board) {
      for (let cell of row) {
        if (cell !== null) {
          actualTotal++;
        }
      }
    }

    return { allPlaced: actualTotal === expectedTotal, placed: actualTotal };
  };

  const areAllShipsSunk = () => {
    return ships.every(({ ship }) => ship.isSunk());
  };

  const display = () => {
    let output = "";
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        output += occupied.has(`${x},${y}`) ? "X " : "- ";
      }
      output = output.trim() + "\n"; // Remove trailing space and add newline
    }
    return output.trim(); // Remove trailing newline
  };

  const getAllAttacks = () => allAttacks;

  const getBoard = () => board;

  const getMissedAttacks = () => missedAttacks;

  const getOccupied = () => Array.from(occupied.keys());

  const getShipAt = (x, y) => occupied.get(`${x},${y}`);

  const getShips = () => {
    return ships;
  };

  const getSize = () => size;

  const hasBeenAttacked = (x, y) => {
    return allAttacks.has(`${x},${y}`);
  };

  const isGameBoardNull = () => {
    for (let row of board) {
      for (let cell of row) {
        if (cell !== null) {
          return false;
        }
      }
    }
    return true;
  };

  const placeShip = (ship, startX, startY) => {
    const orientation = ship.getOrientation();
    const length = ship.getLength();
    let coordinates = [];

    if (orientation === HORIZONTAL) {
      for (let i = 0; i < length; i++) {
        coordinates.push(`${startX + i},${startY}`);
      }
    } else {
      for (let i = 0; i < length; i++) {
        coordinates.push(`${startX},${startY + i}`);
      }
    }

    // Check if any of the coordinates are outside the gameboard
    if (
      coordinates.some((coord) => {
        const [x, y] = parseCoordinates(coord);
        return x < 0 || x >= size || y < 0 || y >= size;
      })
    ) {
      throw new Error(
        `Cannot place ship. Coordinates (${startX}, ${startY}) are outside the gameboard.`
      );
    }

    // Check if any of the coordinates are already occupied
    if (coordinates.some((coord) => occupied.has(coord))) {
      throw new Error("Cannot place ship. Overlaps with another ship.");
    }

    // If not, add the coordinates to the occupied map
    coordinates.forEach((coord) => occupied.set(coord, ship));

    // ...place the ship on the gameboard...
    coordinates.forEach((coord) => {
      const [x, y] = parseCoordinates(coord);
      board[y][x] = ship;
    });

    // ...and add the ship to the ships array
    ships.push({ ship, coordinates });

    return ship;
  };

  const receiveAttack = (x, y) => {
    const coord = `${x},${y}`;

    if (x < 0 || x >= size || y < 0 || y >= size) {
      throw new Error("Attack is outside the gameboard.");
    }

    if (allAttacks.has(coord)) {
      throw new Error("You've already attacked this position!");
    }

    allAttacks.add(coord);

    const ship = getShipAt(x, y);

    if (ship) {
      ship.hit();

      board[x][y] = "H"; // Mark hit on the board
      console.log("HIT");

      return true;
    } else {
      missedAttacks.add(`${x},${y}`);

      board[x][y] = "M"; // Mark miss on the board
      console.log("MISS");

      return false;
    }
  };

  return {
    allShipsPlaced,
    areAllShipsSunk,
    display,
    getAllAttacks,
    getBoard,
    getMissedAttacks,
    getOccupied,
    getShips,
    getShipAt,
    getSize,
    hasBeenAttacked,
    isGameBoardNull,
    placeShip,
    receiveAttack,
  };
};

*/

export const createGameboard = () => {
  const boardSize = 10;
  const board = Array(boardSize)
    .fill()
    .map(() => Array(boardSize).fill(null));
  const ships = [];
  const missedAttacks = [];
  const allAttacks = [];
  const occupied = new Map();

  const placeShip = (ship, startX, startY) => {
    /*
    ships.push({ ship, x, y });
    board[y][x] = ship;
    */
    const orientation = ship.getOrientation();
    const length = ship.getLength();
    let coordinates = [];

    if (orientation === "horizontal") {
      for (let i = 0; i < length; i++) {
        coordinates.push(`${startX + i},${startY}`);
      }
    } else if (orientation === "vertical") {
      for (let i = 0; i < length; i++) {
        coordinates.push(`${startX},${startY + i}`);
      }
    }

    // Check if any of the coordinates are outside the gameboard
    if (
      coordinates.some((coord) => {
        const [x, y] = coord.split(",").map(Number);
        return x < 0 || x >= boardSize || y < 0 || y >= boardSize;
      })
    ) {
      throw new Error(
        "Cannot place ship. Coordinates are outside the gameboard."
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
      const [x, y] = coord.split(",").map(Number);
      board[y][x] = ship;
    });
  };

  const getShipAt = (x, y) => occupied.get(`${x},${y}`);
  /*
  const getShipAt = (x, y) => {
    
    const found = ships.find((ship) => ship.x === x && ship.y === y);
    return found ? found.ship : null;
  };
  */

  const receiveAttack = (x, y) => {
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
      throw new Error("Attack is outside the gameboard.");
    }

    const ship = getShipAt(x, y);
    if (ship) {
      ship.hit();
      /*
      if (ship.isSunk()) {
        removeShip(ship);
      }
      */
    } else {
      missedAttacks.push({ x, y });
    }

    allAttacks.push({ x, y });
  };

  const areAllShipsSunk = () => {
    return ships.every(({ ship }) => ship.isSunk());
  };

  const getMissedAttacks = () => missedAttacks;

  const getOccupied = () => Array.from(occupied.keys());

  const getSize = () => boardSize;

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

  const print = () => {
    let output = "";
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        output += occupied.has(`${x},${y}`) ? "X " : "- ";
      }
      output = output.trim() + "\n"; // Remove trailing space and add newline
    }
    return output.trim(); // Remove trailing newline
  };

  return {
    areAllShipsSunk,
    getMissedAttacks,
    getOccupied,
    getShipAt,
    getSize,
    isGameBoardNull,
    placeShip,
    print,
    receiveAttack,
  };
};

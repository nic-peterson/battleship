import { BOARD_SIZE, CellStatus, ERROR_MESSAGES } from "./constants";

export const createPlayer = (type, name, gameboard) => {
  const attack = (x, y, opponentGameboard) => {
    // Validate coordinates
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      x < 0 ||
      y < 0 ||
      x >= BOARD_SIZE ||
      y >= BOARD_SIZE
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
    }

    const cellToAttack = opponentGameboard.getBoard()[y][x];

    if (
      cellToAttack.status === CellStatus.HIT ||
      cellToAttack.status === CellStatus.MISS
    ) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    const attackResult = opponentGameboard.receiveAttack(x, y);

    return attackResult;
  };

  const getName = () => name;

  const getType = () => type;

  const getGameboard = () => gameboard;

  const getValidCoordinates = (opponentGameboard) => {
    let x, y;

    do {
      x = Math.floor(Math.random() * BOARD_SIZE);
      y = Math.floor(Math.random() * BOARD_SIZE);
    } while (
      opponentGameboard.getBoard()[y][x].status === CellStatus.HIT ||
      opponentGameboard.getBoard()[y][x].status === CellStatus.MISS
    );

    return [x, y];
  };

  return { attack, getName, getType, getGameboard, getValidCoordinates };
};

/*
export const createPlayer = (type, name, gameboard) => {
  const attack = (x, y, opponentGameboard) => {
    const attacks = opponentGameboard.getAllAttacks();
    const coord = `${x},${y}`;

    if (attacks.has(coord)) {
      throw new Error("You've already attacked this position!");
    }

    opponentGameboard.receiveAttack(x, y);
  };

  const getGameboard = () => gameboard;

  const getName = () => name;

  const getType = () => type;

  const getValidCoordinates = (opponentGameboard) => {
    let x, y;
    const size = opponentGameboard.getSize(); // Assuming getSize is a method that returns the size of the gameboard

    do {
      x = Math.floor(Math.random() * size);
      y = Math.floor(Math.random() * size);
    } while (opponentGameboard.hasBeenAttacked(x, y));
    return [x, y];
  };

  return { attack, getValidCoordinates, getGameboard, getName, getType };
};
*/

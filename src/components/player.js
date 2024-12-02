import { BOARD_SIZE, ERROR_MESSAGES } from "../helpers/constants";

export const Player = (type, name, gameboard) => {
  const attack = (x, y, opponentGameboard) => {
    // Validate coordinates
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      x < 0 ||
      y < 0 ||
      x >= opponentGameboard.getSize() ||
      y >= opponentGameboard.getSize()
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
    }

    const attacks = opponentGameboard.getAllAttacks(); // Returns a Set of "x,y"

    const coord = `${x},${y}`;

    if (attacks.has(coord)) {
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
    } while (opponentGameboard.hasBeenAttacked(x, y));

    return [x, y];
  };

  return { attack, getName, getType, getGameboard, getValidCoordinates };
};

import { BOARD_SIZE, ERROR_MESSAGES } from "../helpers/constants";

export const Player = (type, name, gameboard, id) => {
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

    if (opponentGameboard.hasBeenAttacked(x, y)) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    const attackResult = opponentGameboard.receiveAttack(x, y);

    return attackResult;
  };

  const getName = () => name;

  const getId = () => id;

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

  return { attack, getName, getId, getType, getGameboard, getValidCoordinates };
};

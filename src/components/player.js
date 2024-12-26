import { BOARD_SIZE } from "../helpers/constants/boardConstants";
import { ERROR_MESSAGES } from "../helpers/constants/messageConstants";
import { PLAYERS } from "../helpers/constants/playerConstants";

export const Player = (type, name, id) => {
  if (type !== PLAYERS.PLAYER1.TYPE && type !== PLAYERS.PLAYER2.TYPE) {
    throw new Error(ERROR_MESSAGES.INVALID_PLAYER_TYPE);
  }
  if (!name || name.trim() === "") {
    throw new Error(ERROR_MESSAGES.INVALID_PLAYER_NAME);
  }
  if (!id || id.trim() === "") {
    throw new Error(ERROR_MESSAGES.INVALID_PLAYER_ID);
  }
  let gameboard = null; // Initialize without a gameboard
  // Track hits that haven't been fully explored
  let activeHits = [];
  // Track direction of current ship being targeted
  let currentDirection = null;

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

    if (attackResult.result === "hit") {
      activeHits.push({ x, y });
      // If ship was sunk, clear active hits
      if (attackResult.sunk) {
        activeHits = [];
        currentDirection = null;
      }
    }

    return attackResult;
  };

  const getName = () => name;

  const getId = () => id;

  const getType = () => type;

  const getGameboard = () => gameboard;

  const setGameboard = (newGameboard) => {
    gameboard = newGameboard;
  };

  const getValidCoordinates = (opponentGameboard) => {
    let x, y;

    do {
      x = Math.floor(Math.random() * BOARD_SIZE);
      y = Math.floor(Math.random() * BOARD_SIZE);
    } while (opponentGameboard.hasBeenAttacked(x, y));

    return [x, y];
  };

  const makeRandomMove = () => {
    if (!gameboard) throw new Error("No gameboard set");

    const size = gameboard.getSize();
    const allAttacks = gameboard.getAllAttacks();

    // Keep trying random coordinates until we find an unattacked position
    while (true) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      if (!allAttacks.has(`${x},${y}`)) {
        return { x, y };
      }
    }
  };

  // Add a smarter AI move method that could be used later
  const makeSmartMove = (opponentBoard) => {
    // 1. If we have active hits, try to sink that ship
    if (activeHits.length > 0) {
      return targetShip(opponentBoard);
    }

    // 2. If no active hits, hunt in an efficient pattern
    return huntNewShip(opponentBoard);
  };

  // Helper methods for smart targeting
  const targetShip = (opponentBoard) => {
    const lastHit = activeHits[activeHits.length - 1];

    // If we have multiple hits, try to follow the line
    if (activeHits.length > 1) {
      return followShipLine(opponentBoard);
    }

    // Try adjacent cells around single hit
    const adjacentMoves = [
      { x: lastHit.x + 1, y: lastHit.y },
      { x: lastHit.x - 1, y: lastHit.y },
      { x: lastHit.x, y: lastHit.y + 1 },
      { x: lastHit.x, y: lastHit.y - 1 },
    ];

    // Filter valid moves and try them
    const validMoves = adjacentMoves.filter((move) =>
      isValidMove(move.x, move.y, opponentBoard)
    );

    if (validMoves.length > 0) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // If no valid adjacent moves, clear this hit and hunt again
    activeHits = [];
    return huntNewShip(opponentBoard);
  };

  const followShipLine = (opponentBoard) => {
    const firstHit = activeHits[0];
    const lastHit = activeHits[activeHits.length - 1];

    // Determine ship orientation if not known
    if (!currentDirection) {
      currentDirection = firstHit.x === lastHit.x ? "vertical" : "horizontal";
    }

    // Try extending the line in both directions
    const possibleMoves = [];
    if (currentDirection === "horizontal") {
      // Try left and right of the line
      possibleMoves.push(
        { x: Math.min(...activeHits.map((h) => h.x)) - 1, y: firstHit.y },
        { x: Math.max(...activeHits.map((h) => h.x)) + 1, y: firstHit.y }
      );
    } else {
      // Try above and below the line
      possibleMoves.push(
        { x: firstHit.x, y: Math.min(...activeHits.map((h) => h.y)) - 1 },
        { x: firstHit.x, y: Math.max(...activeHits.map((h) => h.y)) + 1 }
      );
    }

    const validMoves = possibleMoves.filter((move) =>
      isValidMove(move.x, move.y, opponentBoard)
    );

    if (validMoves.length > 0) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // If no valid moves in line, reset and try perpendicular direction
    currentDirection = null;
    return targetShip(opponentBoard);
  };

  const huntNewShip = (opponentBoard) => {
    // Use checkerboard pattern for efficiency
    const size = opponentBoard.getSize();
    const allMoves = [];

    // Generate checkerboard pattern
    for (let y = 0; y < size; y++) {
      for (let x = y % 2; x < size; x += 2) {
        if (isValidMove(x, y, opponentBoard)) {
          allMoves.push({ x, y });
        }
      }
    }

    // If no moves in checkerboard pattern, try all remaining spaces
    if (allMoves.length === 0) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (isValidMove(x, y, opponentBoard)) {
            allMoves.push({ x, y });
          }
        }
      }
    }

    return allMoves[Math.floor(Math.random() * allMoves.length)];
  };

  const isValidMove = (x, y, opponentBoard) => {
    return (
      x >= 0 &&
      x < opponentBoard.getSize() &&
      y >= 0 &&
      y < opponentBoard.getSize() &&
      !opponentBoard.hasBeenAttacked(x, y)
    );
  };

  // Modify getNextMove to use smart targeting
  const getNextMove = (opponentBoard) => {
    if (!opponentBoard.getBoard().flat().includes(null)) {
      throw new Error(ERROR_MESSAGES.NO_VALID_MOVES);
    }
    return type === "computer" ? makeSmartMove(opponentBoard) : null;
  };

  return {
    attack,
    getName,
    getId,
    getType,
    getGameboard,
    setGameboard,
    getValidCoordinates,
    getNextMove,
    makeSmartMove,
  };
};

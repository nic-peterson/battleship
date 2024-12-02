import { createPlayer } from "./player";
import { createGameboard } from "./gameboard";
import { UI } from "./ui";
import { placeShipsRandomly } from "../helpers/placeShipsRandomly";
import { BOARD_SIZE, ERROR_MESSAGES } from "../helpers/constants";
import { battleships } from "../helpers/battleships";

export const createGame = () => {
  let currentPlayer;
  let gameOver = false;
  let score = {};
  let player1;
  let player2;

  // Private Methods
  const initailizeGameBoards = () => {
    // Initialize Gameboards
    const player1Gameboard = createGameboard(BOARD_SIZE, [...battleships]);
    const player2Gameboard = createGameboard(BOARD_SIZE, [...battleships]);

    // Ensure gameboards are created correctly
    if (!player1Gameboard || !player1Gameboard.getBoard) {
      throw new Error(ERROR_MESSAGES.PLAYER1_BOARD_FAILED);
    }

    if (!player2Gameboard || !player2Gameboard.getBoard) {
      throw new Error(ERROR_MESSAGES.PLAYER2_BOARD_FAILED);
    }

    // Place ships randomly
    placeShipsRandomly(player1Gameboard);
    placeShipsRandomly(player2Gameboard);

    return { player1Gameboard, player2Gameboard };
  };

  const initializePlayers = (player1Gameboard, player2Gameboard) => {
    // Initialize Players
    player1 = createPlayer("human", "Alice", player1Gameboard);
    player2 = createPlayer("computer", "Computer", player2Gameboard);

    return { player1, player2 };
  };

  // Public Methods
  const initGame = () => {
    try {
      const { player1Gameboard, player2Gameboard } = initailizeGameBoards();
      const { player1, player2 } = initializePlayers(
        player1Gameboard,
        player2Gameboard
      );

      // set current player
      currentPlayer = player1;

      // set score
      setScore(player1, player2);

      // Init UI
      UI.initUI(player1, player2);

      return {
        player1Gameboard,
        player2Gameboard,
        player1,
        player2,
        currentPlayer,
      };
    } catch (error) {
      console.error("Game initialization error:", error);
      UI.displayMessage(`Game initialization failed: ${error.message}`);
      throw error;
    }
  };

  const getPlayers = () => {
    return [player1, player2];
  };

  const getCurrentPlayer = () => {
    return currentPlayer;
  };

  const isGameOver = () => {
    return gameOver;
  };

  const setScore = (player1, player2) => {
    score = { player1: 0, player2: 0 };
  };

  const getScore = () => {
    return score;
  };

  const switchTurn = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    UI.setCurrentPlayer(currentPlayer.getName());
  };

  // New method to handle attacks
  const attack = (x, y) => {
    const opponent = currentPlayer === player1 ? player2 : player1;
    const opponentBoard = opponent.getGameboard();

    const attackResult = opponentBoard.receiveAttack(x, y);

    // Check if all ships are sunk
    gameOver = opponentBoard.areAllShipsSunk();

    return attackResult;
  };

  return {
    initGame,
    getPlayers,
    getCurrentPlayer,
    isGameOver,
    setScore,
    getScore,
    switchTurn,
    attack,
  };
};

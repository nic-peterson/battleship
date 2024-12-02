import { Player } from "./player";
import { Gameboard } from "./gameboard";
import { UI } from "./ui";
import { placeShipsRandomly } from "../helpers/placeShipsRandomly";
import { BOARD_SIZE, ERROR_MESSAGES } from "../helpers/constants";
import { battleships } from "../helpers/battleships";

export const Game = () => {
  let currentPlayer;
  let gameOver = false;
  let score = {};
  let player1;
  let player2;

  // Private Methods
  const initializeGameBoards = () => {
    // Initialize Gameboards
    const player1Gameboard = Gameboard(BOARD_SIZE, [...battleships]);
    const player2Gameboard = Gameboard(BOARD_SIZE, [...battleships]);

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
    player1 = Player("human", "Alice", player1Gameboard);
    player2 = Player("computer", "Computer", player2Gameboard);

    return { player1, player2 };
  };

  // Public Methods
  const initGame = () => {
    try {
      const { player1Gameboard, player2Gameboard } = initializeGameBoards();
      const { player1, player2 } = initializePlayers(
        player1Gameboard,
        player2Gameboard
      );

      // set current player
      currentPlayer = player1;

      // set score
      setScore();

      // Init UI
      UI.initUI(player1, player2);
    } catch (error) {
      console.error("Game initialization error:", error);
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

  const setScore = () => {
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

    // Switch turns if the game is not over
    if (!gameOver) {
      switchTurn();
    }

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

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

  const initGame = () => {
    try {
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

      // Initialize Players
      const player1 = createPlayer("human", "Alice", player1Gameboard);
      const player2 = createPlayer("computer", "Computer", player2Gameboard);

      // set current player
      currentPlayer = player1;

      // set score
      setScore(player1, player2);

      // Render Boards
      UI.renderBoard(player1Gameboard.getBoard(), "player1-board");
      UI.renderBoard(player2Gameboard.getBoard(), "player2-board");

      UI.displayMessage("Game started");
      /*
      UI.displayMessage(
        `Game started\n${currentPlayer.getName()}'s turn\nScore: ${player1.getName()}: ${
          score.player1
        } - ${player2.getName()}: ${score.player2}`
      );
      */

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

  return {
    initGame,
    getPlayers,
    getCurrentPlayer,
    isGameOver,
    setScore,
    getScore,
  };
};

// player1, player2, battleships
/*
export const createGame = (
  { name: player1Name, type: player1Type },
  { name: player2Name, type: player2Type }
) => {
  let currentPlayer;
  let gameOver = false;
  let score = {};
  let player1;
  let player2;
  let winner;

  const isGameOver = () => {
    gameOver =
      player1.getGameboard().areAllShipsSunk() ||
      player2.getGameboard().areAllShipsSunk();
    return gameOver;
  };

  const getCurrentPlayer = () => {
    return currentPlayer;
  };

  const getPlayers = () => {
    return [player1, player2];
  };

  const getScore = () => {
    return score;
  };

  const playerMove = () => {
    if (isGameOver() === false) {
      return;
    }

    // Get the current player's move
  };

  // * Private Methods
  const endGame = () => {
    gameOver = true;
  };

  const initGame = () => {
    // Create players
    // * Player 1
    const player1Gameboard = createGameboard();
    placeShips(player1Gameboard);
    player1 = createPlayer(player1Type, player1Name, player1Gameboard);
    console.log("player1Gameboard is: ");
    console.log(player1Gameboard.print());
    // * Player 2
    const player2Gameboard = createGameboard();
    placeShips(player2Gameboard);
    player2 = createPlayer(player2Type, player2Name, player2Gameboard);
    console.log("player2Gameboard is: ");
    console.log(player2Gameboard.print());
  };

  const setWinner = (player) => {
    winner = player;
  };

  const startGame = () => {
    initGame();
    // Start game
    currentPlayer = player1;
    gameOver = false;
    score = { [player1Name]: 0, [player2Name]: 0 };

    console.log("Game started");
  };

  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const updateScore = (player) => {
    score[player.getName()] += 1;
  };

  return { getCurrentPlayer, getPlayers, getScore, isGameOver, startGame };
};
*/

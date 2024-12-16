import { Player } from "./player";
import { Gameboard } from "./gameboard";

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

  /**
   * setScore
   *
   * s or resets the score for both players.
   */
  const setScore = () => {
    score[player1.getName()] = 0;
    score[player2.getName()] = 0;
  };

  /**
   * updateScore
   *
   * Updates the score for the given player.
   *
   * @param {Player} player - The player whose score is to be updated
   */
  const updateScore = (player) => {
    const playerName = player.getName();
    score[playerName] += 1;
  };

  // Public Methods
  /**
   * initGame
   *
   * Initializes the game by setting up game boards, players,
   * setting the current player, and initializing scores.
   *
   * @returns {void}
   */
  const initializeGame = (p1, p2) => {
    if (!p1?.getName || !p2?.getName) {
      throw new Error("Invalid player objects provided");
    }

    if (!p1 || !p2) {
      throw new Error("Both players are required to initialize game.");
    }

    if (p1.getName() === p2.getName()) {
      throw new Error("Players must have unique names.");
    }

    if (!p1.getGameboard() || !p2.getGameboard()) {
      throw new Error(
        "Both players must have gameboards before initializing game."
      );
    }

    player1 = p1;
    player2 = p2;

    // Ship placement is managed via the game controller
    // e.g., gameController.placeShipsForPlayer(player1);
    // e.g., gameController.placeShipsForPlayer(player2);

    // ! player1.getGameboard().placeShipsRandomly();
    // ! player2.getGameboard().placeShipsRandomly();

    setCurrentPlayer(player1);
    setScore();
    setGameOver(false);

    return { player1, player2, currentPlayer }; // Return initial state for testing
  };

  /**
   * resetGame
   *
   * Resets the game state, including game boards, players, current player,
   * game over status, and scores.
   *
   * @returns {void}
   */
  const resetGame = () => {
    try {
      if (!player1 || !player2) {
        throw new Error("Game not initialized");
      }
      setCurrentPlayer(player1);
      setScore();
      setGameOver(false);

      // Reset player gameboards
      player1.getGameboard().reset();
      player2.getGameboard().reset();
    } catch (error) {
      console.error("Game reset error:", error);
      throw error;
    }
  };

  /**
   * switchTurn
   *
   * Public method to switch the current player to the next player.
   * Should be called internally after an attack to toggle the turn.
   *
   * @returns {void}
   */
  const switchTurn = () => {
    if (gameOver) {
      console.warn("Cannot switch turn. The game is already over.");
      return;
    }
    setCurrentPlayer(currentPlayer === player1 ? player2 : player1);
    console.log(`Switched turn to: ${currentPlayer.getName()}`);
  };

  /**
   * attack
   *
   * Handles the attack action by the current player on the opponent's gameboard.
   *
   * @param {number} x - The x-coordinate of the attack
   * @param {number} y - The y-coordinate of the attack
   * @returns {Object} - The result of the attack (hit, sunk)
   */
  const attack = (x, y) => {
    if (gameOver) {
      throw new Error("Game is already over.");
    }

    const opponent = getOpponent();
    const opponentBoard = opponent.getGameboard();

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

    if (opponentBoard.hasBeenAttacked(x, y)) {
      throw new Error(ERROR_MESSAGES.ALREADY_ATTACKED);
    }

    const attackResult = opponentBoard.receiveAttack(x, y);

    // Update score if ship is sunk
    if (attackResult.sunk) {
      updateScore(currentPlayer);
    }

    // Check if all ships are sunk
    gameOver = opponentBoard.areAllShipsSunk();

    // Switch turns if the game is not over
    if (!isGameOver()) {
      switchTurn();
    } else {
      console.log(`${currentPlayer.getName()} has won the game!`);
    }

    return attackResult;
  };

  /**
   * getPlayers
   *
   * Returns an array of all players in the game.
   *
   * @returns {Array<Player>} - The players
   */
  const getPlayers = () => {
    return [player1, player2];
  };

  /**
   * getCurrentPlayer
   *
   * Returns the current player.
   *
   * @returns {Player} - The current player
   */
  const getCurrentPlayer = () => {
    return currentPlayer;
  };

  /**
   * setCurrentPlayer
   * Direct state management method, primarily for testing/initialization
   */
  const setCurrentPlayer = (player) => {
    if (!player || ![player1, player2].includes(player)) {
      throw new Error("Invalid player provided");
    }
    currentPlayer = player;
  };

  /**
   * getOpponent
   *
   * Returns the opponent of the current player.
   *
   * @returns {Player} - The opponent player
   */
  const getOpponent = () => {
    return currentPlayer === player1 ? player2 : player1;
  };

  /**
   * isGameOver
   *
   * Returns whether the game is over.
   *
   * @returns {boolean} - True if game is over, else false
   */
  const isGameOver = () => {
    return gameOver;
  };

  /**
   * setGameOver
   *
   * Manually sets the game over status (useful for testing).
   *
   * @param {boolean} status - The new game over status
   */
  const setGameOver = (status) => {
    gameOver = status;
  };

  /**
   * getScore
   *
   * Returns the current score.
   *
   * @returns {Object} - The score object
   */
  const getScore = () => {
    return score;
  };

  return {
    initializeGame,
    resetGame,
    getPlayers,
    getCurrentPlayer,
    getOpponent,
    isGameOver,
    setGameOver,
    getScore,
    attack,
    switchTurn,
  };
};

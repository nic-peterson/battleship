import { Player } from "./player";
import { Gameboard } from "./gameboard";
import { UI } from "./ui";
import { placeShipsRandomly } from "../helpers/placeShipsRandomly";
import { BOARD_SIZE, ERROR_MESSAGES } from "../helpers/constants";
import { battleships } from "../helpers/battleships";
import { set } from "lodash";

export const Game = () => {
  let currentPlayer;
  let gameOver = false;
  let score = {};
  let player1;
  let player2;

  // Private Methods

  /**
   * initializeGameBoards
   *
   * Initializes game boards for both players, places ships randomly,
   * and ensures that the boards are correctly created.
   *
   * @returns {Object} - Contains player1Gameboard and player2Gameboard
   */
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

  /**
   * initializePlayers
   *
   * Creates Player instances and associates them with their gameboards.
   *
   * @param {Object} playerGameboards - Contains player1Gameboard and player2Gameboard
   * @returns {Object} - Contains player1 and player2
   */
  const initializePlayers = (playerGameboards) => {
    const { player1Gameboard, player2Gameboard } = playerGameboards;

    // Initialize Players with type, name, gameboard, and identifier
    player1 = Player("human", "Alice", player1Gameboard, "player1");
    player2 = Player("computer", "Computer", player2Gameboard, "player2");

    return { player1, player2 };
  };

  /**
   * setScore
   *
   * Initializes or resets the score for both players.
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
  const initGame = () => {
    try {
      // Step 1: Initialize Gameboards
      const playerGameboards = initializeGameBoards();

      // Step 2: Initialize Players with their respective Gameboards
      const players = initializePlayers(playerGameboards);

      // Step 3: Set the current player to player1 (e.g., Player 1 starts)
      currentPlayer = players.player1;

      // Step 4: Initialize scores
      setScore();
    } catch (error) {
      console.error("Game initialization error:", error);
      throw error;
    }
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
      // Re-initialize Gameboards and Players
      const playerGameboards = initializeGameBoards();
      const players = initializePlayers(playerGameboards);

      // Reset current player to player1
      currentPlayer = players.player1;

      // Reset game over status
      gameOver = false;

      // Reset scores
      setScore();

      // Optional: Reset UI or other components if necessary
      // UI.resetUI();
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
    currentPlayer = currentPlayer === player1 ? player2 : player1;
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
   * @param {boolean} value - The new game over status
   */
  const setGameOver = (value) => {
    gameOver = value;
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
    initGame,
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

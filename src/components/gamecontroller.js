import { Game } from "./game";
import { Gameboard } from "./gameboard";
import { Ship } from "./ship";
import { Player } from "./player";
import {
  CELL_STATUS,
  ORIENTATIONS,
  PLAYER_BOARDS,
} from "../helpers/constants/boardConstants";

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../helpers/constants/messageConstants";

import { PLAYERS } from "../helpers/constants/playerConstants";
import { BATTLESHIPS } from "../helpers/constants/shipConstants";

export const GameController = (game, ui, players = [], gameboards = []) => {
  // Add validation at the start
  if (!game) throw new Error(ERROR_MESSAGES.GAME_REQUIRED);
  if (!ui) throw new Error(ERROR_MESSAGES.UI_REQUIRED);

  // Validate players if provided
  if (players.length > 0 && players.length !== 2) {
    throw new Error(ERROR_MESSAGES.INVALID_PLAYERS_COUNT);
  }

  // Validate gameboards if provided
  if (gameboards.length > 0 && gameboards.length !== 2) {
    throw new Error(ERROR_MESSAGES.INVALID_GAMEBOARDS_COUNT);
  }

  // **Elevate player and gameboard variables to the factory function scope**
  try {
    const [player1, player2] =
      players.length === 2
        ? players
        : [
            Player(
              PLAYERS.PLAYER1.TYPE,
              PLAYERS.PLAYER1.NAME,
              PLAYERS.PLAYER1.ID
            ),
            Player(
              PLAYERS.PLAYER2.TYPE,
              PLAYERS.PLAYER2.NAME,
              PLAYERS.PLAYER2.ID
            ),
          ];
    const [gameboard1, gameboard2] = gameboards.length === 2 ? gameboards : [];

    // Mapping of player IDs to their corresponding board container IDs
    const playerBoardMap = {
      player1: PLAYER_BOARDS.PLAYER1,
      player2: PLAYER_BOARDS.PLAYER2,
    };

    /**
     * Retrieves the current players.
     *
     * @returns {Array<Player>} An array containing player1 and player2.
     */
    const getPlayers = () => [player1, player2];

    /**
     * placeShipsForPlayer
     *
     * Places ships for a given player either randomly or manually.
     *
     * @param {Player} player - The player for whom to place ships
     * @param {boolean} random - If true, place ships randomly; otherwise, place manually
     * @returns {void}
     */
    const placeShipsForPlayer = (player, random = true) => {
      try {
        const gameboard = player.getGameboard();
        if (random) {
          gameboard.placeShipsRandomly();
        } else {
          const shipsToPlace = BATTLESHIPS.map((battleship) =>
            Ship(battleship.length)
          );
          gameboard.placeShip(shipsToPlace[0], 0, 0, ORIENTATIONS.HORIZONTAL);
        }
      } catch (error) {
        ui.displayMessage(error.message);
        throw error;
      }
    };

    // Initialization
    /**
     * startGame
     *
     * Starts or restarts the game by initializing players and placing ships.
     *
     * @returns {Object} The initial game state
     */
    const startGame = () => {
      if (game.isGameStarted()) {
        throw new Error(ERROR_MESSAGES.GAME_ALREADY_STARTED);
      }

      try {
        // Place ships for both players before initializing game
        placeShipsForPlayer(player1, true);
        placeShipsForPlayer(player2, true);

        game.initializeGame(player1, player2);
        ui.initUI(player1, player2);
        ui.addBoardEventListeners(PLAYER_BOARDS.PLAYER2, handleAttack);
        if (game.getCurrentPlayer().getType() === "human") {
          ui.enableBoardInteraction(PLAYER_BOARDS.PLAYER2);
        }
        ui.displayMessage(SUCCESS_MESSAGES.GAME_STARTED);
        return true;
      } catch (error) {
        ui.displayMessage(error.message);
        throw error;
      }
    };

    /**
     * restartGame
     *
     * Restarts the game by resetting game state and re-placing ships.
     *
     * @returns {void}
     */
    const restartGame = () => {
      // Reset the game state
      game.resetGame();
      ui.resetUI();

      // Place ships for both players
      placeShipsForPlayer(player1, true);
      placeShipsForPlayer(player2, true);

      startGame();
    };

    // Game Flow Management
    // TODO investigate this method
    const handleAttack = (x, y) => {
      try {
        if (game.isGameOver()) {
          throw new Error(ERROR_MESSAGES.GAME_OVER);
        }

        if (game.getCurrentPlayer().getType() === "computer") {
          return;
        }

        let attackResult = game.attack(x, y);
        handleAttackResult(attackResult);

        if (
          !game.isGameOver() &&
          game.getCurrentPlayer().getType() === "computer"
        ) {
          setTimeout(() => {
            try {
              const currentPlayer = game.getCurrentPlayer();
              const opponentBoard = game.getOpponent().getGameboard();
              const computerMove = currentPlayer.makeSmartMove(opponentBoard);
              attackResult = game.attack(computerMove.x, computerMove.y);
              handleAttackResult(attackResult);
            } catch (error) {
              ui.displayMessage("Error during computer move: " + error.message);
            }
          }, 1000);
        }

        return attackResult;
      } catch (error) {
        ui.displayMessage(error.message);
        throw error;
      }
    };

    const handleAttackResult = (attackResult) => {
      const currentPlayer = game.getCurrentPlayer();
      const opponent = game.getOpponent();

      // Display hit/miss message
      const message =
        attackResult.result === "hit"
          ? `${currentPlayer.getName()} hit ${opponent.getName()}'s ${
              attackResult.shipType
            }!`
          : `${currentPlayer.getName()} missed`;
      ui.displayMessage(message);

      // If a ship was sunk, display sinking message
      if (attackResult.sunk) {
        const sinkMessage = `${currentPlayer.getName()} sunk ${opponent.getName()}'s ${
          attackResult.shipType
        }!`;
        ui.displayMessage(sinkMessage);

        // Update scores - count ships sunk on opponent's board
        const player1Score = player2.getGameboard().getSunkShipsCount(); // Ships player1 has sunk
        const player2Score = player1.getGameboard().getSunkShipsCount(); // Ships player2 has sunk
        ui.updateScore(player1, player1Score, player2, player2Score);
      }

      // Always render both boards with their correct states
      const isPlayer1Current = currentPlayer === player1;
      ui.renderBoard(
        player1.getGameboard().getBoard(),
        PLAYER_BOARDS.PLAYER1,
        true // Always show ships on player 1's board
      );
      ui.renderBoard(
        player2.getGameboard().getBoard(),
        PLAYER_BOARDS.PLAYER2,
        false // Never show ships on player 2's board
      );

      // Re-add event listeners after rendering
      ui.addBoardEventListeners(PLAYER_BOARDS.PLAYER2, handleAttack);

      // Check for game over
      if (game.isGameOver()) {
        ui.showGameOverScreen(currentPlayer.getName());
        ui.disableBoardInteraction(PLAYER_BOARDS.PLAYER2);
        return;
      }

      // Switch turns and update UI accordingly
      game.switchTurn();
      const newCurrentPlayer = game.getCurrentPlayer();
      ui.updateCurrentPlayer(newCurrentPlayer);

      // Enable/disable boards based on whose turn it is
      if (newCurrentPlayer.getType() === "human") {
        ui.enableBoardInteraction(PLAYER_BOARDS.PLAYER2);
      } else {
        ui.disableBoardInteraction(PLAYER_BOARDS.PLAYER2);
      }
    };

    return {
      startGame,
      restartGame,
      handleAttack,
      getPlayers,
      placeShipsForPlayer,
    };
  } catch (error) {
    ui.displayMessage(error.message);
    throw error;
  }
};

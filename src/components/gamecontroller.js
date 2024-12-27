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
      try {
        if (game.isGameStarted()) return;

        player1.setGameboard(gameboard1);
        player2.setGameboard(gameboard2);

        // Initialize the game
        // initialState = {player1, player2, currentPlayer: player1};
        const initialState = game.initializeGame(player1, player2);

        // Place ships for both players

        placeShipsForPlayer(player1, true); // Random placement
        placeShipsForPlayer(player2, true); // Random placement

        ui.initUI(player1, player2);
        ui.addBoardEventListeners(PLAYER_BOARDS.PLAYER2, handleAttack);
        ui.displayMessage(SUCCESS_MESSAGES.GAME_STARTED);

        return initialState;
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

      startGame();
    };

    // Game Flow Management
    const handleAttack = (x, y) => {
      try {
        if (game.isGameOver()) {
          throw new Error(ERROR_MESSAGES.GAME_OVER);
        }

        let attackResult = game.attack(x, y);
        updateGameState(attackResult);

        // Handle computer moves in a more controlled way
        if (
          !game.isGameOver() &&
          game.getCurrentPlayer().getType() === "computer"
        ) {
          setTimeout(() => {
            const computerMove = game
              .getCurrentPlayer()
              .makeSmartMove(game.getOpponent().getGameboard());
            attackResult = game.attack(computerMove.x, computerMove.y);
            updateGameState(attackResult);
          }, 500);
        }

        return attackResult;
      } catch (error) {
        ui.displayMessage(error.message);
        throw error;
      }
    };

    // Helper to reduce code duplication
    const updateGameState = (attackResult) => {
      const currentPlayer = game.getCurrentPlayer();
      const opponent = game.getOpponent();

      ui.renderBoard(
        opponent.getGameboard().getBoard(),
        playerBoardMap[opponent.getId()],
        false
      );

      ui.displayMessage(
        attackResult.result === CELL_STATUS.HIT
          ? SUCCESS_MESSAGES.HIT
          : SUCCESS_MESSAGES.MISS
      );

      if (attackResult.sunk) {
        ui.displayMessage(SUCCESS_MESSAGES.SHIP_SUNK);
        ui.updateScore(currentPlayer, opponent);
      }

      if (game.isGameOver()) {
        ui.showGameOverScreen(currentPlayer.getName());
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

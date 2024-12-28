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

        // Enable the computer's board for the first turn (if human starts)
        if (game.getCurrentPlayer().getType() === "human") {
          ui.enableBoardInteraction(PLAYER_BOARDS.PLAYER2);
        }

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
    // TODO investigate this method
    const handleAttack = (x, y) => {
      try {
        if (game.isGameOver()) {
          throw new Error(ERROR_MESSAGES.GAME_OVER);
        }

        console.log("Before player move:", {
          currentPlayer: game.getCurrentPlayer().getName(),
          type: game.getCurrentPlayer().getType(),
        });

        if (game.getCurrentPlayer().getType() === "computer") {
          console.log("Blocked - Computer's turn");
          return;
        }

        let attackResult = game.attack(x, y);
        updateGameState(attackResult);

        console.log("After player move:", {
          currentPlayer: game.getCurrentPlayer().getName(),
          type: game.getCurrentPlayer().getType(),
        });

        // Handle computer moves
        if (
          !game.isGameOver() &&
          game.getCurrentPlayer().getType() === "computer"
        ) {
          console.log("Starting computer move...");
          setTimeout(() => {
            try {
              // Add try-catch inside setTimeout
              const computerPlayer = game.getCurrentPlayer();
              const opponentBoard = game.getOpponent().getGameboard();
              const computerMove = computerPlayer.makeSmartMove(opponentBoard);

              console.log("Computer attacking:", computerMove);

              attackResult = game.attack(computerMove.x, computerMove.y);
              updateGameState(attackResult);

              console.log("After computer move:", {
                currentPlayer: game.getCurrentPlayer().getName(),
                type: game.getCurrentPlayer().getType(),
              });
            } catch (error) {
              console.error("Error during computer move:", error);
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

    // Helper to reduce code duplication
    const updateGameState = (attackResult) => {
      const currentPlayer = game.getCurrentPlayer();
      const opponent = game.getOpponent();

      // Render the opponent's board to show the attack result
      ui.renderBoard(
        opponent.getGameboard().getBoard(),
        playerBoardMap[opponent.getId()],
        opponent.getId() === "player1" // Show ships if it's player1's board
      );

      // Also render current player's board to keep ships visible
      ui.renderBoard(
        currentPlayer.getGameboard().getBoard(),
        playerBoardMap[currentPlayer.getId()],
        currentPlayer.getId() === "player1" // Show ships if it's player1's board
      );

      // Create more detailed messages
      let message;
      if (attackResult.result === CELL_STATUS.HIT) {
        message = `${opponent.getName()} hit ${currentPlayer.getName()}'s ${
          attackResult.shipType
        }!`;
      } else {
        message = `${opponent.getName()} missed ${currentPlayer.getName()}'s ships`;
      }
      ui.displayMessage(message);

      // Handle ship sinking with more detail
      if (attackResult.sunk) {
        message = `${currentPlayer.getName()} sunk ${opponent.getName()}'s ${
          attackResult.shipType
        }!`;
        ui.displayMessage(message);

        // Get current scores - flipped to count opponent's sunk ships
        const player1Score = player2.getGameboard().getSunkShipsCount(); // Player 1's score is how many of Player 2's ships were sunk
        const player2Score = player1.getGameboard().getSunkShipsCount(); // Player 2's score is how many of Player 1's ships were sunk

        // Update score with both players and their current scores
        ui.updateScore(player1, player1Score, player2, player2Score);
      }

      // UPdate current player display
      ui.updateCurrentPlayer(currentPlayer);

      // More explicit board management
      console.log("Current player type:", currentPlayer.getType());
      if (currentPlayer.getType() === "human") {
        console.log("Enabling board for human player");
        ui.disableBoardInteraction(PLAYER_BOARDS.PLAYER1); // Disable own board
        ui.enableBoardInteraction(PLAYER_BOARDS.PLAYER2); // Enable opponent's board
      } else {
        console.log("Disabling boards for computer turn");
        ui.disableBoardInteraction(PLAYER_BOARDS.PLAYER1);
        ui.disableBoardInteraction(PLAYER_BOARDS.PLAYER2);
      }

      // Handle game over
      if (game.isGameOver()) {
        ui.showGameOverScreen(currentPlayer.getName());
        ui.disableBoardInteraction(PLAYER_BOARDS.PLAYER2);
      }

      console.log(`After ${currentPlayer.getName()}'s move:`, {
        result: attackResult.result,
        coordinates: attackResult.coordinates,
      });
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

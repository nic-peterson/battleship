// * messages.js
import { BOARD_SIZE } from "./boardConstants";

export const SUCCESS_MESSAGES = {
  GAME_STARTED: "Game started!",
  HIT: "Hit!",
  MISS: "Miss!",
  SUNK: "Sunk!",
};

export const ERROR_MESSAGES = {
  INVALID_ORIENTATION: "Invalid orientation. Use 'horizontal' or 'vertical'.",
  INVALID_COORDINATES: `Ship placement coorindates are out of bounds [0-${BOARD_SIZE}].`,
  INVALID_SHIP: "Ship must be provided.",
  OUT_OF_BOUNDS_HORIZONTAL: "Ship placement is out of bounds horizontally.",
  OUT_OF_BOUNDS_VERTICAL: "Ship placement is out of bounds vertically.",
  OVERLAPPING_SHIP: "Cannot place ship; position is already occupied.",
  ALREADY_ATTACKED: "This coordinate has already been attacked.",
  PLAYER1_BOARD_FAILED: "Player 1 Gameboard creation failed.",
  PLAYER2_BOARD_FAILED: "Player 2 Gameboard creation failed.",
  PLAYER_REQUIRED: "Both players are required to initialize game.",
  INVALID_PLAYER_OBJECT: "Invalid player objects provided.",
  INVALID_PLAYER: "Invalid player provided.",
  UNIQUE_NAME: "Players must have unique names.",
  GAMEBOARDS_REQUIRED:
    "Both players must have gameboards before initializing game.",
  GAMECONTROLLER_INIT_ERROR: "Error initializing GameController:",
  CONTAINER_NOT_FOUND: "Container not found.",
  ALREADY_STARTED: "Game has already started.",
  GAME_OVER: "Game is already over.",
  GAME_NOT_INITIALIZED: "Game not initialized",
  NO_VALID_MOVES: "No valid moves available.",
  GAME_REQUIRED: "Game instance is required",
  UI_REQUIRED: "UI instance is required",
  INVALID_PLAYERS_COUNT: "Exactly 2 players must be provided",
  INVALID_PLAYER: "Invalid player object provided",
  INVALID_GAMEBOARDS_COUNT: "Exactly 2 gameboards must be provided",
};

import { Player } from "../components/player";

// src/constants.js
export const CellStatus = {
  EMPTY: "empty",
  SHIP: "ship",
  HIT: "hit",
  MISS: "miss",
  SUNK: "sunk",
};

export const ORIENTATIONS = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
};

export const BOARD_SIZE = 10;

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
  UNIQUE_NAME: "Players must have unique names.",
  GAMEBOARDS_REQUIRED:
    "Both players must have gameboards before initializing game.",
  GAMECONTROLLER_INIT_ERROR: "Error initializing GameController:",
};

export const PLAYERS = {
  Player1: {
    type: "human",
    name: "Alice",
    id: "player1",
  },
  Player2: {
    type: "cpu",
    name: "Computer",
    id: "player2",
  },
};

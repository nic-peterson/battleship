import "./styles.css";
import { GameController } from "./components/gameController";
import { Game } from "./components/game";
import { UI } from "./components/ui";
import { Player } from "./components/player";
import { Gameboard } from "./components/gameboard";
import { BATTLESHIPS } from "./helpers/constants/shipConstants";
import { BOARD_SIZE } from "./helpers/constants/boardConstants";
import { PLAYERS } from "./helpers/constants/playerConstants";

// Create players first
const player1 = Player(
  PLAYERS.PLAYER1.TYPE,
  PLAYERS.PLAYER1.NAME,
  PLAYERS.PLAYER1.ID
);

const player2 = Player(
  PLAYERS.PLAYER2.TYPE,
  PLAYERS.PLAYER2.NAME,
  PLAYERS.PLAYER2.ID
);

// Create gameboards
const player1Board = Gameboard(BOARD_SIZE, [...BATTLESHIPS]);
const player2Board = Gameboard(BOARD_SIZE, [...BATTLESHIPS]);

// Set gameboards for players
player1.setGameboard(player1Board);
player2.setGameboard(player2Board);

// Initialize core components with players
const ui = UI();
const game = Game(player1, player2);

// Initialize game controller with all dependencies
const gameController = GameController(
  game,
  ui,
  [player1, player2],
  [player1Board, player2Board]
);

// Start the game
document.addEventListener("DOMContentLoaded", () => {
  try {
    gameController.startGame();
  } catch (error) {
    console.error("Failed to start game:", error);
  }
});

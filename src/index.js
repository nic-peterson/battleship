import "./styles.css";
import { GameController } from "./components/gamecontroller";
import { Game } from "./components/game";
import { UI } from "./components/ui";

const game = Game();

const gamecontroller = GameController(game, UI);

gamecontroller.initGame();

gamecontroller.addBoardEventListeners("player2-board");

// game.initGame();
// const [player1, player2] = game.getPlayers();

// initialize the UI
// UI.initUI(player1, player2);

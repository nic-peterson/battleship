import "./styles.css";
import { Game } from "./components/game";
import { UI } from "./components/ui";

const game = Game();
game.initGame();
const [player1, player2] = game.getPlayers();

// initialize the UI
UI.initUI(player1, player2);

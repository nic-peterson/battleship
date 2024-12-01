import "./styles.css";
import { createBoilerPlate } from "./helpers/boilerPlate";
import { createGame } from "./components/game";

// createBoilerPlate();

const game = createGame();
game.initGame();

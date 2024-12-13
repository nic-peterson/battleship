export const GameController = (game, ui) => {
  // Initialization
  const initGame = () => {
    game.initGame();

    const [player1, player2] = game.getPlayers();
    ui.initUI(player1, player2);

    addBoardEventListeners("player2-board");
  };

  // Board Event Management

  const addBoardEventListeners = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);

    if (!container) {
      throw new Error("Container not found");
    }

    // Check if listeners are already added
    if (!container.dataset.listenerAdded) {
      container.addEventListener("click", (event) => {
        const cell = event.target;

        if (
          cell.classList.contains("board-cell") &&
          !cell.classList.contains("hit") &&
          !cell.classList.contains("miss")
        ) {
          const x = parseInt(cell.getAttribute("data-x"), 10);
          const y = parseInt(cell.getAttribute("data-y"), 10);
          handleAttack(x, y);
          console.log("Attacking", x, y);
          console.log("current player", game.getCurrentPlayer().getName());
        }
      });
      container.dataset.listenerAdded = true;
    }
  };

  const enableBoardInteraction = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);

    if (!container) {
      throw new Error("Container not found");
    }

    container.classList.remove("disabled");
  };

  const disableBoardInteraction = (boardContainerId) => {
    const container = document.getElementById(boardContainerId);

    if (!container) {
      throw new Error("Container not found");
    }

    container.classList.add("disabled");
  };

  // Game Flow Management
  const handleAttack = (x, y) => {
    try {
      console.log(`Handling attack at (${x}, ${y})`);
      const attackResult = game.attack(x, y);
      console.log("Attack Result:", attackResult);

      const currentPlayer = game.getCurrentPlayer();
      const opponent = game.getOpponent();
      console.log("Current Player:", currentPlayer.getName());
      console.log("Opponent:", opponent.getName());

      ui.renderBoard(opponent.getGameboard().getBoard(), "player2-board");
      ui.displayMessage(attackResult.hit ? "Hit!" : "Miss!");

      if (attackResult.sunk) {
        ui.displayMessage("You sunk a ship!");
        ui.updateScore(currentPlayer, opponent);
      }

      if (game.isGameOver()) {
        ui.showGameOverScreen(currentPlayer.getName());
        ui.disableBoardInteraction("player2-board");
      } else {
        console.log("Switching turn");
        //game.switchTurn();
        ui.updateCurrentPlayer(game.getCurrentPlayer().getName());
      }
    } catch (error) {
      console.error("Error in handleAttack:", error);

      ui.displayMessage(error.message);
    }
  };

  return {
    initGame,
    handleAttack,
    addBoardEventListeners,
    enableBoardInteraction,
    disableBoardInteraction,
  };
};

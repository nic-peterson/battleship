export const GameController = () => {
  const addBoardEventListeners = (boardContainerId, handleAttack) => {
    const container = document.getElementById(boardContainerId);

    if (!container) {
      throw new Error("Container not found");
    }

    container.addEventListener("click", (event) => {
      const cell = event.target;
      if (
        cell.classList.contains("board-cell") &&
        !cell.classList.contains("hit") &&
        !cell.classList.contains("miss")
      ) {
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        handleAttack(x, y);
      }
    });
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

  return {
    addBoardEventListeners,
    enableBoardInteraction,
    disableBoardInteraction,
  };
};

export const createBoilerPlate = () => {
  const h1 = document.createElement("h1");
  h1.textContent = "Battleship";
  document.body.appendChild(h1);

  const gameDiv = document.createElement("div");
  gameDiv.id = "game";
  for (let i = 0; i < 2; i++) {
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("player-section");

    const playerTitle = document.createElement("h2");
    playerTitle.textContent = "Player " + (i + 1);

    const playerBoardDiv = document.createElement("div");
    playerBoardDiv.classList.add("board");
    playerBoardDiv.id = "player" + (i + 1) + "-board";

    playerDiv.appendChild(playerTitle);
    playerDiv.appendChild(playerBoardDiv);
    gameDiv.appendChild(playerDiv);
  }

  const messageDiv = document.createElement("div");
  messageDiv.id = "message";
  gameDiv.appendChild(messageDiv);

  document.body.appendChild(gameDiv);
};

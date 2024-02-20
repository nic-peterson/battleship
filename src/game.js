import { createPlayer } from "./player";
import { createGameboard } from "./gameboard";
import { placeShips } from "./helper";

// player1, player2, battleships

export const createGame = (
  { name: player1Name, type: player1Type },
  { name: player2Name, type: player2Type }
) => {
  let currentPlayer;
  let gameOver = false;
  let score = {};
  let player1;
  let player2;
  let winner;

  const isGameOver = () => {
    gameOver =
      player1.getGameboard().areAllShipsSunk() ||
      player2.getGameboard().areAllShipsSunk();
    return gameOver;
  };

  const getCurrentPlayer = () => {
    return currentPlayer;
  };

  const getPlayers = () => {
    return [player1, player2];
  };

  const getScore = () => {
    return score;
  };

  // * Private Methods
  const endGame = () => {
    gameOver = true;
  };

  const initGame = () => {
    // Create players
    // * Player 1
    const player1Gameboard = createGameboard();
    placeShips(player1Gameboard);
    player1 = createPlayer(player1Type, player1Name, player1Gameboard);
    console.log("player1Gameboard is: ");
    console.log(player1Gameboard.print());
    // * Player 2
    const player2Gameboard = createGameboard();
    placeShips(player2Gameboard);
    player2 = createPlayer(player2Type, player2Name, player2Gameboard);
    console.log("player2Gameboard is: ");
    console.log(player2Gameboard.print());
  };

  const setWinner = (player) => {
    winner = player;
  };

  const startGame = () => {
    initGame();
    // Start game
    currentPlayer = player1;
    gameOver = false;
    score = { [player1Name]: 0, [player2Name]: 0 };

    console.log("Game started");
  };

  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const updateScore = (player) => {
    score[player.getName()] += 1;
  };

  return { getCurrentPlayer, getPlayers, getScore, isGameOver, startGame };
};

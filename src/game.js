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

  const startGame = () => {
    // Define game variables

    // Create players
    // * Player 1
    const player1Gameboard = createGameboard();
    placeShips(player1Gameboard);
    player1 = createPlayer(player1Type, player1Name, player1Gameboard);
    // * Player 2
    const player2Gameboard = createGameboard();
    placeShips(player2Gameboard);
    player2 = createPlayer(player2Type, player2Name, player2Gameboard);

    // Start game
    currentPlayer = player1;
    gameOver = false;
    score = { [player1Name]: 0, [player2Name]: 0 };
  };

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

  const setWinner = (player) => {
    winner = player;
  };

  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const updateScore = (player, points) => {
    score[player.getName()] += points;
  };

  return { getCurrentPlayer, getPlayers, getScore, isGameOver, startGame };
};

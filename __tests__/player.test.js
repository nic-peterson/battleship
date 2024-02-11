const { createPlayer } = require("../src/player");
const { createGameboard } = require("../src/gameboard");
const { createShip } = require("../src/ship");

describe("Player", () => {
  test.skip("can attack opponent gameboard", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();
    const player = createPlayer("player", playerGameboard);
    // const opponent = createPlayer("computer", opponentGameboard);
    player.attack(opponentGameboard);
    expect(opponentGameboard.getMissedAttacks().length).toBe(1);
  });

  test.skip("computer player does not attack the same coordinates twice", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();
    const player = createPlayer("player", playerGameboard);
    const opponent = createPlayer("computer", opponentGameboard);
    for (let i = 0; i < 100; i++) {
      opponent.attack(playerGameboard);
    }
    const missedAttacks = playerGameboard.getMissedAttacks();
    const uniqueAttacks = new Set(missedAttacks.map(({ x, y }) => `${x},${y}`));
    expect(missedAttacks.length).toBe(uniqueAttacks.size);
  });
});

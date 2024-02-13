const { createPlayer } = require("../src/player");
const { createGameboard } = require("../src/gameboard");
const { createShip } = require("../src/ship");

describe("Player", () => {
  test("has a name", () => {
    const playerGameboard = createGameboard();
    const player = createPlayer("human", "player", playerGameboard);
    expect(player.getName()).toBe("player");
  });

  test("has a type -> human", () => {
    const playerGameboard = createGameboard();
    const player = createPlayer("human", "player", playerGameboard);
    expect(player.getType()).toBe("human");
  });

  test("has a type -> computer", () => {
    const playerGameboard = createGameboard();
    const player = createPlayer("computer", "player", playerGameboard);
    expect(player.getType()).toBe("computer");
  });

  test("returns the gameboard", () => {
    const playerGameboard = createGameboard();
    const player = createPlayer("human", "player", playerGameboard);
    expect(player.getGameboard()).toBe(playerGameboard);
  });

  test("can hit a ship on opponent gameboard", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();

    const player = createPlayer("player", playerGameboard);
    const ship = createShip(3, "horizontal", "cruiser");
    opponentGameboard.placeShip(ship, 0, 0);

    player.attack(0, 0, opponentGameboard);
    expect(ship.getHits()).toBe(1);
  });

  test("can miss a ship on opponent gameboard", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();

    const player = createPlayer("player", playerGameboard);
    player.attack(0, 0, opponentGameboard);
    expect(opponentGameboard.getMissedAttacks().length).toBe(1);

    const missedAttacks = opponentGameboard.getMissedAttacks();

    const lastMissedAttack = missedAttacks[missedAttacks.length - 1];
    expect(lastMissedAttack).toEqual({ x: 0, y: 0 });
  });

  test("throws an error if the player tries to attack the same coordinates twice", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();

    const player = createPlayer("player", playerGameboard);
    player.attack(0, 0, opponentGameboard);
    expect(() => player.attack(0, 0, opponentGameboard)).toThrow();
  });

  describe("getValidCoordinates", () => {
    test.skip("returns valid coordinates", () => {
      const attacks = new Set(["0,0", "0,1", "0,2"]);
      const opponentGameboard = createGameboard(3); // Assuming createGameboard takes the size as an argument
      const [x, y] = getValidCoordinates(attacks, opponentGameboard);
      const size = opponentGameboard.getSize();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(size);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(size);
      expect(attacks.has(`${x},${y}`)).toBe(false);
    });
  });

  /*
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
  */
});

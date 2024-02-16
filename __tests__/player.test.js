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

    const player = createPlayer("human", "player", playerGameboard);
    const ship = createShip(3, "horizontal", "cruiser");
    opponentGameboard.placeShip(ship, 0, 0);
    player.attack(0, 0, opponentGameboard); // Attack at coordinates (0,0)

    // Check that the attack was registered
    expect(opponentGameboard.getAllAttacks().has("0,0")).toBe(true);
    // Check that the ship was hit
    expect(ship.getHits()).toBe(1);

    player.attack(1, 0, opponentGameboard); // Attack at different coordinates (1,0)

    // Check that the attack was registered
    expect(opponentGameboard.getAllAttacks().has("1,0")).toBe(true);
  });

  test("can miss a ship on opponent gameboard", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();

    const player = createPlayer("human", "player", playerGameboard);
    player.attack(0, 0, opponentGameboard);
    expect(opponentGameboard.getMissedAttacks().size).toBe(1);
    expect(opponentGameboard.getMissedAttacks().has("0,0")).toBe(true);
  });

  test("throws an error if the player tries to attack the same coordinates twice", () => {
    const playerGameboard = createGameboard();
    const opponentGameboard = createGameboard();

    const player = createPlayer("player", playerGameboard);
    player.attack(0, 0, opponentGameboard);
    expect(() => player.attack(0, 0, opponentGameboard)).toThrow();
  });

  describe("getValidCoordinates", () => {
    test("returns valid coordinates that have not been attacked", () => {
      const playerGameboard = createGameboard();
      const opponentGameboard = createGameboard();

      const player = createPlayer("human", "player", playerGameboard);

      opponentGameboard.hasBeenAttacked = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const result = player.getValidCoordinates(opponentGameboard);

      expect(result).toHaveLength(2);
      expect(opponentGameboard.hasBeenAttacked).toHaveBeenCalledTimes(2);
      expect(opponentGameboard.hasBeenAttacked).toHaveBeenCalledWith(
        result[0],
        result[1]
      );
    });
  });
});

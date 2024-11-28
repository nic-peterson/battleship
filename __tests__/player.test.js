const { createPlayer } = require("../src/player");
const { createGameboard } = require("../src/gameboard");
const { createShip } = require("../src/ship");
const {
  ORIENTATIONS,
  ERROR_MESSAGES,
  CellStatus,
  BOARD_SIZE,
} = require("../src/constants"); // Assuming that the constants are exported from a separate file
// const { before } = require("lodash");

describe("Player Methods", () => {
  let player;
  let humanGameboard;
  let computerGameboard;

  beforeEach(() => {
    // Initialize gameboards for each player
    humanGameboard = createGameboard();
    computerGameboard = createGameboard();

    // Create a player instance (e.g., human)
    player = createPlayer("human", "Alice", humanGameboard);
  });

  describe("Initialization", () => {
    test("should correctly initialize player with name, type, and gameboard", () => {
      expect(player.getName()).toBe("Alice");
      expect(player.getType()).toBe("human");
      expect(player.getGameboard()).toBe(humanGameboard);
    });
  });

  describe("Attack", () => {
    test("should successfully attack a valid coordinate on opponent's gameboard", () => {
      // Arrange
      const ship = createShip(2);
      computerGameboard.placeShip(ship, 3, 3, ORIENTATIONS.HORIZONTAL);

      // Act
      const attackResult = player.attack(3, 3, computerGameboard);

      // Assert
      expect(attackResult).toEqual({ result: CellStatus.HIT, shipSunk: false });
      expect(ship.getHits()).toBe(1);
      expect(computerGameboard.getBoard()[3][3].status).toBe(CellStatus.HIT);
    });

    test("should throw an error when attacking the same position twice", () => {
      // Arrange
      const ship = createShip(2);
      computerGameboard.placeShip(ship, 4, 4, ORIENTATIONS.VERTICAL);
      player.attack(4, 4, computerGameboard); // First attack

      // Act & Assert
      expect(() => {
        player.attack(4, 4, computerGameboard); // Second attack
      }).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
    });

    test("should throw an error when attacking out-of-bounds coordinates", () => {
      // Act & Assert
      expect(() => {
        player.attack(-1, 5, computerGameboard);
      }).toThrow(ERROR_MESSAGES.INVALID_COORDINATES);

      expect(() => {
        player.attack(5, 10, computerGameboard);
      }).toThrow(ERROR_MESSAGES.INVALID_COORDINATES);
    });
  });

  describe("Valid Coordinate Generation", () => {
    test.skip("should generate valid coordinates that have not been attacked", () => {
      // Arrange
      // Simulate some attacks
      player.attack(2, 2, computerGameboard);
      player.attack(3, 3, computerGameboard);

      // Act
      const [x, y] = player.getValidCoordinates(computerGameboard);

      // Assert
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(BOARD_SIZE);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(BOARD_SIZE);
      expect(computerGameboard.hasBeenAttacked(x, y)).toBe(false);
    });

    test.skip("should return coordinates without considering orientation", () => {
      // For player, orientation isn't directly relevant; ensure coordinates are valid
      const [x, y] = player.getValidCoordinates(computerGameboard);

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(computerGameboard.getSize());
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(computerGameboard.getSize());
    });
  });

  describe("Retrieve Player Information", () => {
    test("should return the correct gameboard", () => {
      expect(player.getGameboard()).toBe(humanGameboard);
    });

    test("should return the correct player name", () => {
      expect(player.getName()).toBe("Alice");
    });

    test("should return the correct player type", () => {
      expect(player.getType()).toBe("human");
    });
  });
});

/*
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
*/

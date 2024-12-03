const { Player } = require("../src/components/player");
const { Gameboard } = require("../src/components/gameboard");
const { Ship } = require("../src/components/ship");
const {
  ORIENTATIONS,
  ERROR_MESSAGES,
  CellStatus,
  BOARD_SIZE,
} = require("../src/helpers/constants"); // Assuming that the constants are exported from a separate file
// const { before } = require("lodash");

// player.test.js

describe("Player Module", () => {
  let player;
  let mockGameboard;

  beforeEach(() => {
    // Mock Gameboard
    mockGameboard = {
      receiveAttack: jest.fn(),
      hasBeenAttacked: jest.fn(),
      getSize: jest.fn().mockReturnValue(10), // Assuming a 10x10 board
    };

    // Initialize player
    player = Player("human", "Alice", mockGameboard);
  });

  test("should initialize with correct name and type", () => {
    expect(player.getName()).toBe("Alice");
    expect(player.getType()).toBe("human");
    expect(player.getGameboard()).toBe(mockGameboard);
  });

  test("should attack opponent's gameboard at specified coordinates", () => {
    // Arrange
    mockGameboard.hasBeenAttacked.mockReturnValue(false);
    mockGameboard.receiveAttack.mockReturnValue({
      result: "hit",
      sunk: false,
      coordinates: { x: 3, y: 3 },
    });

    // Act
    const attackResult = player.attack(3, 3, mockGameboard);

    // Assert
    expect(mockGameboard.hasBeenAttacked).toHaveBeenCalledWith(3, 3);
    expect(mockGameboard.receiveAttack).toHaveBeenCalledWith(3, 3);
    expect(attackResult).toEqual({
      result: "hit",
      sunk: false,
      coordinates: { x: 3, y: 3 },
    });
  });

  test("should throw error when attacking already attacked coordinate", () => {
    // Arrange
    mockGameboard.hasBeenAttacked.mockReturnValue(true);

    // Act & Assert
    expect(() => player.attack(3, 3, mockGameboard)).toThrow(
      "This coordinate has already been attacked."
    );
  });

  test("should generate valid coordinates that have not been attacked", () => {
    // Arrange
    mockGameboard.hasBeenAttacked.mockReturnValue(false);

    // Act
    const [x, y] = player.getValidCoordinates(mockGameboard);

    // Assert
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(10);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThan(10);
    expect(mockGameboard.hasBeenAttacked).toHaveBeenCalledWith(x, y);
  });

  test("should handle computer player generating valid attack coordinates", () => {
    // Arrange
    const computerPlayer = Player("computer", "Computer", mockGameboard);
    mockGameboard.hasBeenAttacked.mockReturnValue(false);

    // Act
    const [x, y] = computerPlayer.getValidCoordinates(mockGameboard);

    // Assert
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(10);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThan(10);
    expect(mockGameboard.hasBeenAttacked).toHaveBeenCalledWith(x, y);
  });
});
/*
describe("Player Methods", () => {
  let player;
  let humanGameboard;
  let computerGameboard;

  beforeEach(() => {
    // Initialize gameboards for each player
    humanGameboard = Gameboard();
    computerGameboard = Gameboard();

    // Create a player instance (e.g., human)
    player = Player("human", "Alice", humanGameboard);
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
      const ship = Ship(2);
      computerGameboard.placeShip(ship, 3, 3, ORIENTATIONS.HORIZONTAL);

      // Act
      const attackResult = player.attack(3, 3, computerGameboard);

      // Assert
      expect(attackResult).toEqual({
        result: CellStatus.HIT,
        sunk: false,
        coordinates: { x: 3, y: 3 },
      });
      expect(ship.getHits()).toBe(1);
      expect(computerGameboard.getBoard()[3][3].status).toBe(CellStatus.HIT);
    });

    test("should throw an error when attacking the same position twice", () => {
      // Arrange
      const ship = Ship(2);
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
    test("should generate valid coordinates that have not been attacked", () => {
      // Arrange
      // Simulate some attacks
      player.attack(2, 2, computerGameboard);
      player.attack(3, 3, computerGameboard);

      // Act
      const [x, y] = player.getValidCoordinates(computerGameboard);

      // Assert
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(computerGameboard.getSize());
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(computerGameboard.getSize());
      expect(computerGameboard.hasBeenAttacked(x, y)).toBe(false);
    });

    test("should return coordinates without considering orientation", () => {
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
*/

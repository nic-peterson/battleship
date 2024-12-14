const { Player } = require("../src/components/player");
import { ERROR_MESSAGES } from "../src/helpers/constants";

// player.test.js

describe("Player Factory", () => {
  let player;
  let mockGameboard;
  let mockOpponentGameboard;

  beforeEach(() => {
    mockGameboard = {
      getSize: jest.fn().mockReturnValue(10),
      hasBeenAttacked: jest.fn().mockReturnValue(false),
      receiveAttack: jest.fn(),
    };

    mockOpponentGameboard = {
      getSize: jest.fn().mockReturnValue(10),
      hasBeenAttacked: jest.fn().mockReturnValue(false),
      receiveAttack: jest.fn(),
    };

    player = Player("human", "Alice", "player1");
  });

  describe("Initialization", () => {
    test("should create player with correct properties", () => {
      expect(player.getName()).toBe("Alice");
      expect(player.getId()).toBe("player1");
      expect(player.getType()).toBe("human");
      expect(player.getGameboard()).toBeNull();
    });
  });

  describe("Gameboard Management", () => {
    test("should set and get gameboard", () => {
      player.setGameboard(mockGameboard);
      expect(player.getGameboard()).toBe(mockGameboard);
    });
  });

  describe("Attack Functionality", () => {
    test("should successfully attack valid coordinates", () => {
      mockOpponentGameboard.receiveAttack.mockReturnValue({ hit: true });
      const result = player.attack(0, 0, mockOpponentGameboard);
      expect(result).toEqual({ hit: true });
      expect(mockOpponentGameboard.receiveAttack).toHaveBeenCalledWith(0, 0);
    });

    test("should throw error for invalid coordinates", () => {
      expect(() => player.attack(-1, 0, mockOpponentGameboard)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
      expect(() => player.attack(10, 0, mockOpponentGameboard)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
    });

    test("should throw error for already attacked coordinates", () => {
      mockOpponentGameboard.hasBeenAttacked.mockReturnValue(true);
      expect(() => player.attack(0, 0, mockOpponentGameboard)).toThrow(
        ERROR_MESSAGES.ALREADY_ATTACKED
      );
    });

    test("should throw error for non-numeric coordinates", () => {
      expect(() => player.attack("0", 0, mockOpponentGameboard)).toThrow(
        ERROR_MESSAGES.INVALID_COORDINATES
      );
    });
  });

  describe("Valid Coordinates Generation", () => {
    test("should generate coordinates within board bounds", () => {
      const [x, y] = player.getValidCoordinates(mockOpponentGameboard);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(10);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(10);
    });

    test("should retry if coordinates were already attacked", () => {
      mockOpponentGameboard.hasBeenAttacked
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const [x, y] = player.getValidCoordinates(mockOpponentGameboard);
      expect(mockOpponentGameboard.hasBeenAttacked).toHaveBeenCalledTimes(3);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
    });
  });
});

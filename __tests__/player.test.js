// player.test.js
const { Player } = require("../src/components/player");
const { Gameboard } = require("../src/components/gameboard");
const { Ship } = require("../src/components/ship");
const { ERROR_MESSAGES } = require("../src/helpers/constants/messageConstants");
import { PLAYERS } from "../src/helpers/constants/playerConstants";
import { CELL_STATUS } from "../src/helpers/constants/boardConstants";

describe("Player Factory", () => {
  let player;
  let humanPlayer;
  let computerPlayer;

  let mockGameboard;
  let mockOpponentGameboard;

  beforeEach(() => {
    mockGameboard = {
      getSize: jest.fn().mockReturnValue(10),
      hasBeenAttacked: jest.fn().mockReturnValue(false),
      receiveAttack: jest.fn(),
      getBoard: jest.fn(),
      getAllAttacks: jest.fn().mockReturnValue(new Set()),
    };

    mockOpponentGameboard = {
      getSize: jest.fn().mockReturnValue(10),
      hasBeenAttacked: jest.fn().mockReturnValue(false),
      receiveAttack: jest.fn(),
      getBoard: jest.fn(),
      getAllAttacks: jest.fn().mockReturnValue(new Set()),
    };

    player = Player("human", "Alice", "player1");

    // Use PLAYERS constant for initialization
    humanPlayer = Player(
      PLAYERS.PLAYER1.TYPE,
      PLAYERS.PLAYER1.NAME,
      PLAYERS.PLAYER1.ID
    );
    computerPlayer = Player(
      PLAYERS.PLAYER2.TYPE,
      PLAYERS.PLAYER2.NAME,
      PLAYERS.PLAYER2.ID
    );
  });

  describe("Initialization", () => {
    const testCases = [
      {
        player: () => humanPlayer,
        config: PLAYERS.PLAYER1,
      },
      {
        player: () => computerPlayer,
        config: PLAYERS.PLAYER2,
      },
    ];

    /*
    test("should create player with correct properties", () => {
      expect(player.getName()).toBe("Alice");
      expect(player.getId()).toBe("player1");
      expect(player.getType()).toBe("human");
      expect(player.getGameboard()).toBeNull();
    });
    */

    testCases.forEach(({ player, config }) => {
      test(`should initialize ${config.TYPE} player correctly`, () => {
        const p = player();
        expect(p.getType()).toBe(config.TYPE);
        expect(p.getName()).toBe(config.NAME);
        expect(p.getId()).toBe(config.ID);
        expect(p.getGameboard()).toBeNull();
      });
    });
  });

  describe("Gameboard Management", () => {
    test("should set and get gameboard", () => {
      player.setGameboard(mockGameboard);
      expect(player.getGameboard()).toBe(mockGameboard);
    });
  });

  describe("Error Handling", () => {
    test("should throw error when creating player with invalid type", () => {
      expect(() =>
        Player("invalid", PLAYERS.PLAYER1.NAME, PLAYERS.PLAYER1.ID)
      ).toThrow(ERROR_MESSAGES.INVALID_PLAYER_TYPE);
    });

    test("should throw error when creating player with missing name", () => {
      expect(() =>
        Player(PLAYERS.PLAYER1.TYPE, "", PLAYERS.PLAYER1.ID)
      ).toThrow(ERROR_MESSAGES.INVALID_PLAYER_NAME);
    });

    test("should throw error when creating player with missing id", () => {
      expect(() =>
        Player(PLAYERS.PLAYER1.TYPE, PLAYERS.PLAYER1.NAME, "")
      ).toThrow(ERROR_MESSAGES.INVALID_PLAYER_ID);
    });
  });

  describe("Attack Functionality", () => {
    beforeEach(() => {
      humanPlayer.setGameboard(mockGameboard);
    });
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
    test("should throw error when attacking without gameboard set", () => {
      const newPlayer = Player("human", "Test", "test-1");
      expect(() => {
        newPlayer.attack(0, 0, mockGameboard);
      }).toThrow(ERROR_MESSAGES.NO_GAMEBOARD);
    });

    test("should throw error when attacking null gameboard", () => {
      expect(() => {
        humanPlayer.attack(0, 0, null);
      }).toThrow(ERROR_MESSAGES.INVALID_GAMEBOARD);
    });

    test("should handle successful attack result", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });
      const result = humanPlayer.attack(0, 0, mockGameboard);
      expect(result.result).toBe(CELL_STATUS.HIT);
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

  describe("AI Player Smart Moves", () => {
    let player;
    let opponentBoard;

    beforeEach(() => {
      computerPlayer.setGameboard(mockGameboard);
      // Mock getAllAttacks to return empty set for valid moves
      mockGameboard.getAllAttacks.mockReturnValue(new Set());
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });
      mockGameboard.hasBeenAttacked.mockReturnValue(false);
    });

    test("should target adjacent cells after hit", () => {
      // First attack to set up activeHits
      computerPlayer.attack(3, 3, mockGameboard);
      const nextMove = computerPlayer.makeSmartMove(mockGameboard);

      expect(nextMove).not.toBeNull();
      const isAdjacent =
        (Math.abs(nextMove.x - 3) === 1 && nextMove.y === 3) ||
        (Math.abs(nextMove.y - 3) === 1 && nextMove.x === 3);
      expect(isAdjacent).toBe(true);
    });

    test("should follow ship line after multiple hits", () => {
      mockGameboard.hasBeenAttacked
        .mockReturnValueOnce(false) // First attack (3,3)
        .mockReturnValueOnce(false) // Second attack (4,3)
        .mockReturnValue(true); // Block these coordinates after attacks

      // Mock consecutive hits
      mockGameboard.receiveAttack
        .mockReturnValueOnce({
          result: CELL_STATUS.HIT,
          sunk: false,
          coordinates: { x: 3, y: 3 },
        })
        .mockReturnValueOnce({
          result: CELL_STATUS.HIT,
          sunk: false,
          coordinates: { x: 4, y: 3 },
        });
      mockGameboard.hasBeenAttacked
        .mockReturnValue(false) // Allow new moves
        .mockReturnValueOnce(true) // Block (3,3)
        .mockReturnValueOnce(true); // Block (4,3)

      // Make two hits in a row
      computerPlayer.attack(3, 3, mockGameboard);
      computerPlayer.attack(4, 3, mockGameboard);

      const nextMove = computerPlayer.makeSmartMove(mockGameboard);

      expect(nextMove).not.toBeNull();
      expect(
        [
          { x: 2, y: 3 },
          { x: 5, y: 3 },
        ].some((move) => move.x === nextMove.x && move.y === nextMove.y)
      ).toBe(true);
    });

    test("should use checkerboard pattern when hunting", () => {
      const move = computerPlayer.makeSmartMove(mockGameboard);

      // Should start with a checkerboard pattern
      expect((move.x + move.y) % 2).toBe(0);
    });

    test("should handle no valid moves available", () => {
      // Mock hasBeenAttacked to always return true (all cells attacked)
      mockGameboard.hasBeenAttacked.mockReturnValue(true);

      expect(() => {
        computerPlayer.getNextMove(mockGameboard);
      }).toThrow(ERROR_MESSAGES.NO_VALID_MOVES);
    });

    test("should throw error when getting next move without opponent board", () => {
      expect(() => {
        computerPlayer.getNextMove(null);
      }).toThrow(ERROR_MESSAGES.INVALID_GAMEBOARD);
    });

    test("should handle smart targeting after hit", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });

      computerPlayer.attack(5, 5, mockGameboard);
      const nextMove = computerPlayer.makeSmartMove(mockGameboard);

      // Verify move is adjacent to previous hit
      const isAdjacent =
        (Math.abs(nextMove.x - 5) === 1 && nextMove.y === 5) ||
        (Math.abs(nextMove.y - 5) === 1 && nextMove.x === 5);
      expect(isAdjacent).toBe(true);
    });

    test("should handle sunk ship and reset targeting", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: true,
      });

      // Make initial hit
      computerPlayer.attack(3, 3, mockGameboard);

      // Next move should be checkerboard pattern since targeting was reset
      const nextMove = computerPlayer.makeSmartMove(mockGameboard);
      expect((nextMove.x + nextMove.y) % 2).toBe(0);
    });

    test("should try alternate direction when hitting ship boundary", () => {
      // Mock hasBeenAttacked to track attacked coordinates
      const attackedCoords = new Set();
      mockGameboard.hasBeenAttacked.mockImplementation((x, y) =>
        attackedCoords.has(`${x},${y}`)
      );

      mockGameboard.receiveAttack.mockImplementation((x, y) => {
        attackedCoords.add(`${x},${y}`);
        return {
          result: x === 3 && y <= 4 ? CELL_STATUS.HIT : CELL_STATUS.MISS,
          sunk: false,
        };
      });

      // Make hits in a line
      computerPlayer.attack(3, 3, mockGameboard);
      computerPlayer.attack(3, 4, mockGameboard);
      computerPlayer.attack(3, 5, mockGameboard); // Miss

      const nextMove = computerPlayer.makeSmartMove(mockGameboard);
      expect(nextMove.x).toBe(3);
      expect(nextMove.y).toBe(2);
    });

    test("should handle invalid moves during targeting", () => {
      // Set up a hit at board edge
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });

      computerPlayer.attack(0, 0, mockGameboard);

      // Mock that some adjacent moves are invalid/already attacked
      mockGameboard.hasBeenAttacked
        .mockReturnValue(true) // Block most moves
        .mockReturnValueOnce(false); // Allow one valid move

      const nextMove = computerPlayer.makeSmartMove(mockGameboard);
      expect(nextMove).toBeDefined();
      expect(nextMove.x >= 0 && nextMove.x < 10).toBeTruthy();
      expect(nextMove.y >= 0 && nextMove.y < 10).toBeTruthy();
    });

    test("should handle all adjacent cells being invalid", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });

      // Make a hit but surround it with invalid moves
      computerPlayer.attack(5, 5, mockGameboard);

      // Mock hasBeenAttacked to allow one checkerboard move
      mockGameboard.hasBeenAttacked.mockImplementation(
        (x, y) =>
          // Allow one specific checkerboard position
          !(x === 0 && y === 0)
      );

      const nextMove = computerPlayer.makeSmartMove(mockGameboard);
      expect(nextMove.x).toBe(0);
      expect(nextMove.y).toBe(0);
    });

    test("should make valid random moves", () => {
      const attackedCoords = new Set();
      mockGameboard.hasBeenAttacked.mockImplementation((x, y) =>
        attackedCoords.has(`${x},${y}`)
      );

      // Make several random moves
      for (let i = 0; i < 5; i++) {
        const [x, y] = computerPlayer.getValidCoordinates(mockGameboard);

        // Verify move is within bounds
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(10);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(10);

        // Verify move wasn't previously made
        expect(attackedCoords.has(`${x},${y}`)).toBe(false);
        attackedCoords.add(`${x},${y}`);
      }
    });

    test("should make random move and return valid coordinates", () => {
      const attackedCoords = new Set();
      mockGameboard.hasBeenAttacked.mockImplementation((x, y) =>
        attackedCoords.has(`${x},${y}`)
      );

      // Make random move
      const move = computerPlayer.makeRandomMove(mockGameboard);

      // Verify coordinates are valid
      expect(move).toHaveProperty("x");
      expect(move).toHaveProperty("y");
      expect(move.x).toBeGreaterThanOrEqual(0);
      expect(move.x).toBeLessThan(10);
      expect(move.y).toBeGreaterThanOrEqual(0);
      expect(move.y).toBeLessThan(10);
    });

    test("should fallback to checkerboard pattern when no valid targeting moves", () => {
      // Setup initial hit
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });
      computerPlayer.attack(5, 5, mockGameboard);

      // Mock that all adjacent cells are attacked
      mockGameboard.hasBeenAttacked.mockImplementation((x, y) => {
        // Block all adjacent cells to force fallback
        if (Math.abs(x - 5) <= 1 && Math.abs(y - 5) <= 1) {
          return true;
        }
        // Allow one specific checkerboard position
        return !(x === 0 && y === 0);
      });

      const nextMove = computerPlayer.makeSmartMove(mockGameboard);

      // Should fallback to checkerboard pattern
      expect(nextMove.x).toBe(0);
      expect(nextMove.y).toBe(0);
      expect((nextMove.x + nextMove.y) % 2).toBe(0); // Verify checkerboard pattern
    });

    test("should collect all valid moves from the board", () => {
      // Mock a partially filled board
      mockGameboard.hasBeenAttacked.mockImplementation((x, y) => {
        // Make some cells "attacked" to test valid move collection
        if (x < 5) return true; // First half of board is attacked
        return false; // Second half is free
      });

      mockGameboard.getSize.mockReturnValue(10);

      // Get valid moves through makeSmartMove
      const move = computerPlayer.makeSmartMove(mockGameboard);

      // Verify move is from valid section
      expect(move.x).toBeGreaterThanOrEqual(5); // Should be from free half
      expect(move.x).toBeLessThan(10);
      expect(move.y).toBeGreaterThanOrEqual(0);
      expect(move.y).toBeLessThan(10);
    });
  });

  describe("Player Interaction with Gameboard", () => {
    test("should record a hit via Gameboard", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: false,
      });

      const result = humanPlayer.attack(0, 0, mockGameboard);
      expect(mockGameboard.receiveAttack).toHaveBeenCalledWith(0, 0);
      expect(result.result).toBe(CELL_STATUS.HIT);
      expect(result.sunk).toBe(false);
    });

    test("should record a miss via Gameboard", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.MISS,
        sunk: false,
      });

      const result = humanPlayer.attack(1, 1, mockGameboard);
      expect(mockGameboard.receiveAttack).toHaveBeenCalledWith(1, 1);
      expect(result.result).toBe(CELL_STATUS.MISS);
      expect(result.sunk).toBe(false);
    });

    test("should handle a sunk ship via Gameboard", () => {
      mockGameboard.receiveAttack.mockReturnValue({
        result: CELL_STATUS.HIT,
        sunk: true,
      });

      const result = humanPlayer.attack(2, 2, mockGameboard);
      expect(mockGameboard.receiveAttack).toHaveBeenCalledWith(2, 2);
      expect(result.result).toBe(CELL_STATUS.HIT);
      expect(result.sunk).toBe(true);
    });
  });
});

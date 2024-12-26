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

    /*
    beforeEach(() => {
      player = Player(
        PLAYERS.PLAYER2.TYPE,
        PLAYERS.PLAYER2.NAME,
        PLAYERS.PLAYER2.ID
      );
      opponentBoard = Gameboard();
      // Place a test ship
      const ship = Ship("Destroyer", 3);
      opponentBoard.placeShip(ship, 3, 3, "horizontal");
      computerPlayer.setGameboard(mockGameboard);
    });
    */

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
      // Mock getAllAttacks to return a full board
      const fullBoard = new Set();
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          fullBoard.add(`${x},${y}`);
        }
      }
      //mockGameboard.getAllAttacks.mockReturnValue(fullBoard);
      const mockBoard = Array(10)
        .fill(null)
        .map(() => Array(10).fill("X")); // Full board with no valid moves
      mockGameboard.getBoard = jest.fn(() => mockBoard);

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

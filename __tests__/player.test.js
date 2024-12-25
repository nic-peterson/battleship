// player.test.js
const { Player } = require("../src/components/player");
const { Gameboard } = require("../src/components/gameboard");
const { Ship } = require("../src/components/ship");
const { ERROR_MESSAGES } = require("../src/helpers/constants/messageConstants");
const {
  BOARD_SIZE,
  CELL_STATUS,
  ORIENTATIONS,
} = require("../src/helpers/constants/boardConstants");
import { BATTLESHIPS } from "../src/helpers/constants/shipConstants";

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

  describe("AI Player Smart Moves", () => {
    let player;
    let opponentBoard;

    beforeEach(() => {
      player = Player("computer", "AI", "ai-1");
      opponentBoard = Gameboard();
      // Place a test ship
      const ship = Ship("Destroyer", 3);
      opponentBoard.placeShip(ship, 3, 3, "horizontal");
    });

    test("should target adjacent cells after a hit", () => {
      // Simulate a hit
      player.attack(3, 3, opponentBoard);

      const nextMove = player.getNextMove(opponentBoard);

      // Next move should be adjacent to the hit
      expect(
        [
          { x: 2, y: 3 },
          { x: 4, y: 3 },
          { x: 3, y: 2 },
          { x: 3, y: 4 },
        ].some((move) => move.x === nextMove.x && move.y === nextMove.y)
      ).toBe(true);
    });

    test("should follow ship line after multiple hits", () => {
      // Simulate two hits in a row
      player.attack(3, 3, opponentBoard);
      player.attack(4, 3, opponentBoard);

      const nextMove = player.getNextMove(opponentBoard);

      // Next move should be in line with previous hits
      expect(
        [
          { x: 2, y: 3 },
          { x: 5, y: 3 },
        ].some((move) => move.x === nextMove.x && move.y === nextMove.y)
      ).toBe(true);
    });

    test("should use checkerboard pattern when hunting", () => {
      const move = player.getNextMove(opponentBoard);

      // Should start with a checkerboard pattern
      expect((move.x + move.y) % 2).toBe(0);
    });
  });
});

describe("Player", () => {
  let player;
  let opponentBoard;

  beforeEach(() => {
    player = Player("computer", "AI", "ai-1");
    opponentBoard = Gameboard();
  });

  describe("Basic Player Functions", () => {
    test("should return player name", () => {
      expect(player.getName()).toBe("AI");
    });

    test("should return player id", () => {
      expect(player.getId()).toBe("ai-1");
    });

    test("should return player type", () => {
      expect(player.getType()).toBe("computer");
    });
  });

  describe("Attack Logic", () => {
    test("should throw error for invalid coordinates", () => {
      expect(() => {
        player.attack(-1, 0, opponentBoard);
      }).toThrow(ERROR_MESSAGES.INVALID_COORDINATES);
    });

    test("should throw error for repeated attack", () => {
      player.attack(0, 0, opponentBoard);
      expect(() => {
        player.attack(0, 0, opponentBoard);
      }).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
    });

    test("should return attack result", () => {
      const ship = Ship("Destroyer", 2);
      opponentBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      const result = player.attack(0, 0, opponentBoard);
      expect(result.result).toBe(CELL_STATUS.HIT);
    });
  });

  describe("Computer Move Logic", () => {
    test("computer player should return valid move coordinates", () => {
      const move = player.getNextMove(opponentBoard);

      expect(move).toHaveProperty("x");
      expect(move).toHaveProperty("y");
      expect(move.x).toBeGreaterThanOrEqual(0);
      expect(move.x).toBeLessThan(BOARD_SIZE);
      expect(move.y).toBeGreaterThanOrEqual(0);
      expect(move.y).toBeLessThan(BOARD_SIZE);
    });

    test("human player should return null for getNextMove", () => {
      const humanPlayer = Player("human", "Human", "human-1");
      expect(humanPlayer.getNextMove()).toBeNull();
    });
  });
});

describe("Player", () => {
  let humanPlayer;
  let computerPlayer;
  let opponentBoard;

  beforeEach(() => {
    humanPlayer = Player("human", "Human", "human-1");
    computerPlayer = Player("computer", "AI", "computer-1");
    opponentBoard = Gameboard(BOARD_SIZE, BATTLESHIPS);
  });

  describe("Player Properties", () => {
    const testCases = [
      {
        player: "human",
        getPlayer: () => humanPlayer, // Add function to get player instance
        expected: {
          type: "human",
          name: "Human",
          id: "human-1",
        },
      },
      {
        player: "computer",
        getPlayer: () => computerPlayer, // Add function to get player instance
        expected: {
          type: "computer",
          name: "AI",
          id: "computer-1",
        },
      },
    ];

    testCases.forEach(({ playerType, getPlayer, expected }) => {
      describe(`${playerType} player`, () => {
        test("should have correct properties", () => {
          const currentPlayer = getPlayer(); // Get player instance using function
          expect(currentPlayer.getType()).toBe(expected.type);
          expect(currentPlayer.getName()).toBe(expected.name);
          expect(currentPlayer.getId()).toBe(expected.id);
        });
      });
    });
  });

  describe("Attack Validation", () => {
    const invalidAttacks = [
      {
        coords: [-1, 0],
        desc: "negative x coordinate",
        error: ERROR_MESSAGES.INVALID_COORDINATES,
      },
      {
        coords: [0, -1],
        desc: "negative y coordinate",
        error: ERROR_MESSAGES.INVALID_COORDINATES,
      },
      {
        coords: [BOARD_SIZE, 0],
        desc: "x coordinate too large",
        error: ERROR_MESSAGES.INVALID_COORDINATES,
      },
      {
        coords: [0, BOARD_SIZE],
        desc: "y coordinate too large",
        error: ERROR_MESSAGES.INVALID_COORDINATES,
      },
    ];

    invalidAttacks.forEach(({ coords, desc, error }) => {
      test(`should reject attack with ${desc}`, () => {
        expect(() => {
          humanPlayer.attack(coords[0], coords[1], opponentBoard);
        }).toThrow(error);
      });
    });

    test("should reject repeated attack", () => {
      humanPlayer.attack(0, 0, opponentBoard);
      expect(() => {
        humanPlayer.attack(0, 0, opponentBoard);
      }).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
    });
  });

  describe("Attack Results", () => {
    beforeEach(() => {
      // Setup a ship for testing hits
      const ship = Ship("Destroyer", 2);
      opponentBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);
    });

    const attackScenarios = [
      {
        desc: "hit on ship",
        coords: [0, 0],
        expected: { result: CELL_STATUS.HIT, sunk: false },
      },
      {
        desc: "miss on empty cell",
        coords: [5, 5],
        expected: { result: CELL_STATUS.MISS, sunk: false },
      },
    ];

    attackScenarios.forEach(({ desc, coords, expected }) => {
      test(`should correctly register ${desc}`, () => {
        const result = humanPlayer.attack(coords[0], coords[1], opponentBoard);
        expect(result.result).toBe(expected.result);
        expect(result.sunk).toBe(expected.sunk);
      });
    });
  });

  describe("Computer AI", () => {
    describe("Move Generation", () => {
      test("computer should generate valid moves", () => {
        const move = computerPlayer.getNextMove(opponentBoard);

        expect(move).toMatchObject({
          x: expect.any(Number),
          y: expect.any(Number),
        });

        expect(move.x).toBeGreaterThanOrEqual(0);
        expect(move.x).toBeLessThan(BOARD_SIZE);
        expect(move.y).toBeGreaterThanOrEqual(0);
        expect(move.y).toBeLessThan(BOARD_SIZE);
      });

      test("human should return null for getNextMove", () => {
        expect(humanPlayer.getNextMove()).toBeNull();
      });
    });

    describe("Smart Targeting", () => {
      beforeEach(() => {
        const ship = Ship("Destroyer", 3);
        opponentBoard.placeShip(ship, 3, 3, ORIENTATIONS.HORIZONTAL);
      });

      test("should target adjacent cells after hit", () => {
        computerPlayer.attack(3, 3, opponentBoard);
        const nextMove = computerPlayer.getNextMove(opponentBoard);

        const validAdjacentMoves = [
          { x: 2, y: 3 },
          { x: 4, y: 3 },
          { x: 3, y: 2 },
          { x: 3, y: 4 },
        ];

        expect(
          validAdjacentMoves.some(
            (move) => move.x === nextMove.x && move.y === nextMove.y
          )
        ).toBe(true);
      });

      test("should follow ship direction after multiple hits", () => {
        // Make two hits in a row
        computerPlayer.attack(3, 3, opponentBoard);
        computerPlayer.attack(4, 3, opponentBoard);

        const nextMove = computerPlayer.getNextMove(opponentBoard);
        const validLinearMoves = [
          { x: 2, y: 3 },
          { x: 5, y: 3 },
        ];

        expect(
          validLinearMoves.some(
            (move) => move.x === nextMove.x && move.y === nextMove.y
          )
        ).toBe(true);
      });
    });
  });
});

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

  describe("AI Player Smart Moves", () => {
    let player;
    let opponentBoard;

    beforeEach(() => {
      player = Player("computer", "AI", "ai-1");
      opponentBoard = Gameboard();
      // Place a test ship
      const ship = Ship("Destroyer", 3);
      opponentBoard.placeShip(ship, 3, 3, "horizontal");
    });

    test("should target adjacent cells after a hit", () => {
      // Simulate a hit
      player.attack(3, 3, opponentBoard);

      const nextMove = player.getNextMove(opponentBoard);

      // Next move should be adjacent to the hit
      expect(
        [
          { x: 2, y: 3 },
          { x: 4, y: 3 },
          { x: 3, y: 2 },
          { x: 3, y: 4 },
        ].some((move) => move.x === nextMove.x && move.y === nextMove.y)
      ).toBe(true);
    });

    test("should follow ship line after multiple hits", () => {
      // Simulate two hits in a row
      player.attack(3, 3, opponentBoard);
      player.attack(4, 3, opponentBoard);

      const nextMove = player.getNextMove(opponentBoard);

      // Next move should be in line with previous hits
      expect(
        [
          { x: 2, y: 3 },
          { x: 5, y: 3 },
        ].some((move) => move.x === nextMove.x && move.y === nextMove.y)
      ).toBe(true);
    });

    test("should use checkerboard pattern when hunting", () => {
      const move = player.getNextMove(opponentBoard);

      // Should start with a checkerboard pattern
      expect((move.x + move.y) % 2).toBe(0);
    });
  });
});

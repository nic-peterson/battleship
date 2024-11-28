const { createGameboard } = require("../src/gameboard"); // replace with the path to your createGameboard function
const { createShip } = require("../src/ship"); // replace with the path to your createShip function

const {
  CellStatus,
  ORIENTATIONS,
  ERROR_MESSAGES,
} = require("../src/constants");
const { battleships } = require("../src/battleships");

const verifyShipPlacement = (board, ship, coordinates) => {
  coordinates.forEach(([x, y]) => {
    expect(board[y][x].ship).toBe(ship);
    expect(board[y][x].status).toBe(CellStatus.SHIP);
  });
};

const expectedTotal = battleships.reduce((sum, ship) => sum + ship.length, 0);

describe("Gameboard Methods", () => {
  let gameboard;

  beforeEach(() => {
    gameboard = createGameboard();
  });

  describe("Gameboard Initialization", () => {
    test("should create a 10x10 gameboard array initialized with empty objects", () => {
      const gameboard = createGameboard();
      const board = gameboard.getBoard();

      // Check that the board has 10 rows
      expect(board.length).toBe(10);

      // Check that each row has 10 columns
      board.forEach((row) => {
        expect(row.length).toBe(10);
      });

      // Check that all cells are initialized to null
      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toHaveProperty("ship", null);
          expect(cell).toHaveProperty("isHit", false);
          expect(cell).toHaveProperty("status", CellStatus.EMPTY);
        });
      });
    });
  });

  describe("Ship Placement", () => {
    describe("Valid Placements", () => {
      test("should place a ship horizontally without errors", () => {
        const ship = createShip(3);
        gameboard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);
        const board = gameboard.getBoard();
        const coordinates = [
          [0, 0],
          [1, 0],
          [2, 0],
        ];

        verifyShipPlacement(board, ship, coordinates);
      });

      test("should place a ship vertically without errors", () => {
        const ship = createShip(3);
        gameboard.placeShip(ship, 2, 2, ORIENTATIONS.VERTICAL);
        const board = gameboard.getBoard();
        const coordinates = [
          [2, 2],
          [2, 3],
          [2, 4],
        ];

        verifyShipPlacement(board, ship, coordinates);
      });

      test("should place a ship at the extreme left edge horizontally", () => {
        const ship = createShip(1);
        gameboard.placeShip(ship, 0, 5, ORIENTATIONS.HORIZONTAL);
        const board = gameboard.getBoard();
        const coordinates = [[0, 5]];

        verifyShipPlacement(board, ship, coordinates);
      });

      test("should place a ship at the extreme right edge horizontally", () => {
        const ship = createShip(1);
        gameboard.placeShip(ship, 9, 5, ORIENTATIONS.HORIZONTAL);
        const board = gameboard.getBoard();
        const coordinates = [[9, 5]];

        verifyShipPlacement(board, ship, coordinates);
      });

      test("should place a ship at the extreme top edge vertically", () => {
        const ship = createShip(1);
        gameboard.placeShip(ship, 5, 0, ORIENTATIONS.VERTICAL);
        const board = gameboard.getBoard();
        const coordinates = [[5, 0]];

        verifyShipPlacement(board, ship, coordinates);
      });

      test("should place a ship at the extreme bottom edge vertically", () => {
        const ship = createShip(1);
        gameboard.placeShip(ship, 5, 9, ORIENTATIONS.VERTICAL);
        const board = gameboard.getBoard();
        const coordinates = [[5, 9]];

        verifyShipPlacement(board, ship, coordinates);
      });

      test("should place multiple ships without overlap", () => {
        const ship1 = createShip(3);
        const ship2 = createShip(2);
        gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
        gameboard.placeShip(ship2, 2, 2, ORIENTATIONS.VERTICAL);
        const board = gameboard.getBoard();

        verifyShipPlacement(board, ship1, [
          [0, 0],
          [1, 0],
          [2, 0],
        ]);

        verifyShipPlacement(board, ship2, [
          [2, 2],
          [2, 3],
        ]);
      });
    });

    describe("Invalid Placements", () => {
      test.each([
        {
          description: "negative x and y coordinates",
          x: -1,
          y: -1,
          orientation: ORIENTATIONS.HORIZONTAL,
          error: ERROR_MESSAGES.INVALID_COORDINATES,
        },
        {
          description: "negative x coordinate",
          x: -2,
          y: 5,
          orientation: ORIENTATIONS.HORIZONTAL,
          error: ERROR_MESSAGES.INVALID_COORDINATES,
        },

        {
          description: "negative y coordinate",
          x: 5,
          y: -3,
          orientation: ORIENTATIONS.VERTICAL,
          error: ERROR_MESSAGES.INVALID_COORDINATES,
        },
        {
          description: "x and y coordinates exceed board size",
          x: 10,
          y: 10,
          orientation: ORIENTATIONS.HORIZONTAL,
          error: ERROR_MESSAGES.INVALID_COORDINATES,
        },
        {
          description: "x coordinate exceeds board size",
          x: 10,
          y: 5,
          orientation: ORIENTATIONS.HORIZONTAL,
          error: ERROR_MESSAGES.INVALID_COORDINATES,
        },
        {
          description: "y coordinate exceeds board size",
          x: 5,
          y: 10,
          orientation: ORIENTATIONS.VERTICAL,
          error: ERROR_MESSAGES.INVALID_COORDINATES,
        },
        {
          description: "x + length exceeds board size horizontally",
          x: 7,
          y: 5,
          orientation: ORIENTATIONS.HORIZONTAL,
          shipLength: 4,
          error: ERROR_MESSAGES.OUT_OF_BOUNDS_HORIZONTAL,
        },
        {
          description: "y + length exceeds board size vertically",
          x: 5,
          y: 7,
          orientation: ORIENTATIONS.VERTICAL,
          shipLength: 4,
          error: ERROR_MESSAGES.OUT_OF_BOUNDS_VERTICAL,
        },
        {
          description: "diagonal orientation",
          x: 0,
          y: 0,
          orientation: "diagonal",
          error: ERROR_MESSAGES.INVALID_ORIENTATION,
        },
      ])(
        "should throw an error when placing a ship with $description",
        ({ x, y, orientation, shipLength = 3, error }) => {
          const ship = createShip(shipLength);
          expect(() => {
            gameboard.placeShip(ship, x, y, orientation);
          }).toThrow(error);
        }
      );

      test("should throw an error when placing overlapping ships", () => {
        const ship1 = createShip(3);
        const ship2 = createShip(2);
        gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);

        expect(() => {
          gameboard.placeShip(ship2, 1, 0, ORIENTATIONS.VERTICAL);
        }).toThrow(ERROR_MESSAGES.OVERLAPPING_SHIP);
      });
    });
  });

  describe("Receiving Attacks", () => {
    describe("Hits and Sinks", () => {
      test("should register a hit on a ship", () => {
        const ship = createShip(2);
        gameboard.placeShip(ship, 1, 1, ORIENTATIONS.HORIZONTAL);

        const attackResult = gameboard.receiveAttack(1, 1);

        expect(attackResult).toEqual({
          result: CellStatus.HIT,
          shipSunk: false,
        });
        expect(ship.getHits()).toBe(1);
        expect(gameboard.getBoard()[1][1].status).toBe(CellStatus.HIT);
      });

      test("should register a sink when all parts of the ship are hit", () => {
        const ship = createShip(2);
        gameboard.placeShip(ship, 1, 1, ORIENTATIONS.HORIZONTAL);

        gameboard.receiveAttack(1, 1);
        const attackResult = gameboard.receiveAttack(2, 1);

        expect(attackResult).toEqual({
          result: CellStatus.HIT,
          shipSunk: true,
        });
        expect(ship.isSunk()).toBe(true);
        expect(gameboard.getBoard()[1][1].status).toBe(CellStatus.HIT);
        expect(gameboard.getBoard()[1][2].status).toBe(CellStatus.HIT);
      });

      test("should register a miss when attacking an empty cell", () => {
        const attackResult = gameboard.receiveAttack(0, 0);

        expect(attackResult).toEqual({ result: CellStatus.MISS });
        expect(gameboard.getBoard()[0][0].status).toBe(CellStatus.MISS);
        expect(gameboard.getMissedAttacks()).toContainEqual({ x: 0, y: 0 });
      });

      test("should throw an error when attacking the same position twice", () => {
        gameboard.receiveAttack(0, 0);

        expect(() => {
          gameboard.receiveAttack(0, 0);
        }).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
      });

      test("should register a hit on a ship placed at the extreme corner", () => {
        const ship = createShip(1);
        gameboard.placeShip(ship, 9, 9, ORIENTATIONS.HORIZONTAL);
        const attackResult = gameboard.receiveAttack(9, 9);
        const board = gameboard.getBoard();

        expect(attackResult).toEqual({
          result: CellStatus.HIT,
          shipSunk: true,
        });
        expect(board[9][9].status).toBe(CellStatus.HIT);
      });

      test("should register a miss on a cell with no ship at extreme corner", () => {
        const attackResult = gameboard.receiveAttack(0, 9);
        const board = gameboard.getBoard();

        expect(attackResult).toEqual({ result: CellStatus.MISS });
        expect(board[9][0].status).toBe(CellStatus.MISS);
        expect(gameboard.getMissedAttacks()).toContainEqual({ x: 0, y: 9 });
      });
    });

    describe("Multiple Attacks", () => {
      test("should register multiple hits and sinks correctly", () => {
        const ship1 = createShip(2);
        const ship2 = createShip(3);
        gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
        gameboard.placeShip(ship2, 2, 2, ORIENTATIONS.VERTICAL);

        // Attack ship1
        let result = gameboard.receiveAttack(0, 0);
        expect(result).toEqual({ result: CellStatus.HIT, shipSunk: false });
        expect(ship1.getHits()).toBe(1);

        result = gameboard.receiveAttack(1, 0);
        expect(result).toEqual({ result: CellStatus.HIT, shipSunk: true });
        expect(ship1.isSunk()).toBe(true);

        // Attack ship2
        result = gameboard.receiveAttack(2, 2);
        expect(result).toEqual({ result: CellStatus.HIT, shipSunk: false });
        expect(ship2.getHits()).toBe(1);

        result = gameboard.receiveAttack(2, 3);
        expect(result).toEqual({ result: CellStatus.HIT, shipSunk: false });
        expect(ship2.getHits()).toBe(2);

        result = gameboard.receiveAttack(2, 4);
        expect(result).toEqual({ result: CellStatus.HIT, shipSunk: true });
        expect(ship2.isSunk()).toBe(true);
      });
    });
  });

  describe("Gameboard Status", () => {
    test("should return all missed shots", () => {
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 1);

      const missedAttacks = gameboard.getMissedAttacks();
      expect(missedAttacks).toContainEqual({ x: 0, y: 0 });
      expect(missedAttacks).toContainEqual({ x: 1, y: 1 });
      expect(missedAttacks).toHaveLength(2);
    });

    test("should return all hits", () => {
      const ship = createShip(2);
      gameboard.placeShip(ship, 1, 1, ORIENTATIONS.HORIZONTAL);
      gameboard.receiveAttack(1, 1);
      gameboard.receiveAttack(2, 1);

      const hits = gameboard.getHits();
      expect(hits).toContainEqual({ x: 1, y: 1 });
      expect(hits).toContainEqual({ x: 2, y: 1 });
      expect(hits).toHaveLength(2);
    });

    test("should return true if all ships are sunk", () => {
      const ship1 = createShip(1);
      const ship2 = createShip(2);
      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
      gameboard.placeShip(ship2, 2, 2, ORIENTATIONS.VERTICAL);

      gameboard.receiveAttack(0, 0); // Sink ship1
      gameboard.receiveAttack(2, 2);
      gameboard.receiveAttack(2, 3); // Sink ship2

      expect(gameboard.areAllShipsSunk()).toBe(true);
    });

    test("should return false if not all ships are sunk", () => {
      const ship1 = createShip(1);
      const ship2 = createShip(2);
      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
      gameboard.placeShip(ship2, 2, 2, ORIENTATIONS.VERTICAL);

      gameboard.receiveAttack(0, 0); // Sink ship1
      gameboard.receiveAttack(2, 2); // Partially hit ship2

      expect(gameboard.areAllShipsSunk()).toBe(false);
    });

    test("should return true if all ships are placed", () => {
      // Assuming total ships to place is defined elsewhere, e.g., battleships.js
      const ship1 = createShip(3);
      const ship2 = createShip(2);
      const ship3 = createShip(4);
      const ship4 = createShip(5);
      const ship5 = createShip(3);

      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
      gameboard.placeShip(ship2, 1, 1, ORIENTATIONS.VERTICAL);
      gameboard.placeShip(ship3, 2, 2, ORIENTATIONS.HORIZONTAL);
      gameboard.placeShip(ship4, 5, 5, ORIENTATIONS.VERTICAL);
      gameboard.placeShip(ship5, 4, 4, ORIENTATIONS.HORIZONTAL);

      // Adjust this based on actual implementation of allShipsPlaced
      expect(gameboard.allShipsPlaced()).toEqual({
        allPlaced: true,
        placed: expectedTotal,
      });
    });

    test("should return false if not all ships are placed", () => {
      const ship1 = createShip(3);
      const ship2 = createShip(2);
      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
      // ship2 not placed

      expect(gameboard.allShipsPlaced()).toEqual({
        allPlaced: false,
        placed: 3,
      });
    });
  });
});

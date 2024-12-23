// * gameboard.test.js: Tests for the Gameboard module

import { Gameboard } from "../src/components/gameboard";
import { Ship } from "../src/components/ship";
import {
  BOARD_SIZE,
  CELL_STATUS,
  ORIENTATIONS,
} from "../src/helpers/constants/boardConstants";
import { ERROR_MESSAGES } from "../src/helpers/constants/messageConstants";
import { BATTLESHIPS } from "../src/helpers/constants/shipConstants";

const verifyShipPlacement = (board, ship, positions) => {
  positions.forEach(({ x, y }) => {
    expect(board[y][x].ship).toBe(ship);
    expect(board[y][x].status).toBe(CELL_STATUS.SHIP);
    expect(board[y][x].shipType).toBe(ship.getType()); // Verifies shipType for consistency
  });
};

const expectedTotal = BATTLESHIPS.reduce((sum, ship) => sum + ship.length, 0);

describe("Gameboard Methods", () => {
  let gameboard;

  beforeEach(() => {
    gameboard = Gameboard(BOARD_SIZE, BATTLESHIPS);
  });

  describe("Gameboard Initialization", () => {
    test("should create a 10x10 gameboard array initialized with empty objects", () => {
      const board = gameboard.getBoard();

      expect(board.length).toBe(BOARD_SIZE);
      board.forEach((row) => {
        expect(row.length).toBe(BOARD_SIZE);
        row.forEach((cell) => {
          expect(cell).toHaveProperty("ship", null);
          expect(cell).toHaveProperty("hasBeenAttacked", false);
          expect(cell).toHaveProperty("status", CELL_STATUS.EMPTY);
        });
      });
    });

    test.each([8, 10, 12])("should create a %dx%d gameboard", (size) => {
      const gameboard = Gameboard(size, BATTLESHIPS);
      const board = gameboard.getBoard();
      expect(board.length).toBe(gameboard.getSize());
      expect(board.length).toBe(size);
      board.forEach((row) => {
        expect(row.length).toBe(size);
      });
    });

    test("should return all ships passed", () => {
      const ships = gameboard.getShips();
      expect(ships).toEqual(BATTLESHIPS);
    });

    test("should create a gameboard with the parameterized ships", () => {
      const ships = gameboard.getShips();
      expect(ships).toEqual(BATTLESHIPS);
    });

    test("should handle small board sizes gracefully", () => {
      const smallGameboard = Gameboard(2, BATTLESHIPS);
      expect(() => smallGameboard.placeShipsRandomly()).toThrow(); // Expecting it to fail if ships can't fit
    });
  });

  describe("Ship Placement", () => {
    test("should place a ship horizontally without errors", () => {
      const ship = Ship("Destroyer", 3);
      gameboard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);
      const board = gameboard.getBoard();
      const coordinates = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];

      verifyShipPlacement(board, ship, coordinates);
    });

    test("should place a ship vertically without errors", () => {
      const ship = Ship("Submarine", 3);
      gameboard.placeShip(ship, 2, 2, ORIENTATIONS.VERTICAL);
      const board = gameboard.getBoard();
      const coordinates = [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
      ];

      verifyShipPlacement(board, ship, coordinates);
    });

    test("should throw an error when overlapping ships are placed", () => {
      const ship1 = Ship("Battleship", 3);
      const ship2 = Ship("Patrol Boat", 2);
      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);

      expect(() => {
        gameboard.placeShip(ship2, 1, 0, ORIENTATIONS.VERTICAL);
      }).toThrow(ERROR_MESSAGES.OVERLAPPING_SHIP);
    });

    test("should throw an error when ship placement is out of bounds horizontally", () => {
      const ship = Ship("Destroyer", 3);
      expect(() => {
        gameboard.placeShip(ship, 8, 0, ORIENTATIONS.HORIZONTAL);
      }).toThrow(ERROR_MESSAGES.OUT_OF_BOUNDS_HORIZONTAL);
    });

    test("should throw an error when ship placement is out of bounds vertically", () => {
      const ship = Ship("Submarine", 3);
      expect(() => {
        gameboard.placeShip(ship, 0, 8, ORIENTATIONS.VERTICAL);
      }).toThrow(ERROR_MESSAGES.OUT_OF_BOUNDS_VERTICAL);
    });

    test("should throw an error if attempting to place an invalid ship", () => {
      expect(() => {
        gameboard.placeShip(null, 0, 0, ORIENTATIONS.HORIZONTAL);
      }).toThrow(ERROR_MESSAGES.INVALID_SHIP);
    });

    test("should throw an error if attempting to place a ship with an invalid orientation", () => {
      const ship = Ship("Destroyer", 2);
      expect(() => {
        gameboard.placeShip(ship, 0, 0, "diagonal");
      }).toThrow(ERROR_MESSAGES.INVALID_ORIENTATION);
    });

    test("should throw an error if attempting to place a ship with invalid coordinates", () => {
      const ship = Ship("Destroyer", 2);
      expect(() => {
        gameboard.placeShip(ship, -1, 0, ORIENTATIONS.HORIZONTAL);
      }).toThrow(ERROR_MESSAGES.INVALID_COORDINATES);
    });

    test("should throw an error if there's no ship provided for random placement", () => {
      const testGameboard = Gameboard(BOARD_SIZE, []);
      expect(() => testGameboard.placeShipsRandomly()).toThrow();
    });

    test("should throw an error if attempts exceed the maximum number of tries", () => {
      const testGameboard = Gameboard(5, BATTLESHIPS);
      testGameboard.placeShipsRandomly();
      expect(() => testGameboard.placeShipsRandomly()).toThrow();
    });

    test("should randomly place all ships on the board", () => {
      gameboard.placeShipsRandomly();
      const board = gameboard.getBoard();
      const placedShips = gameboard.getPlacedShips();
      const totalPlaced = placedShips.reduce(
        (sum, { positions }) => sum + positions.length,
        0
      );

      expect(totalPlaced).toBe(expectedTotal);

      placedShips.forEach(({ ship, positions }) => {
        verifyShipPlacement(board, ship, positions);
      });
    });

    test("should handle multiple random placements consistently", () => {
      for (let i = 0; i < 100; i++) {
        const testGameboard = Gameboard(BOARD_SIZE, BATTLESHIPS);
        expect(() => testGameboard.placeShipsRandomly()).not.toThrow();
      }
    });

    test("should accurately report all ships placed", () => {
      gameboard.placeShipsRandomly();
      expect(gameboard.allShipsPlaced().allPlaced).toBe(true);
    });

    test("placeShipOnBoard should correctly assign ship properties to board cells", () => {
      const ship = Ship("Battleship", 4);
      gameboard.placeShip(ship, 5, 5, ORIENTATIONS.HORIZONTAL);
      const board = gameboard.getBoard();

      for (let i = 0; i < ship.getLength(); i++) {
        const x = 5 + i;
        const y = 5;
        expect(board[y][x].ship).toBe(ship);
        expect(board[y][x].shipType).toBe("Battleship");
        expect(board[y][x].status).toBe(CELL_STATUS.SHIP);
      }

      const placedShips = gameboard.getPlacedShips();
      expect(placedShips).toContainEqual({
        ship,
        positions: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 7, y: 5 },
          { x: 8, y: 5 },
        ],
      });
    });
  });

  describe("Receiving Attacks", () => {
    test("should register a hit on a ship and include shipType in the result", () => {
      const ship = Ship("Destroyer", 2);
      gameboard.placeShip(ship, 1, 1, ORIENTATIONS.HORIZONTAL);

      const attackResult = gameboard.receiveAttack(1, 1);
      expect(attackResult).toEqual({
        result: CELL_STATUS.HIT,
        shipType: "Destroyer",
        sunk: false,
        coordinates: { x: 1, y: 1 },
      });
    });

    test("should register a miss on an empty cell", () => {
      const attackResult = gameboard.receiveAttack(0, 0);
      expect(attackResult).toEqual({
        result: CELL_STATUS.MISS,
        shipType: null,
        sunk: false,
        coordinates: { x: 0, y: 0 },
      });
    });

    test("should register a sunk ship when all parts are hit", () => {
      const ship = Ship("Destroyer", 2);
      gameboard.placeShip(ship, 1, 1, ORIENTATIONS.HORIZONTAL);
      gameboard.receiveAttack(1, 1);
      const attackResult = gameboard.receiveAttack(2, 1);
      expect(attackResult).toEqual({
        result: CELL_STATUS.HIT,
        shipType: "Destroyer",
        sunk: true,
        coordinates: { x: 2, y: 1 },
      });
    });

    test("should throw an error when attacking the same position twice", () => {
      gameboard.receiveAttack(0, 0);
      expect(() => {
        gameboard.receiveAttack(0, 0);
      }).toThrow(ERROR_MESSAGES.ALREADY_ATTACKED);
    });

    test("should throw an error when providing invalid coordinates", () => {
      expect(() => {
        gameboard.receiveAttack(-1, 0);
      }).toThrow(ERROR_MESSAGES.INVALID_COORDINATES);
    });
  });

  describe("Gameboard Status", () => {
    test("should return all missed shots", () => {
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 1);

      const missedAttacks = gameboard.getMissedAttacks();
      expect(missedAttacks).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]);
    });

    test("should return true if all ships are sunk", () => {
      const ship = Ship("Destroyer", 1);
      gameboard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);
      gameboard.receiveAttack(0, 0);
      expect(gameboard.areAllShipsSunk()).toBe(true);
    });

    test("should return false if not all ships are sunk", () => {
      const ship1 = Ship("Destroyer", 1);
      const ship2 = Ship("Cruiser", 2);
      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
      gameboard.placeShip(ship2, 1, 1, ORIENTATIONS.VERTICAL);

      gameboard.receiveAttack(0, 0); // Sink ship1
      gameboard.receiveAttack(1, 1); // Partially hit ship2

      expect(gameboard.areAllShipsSunk()).toBe(false);
    });

    test("should reset all gameboard properties", () => {
      gameboard.placeShipsRandomly();
      gameboard.receiveAttack(0, 0);
      gameboard.reset();

      expect(
        gameboard
          .getBoard()
          .every((row) =>
            row.every((cell) => cell.status === CELL_STATUS.EMPTY)
          )
      ).toBe(true);
      expect(gameboard.getHits()).toEqual([]);
      expect(gameboard.getMissedAttacks()).toEqual([]);
      expect(gameboard.getPlacedShips().length).toBe(0);
    });

    test("should get a list of all attacks", () => {
      const ship1 = Ship("Battleship", 3);
      gameboard.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL);
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 1);
      gameboard.receiveAttack(2, 2);
      gameboard.receiveAttack(3, 3);
      gameboard.receiveAttack(4, 4);

      const attacks = gameboard.getAllAttacks();
      expect(attacks).toEqual(new Set(["0,0", "1,1", "2,2", "3,3", "4,4"]));
    });

    test("should return if all ships are sunk", () => {
      const testGameboard = Gameboard(3, [
        { type: "Test Ship", length: 3 },
        { type: "Test Ship 2", length: 2 },
      ]);

      testGameboard.placeShip(
        Ship("Test Ship", 3),
        0,
        0,
        ORIENTATIONS.HORIZONTAL
      );
      testGameboard.placeShip(
        Ship("Test Ship 2", 2),
        0,
        1,
        ORIENTATIONS.HORIZONTAL
      );

      testGameboard.receiveAttack(0, 0);
      testGameboard.receiveAttack(1, 0);
      testGameboard.receiveAttack(2, 0);
      testGameboard.receiveAttack(0, 1);
      testGameboard.receiveAttack(1, 1);
      expect(testGameboard.areAllShipsSunk()).toBe(true);
    });

    test("should return false if no ships have been placed", () => {
      const emptyGameboard = Gameboard(BOARD_SIZE, BATTLESHIPS);
      expect(emptyGameboard.areAllShipsSunk()).toBe(false);
    });
  });
});

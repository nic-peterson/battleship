const { createGameboard } = require("../src/gameboard"); // replace with the path to your createGameboard function
const { createShip } = require("../src/ship"); // replace with the path to your createShip function
const { placeShips } = require("../src/helper"); // replace with the path to your placeShip function
const { before } = require("lodash");

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
          expect(cell).toHaveProperty("status", "empty");
        });
      });
    });
  });

  describe("Ship Placement", () => {
    test("should place a ship at specified coordinates horizontally", () => {
      const ship = createShip(3); // Assuming you have a createShip(length) function

      gameboard.placeShip(ship, 0, 0, "horizontal"); // Place ship at (0,0) horizontally

      const board = gameboard.getBoard();

      // Check that the ship occupies the correct cells
      expect(board[0][0].ship).toBe(ship);
      expect(board[0][1].ship).toBe(ship);
      expect(board[0][2].ship).toBe(ship);

      // Check the status of the cells
      expect(board[0][0].status).toBe("ship");
      expect(board[0][1].status).toBe("ship");
      expect(board[0][2].status).toBe("ship");
    });

    test("should place a ship at specified coordinates vertically", () => {
      const ship = createShip(3);

      gameboard.placeShip(ship, 2, 2, "vertical"); // Place ship at (0,0) vertically

      const board = gameboard.getBoard();

      // Check that the ship occupies the correct cells
      expect(board[2][2].ship).toBe(ship);
      expect(board[3][2].ship).toBe(ship);
      expect(board[4][2].ship).toBe(ship);

      // Check the status of the cells
      expect(board[2][2].status).toBe("ship");
      expect(board[3][2].status).toBe("ship");
      expect(board[4][2].status).toBe("ship");
    });

    test("should not allow ship placement out of bounds horizontally", () => {
      const ship = createShip(4);

      expect(() => {
        gameboard.placeShip(ship, 7, 0, "horizontal");
      }).toThrow("Ship placement is out of bounds horizontally.");
    });

    test("should not allow ship placement out of bounds vertically", () => {
      const ship = createShip(4);

      expect(() => {
        gameboard.placeShip(ship, 0, 7, "vertical");
      }).toThrow("Ship placement is out of bounds vertically.");
    });

    test("should not allow overlapping ships", () => {
      const ship1 = createShip(3);
      const ship2 = createShip(3);

      gameboard.placeShip(ship1, 0, 0, "horizontal");

      expect(() => {
        gameboard.placeShip(ship2, 0, 0, "vertical");
      }).toThrow("Cannot place ship; position is already occupied.");
    });
  });

  describe("Receiving Attacks", () => {
    test("should register a hit on a ship", () => {
      const ship = createShip(2);
      gameboard.placeShip(ship, 1, 1, "horizontal");

      const attackResult = gameboard.receiveAttack(1, 1);

      expect(attackResult).toEqual({ result: "hit", shipSunk: false });
      expect(ship.getHits()).toBe(1);
      expect(gameboard.getBoard()[1][1].status).toBe("hit");
    });

    test("should register a sink when all parts of the ship are hit", () => {
      const ship = createShip(2);
      gameboard.placeShip(ship, 1, 1, "horizontal");

      gameboard.receiveAttack(1, 1);
      const attackResult = gameboard.receiveAttack(2, 1);

      expect(attackResult).toEqual({ result: "hit", shipSunk: true });
      expect(ship.isSunk()).toBe(true);
      expect(gameboard.getBoard()[1][1].status).toBe("hit");
      expect(gameboard.getBoard()[1][2].status).toBe("hit");
    });

    test("should register a miss when attacking an empty cell", () => {
      const attackResult = gameboard.receiveAttack(0, 0);

      expect(attackResult).toEqual({ result: "miss" });
      expect(gameboard.getBoard()[0][0].status).toBe("miss");
      expect(gameboard.getMissedAttacks()).toContainEqual({ x: 0, y: 0 });
    });

    test("should throw an error when attacking the same position twice", () => {
      gameboard.receiveAttack(0, 0);

      expect(() => {
        gameboard.receiveAttack(0, 0);
      }).toThrow("Position has already been attacked.");
    });
  });

  describe("Gameboard Status", () => {
    test("should return all missed shots", () => {
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(1, 1);

      const missedAttacks = gameboard.getMissedAttacks();
      expect(missedAttacks).toContainEqual({ x: 0, y: 0 });
      expect(missedAttacks).toContainEqual({ x: 1, y: 1 });
    });

    test("should return all hits", () => {
      const ship = createShip(2);
      gameboard.placeShip(ship, 1, 1, "horizontal");

      gameboard.receiveAttack(1, 1);
      gameboard.receiveAttack(2, 1);

      const hits = gameboard.getHits();
      expect(hits).toContainEqual({ x: 1, y: 1 });
      expect(hits).toContainEqual({ x: 2, y: 1 });
    });

    test("should return true if all ships are sunk", () => {
      const ship1 = createShip(2);
      const ship2 = createShip(3);

      gameboard.placeShip(ship1, 1, 1, "horizontal");
      gameboard.placeShip(ship2, 3, 3, "vertical");

      gameboard.receiveAttack(1, 1);
      gameboard.receiveAttack(2, 1);
      gameboard.receiveAttack(3, 3);
      gameboard.receiveAttack(3, 4);
      gameboard.receiveAttack(3, 5);

      expect(gameboard.areAllShipsSunk()).toBe(true);
    });

    test("should return false if not all ships are sunk", () => {
      const ship1 = createShip(2);
      const ship2 = createShip(3);

      gameboard.placeShip(ship1, 1, 1, "horizontal");
      gameboard.placeShip(ship2, 3, 3, "vertical");

      gameboard.receiveAttack(1, 1);
      gameboard.receiveAttack(2, 1);
      gameboard.receiveAttack(3, 3);
      gameboard.receiveAttack(3, 4);

      expect(gameboard.areAllShipsSunk()).toBe(false);
    });

    test("should return true if all ships are placed", () => {
      const ship1 = createShip(2);
      const ship2 = createShip(3);
      const ship3 = createShip(3);
      const ship4 = createShip(4);
      const ship5 = createShip(5);

      gameboard.placeShip(ship1, 8, 8, "horizontal");
      gameboard.placeShip(ship2, 3, 3, "vertical");
      gameboard.placeShip(ship3, 5, 5, "horizontal");
      gameboard.placeShip(ship4, 6, 6, "vertical");
      gameboard.placeShip(ship5, 1, 1, "horizontal");

      const { allPlaced } = gameboard.allShipsPlaced();
      expect(allPlaced).toBe(true);
    });

    test("should return false if not all ships are placed", () => {
      const ship1 = createShip(2);

      gameboard.placeShip(ship1, 1, 1, "horizontal");

      const { allPlaced } = gameboard.allShipsPlaced();
      expect(allPlaced).toBe(false);
    });
  });
});

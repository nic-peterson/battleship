import { BATTLESHIPS } from "../src/helpers/constants/shipConstants";

// Helper function to create a mock Gameboard instance
/*
export const createMockGameboard = () => ({
  placeShipsRandomly: jest.fn(),
  getPlacedShips: jest.fn().mockReturnValue([...battleships]),
  reset: jest.fn(),
  getBoard: jest.fn().mockReturnValue([]), // Adjust as needed
});
*/

export const createMockGameboard = () => {
  let placedShips = [...BATTLESHIPS];
  let allAttacks = new Set();

  return {
    placeShipsRandomly: jest.fn(),
    getPlacedShips: jest.fn(() => placedShips),
    reset: jest.fn(() => {
      placedShips = [];
      allAttacks = new Set();
    }),
    getBoard: jest.fn(() => []),
    hasBeenAttacked: jest.fn(),
    receiveAttack: jest.fn(),
    areAllShipsSunk: jest.fn(),
    getAllAttacks: jest.fn(() => allAttacks),
  };
};

// Helper function to create a mock Player instance
export const createMockPlayer = (type, name, id) => {
  let storedBoard = null;
  return {
    getName: jest.fn().mockReturnValue(name),
    getType: jest.fn().mockReturnValue(type),
    getId: jest.fn().mockReturnValue(id),
    setGameboard: jest.fn().mockImplementation((board) => {
      storedBoard = board;
    }),
    getGameboard: jest.fn().mockImplementation(() => storedBoard),
    makeSmartMove: jest.fn(),
  };
};

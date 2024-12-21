import { battleships } from "../src/helpers/battleships";

// Helper function to create a mock Gameboard instance
export const createMockGameboard = () => ({
  placeShipsRandomly: jest.fn(),
  getPlacedShips: jest.fn().mockReturnValue([...battleships]),
  reset: jest.fn(),
  getBoard: jest.fn().mockReturnValue([]), // Adjust as needed
});

// Helper function to create a mock Player instance
export const createMockPlayer = (type, name, id) => ({
  getName: jest.fn().mockReturnValue(name),
  getType: jest.fn().mockReturnValue(type),
  getId: jest.fn().mockReturnValue(id),
  setGameboard: jest.fn(),
  getGameboard: jest.fn().mockReturnValue(createMockGameboard()),
});

// src/cell.js
import { CellStatus } from "./constants.js";

export const createCell = () => ({
  ship: null, // Reference to the ship object; null if no ship is placed
  isHit: false, // Indicates if the cell has been attacked
  status: CellStatus.EMPTY, // Uses the enumeration for status
});

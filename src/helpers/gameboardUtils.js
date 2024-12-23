// * gameboardUtils.js

import { CELL_STATUS } from "./constants/boardConstants.js";

/**
 * Creates the initial game board as a 2D array.
 * @param {number} size - The size of the game board.
 * @param {Function} createCell - A function to create individual cells.
 * @returns {Array<Array<Object>>} The initialized game board.
 */
export const createBoard = (size, createCell) => {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => createCell())
    );
};

/**
 * Creates a single cell object for the game board.
 * @returns {Object} The initialized cell object.
 */
export const createCell = () => ({
  ship: null,
  shipType: null,
  isHit: false,
  hasBeenAttacked: false,
  status: CELL_STATUS.EMPTY,
});

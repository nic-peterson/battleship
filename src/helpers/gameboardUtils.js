// * gameboardUtils.js

import { CELL_STATUS } from "./constants/boardConstants.js";

export const createBoard = (size, createCell) => {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => createCell())
    );
};

export const createCell = () => ({
  ship: null,
  shipType: null,
  isHit: false,
  hasBeenAttacked: false,
  status: CELL_STATUS.EMPTY,
});

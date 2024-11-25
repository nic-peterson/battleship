export const createShip = (length, orientation = "horizontal", type) => {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Length must be a positive integer.");
  }
  if (!["horizontal", "vertical"].includes(orientation)) {
    throw new Error("Orientation must be 'horizontal' or 'vertical'.");
  }
  if (typeof type !== "string") {
    throw new Error("Type must be a string.");
  }

  let hits = 0;

  const hit = () => {
    if (hits < length) hits += 1;
  };

  const getHits = () => hits;

  const getLength = () => length;

  const getOrientation = () => orientation;

  const getType = () => type;

  const isSunk = () => hits >= length;

  const getState = () => ({
    length,
    hits,
    isSunk: isSunk(),
    orientation,
    type,
  });

  return {
    hit,
    getHits,
    getLength,
    getOrientation,
    getType,
    isSunk,
    getState,
  };
};

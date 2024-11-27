export const createShip = (length) => {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Length must be a positive integer.");
  }

  let hits = 0;

  const hit = () => {
    if (hits < length) hits += 1;
  };

  const getHits = () => hits;

  const getLength = () => length;

  const isSunk = () => hits >= length;

  return {
    hit,
    getHits,
    getLength,
    isSunk,
  };
};

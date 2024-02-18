export const createShip = (length, orientation, type) => {
  let hits = 0;

  const hit = () => {
    hits += 1;
  };

  const getHits = () => hits;

  const getLength = () => length;

  const getOrientation = () => orientation;

  const getType = () => type;

  const isSunk = () => hits === length;

  return {
    length,
    hit,
    getHits,
    getLength,
    getOrientation,
    getType,
    isSunk,
    type,
  };
};

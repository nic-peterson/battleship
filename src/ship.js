export const createShip = (length, orientation) => {
  let hits = 0;

  const call = () => {
    console.log("I get called from ship.js!");
  };

  const hit = () => {
    hits += 1;
  };

  const getHits = () => hits;

  const getOrientation = () => orientation;

  const isSunk = () => hits === length;

  return {
    length,
    call,
    hit,
    getHits,
    getOrientation,
    isSunk,
  };
};

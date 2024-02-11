/*
export default function ship() {
  console.log("I get called from ship.js!");
}
*/

export const createShip = (length) => {
  let hits = 0;
  const call = () => {
    console.log("I get called from ship.js!");
  };

  const hit = () => {
    hits += 1;
  };

  const getHits = () => hits;

  const isSunk = () => hits === length;

  return {
    length,
    call,
    hit,
    getHits,
    isSunk,
  };
};

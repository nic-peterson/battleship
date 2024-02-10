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

  return {
    length,
    call,
    hit: () => {
      hits += 1;
    },
    getHits: () => hits,
    isSunk: () => hits === length,
  };
};

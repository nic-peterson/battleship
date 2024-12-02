/**
 * Creates a ship object with the specified length.
 *
 * @param {number} length - The length of the ship. Must be a positive integer.
 * @returns {Object} The ship object.
 * @returns {Function} hit - Registers a hit on the ship.
 * @returns {Function} getHits - Returns the number of hits the ship has taken.
 * @returns {Function} getLength - Returns the length of the ship.
 * @returns {Function} isSunk - Returns true if the ship is sunk (i.e., number of hits equals the length of the ship), otherwise false.
 * @throws {Error} If the length is not a positive integer.
 */

export const Ship = (length) => {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error("Length must be a positive integer.");
  }

  let hits = 0;

  const hit = () => {
    if (hits < length) {
      hits += 1;
    }
  };

  const getHits = () => hits;

  const getLength = () => length;

  const isSunk = () => hits === length;

  return {
    hit,
    getHits,
    getLength,
    isSunk,
  };
};

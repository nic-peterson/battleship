import { create } from "lodash";

export const createGameboard = () => {
  const ships = [];
  const missedAttacks = [];

  const placeShip = (ship, x, y) => {
    ships.push({ ship, x, y });
  };

  const receiveAttack = (x, y) => {
    const ship = ships.find((s) => s.x === x && s.y === y);
    if (ship) {
      ship.ship.hit();
    } else {
      missedAttacks.push({ x, y });
    }
  };

  const areAllShipsSunk = () => ships.every((s) => s.ship.isSunk());

  const getMissedAttacks = () => missedAttacks;

  return {
    placeShip,
    receiveAttack,
    areAllShipsSunk,
    getMissedAttacks,
  };
};

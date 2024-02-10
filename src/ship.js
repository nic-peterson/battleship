/*
export default function ship() {
  console.log("I get called from ship.js!");
}
*/

export const createShip = () => {
  const call = () => {
    console.log("I get called from ship.js!");
  };

  return {
    call,
  };
};

/*
export default function ship() {
  console.log("I get called from ship.js!");
}
*/

export const ship = (() => {
  const call = () => {
    console.log("I get called from ship.js!");
  };

  return {
    call,
  };
})();

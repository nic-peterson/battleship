export const createPlayer = (type, name, gameboard) => {
  const attacks = new Set();

  const attack = (x, y, opponentGameboard) => {
    if (!attacks.has(`${x},${y}`)) {
      attacks.add(`${x},${y}`);
      opponentGameboard.receiveAttack(x, y);
    } else {
      throw new Error("You've already attacked this position!");
    }
  };

  const getGameboard = () => gameboard;

  const getName = () => name;

  const getType = () => type;

  function getValidCoordinates(attacks, opponentGameboard) {
    let x, y;
    const size = opponentGameboard.getSize(); // Assuming getSize is a method that returns the size of the gameboard

    do {
      x = Math.floor(Math.random() * size);
      y = Math.floor(Math.random() * size);
    } while (attacks.has(`${x},${y}`));
    return [x, y];
  }

  return { attack, getValidCoordinates, getGameboard, getName, getType };
};

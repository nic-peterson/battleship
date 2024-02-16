export const createPlayer = (type, name, gameboard) => {
  const attack = (x, y, opponentGameboard) => {
    const attacks = opponentGameboard.getAllAttacks();
    const coord = `${x},${y}`;

    if (attacks.has(coord)) {
      throw new Error("You've already attacked this position!");
    }

    opponentGameboard.receiveAttack(x, y);
  };

  /*
  const attack = (x, y, opponentGameboard) => {
    const attacks = opponentGameboard.getAllAttacks();
    ``;

    console.log(attacks);

    if (!attacks.has(`${x},${y}`)) {
      attacks.add(`${x},${y}`);
      opponentGameboard.receiveAttack(x, y);
    } else {
      throw new Error("You've already attacked this position!");
    }
    
  };

  */

  const getGameboard = () => gameboard;

  const getName = () => name;

  const getType = () => type;

  function getValidCoordinates(opponentGameboard) {
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

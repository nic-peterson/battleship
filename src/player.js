export const createPlayer = () => {
  const attacks = new Set();

  const attack = (x, y, opponentGameboard) => {
    if (!attacks.has(`${x},${y}`)) {
      attacks.add(`${x},${y}`);
      opponentGameboard.receiveAttack(x, y);
    } else {
      throw new Error("You've already attacked this position!");
    }
  };

  return { attack };
};

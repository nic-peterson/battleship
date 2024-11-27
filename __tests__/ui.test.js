const { JSDOM } = require("jsdom");
const { createUI } = require("../src/ui");

function createScore() {
  const score = document.createElement("p");
  score.id = "score";
  document.body.appendChild(score);
}

function updateScore(newScore) {
  const score = document.getElementById("score");
  score.textContent = `Score: ${newScore}`;
}

describe("UI", () => {
  let dom;
  let container;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><p id="score"></p>');
    container = dom.window.document;
    // Set the global document object to the jsdom document
    global.document = container;
  });

  afterEach(() => {
    // Clean up the global document object after each test
    global.document = undefined;
  });

  test("displays score", () => {
    createScore();
    const score = container.getElementById("score");
    expect(score).toBeDefined();
  });

  test("updates score ", () => {
    createScore();

    updateScore(5);

    let score = container.getElementById("score");
    expect(score.textContent).toBe("Score: 5");
    /*
    const ui = createUI();
    const score = ui.getScore();
    expect(score).toBeDefined();
    */
  });
  /*  
  test("creates a gameboard", () => {
    const ui = createUI();
    const gameboard = ui.getGameboard();
    expect(gameboard).toBeDefined();
  });

  test("creates a player", () => {
    const ui = createUI();
    const player = ui.getPlayer();
    expect(player).toBeDefined();
  });

  test("creates an opponent", () => {
    const ui = createUI();
    const opponent = ui.getOpponent();
    expect(opponent).toBeDefined();
  });

  test("creates a display", () => {
    const ui = createUI();
    const display = ui.getDisplay();
    expect(display).toBeDefined();
  });
  */
});

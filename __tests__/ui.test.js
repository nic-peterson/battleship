const { JSDOM } = require("jsdom");
const { UI } = require("../src/components/ui");

describe("UI", () => {
  let dom;
  let container;

  beforeEach(() => {
    dom = new JSDOM(
      '<!DOCTYPE html><div id="board"></div><div id="message"></div>'
    );
    container = dom.window.document;
    global.document = container;
  });

  afterEach(() => {
    global.document = undefined;
  });

  test("renders the game board", () => {
    const board = [
      [
        { ship: true, status: "" },
        { ship: false, status: "miss" },
      ],
      [
        { ship: false, status: "" },
        { ship: true, status: "hit" },
      ],
    ];

    UI.renderBoard(board, "board");

    const boardContainer = container.getElementById("board");
    expect(boardContainer).toBeDefined();
    expect(boardContainer.children.length).toBe(2); // Two rows

    const firstRow = boardContainer.children[0];
    expect(firstRow.children.length).toBe(2); // Two cells in the first row
    expect(firstRow.children[0].classList.contains("ship")).toBe(true);
    expect(firstRow.children[1].classList.contains("miss")).toBe(true);

    const secondRow = boardContainer.children[1];
    expect(secondRow.children.length).toBe(2); // Two cells in the second row
    expect(secondRow.children[1].classList.contains("ship")).toBe(true);
    expect(secondRow.children[1].classList.contains("hit")).toBe(true);
  });

  test("displays a message", () => {
    const message = "Player 1's turn";
    UI.displayMessage(message);

    const messageContainer = container.getElementById("message");
    expect(messageContainer).toBeDefined();
    expect(messageContainer.textContent).toBe(message);
  });
});

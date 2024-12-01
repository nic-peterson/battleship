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

  test("initializes the UI", () => {
    const player1 = { getName: () => "Player 1" };
    const player2 = { getName: () => "Player 2" };

    UI.initUI(player1, player2);

    const h1 = container.querySelector("h1");
    expect(h1).toBeDefined();
    expect(h1.textContent).toBe("Battleship");

    const gameDiv = container.getElementById("game");
    expect(gameDiv).toBeDefined();

    const playerSections = gameDiv.getElementsByClassName("player-section");
    expect(playerSections.length).toBe(2);

    const player1Section = playerSections[0];
    const player1Title = player1Section.querySelector("h2");
    expect(player1Title.textContent).toBe("Player 1");

    const player2Section = playerSections[1];
    const player2Title = player2Section.querySelector("h2");
    expect(player2Title.textContent).toBe("Player 2");

    const messageDiv = container.getElementById("message");
    expect(messageDiv).toBeDefined();
  });
});

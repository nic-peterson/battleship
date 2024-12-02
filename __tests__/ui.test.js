const { JSDOM } = require("jsdom");
const { UI } = require("../src/components/ui");

describe("UI", () => {
  let dom;
  let container;

  let player1;
  let player2;

  beforeEach(() => {
    dom = new JSDOM(
      '<!DOCTYPE html><div id="board"></div><div id="message"></div>'
    );
    container = dom.window.document;
    global.document = container;

    // Reset the DOM
    document.body.innerHTML = "";

    // Mock players
    player1 = { getName: jest.fn().mockReturnValue("Alice") };
    player2 = { getName: jest.fn().mockReturnValue("Bob") };

    // Initialize the UI
    UI.initUI(player1, player2);
  });

  afterEach(() => {
    global.document = undefined;
  });

  test("should initialize UI elements correctly", () => {
    expect(document.querySelector("h1").textContent).toBe("Battleship");
    expect(document.getElementById("score")).not.toBeNull();
    expect(document.getElementById("current-player")).not.toBeNull();
    expect(document.getElementById("game")).not.toBeNull();
    expect(document.getElementById("message")).not.toBeNull();
  });

  test("should initialize UI with dynamic player names", () => {
    // Reset the DOM again to avoid interference from beforeEach
    document.body.innerHTML = "";

    player1.getName.mockReturnValue("Dynamic Player 1");
    player2.getName.mockReturnValue("Dynamic Player 2");

    UI.initUI(player1, player2);

    const playerSections = document.querySelectorAll(".player-section h2");
    expect(playerSections[0].textContent).toBe("Dynamic Player 1");
    expect(playerSections[1].textContent).toBe("Dynamic Player 2");
  });

  test("should display initial score correctly", () => {
    const scoreDiv = document.getElementById("score");
    expect(scoreDiv.textContent).toBe("Alice: 0 | Bob: 0");
  });

  test("should display current player correctly", () => {
    const currentPlayerDiv = document.getElementById("current-player");
    expect(currentPlayerDiv.textContent).toBe("Current Player: Alice");
  });

  test("should update score", () => {
    UI.setScore(player1, 5, player2, 3);
    const scoreDiv = document.getElementById("score");
    expect(scoreDiv.textContent).toBe("Alice: 5 | Bob: 3");
  });

  test("should update current player", () => {
    UI.setCurrentPlayer("Bob");
    const currentPlayerDiv = document.getElementById("current-player");
    expect(currentPlayerDiv.textContent).toBe("Current Player: Bob");
  });

  test("should display messages", () => {
    UI.displayMessage("Test message");
    const messageDiv = document.getElementById("message");
    expect(messageDiv.textContent).toBe("Test message");
  });

  test("should render board correctly", () => {
    // Create a mock board
    const mockBoard = [
      [
        { ship: null, status: null },
        { ship: {}, status: "hit" },
      ],
      [
        { ship: null, status: "miss" },
        { ship: {}, status: null },
      ],
    ];

    UI.renderBoard(mockBoard, "player1-board", true);
    const boardContainer = document.getElementById("player1-board");
    expect(boardContainer).not.toBeNull();
    const cells = boardContainer.querySelectorAll(".board-cell");
    expect(cells.length).toBe(4);

    // Check cell classes
    const cellArray = Array.from(cells);
    expect(cellArray[0].classList.contains("ship")).toBe(false);
    expect(cellArray[0].classList.contains("hit")).toBe(false);
    expect(cellArray[0].classList.contains("miss")).toBe(false);

    expect(cellArray[1].classList.contains("ship")).toBe(true);
    expect(cellArray[1].classList.contains("hit")).toBe(true);

    expect(cellArray[2].classList.contains("miss")).toBe(true);

    expect(cellArray[3].classList.contains("ship")).toBe(true);
  });

  test("should throw an error if container ID is invalid", () => {
    const mockBoard = [[{ ship: null, status: null }]];
    expect(() => {
      UI.renderBoard(mockBoard, "invalid-id");
    }).toThrowError("Container not found");
  });

  test("should render empty board", () => {
    const mockBoard = [];
    UI.renderBoard(mockBoard, "player1-board");
    const boardContainer = document.getElementById("player1-board");
    expect(boardContainer.children.length).toBe(0);
  });

  test("should handle cell clicks", () => {
    const mockHandleAttack = jest.fn();

    // Create a mock board with at least one cell
    const mockBoard = [[{ ship: null, status: null }]];

    // Render the board before adding event listeners
    UI.renderBoard(mockBoard, "player2-board");

    UI.addBoardEventListeners("player2-board", mockHandleAttack);

    const cell = document.querySelector("#player2-board .board-cell");
    cell.click();

    expect(mockHandleAttack).toHaveBeenCalled();
  });

  test.skip("renders the game board", () => {
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

  test.skip("displays a message", () => {
    const message = "Player 1's turn";
    UI.displayMessage(message);

    const messageContainer = container.getElementById("message");
    expect(messageContainer).toBeDefined();
    expect(messageContainer.textContent).toBe(message);
  });

  test.skip("initializes the UI", () => {
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

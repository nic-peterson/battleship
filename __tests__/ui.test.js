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

    // Mock gameboard objects
    const mockGameboard = {
      getBoard: jest.fn().mockReturnValue([]), // Return an empty board array
    };

    // Mock players
    player1 = {
      getName: jest.fn().mockReturnValue("Alice"),
      getGameboard: jest.fn().mockReturnValue(mockGameboard),
    };
    player2 = {
      getName: jest.fn().mockReturnValue("Bob"),
      getGameboard: jest.fn().mockReturnValue(mockGameboard),
    };

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
    UI.updateScore(player1, 5, player2, 3);
    const scoreDiv = document.getElementById("score");
    expect(scoreDiv.textContent).toBe("Alice: 5 | Bob: 3");
  });

  test("should update current player", () => {
    UI.updateCurrentPlayer("Bob");
    const currentPlayerDiv = document.getElementById("current-player");
    expect(currentPlayerDiv.textContent).toBe("Current Player: Bob");
  });

  test("should display messages", () => {
    UI.displayMessage("Test message");
    const messageDiv = document.getElementById("message");
    expect(messageDiv.textContent).toBe("Test message");
  });

  test("should render board correctly", () => {
    // Create mock ship objects
    const mockShipNotSunk = {
      isSunk: jest.fn().mockReturnValue(false),
    };

    const mockShipSunk = {
      isSunk: jest.fn().mockReturnValue(true),
    };

    // Create a mock board
    const mockBoard = [
      [
        { ship: null, status: null },
        { ship: mockShipNotSunk, status: "hit" },
      ],
      [
        { ship: null, status: "miss" },
        { ship: mockShipSunk, status: null },
      ],
    ];

    UI.renderBoard(mockBoard, "player1-board", true);
    const boardContainer = document.getElementById("player1-board");
    expect(boardContainer).not.toBeNull();
    const cells = boardContainer.querySelectorAll(".board-cell");
    expect(cells.length).toBe(4);

    // Check cell classes
    const cellArray = Array.from(cells);

    // Cell [0][0]
    expect(cellArray[0].classList.contains("ship")).toBe(false);
    expect(cellArray[0].classList.contains("hit")).toBe(false);
    expect(cellArray[0].classList.contains("miss")).toBe(false);

    // Cell [0][1]
    expect(cellArray[1].classList.contains("ship")).toBe(true);
    expect(cellArray[1].classList.contains("hit")).toBe(true);
    expect(cellArray[1].classList.contains("sunk")).toBe(false);

    // Cell [1][0]
    expect(cellArray[2].classList.contains("miss")).toBe(true);

    // Cell [1][1]
    expect(cellArray[3].classList.contains("ship")).toBe(true);
    expect(cellArray[3].classList.contains("sunk")).toBe(true);
  });

  test("should throw an error if container ID is invalid", () => {
    const mockBoard = [[{ ship: null, status: null }]];
    expect(() => {
      UI.renderBoard(mockBoard, "invalid-id");
    }).toThrowError("Container not found");
  });

  test("renderBoard should not throw an error when container is found", () => {
    const mockBoard = [[{ ship: null, status: null }]];
    const container = document.createElement("div");
    container.id = "valid-container";
    document.body.appendChild(container);

    expect(() => {
      UI.renderBoard(mockBoard, "valid-container");
    }).not.toThrow();
  });

  test("renderBoard should not display ships on opponent's board", () => {
    const mockBoard = [[{ ship: {}, status: null }]];
    const container = document.createElement("div");
    container.id = "opponent-board";
    document.body.appendChild(container);

    UI.renderBoard(mockBoard, "opponent-board", false);

    const cell = container.querySelector(".board-cell");
    expect(cell.classList.contains("ship")).toBe(false);
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
});

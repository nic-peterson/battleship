const { JSDOM } = require("jsdom");
const { UI } = require("../src/components/ui");

describe("UI", () => {
  let dom;
  let container;

  let player1;
  let player2;

  let ui;

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

    ui = UI();
    // Initialize the UI
    ui.initUI(player1, player2);
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

    ui.initUI(player1, player2);

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
    ui.updateScore(player1, 5, player2, 3);
    const scoreDiv = document.getElementById("score");
    expect(scoreDiv.textContent).toBe("Alice: 5 | Bob: 3");
  });

  test("should update current player", () => {
    ui.updateCurrentPlayer("Bob");
    const currentPlayerDiv = document.getElementById("current-player");
    expect(currentPlayerDiv.textContent).toBe("Current Player: Bob");
  });

  test("should display messages", () => {
    ui.displayMessage("Test message");
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

    ui.renderBoard(mockBoard, "player1-board", true);
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
      ui.renderBoard(mockBoard, "invalid-id");
    }).toThrowError("Container not found");
  });

  test("renderBoard should not throw an error when container is found", () => {
    const mockBoard = [[{ ship: null, status: null }]];
    const container = document.createElement("div");
    container.id = "valid-container";
    document.body.appendChild(container);

    expect(() => {
      ui.renderBoard(mockBoard, "valid-container");
    }).not.toThrow();
  });

  test("renderBoard should not display ships on opponent's board", () => {
    const mockBoard = [[{ ship: {}, status: null }]];
    const container = document.createElement("div");
    container.id = "opponent-board";
    document.body.appendChild(container);

    ui.renderBoard(mockBoard, "opponent-board", false);

    const cell = container.querySelector(".board-cell");
    expect(cell.classList.contains("ship")).toBe(false);
  });

  test("should render empty board", () => {
    const mockBoard = [];
    ui.renderBoard(mockBoard, "player1-board");
    const boardContainer = document.getElementById("player1-board");
    expect(boardContainer.children.length).toBe(0);
  });

  test("should handle cell clicks", () => {
    const mockHandleAttack = jest.fn();

    // Create a mock board with at least one cell
    const mockBoard = [[{ ship: null, status: null }]];

    // Render the board before adding event listeners
    ui.renderBoard(mockBoard, "player2-board");

    ui.addBoardEventListeners("player2-board", mockHandleAttack);

    const cell = document.querySelector("#player2-board .board-cell");
    cell.click();

    expect(mockHandleAttack).toHaveBeenCalled();
  });
});

describe("UI - showGameOverScreen", () => {
  let dom;
  let container;
  let ui;

  beforeEach(() => {
    // Create a mock DOM environment
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    container = dom.window.document;
    global.document = container;
    global.location = { reload: jest.fn() }; // Mock location.reload
    ui = UI();
    // Initialize the UI
    // ui.initUI(player1, player2);
  });

  afterEach(() => {
    global.document = undefined;
    global.location = undefined;
  });

  test("should create a game-over overlay with the winner's name", () => {
    const winnerName = "Alice";

    // Call the showGameOverScreen method
    ui.showGameOverScreen(winnerName);

    // Check if the game-over overlay exists
    const gameOverDiv = document.getElementById("game-over");
    expect(gameOverDiv).not.toBeNull();
    expect(gameOverDiv.classList.contains("overlay")).toBe(true);

    // Check the winner's message
    const winnerMessage = gameOverDiv.querySelector("h2");
    expect(winnerMessage).not.toBeNull();
    expect(winnerMessage.textContent).toBe("Alice wins!");

    // Check for the restart button
    const restartButton = gameOverDiv.querySelector("button");
    expect(restartButton).not.toBeNull();
    expect(restartButton.textContent).toBe("Play Again");
  });

  test("should reload the page when the restart button is clicked", () => {
    const winnerName = "Bob";

    // Call the showGameOverScreen method
    ui.showGameOverScreen(winnerName);

    // Simulate a button click
    const restartButton = document.querySelector("#game-over button");
    restartButton.click();

    // Check if location.reload was called
    expect(global.location.reload).toHaveBeenCalled();
  });
});

describe("UI - resetUI", () => {
  let dom;
  let container;
  let ui;

  beforeEach(() => {
    // Create a mock DOM environment
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    container = dom.window.document;
    global.document = container;

    // Initialize a new UI instance before each test
    ui = UI();

    // Set up the DOM as it would be after initUI is called
    document.body.innerHTML = `
      <h1>Battleship</h1>
      <div id="score">Player 1: 0 | Computer: 0</div>
      <div id="current-player">Current Player: Player 1</div>
      <div id="game">
        <div class="player-section">
          <h2>Player 1</h2>
          <div id="player1-board" class="board">
            <div class="board-row">
              <div class="board-cell" data-x="0" data-y="0"></div>
              <div class="board-cell" data-x="1" data-y="0"></div>
              <!-- More cells... -->
            </div>
            <!-- More rows... -->
          </div>
        </div>
        <div class="player-section">
          <h2>Computer</h2>
          <div id="player2-board" class="board">
            <div class="board-row">
              <div class="board-cell" data-x="0" data-y="0"></div>
              <div class="board-cell" data-x="1" data-y="0"></div>
              <!-- More cells... -->
            </div>
            <!-- More rows... -->
          </div>
        </div>
        <div id="message" class="message info">Game started</div>
      </div>
    `;
  });

  test("should remove child elements within the game container", () => {
    // Ensure the game container exists before reset
    const gameContainer = document.getElementById("game");
    expect(gameContainer).not.toBeNull();

    // Ensure that child elements exist before reset
    const playerSections = gameContainer.querySelectorAll(".player-section");
    expect(playerSections.length).toBeGreaterThan(0);

    // Call resetUI
    ui.resetUI();

    // Assert that player sections are removed
    const updatedPlayerSections =
      gameContainer.querySelectorAll(".player-section");
    expect(updatedPlayerSections.length).toBe(0);

    // Ensure that #message div still exists and is cleared
    const messageDiv = gameContainer.querySelector("#message");
    expect(messageDiv).not.toBeNull();
    expect(messageDiv.textContent).toBe(""); // It should be cleared
  });

  test("should remove the heading", () => {
    // Ensure the heading exists before reset
    expect(document.querySelector("h1")).not.toBeNull();

    // Call resetUI
    ui.resetUI();

    // Assert that the heading is removed
    expect(document.querySelector("h1")).toBeNull();
  });

  test("should remove the score div", () => {
    // Ensure the score div exists before reset
    expect(document.getElementById("score")).not.toBeNull();

    // Call resetUI
    ui.resetUI();

    // Assert that the score div is removed
    expect(document.getElementById("score")).toBeNull();
  });

  test("should remove the current player div", () => {
    // Ensure the current player div exists before reset
    expect(document.getElementById("current-player")).not.toBeNull();

    // Call resetUI
    ui.resetUI();

    // Assert that the current player div is removed
    expect(document.getElementById("current-player")).toBeNull();
  });

  test("should clear the message div", () => {
    // Ensure the message div exists before reset
    const messageDiv = document.getElementById("message");
    expect(messageDiv).not.toBeNull();
    expect(messageDiv.textContent).toBe("Game started");
    expect(messageDiv.className).toBe("message info");

    // Call resetUI
    ui.resetUI();

    // Assert that the message div is cleared but not removed
    expect(document.getElementById("message")).not.toBeNull();
    expect(messageDiv.textContent).toBe("");
    expect(messageDiv.className).toBe("message info"); // Assuming you reset the text but keep classes
  });

  test("should remove all player sections", () => {
    // Ensure player sections exist before reset
    const playerSections = document.querySelectorAll(".player-section");
    expect(playerSections.length).toBe(2); // Player 1 and Computer

    // Call resetUI
    ui.resetUI();

    // Assert that player sections are removed
    expect(document.querySelectorAll(".player-section").length).toBe(0);
  });

  test("should not throw an error if elements are already removed", () => {
    // Call resetUI once to remove elements
    ui.resetUI();

    // Call resetUI again; should not throw
    expect(() => ui.resetUI()).not.toThrow();
  });

  test("should not remove elements that are not part of the initial UI", () => {
    // Add an extra element to the DOM
    const extraDiv = document.createElement("div");
    extraDiv.id = "extra-element";
    document.body.appendChild(extraDiv);

    // Ensure the extra element exists before reset
    expect(document.getElementById("extra-element")).not.toBeNull();

    // Call resetUI
    ui.resetUI();

    // Assert that the extra element is still present
    expect(document.getElementById("extra-element")).not.toBeNull();
  });
});

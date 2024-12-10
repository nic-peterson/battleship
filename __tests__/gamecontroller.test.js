const { JSDOM } = require("jsdom");
import { GameController } from "../src/components/gamecontroller";

describe("GameController", () => {
  let mockGame;
  let mockUI;
  let gameController;

  beforeEach(() => {
    // Mock the DOM
    const dom = new JSDOM(
      "<!DOCTYPE html><html><body><div id='player2-board' class='disabled'></div></body></html>"
    );
    global.document = dom.window.document;
    global.window = dom.window;

    // Mock the Game and UI
    mockGame = {
      attack: jest.fn(), // Mock the attack method
      switchTurn: jest.fn(), // Mock the switchTurn method
      isGameOver: jest.fn().mockReturnValue(false), // Mock isGameOver
      getCurrentPlayer: jest
        .fn()
        .mockReturnValue({ getName: () => "Player 1" }), // Mock current player
    };

    mockUI = {
      renderBoard: jest.fn(), // Mock renderBoard method
      updateScore: jest.fn(), // Mock updateScore method
      updateCurrentPlayer: jest.fn(), // Mock updateCurrentPlayer method
      displayMessage: jest.fn(), // Mock displayMessage method
      addBoardEventListeners: jest.fn(), // Mock addBoardEventListeners method
    };

    // Initialize the GameController
    gameController = GameController(mockGame, mockUI);
  });

  afterEach(() => {
    global.document = undefined;
    global.window = undefined;
    jest.clearAllMocks(); // Clear all mock calls and instances
  });

  test("addBoardEventListeners should call handleAttack with correct coordinates", () => {
    const handleAttackMock = jest.fn();

    // Set up the DOM structure for the test
    document.body.innerHTML = `
        <div id="player2-board">
            <div class="board-cell" data-x="1" data-y="0"></div>
        </div>
    `;

    // Call the method to add event listeners
    gameController.addBoardEventListeners("player2-board", handleAttackMock);

    // Simulate a click on the target cell
    const cell = document.querySelector('[data-x="1"][data-y="0"]');
    if (!cell) {
      throw new Error("Test setup error: Cell element not found in DOM.");
    }
    cell.classList.add("board-cell"); // Ensure the correct class is present
    cell.click(); // Simulate the click event

    // Assert that the mock function was called with the correct coordinates
    expect(handleAttackMock).toHaveBeenCalledWith(1, 0);
  });

  test("enableBoardInteraction should remove the 'disabled' class", () => {
    gameController.enableBoardInteraction("player2-board");

    const container = document.getElementById("player2-board");
    expect(container.classList.contains("disabled")).toBe(false);
  });

  test("disableBoardInteraction should add the 'disabled' class", () => {
    gameController.disableBoardInteraction("player2-board");

    const container = document.getElementById("player2-board");
    expect(container.classList.contains("disabled")).toBe(true);
  });

  test("addBoardEventListeners should throw an error if container not found", () => {
    expect(() =>
      gameController.addBoardEventListeners("invalid-id", jest.fn())
    ).toThrow("Container not found");
  });

  test("enableBoardInteraction should throw an error if container not found", () => {
    expect(() => gameController.enableBoardInteraction("invalid-id")).toThrow(
      "Container not found"
    );
  });

  test("disableBoardInteraction should throw an error if container not found", () => {
    expect(() => gameController.disableBoardInteraction("invalid-id")).toThrow(
      "Container not found"
    );
  });
});

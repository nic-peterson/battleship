const { JSDOM } = require("jsdom");
import { GameController } from "../src/components/gamecontroller";

describe("GameController", () => {
  let mockGame;
  let mockUI;
  let gameController;
  let mockPlayer1;
  let mockPlayer2;

  beforeEach(() => {
    // Mock the DOM
    const dom = new JSDOM(
      "<!DOCTYPE html><html><body><div id='player2-board' class='disabled'></div></body></html>"
    );
    global.document = dom.window.document;
    global.window = dom.window;

    // Mock Players
    mockPlayer1 = { getName: jest.fn().mockReturnValue("Player 1") };
    mockPlayer2 = {
      getName: jest.fn().mockReturnValue("Player 2"),
      getGameboard: jest
        .fn()
        .mockReturnValue({ getBoard: jest.fn().mockReturnValue([]) }),
    };

    // Mock the Game and UI
    mockGame = {
      initGame: jest.fn(),
      getPlayers: jest.fn().mockReturnValue([mockPlayer1, mockPlayer2]),
      attack: jest.fn(), // Mock the attack method
      switchTurn: jest.fn(), // Mock the switchTurn method
      isGameOver: jest.fn().mockReturnValue(false), // Mock isGameOver
      getCurrentPlayer: jest.fn().mockReturnValue(mockPlayer1),
      getOpponent: jest.fn().mockReturnValue(mockPlayer2),
    };

    mockUI = {
      initUI: jest.fn(),
      renderBoard: jest.fn(), // Mock renderBoard method
      updateScore: jest.fn(), // Mock updateScore method
      updateCurrentPlayer: jest.fn(), // Mock updateCurrentPlayer method
      displayMessage: jest.fn(), // Mock displayMessage method
      addBoardEventListeners: jest.fn(), // Mock addBoardEventListeners method
      disableBoardInteraction: jest.fn(),
      enableBoardInteraction: jest.fn(),
      showGameOverScreen: jest.fn(),
    };

    // Initialize the GameController
    gameController = GameController(mockGame, mockUI);
  });

  afterEach(() => {
    global.document = undefined;
    global.window = undefined;
    jest.clearAllMocks(); // Clear all mock calls and instances
  });

  describe("Initialization", () => {
    test("initGame should call game.initGame and ui.initUI", () => {
      gameController.initGame();

      expect(mockGame.initGame).toHaveBeenCalled();
      expect(mockGame.getPlayers).toHaveBeenCalled();
      expect(mockUI.initUI).toHaveBeenCalledWith(
        expect.objectContaining({ getName: expect.any(Function) }),
        expect.objectContaining({ getName: expect.any(Function) })
      );
    });

    test("initGame should initialize UI with correct players", () => {
      mockGame.getPlayers.mockReturnValue([
        { getName: jest.fn().mockReturnValue("Player A") },
        { getName: jest.fn().mockReturnValue("Player B") },
      ]);

      gameController.initGame();

      expect(mockUI.initUI).toHaveBeenCalledWith(
        expect.objectContaining({ getName: expect.any(Function) }),
        expect.objectContaining({ getName: expect.any(Function) })
      );
    });
  });

  describe("Board Interactions", () => {
    describe("Event Listeners", () => {
      test("should not add duplicate event listeners", () => {
        // Spies on methods
        const attackSpy = jest.spyOn(mockGame, "attack");
        const renderBoardSpy = jest.spyOn(mockUI, "renderBoard");
        const displayMessageSpy = jest.spyOn(mockUI, "displayMessage");

        // Set up the DOM
        document.body.innerHTML = `
              <div id="player2-board">
                <div class="board-cell" data-x="1" data-y="0"></div>
              </div>
            `;
        const cell = document.querySelector('[data-x="1"][data-y="0"]');
        cell.classList.add("board-cell");

        // Set the return value of mockGame.attack
        mockGame.attack.mockReturnValue({ hit: true, sunk: false });

        // Add event listeners multiple times
        gameController.addBoardEventListeners("player2-board");
        gameController.addBoardEventListeners("player2-board");

        // Simulate a click
        cell.click();

        // Assertions
        expect(attackSpy).toHaveBeenCalledTimes(1);
        expect(renderBoardSpy).toHaveBeenCalledTimes(1);
        expect(displayMessageSpy).toHaveBeenCalledTimes(1);
      });

      test("should call handleAttack with correct coordinates", () => {
        // Set up the DOM structure for the test
        document.body.innerHTML = `
            <div id="player2-board">
                <div class="board-cell" data-x="1" data-y="0"></div>
            </div>
        `;

        // Set up game attack mock
        mockGame.attack.mockReturnValue({ hit: true, sunk: false });

        // Add event listeners
        gameController.addBoardEventListeners("player2-board");

        // Simulate a click on the target cell
        const cell = document.querySelector('[data-x="1"][data-y="0"]');
        if (!cell) {
          throw new Error("Test setup error: Cell element not found in DOM.");
        }
        cell.classList.add("board-cell");
        cell.click();

        // Verify game.attack was called with correct coordinates
        expect(mockGame.attack).toHaveBeenCalledWith(1, 0);
      });

      test("should not call handleAttack for non-cell elements", () => {
        const handleAttackMock = jest.fn();
        document.body.innerHTML = `<div id="player2-board"><div class="not-a-cell"></div></div>`;

        gameController.addBoardEventListeners(
          "player2-board",
          handleAttackMock
        );
        const nonCell = document.querySelector(".not-a-cell");
        nonCell.click();

        expect(handleAttackMock).not.toHaveBeenCalled();
      });

      test("should throw error if container not found", () => {
        expect(() =>
          gameController.addBoardEventListeners("invalid-id", jest.fn())
        ).toThrow("Container not found");
      });
    });
  });

  describe("Board State Management", () => {
    test("handleAttack updates game and UI state correctly", () => {
      const mockAttackResult = { hit: true, sunk: false };
      mockGame.attack.mockReturnValue(mockAttackResult);
      mockGame.isGameOver.mockReturnValue(false);

      gameController.handleAttack(1, 0);

      expect(mockGame.attack).toHaveBeenCalledWith(1, 0);
      expect(mockUI.renderBoard).toHaveBeenCalled();
      expect(mockUI.displayMessage).toHaveBeenCalledWith("Hit!");
      expect(mockUI.updateCurrentPlayer).toHaveBeenCalledWith(
        mockGame.getCurrentPlayer().getName()
      );
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
  });

  describe("Game Flow", () => {
    describe("Attack Handling", () => {
      test.each([
        [{ hit: true, sunk: false }, "Hit!"],
        [{ hit: false, sunk: false }, "Miss!"],
      ])("displays correct message for %s", (attackResult, expectedMessage) => {
        // Mock attack result
        mockGame.attack.mockReturnValue(attackResult);
        mockGame.isGameOver.mockReturnValue(false);

        // Execute attack
        gameController.handleAttack(0, 0);

        // Verify message
        expect(mockUI.displayMessage).toHaveBeenCalledWith(expectedMessage);
      });
    });

    test("should update current player after each turn", () => {
      // Set up DOM
      document.body.innerHTML = `
          <div id="player2-board">
            <div class="board-cell" data-x="1" data-y="0"></div>
          </div>
        `;
      const cell = document.querySelector('[data-x="1"][data-y="0"]');
      cell.classList.add("board-cell");

      // Mock attack result - normal hit, no sink
      mockGame.attack.mockReturnValue({ hit: true, sunk: false });
      mockGame.isGameOver.mockReturnValue(false);

      // Add event listener and click
      gameController.addBoardEventListeners("player2-board");
      cell.click();

      // Verify current player is updated but score is not
      expect(mockUI.updateCurrentPlayer).toHaveBeenCalled();
      expect(mockUI.updateScore).not.toHaveBeenCalled();
    });

    test("should update score when a ship is sunk", () => {
      // Set up DOM
      document.body.innerHTML = `
          <div id="player2-board">
            <div class="board-cell" data-x="1" data-y="0"></div>
          </div>
        `;
      const cell = document.querySelector('[data-x="1"][data-y="0"]');
      cell.classList.add("board-cell");

      // Mock attack result - hit AND sink
      mockGame.attack.mockReturnValue({ hit: true, sunk: true });
      mockGame.isGameOver.mockReturnValue(false);

      // Add event listener and click
      gameController.addBoardEventListeners("player2-board");
      cell.click();

      // Verify both score and current player are updated
      expect(mockUI.updateScore).toHaveBeenCalled();
      expect(mockUI.updateCurrentPlayer).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    describe("handleAttack", () => {
      test("handleAttack should gracefully handle exceptions from game.attack", () => {
        mockGame.attack.mockImplementation(() => {
          throw new Error("Attack failed");
        });

        expect(() => gameController.handleAttack(1, 0)).not.toThrow();
        expect(mockUI.displayMessage).toHaveBeenCalledWith("Attack failed");
      });

      test("handleAttack should gracefully handle exceptions from ui.renderBoard", () => {
        mockUI.renderBoard.mockImplementation(() => {
          throw new Error("Render failed");
        });

        const mockAttackResult = { hit: true, sunk: false };
        mockGame.attack.mockReturnValue(mockAttackResult);

        expect(() => gameController.handleAttack(1, 0)).not.toThrow();
        expect(mockUI.displayMessage).toHaveBeenCalledWith("Render failed");
      });
    });

    describe("Board Interaction", () => {
      test("enableBoardInteraction should throw an error for invalid IDs", () => {
        expect(() =>
          gameController.enableBoardInteraction("invalid-id")
        ).toThrow("Container not found");
      });

      test("enableBoardInteraction should throw an error if container not found", () => {
        expect(() =>
          gameController.enableBoardInteraction("invalid-id")
        ).toThrow("Container not found");
      });

      test("disableBoardInteraction should throw an error if container not found", () => {
        expect(() =>
          gameController.disableBoardInteraction("invalid-id")
        ).toThrow("Container not found");
      });
    });
  });

  describe("Game Over", () => {
    test("should disable board and show game over when all ships are sunk", () => {
      // Set up the DOM first
      document.body.innerHTML = `
          <div id="player2-board">
            <div class="board-cell" data-x="1" data-y="0"></div>
          </div>
        `;

      // Mock game state
      mockGame.isGameOver.mockReturnValue(true);
      mockGame.attack.mockReturnValue({ hit: true, sunk: true });
      mockGame.getCurrentPlayer.mockReturnValue({ getName: () => "Player 1" });

      // Add event listeners
      gameController.addBoardEventListeners("player2-board");

      // Get and configure cell
      const cell = document.querySelector('[data-x="1"][data-y="0"]');
      cell.classList.add("board-cell");

      // Trigger the click
      cell.click();

      // Verify game over behavior
      expect(mockUI.showGameOverScreen).toHaveBeenCalledWith("Player 1");
      expect(mockUI.disableBoardInteraction).toHaveBeenCalledWith(
        "player2-board"
      );
    });
  });
});

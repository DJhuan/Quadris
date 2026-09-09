class InputHandler {
  constructor(game) {
    this.game = game;
    this.keysHeld = {};
    this.dasTimers = {};
    this.dasDelay = 160;
    this.dasInterval = 50;

    this.initKeyboard();
  }

  initKeyboard() {
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    const code = e.code;
    const gameKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyQ",
      "KeyE",
      "KeyP",
      "Space",
      "Enter",
      "Escape",
    ];

    if (gameKeys.includes(code)) {
      e.preventDefault();
    }

    if (code === "KeyP" || code === "Escape") {
      if (this.game.state === "PLAYING" || this.game.state === "PAUSED") {
        this.game.togglePause();
      }
      return;
    }

    if (code === "Enter") {
      if (this.game.state === "MENU" || this.game.state === "GAME_OVER") {
        this.game.startGame();
      }
      return;
    }

    if (this.game.state !== "PLAYING") {
      return;
    }

    if (code === "KeyQ" && !e.repeat) {
      this.game.rotateCurrentPiece("CCW");
      return;
    }
    if (code === "KeyE" && !e.repeat) {
      this.game.rotateCurrentPiece("CW");
      return;
    }

    if (code === "Space" && !e.repeat) {
      this.game.hardDrop();
      return;
    }

    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(code)
    ) {
      if (!this.keysHeld[code]) {
        this.keysHeld[code] = true;
        this.triggerMove(code);

        this.dasTimers[code] = setTimeout(() => {
          this.dasTimers[code] = setInterval(() => {
            if (this.keysHeld[code] && this.game.state === "PLAYING") {
              this.triggerMove(code);
            }
          }, this.dasInterval);
        }, this.dasDelay);
      }
    }
  }

  handleKeyUp(e) {
    const code = e.code;
    if (this.keysHeld[code]) {
      this.keysHeld[code] = false;
      clearTimeout(this.dasTimers[code]);
      clearInterval(this.dasTimers[code]);
      delete this.dasTimers[code];
    }
  }

  triggerMove(code) {
    if (this.game.state !== "PLAYING") return;

    switch (code) {
      case "KeyW":
      case "ArrowUp":
        this.game.movePiece(0, -1);
        break;
      case "KeyS":
      case "ArrowDown":
        this.game.movePiece(0, 1);
        break;
      case "KeyA":
      case "ArrowLeft":
        this.game.movePiece(-1, 0);
        break;
      case "KeyD":
      case "ArrowRight":
        this.game.movePiece(1, 0);
        break;
    }
  }

  clearAllTimers() {
    for (const code in this.dasTimers) {
      clearTimeout(this.dasTimers[code]);
      clearInterval(this.dasTimers[code]);
    }
    this.keysHeld = {};
    this.dasTimers = {};
  }
}

window.InputHandler = InputHandler;

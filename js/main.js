document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const nextCanvas = document.getElementById("nextCanvas");

  const scoreEl = document.getElementById("scoreValue");
  const highScoreEl = document.getElementById("highScoreValue");
  const levelEl = document.getElementById("levelValue");
  const linesEl = document.getElementById("linesValue");

  const compassUp = document.getElementById("compassUp");
  const compassDown = document.getElementById("compassDown");
  const compassLeft = document.getElementById("compassLeft");
  const compassRight = document.getElementById("compassRight");

  const gameOverlay = document.getElementById("gameOverlay");
  const menuScreen = document.getElementById("menuScreen");
  const pauseScreen = document.getElementById("pauseScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreEl = document.getElementById("finalScoreValue");

  const startBtn = document.getElementById("startBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const restartBtn = document.getElementById("restartBtn");
  const pauseBtn = document.getElementById("pauseBtn");

  const game = new Game();
  const renderer = new Renderer(canvas, nextCanvas);
  const input = new InputHandler(game);

  window.gameInstance = game;
  window.gameRenderer = renderer;

  function updateScoreHUD(g) {
    scoreEl.textContent = g.score.toString().padStart(7, "0");
    highScoreEl.textContent = g.highScore.toString().padStart(7, "0");
    levelEl.textContent = g.level;
    linesEl.textContent = g.linesCleared;
  }

  function handleGravityChange(direction) {
    const directions = {
      UP: compassUp,
      DOWN: compassDown,
      LEFT: compassLeft,
      RIGHT: compassRight,
    };

    for (const key in directions) {
      if (directions[key]) {
        directions[key].classList.toggle("active", key === direction);
      }
    }
  }

  function handleStateChange(state) {
    menuScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    switch (state) {
      case "MENU":
        gameOverlay.classList.remove("hidden");
        menuScreen.classList.remove("hidden");
        break;
      case "PLAYING":
        gameOverlay.classList.add("hidden");
        if (pauseBtn) pauseBtn.textContent = "Pausar (P)";
        break;
      case "PAUSED":
        gameOverlay.classList.remove("hidden");
        pauseScreen.classList.remove("hidden");
        if (pauseBtn) pauseBtn.textContent = "Continuar (P)";
        break;
      case "GAME_OVER":
        gameOverlay.classList.remove("hidden");
        gameOverScreen.classList.remove("hidden");
        finalScoreEl.textContent = game.score.toString().padStart(7, "0");
        break;
    }
  }

  game.onScoreChange = updateScoreHUD;
  game.onGravityChange = handleGravityChange;
  game.onStateChange = handleStateChange;

  startBtn.addEventListener("click", () => {
    game.startGame();
  });

  resumeBtn.addEventListener("click", () => {
    game.togglePause();
  });

  restartBtn.addEventListener("click", () => {
    game.startGame();
  });

  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (game.state === "PLAYING" || game.state === "PAUSED") {
        game.togglePause();
      }
    });
  }

  updateScoreHUD(game);
  handleGravityChange("DOWN");
  handleStateChange("MENU");

  function gameLoop(timestamp) {
    game.update(timestamp);
    renderer.draw(game);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});

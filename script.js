const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameState = "MENU";

let birdY, velocity;
let gravity = 0.5;

let pipeX, pipeGap, topPipeHeight;
let score;

function resetGame() {
  birdY = canvas.height / 2;
  velocity = 0;
  pipeX = canvas.width;
  pipeGap = 180;
  topPipeHeight = Math.random() * 250 + 50;
  score = 0;
}

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(80, birdY, 30, 30);
}

function drawPipes() {
  ctx.fillStyle = "green";
  ctx.fillRect(pipeX, 0, 70, topPipeHeight);
  ctx.fillRect(
    pipeX,
    topPipeHeight + pipeGap,
    70,
    canvas.height
  );
}

function drawText(text, size, y) {
  ctx.fillStyle = "white";
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, y);
}

function collision() {
  if (
    80 + 30 > pipeX &&
    80 < pipeX + 70 &&
    (birdY < topPipeHeight ||
      birdY + 30 > topPipeHeight + pipeGap)
  ) {
    gameState = "GAMEOVER";
  }

  if (birdY < 0 || birdY + 30 > canvas.height) {
    gameState = "GAMEOVER";
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "MENU") {
    drawText("FLAPPY BIRD", 50, 250);
    drawText("Press SPACE to Start", 24, 320);
  }

  if (gameState === "PLAYING") {
    velocity += gravity;
    birdY += velocity;

    pipeX -= 3;
    if (pipeX < -70) {
      pipeX = canvas.width;
      topPipeHeight = Math.random() * 250 + 50;
      score++;
    }

    drawBird();
    drawPipes();
    collision();

    drawText(`Score: ${score}`, 24, 40);
  }

  if (gameState === "PAUSED") {
    drawBird();
    drawPipes();
    drawText("PAUSED", 50, 300);
    drawText("Press P to Resume", 24, 350);
  }

  if (gameState === "GAMEOVER") {
    drawText("GAME OVER", 50, 260);
    drawText(`Score: ${score}`, 30, 310);
    drawText("Press R to Restart", 24, 360);
  }

  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameState === "MENU") {
      resetGame();
      gameState = "PLAYING";
    } else if (gameState === "PLAYING") {
      velocity = -9;
    }
  }

  if (e.code === "KeyP" && gameState === "PLAYING") {
    gameState = "PAUSED";
  } else if (e.code === "KeyP" && gameState === "PAUSED") {
    gameState = "PLAYING";
  }

  if (e.code === "KeyR" && gameState === "GAMEOVER") {
    resetGame();
    gameState = "PLAYING";
  }
});

update();

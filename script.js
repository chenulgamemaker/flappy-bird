const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let birdY = 200;
let velocity = 0;
let gravity = 0.5;

let pipeX = 400;
let pipeGap = 150;
let topPipeHeight = Math.random() * 200 + 50;

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(50, birdY, 20, 20);
}

function drawPipes() {
  ctx.fillStyle = "green";
  ctx.fillRect(pipeX, 0, 50, topPipeHeight);
  ctx.fillRect(pipeX, topPipeHeight + pipeGap, 50, canvas.height);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocity += gravity;
  birdY += velocity;

  pipeX -= 2;
  if (pipeX < -50) {
    pipeX = 400;
    topPipeHeight = Math.random() * 200 + 50;
  }

  drawBird();
  drawPipes();

  requestAnimationFrame(update);
}

document.addEventListener("keydown", () => {
  velocity = -8;
});

update();

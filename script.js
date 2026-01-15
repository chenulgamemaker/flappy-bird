const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ---------------------
   GAME STATE
--------------------- */
let state = "MENU"; // MENU, PLAYING, PAUSED, GAMEOVER

/* ---------------------
   IMAGES
--------------------- */
const bgImg = new Image();
bgImg.src = "assets/background-day.png";

const baseImg = new Image();
baseImg.src = "assets/base.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe-green.png";

const birdFrames = [
  new Image(),
  new Image(),
  new Image()
];
birdFrames[0].src = "assets/bird/yellowbird-upflap.png";
birdFrames[1].src = "assets/bird/yellowbird-midflap.png";
birdFrames[2].src = "assets/bird/yellowbird-downflap.png";

const gameOverImg = new Image();
gameOverImg.src = "assets/ui/gameover.png";

const messageImg = new Image();
messageImg.src = "assets/ui/message.png";

/* Numbers for score */
const numberImgs = [];
for (let i = 0; i <= 9; i++) {
  const img = new Image();
  img.src = `assets/ui/Numbers/${i}.png`;
  numberImgs.push(img);
}

/* ---------------------
   SOUNDS
--------------------- */
const wingSound = new Audio("assets/sounds/wing.wav");
const hitSound = new Audio("assets/sounds/hit.wav");
const dieSound = new Audio("assets/sounds/die.wav");
const pointSound = new Audio("assets/sounds/point.wav");

/* ---------------------
   GAME VARIABLES
--------------------- */
let bird;
let pipes;
let score;
let highScore = localStorage.getItem("highScore") || 0;

let frame = 0;
const gravity = 0.5;
const jump = -9;
const pipeGap = 180;
const pipeWidth = 70;
const groundHeight = 112;

/* ---------------------
   RESET GAME
--------------------- */
function resetGame() {
  bird = {
    x: 100,
    y: canvas.height / 2,
    size: 34,
    vel: 0,
    rot: 0
  };

  pipes = [{
    x: canvas.width,
    top: Math.random() * 250 + 50
  }];

  score = 0;
  frame = 0;
}

/* ---------------------
   DRAW SCORE (IMAGE NUMBERS)
--------------------- */
function drawScoreImages(value, y) {
  const digits = value.toString().split("");
  const w = 24;
  const h = 36;
  const totalWidth = digits.length * w;
  let x = canvas.width / 2 - totalWidth / 2;

  digits.forEach(d => {
    ctx.drawImage(numberImgs[d], x, y, w, h);
    x += w;
  });
}

/* ---------------------
   INPUT
--------------------- */
function flap() {
  if (state === "PLAYING") {
    bird.vel = jump;
    wingSound.currentTime = 0;
    wingSound.play();
  }

  if (state === "MENU") {
    resetGame();
    state = "PLAYING";
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();

  if (e.code === "KeyP" && state === "PLAYING") state = "PAUSED";
  else if (e.code === "KeyP" && state === "PAUSED") state = "PLAYING";

  if (e.code === "KeyR" && state === "GAMEOVER") {
    resetGame();
    state = "PLAYING";
  }
});

canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", flap);

/* ---------------------
   GAME LOOP
--------------------- */
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ---------- MENU ---------- */
  if (state === "MENU") {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(messageImg, canvas.width / 2 - 92, 220);
  }

  /* ---------- PLAYING ---------- */
  if (state === "PLAYING") {
    frame++;

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Bird physics
    bird.vel += gravity;
    bird.y += bird.vel;
    bird.rot = Math.min(Math.PI / 6, bird.vel / 10);

    // Pipes
    pipes.forEach(p => p.x -= 3);

    if (pipes[0].x < canvas.width / 2 && pipes.length === 1) {
      pipes.push({ x: canvas.width, top: Math.random() * 250 + 50 });
    }

    if (pipes[0].x < -pipeWidth) {
      pipes.shift();
      score++;
      pointSound.play();
    }

    pipes.forEach(p => {
      ctx.drawImage(pipeImg, p.x, p.top - 320, pipeWidth, 320);
      ctx.drawImage(pipeImg, p.x, p.top + pipeGap, pipeWidth, 320);
    });

    // Bird animation
    const birdFrame = Math.floor(frame / 6) % birdFrames.length;
    ctx.save();
    ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
    ctx.rotate(bird.rot);
    ctx.drawImage(
      birdFrames[birdFrame],
      -bird.size / 2,
      -bird.size / 2,
      bird.size,
      bird.size
    );
    ctx.restore();

    // Ground
    ctx.drawImage(baseImg, 0, canvas.height - groundHeight, canvas.width, groundHeight);

    // Collision
    pipes.forEach(p => {
      if (
        bird.x + bird.size > p.x &&
        bird.x < p.x + pipeWidth &&
        (bird.y < p.top || bird.y + bird.size > p.top + pipeGap)
      ) {
        hitSound.play();
        dieSound.play();
        state = "GAMEOVER";
      }
    });

    if (bird.y < 0 || bird.y + bird.size > canvas.height - groundHeight) {
      hitSound.play();
      dieSound.play();
      state = "GAMEOVER";
    }

    drawScoreImages(score, 30);
  }

  /* ---------- PAUSED ---------- */
  if (state === "PAUSED") {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    drawScoreImages(score, 30);
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  }

  /* ---------- GAME OVER ---------- */
  if (state === "GAMEOVER") {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(gameOverImg, canvas.width / 2 - 96, 230);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }

    drawScoreImages(score, 300);
  }

  requestAnimationFrame(update);
}

update();

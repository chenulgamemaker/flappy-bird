const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ---------------------
   RESPONSIVE CANVAS
--------------------- */
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, 480);
  canvas.height = Math.min(window.innerHeight, 640);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ---------------------
   GAME STATE
--------------------- */
let state = "MAINMENU"; 
// MAINMENU, PLAYING, PAUSED, GAMEOVER, LEADERBOARD, SETTINGS, CREDITS

/* ---------------------
   SETTINGS
--------------------- */
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled"));
if (soundEnabled === null) soundEnabled = true;

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

/* Numbers */
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

function playSound(sound) {
  if (!soundEnabled) return;
  sound.currentTime = 0;
  sound.play();
}

/* ---------------------
   GAME VARIABLES
--------------------- */
let bird, pipes, score;
let highScore = localStorage.getItem("highScore") || 0;

const gravity = 0.3;
const jump = -6;
const pipeGap = 180;
const pipeWidth = 70;
const pipeHeight = 320;
const groundHeight = 112;
const pipeSpeed = 2.5;

/* ---------------------
   RESET GAME
--------------------- */
function resetGame() {
  bird = { x: 100, y: canvas.height / 2, size: 34, vel: 0, rot: 0 };
  pipes = [{ x: canvas.width, top: Math.random() * 200 + 80 }];
  score = 0;
}
resetGame();

/* ---------------------
   SCORE DRAW
--------------------- */
function drawScoreImages(value, y) {
  const digits = value.toString().split("");
  let x = canvas.width / 2 - (digits.length * 24) / 2;
  digits.forEach(d => {
    ctx.drawImage(numberImgs[d], x, y, 24, 36);
    x += 24;
  });
}

/* ---------------------
   INPUT
--------------------- */
function flap() {
  if (state === "PLAYING") {
    bird.vel = jump;
    playSound(wingSound);
  } else if (state === "MAINMENU" || state === "GAMEOVER") {
    resetGame();
    state = "PLAYING";
    playSound(wingSound);
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();
  if (e.code === "KeyP" && state === "PLAYING") state = "PAUSED";
  else if (e.code === "KeyP" && state === "PAUSED") state = "PLAYING";
});

canvas.addEventListener("mousedown", handleClick);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  handleClick(e);
}, { passive: false });

/* ---------------------
   CLICK HANDLER
--------------------- */
function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX || e.touches[0].clientX) - rect.left;
  const my = (e.clientY || e.touches[0].clientY) - rect.top;

  const bx = canvas.width / 2 - 140;
  const bw = 280;
  const bh = 60;

  if (state === "MAINMENU") {
    if (mx > bx && mx < bx + bw) {
      if (my > 220 && my < 220 + bh) { resetGame(); state = "PLAYING"; }
      if (my > 300 && my < 300 + bh) state = "LEADERBOARD";
      if (my > 380 && my < 380 + bh) state = "SETTINGS";
      if (my > 460 && my < 460 + bh) state = "CREDITS";
    }
  } 
  else if (state === "SETTINGS") {
    if (my > 250 && my < 310) {
      soundEnabled = !soundEnabled;
      localStorage.setItem("soundEnabled", soundEnabled);
    } else {
      state = "MAINMENU";
    }
  }
  else if (state === "GAMEOVER") flap();
  else if (["LEADERBOARD","CREDITS"].includes(state)) state = "MAINMENU";
}

/* ---------------------
   DRAW MENUS
--------------------- */
function drawButton(text, y) {
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(canvas.width / 2 - 140, y, 280, 60);
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, y + 40);
}

function drawMainMenu() {
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
  ctx.fillStyle="white";
  ctx.font="48px Arial";
  ctx.textAlign="center";
  ctx.fillText("Flappy Bird",canvas.width/2,130);

  drawButton("Play",220);
  drawButton("Leaderboard",300);
  drawButton("Settings",380);
  drawButton("Credits",460);
}

function drawSettings() {
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
  ctx.fillStyle="white";
  ctx.font="42px Arial";
  ctx.textAlign="center";
  ctx.fillText("Settings",canvas.width/2,140);

  drawButton(`Sound: ${soundEnabled ? "ON" : "OFF"}`,250);

  ctx.font="22px Arial";
  ctx.fillText("Tap anywhere else to return",canvas.width/2,420);
}

function drawCredits() {
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
  ctx.fillStyle="white";
  ctx.font="40px Arial";
  ctx.textAlign="center";
  ctx.fillText("Credits",canvas.width/2,140);

  ctx.font="26px Arial";
  ctx.fillText("Made by",canvas.width/2,230);
  ctx.fillText("Chenul & ChatGPT",canvas.width/2,270);

  ctx.font="22px Arial";
  ctx.fillText("Tap to return",canvas.width/2,420);
}

/* ---------------------
   GAME LOOP
--------------------- */
function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (state === "MAINMENU") drawMainMenu();
  else if (state === "SETTINGS") drawSettings();
  else if (state === "CREDITS") drawCredits();
  else if (state === "PLAYING") {
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

    bird.vel += gravity;
    bird.y += bird.vel;

    pipes.forEach(p => p.x -= pipeSpeed);
    if (pipes[0].x < canvas.width / 2 && pipes.length === 1)
      pipes.push({ x: canvas.width, top: Math.random() * 200 + 80 });

    if (pipes[0].x < -pipeWidth) {
      pipes.shift();
      score++;
      playSound(pointSound);
    }

    pipes.forEach(p => {
      ctx.save();
      ctx.translate(p.x + pipeWidth / 2, p.top);
      ctx.scale(1,-1);
      ctx.drawImage(pipeImg,-pipeWidth/2,0,pipeWidth,pipeHeight);
      ctx.restore();
      ctx.drawImage(pipeImg,p.x,p.top+pipeGap,pipeWidth,pipeHeight);
    });

    ctx.drawImage(
      birdFrames[Math.floor(Date.now()/100)%3],
      bird.x,bird.y,bird.size,bird.size
    );

    ctx.drawImage(baseImg,0,canvas.height-groundHeight,canvas.width,groundHeight);
    drawScoreImages(score,30);

    let hit = bird.y < 0 || bird.y + bird.size > canvas.height - groundHeight;
    pipes.forEach(p => {
      if (bird.x + bird.size > p.x &&
          bird.x < p.x + pipeWidth &&
          (bird.y < p.top || bird.y + bird.size > p.top + pipeGap)) hit = true;
    });

    if (hit) {
      playSound(hitSound);
      playSound(dieSound);
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
      state = "GAMEOVER";
    }
  }
  else if (state === "GAMEOVER") {
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
    ctx.drawImage(gameOverImg,canvas.width/2-96,240);
    drawScoreImages(score,320);

    ctx.fillStyle="white";
    ctx.font="24px Arial";
    ctx.textAlign="center";
    ctx.fillText(`High Score: ${highScore}`,canvas.width/2,380);
    ctx.fillText("Tap or Press Space to Restart",canvas.width/2,420);
  }

  requestAnimationFrame(update);
}

update();

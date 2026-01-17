"use strict";

/* ================= CANVAS ================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 640;

/* ================= ASSETS ================= */
const bgImg = new Image();
bgImg.src = "assets/background-day.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe-green.png";

const birdImgs = [
  "assets/yellowbird-upflap.png",
  "assets/yellowbird-midflap.png",
  "assets/yellowbird-downflap.png"
].map(src => { const i = new Image(); i.src = src; return i; });

const baseImg = new Image();
baseImg.src = "assets/base.png";

const messageImg = new Image();
messageImg.src = "assets/message.png";

const gameOverImg = new Image();
gameOverImg.src = "assets/gameover.png";

/* ================= SOUND ================= */
let soundEnabled = true;

const sounds = {
  wing: new Audio("assets/wing.wav"),
  hit: new Audio("assets/hit.wav"),
  point: new Audio("assets/point.wav"),
  die: new Audio("assets/die.wav")
};

function playSound(s) { if(soundEnabled){ s.currentTime=0; s.play(); } }

/* ================= GAME VARS ================= */
let bird, pipes, score, frame;
const gravity = 0.45;
const jump = -7;
const pipeGap = 140;
const pipeWidth = 52;
const pipeHeight = 320;

let state = "START"; // START → PLAYING → GAMEOVER

/* ================= RESET ================= */
function resetGame() {
  bird = { x: 80, y: canvas.height/2, vel:0 };
  pipes = [];
  score = 0;
  frame = 0;
}

/* ================= INPUT ================= */
function flap() {
  if(state === "START") { state="PLAYING"; playSound(sounds.wing); }
  else if(state === "PLAYING") { bird.vel = jump; playSound(sounds.wing); }
  else if(state === "GAMEOVER") { resetGame(); state="START"; }
}

canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", e => { e.preventDefault(); flap(); }, {passive:false});
document.addEventListener("keydown", e => { if(e.code==="Space") flap(); });

/* ================= UPDATE LOOP ================= */
function update() {
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

  if(state === "START") {
    ctx.drawImage(messageImg, canvas.width/2 - messageImg.width/2, canvas.height/2 - messageImg.height/2);
  }

  else if(state === "PLAYING") {
    frame++;
    bird.vel += gravity;
    bird.y += bird.vel;

    if(frame % 90 ===0) {
      pipes.push({ x: canvas.width, top: Math.random()*(canvas.height-pipeGap-200)+100, passed:false });
    }

    pipes.forEach(p => {
      p.x -= 2.5;
      // top pipe
      ctx.save();
      ctx.translate(p.x+pipeWidth/2, p.top);
      ctx.scale(1,-1);
      ctx.drawImage(pipeImg,-pipeWidth/2,0,pipeWidth,pipeHeight);
      ctx.restore();
      // bottom pipe
      ctx.drawImage(pipeImg,p.x,p.top+pipeGap,pipeWidth,pipeHeight);

      // collision
      if(bird.x+34 > p.x && bird.x < p.x+pipeWidth && (bird.y<p.top || bird.y+24>p.top+pipeGap)) {
        playSound(sounds.hit); playSound(sounds.die); state="GAMEOVER";
      }

      if(!p.passed && p.x+pipeWidth < bird.x) { score++; p.passed=true; playSound(sounds.point); }
    });

    pipes = pipes.filter(p => p.x > -pipeWidth);

    if(bird.y<0 || bird.y+24>canvas.height-112) { state="GAMEOVER"; playSound(sounds.hit); playSound(sounds.die); }

    ctx.drawImage(birdImgs[Math.floor(frame/6)%3], bird.x, bird.y, 34, 24);
    ctx.drawImage(baseImg,0,canvas.height-112,canvas.width,112);

    ctx.fillStyle="white"; ctx.font="36px Arial"; ctx.textAlign="center";
    ctx.fillText(score,canvas.width/2,80);
  }

  else if(state === "GAMEOVER") {
    ctx.drawImage(gameOverImg, canvas.width/2 - gameOverImg.width/2, canvas.height/2 - gameOverImg.height/2);
    ctx.drawImage(baseImg,0,canvas.height-112,canvas.width,112);
    ctx.fillStyle="white"; ctx.font="28px Arial"; ctx.textAlign="center";
    ctx.fillText("Score: "+score, canvas.width/2, canvas.height/2+100);
  }

  requestAnimationFrame(update);
}

/* ================= START LOOP ================= */
resetGame();
update();

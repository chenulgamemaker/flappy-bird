"use strict";

/* ===== BASIC ANTI-TAMPER (NOT PERFECT) ===== */
Object.freeze(Math);
Object.freeze(Object.prototype);

/* ===== CANVAS ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, 480);
  canvas.height = Math.min(window.innerHeight, 640);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ===== GAME STATES ===== */
const STATE = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  GAMEOVER: "GAMEOVER",
  LEADERBOARD: "LEADERBOARD",
  SETTINGS: "SETTINGS",
  CREDITS: "CREDITS"
};
let state = STATE.MENU;

/* ===== ASSETS ===== */
const bgImg = new Image();
bgImg.src = "assets/background-day.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe-green.png";

const birdImgs = [
  "assets/yellowbird-upflap.png",
  "assets/yellowbird-midflap.png",
  "assets/yellowbird-downflap.png"
].map(src => {
  const i = new Image();
  i.src = src;
  return i;
});

/* ===== SOUND SETTINGS ===== */
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled"));
if (soundEnabled === null) soundEnabled = true;

const sounds = {
  wing: new Audio("assets/wing.wav"),
  hit: new Audio("assets/hit.wav"),
  point: new Audio("assets/point.wav"),
  die: new Audio("assets/die.wav")
};

function playSound(s) {
  if (soundEnabled) {
    s.currentTime = 0;
    s.play();
  }
}

/* ===== PLAYER NAME ===== */
let playerName = localStorage.getItem("playerName");
if (!playerName) {
  playerName = prompt("Enter your name:") || "Player";
  playerName = playerName.substring(0, 12);
  localStorage.setItem("playerName", playerName);
}

/* ===== ADMIN ===== */
const isAdmin = playerName.toLowerCase() === "chenul";
let adminPanel = false;

/* ===== GAME VARIABLES ===== */
let bird, pipes, score;
const gravity = 0.45;
const jump = -7;
const pipeGap = 140;
const pipeWidth = 52;
const pipeHeight = 320;
let frame = 0;

/* ===== RESET ===== */
function resetGame() {
  bird = { x: 80, y: canvas.height / 2, vel: 0, frame: 0 };
  pipes = [];
  score = 0;
  frame = 0;
}

/* ===== LEADERBOARD ===== */
function getLeaderboard() {
  return JSON.parse(localStorage.getItem("leaderboard")) || [];
}

function saveScore(name, score) {
  let board = getLeaderboard();
  board.push({ name, score });
  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(board));
}

/* ===== INPUT ===== */
function flap() {
  if (state === STATE.PLAYING) {
    bird.vel = jump;
    playSound(sounds.wing);
  } else if (state === STATE.MENU || state === STATE.GAMEOVER) {
    resetGame();
    state = STATE.PLAYING;
    playSound(sounds.wing);
  }
}

canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  flap();
}, { passive: false });

document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();

  if (isAdmin && e.code === "KeyA") {
    adminPanel = !adminPanel;
  }
});

/* ===== DRAW ===== */
function drawCentered(text, y, size = 24) {
  ctx.fillStyle = "white";
  ctx.font = size + "px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, y);
}

/* ===== UPDATE ===== */
function update() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  if (state === STATE.MENU) {
    drawCentered("FLAPPY BIRD", 180, 42);
    drawCentered("Tap to Play", 260);
    drawCentered("Leaderboard", 320);
    drawCentered("Settings", 360);
    drawCentered("Credits", 400);
  }

  else if (state === STATE.PLAYING) {
    frame++;

    bird.vel += gravity;
    bird.y += bird.vel;

    if (frame % 90 === 0) {
      pipes.push({
        x: canvas.width,
        top: Math.random() * (canvas.height - pipeGap - 200) + 100,
        passed: false
      });
    }

    pipes.forEach(p => {
      p.x -= 2.5;

      // Pipes
      ctx.save();
      ctx.translate(p.x + pipeWidth / 2, p.top);
      ctx.scale(1, -1);
      ctx.drawImage(pipeImg, -pipeWidth / 2, 0, pipeWidth, pipeHeight);
      ctx.restore();

      ctx.drawImage(pipeImg, p.x, p.top + pipeGap, pipeWidth, pipeHeight);

      // Collision
      if (
        bird.x + 24 > p.x &&
        bird.x < p.x + pipeWidth &&
        (bird.y < p.top || bird.y + 24 > p.top + pipeGap)
      ) {
        playSound(sounds.hit);
        playSound(sounds.die);
        saveScore(playerName, score);
        state = STATE.GAMEOVER;
      }

      if (!p.passed && p.x + pipeWidth < bird.x) {
        score++;
        p.passed = true;
        playSound(sounds.point);
      }
    });

    pipes = pipes.filter(p => p.x > -pipeWidth);

    if (bird.y < 0 || bird.y + 24 > canvas.height) {
      saveScore(playerName, score);
      state = STATE.GAMEOVER;
    }

    ctx.drawImage(birdImgs[Math.floor(frame / 5) % 3], bird.x, bird.y, 34, 24);
    drawCentered(score, 80, 36);
  }

  else if (state === STATE.GAMEOVER) {
    drawCentered("Game Over", 220, 40);
    drawCentered("Score: " + score, 270);
    drawCentered("Tap to Restart", 330);
  }

  else if (state === STATE.CREDITS) {
    drawCentered("Credits", 200, 40);
    drawCentered("chenul", 260);
    drawCentered("ChatGPT", 300);
    drawCentered("Tap to return", 380);
  }

  else if (state === STATE.SETTINGS) {
    drawCentered("Settings", 200, 40);
    drawCentered("Sound: " + (soundEnabled ? "ON" : "OFF"), 260);
    drawCentered("Tap to toggle", 300);
  }

  if (adminPanel) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(20, 20, 200, 100);
    ctx.fillStyle = "lime";
    ctx.font = "14px monospace";
    ctx.fillText("ADMIN PANEL", 40, 50);
    ctx.fillText("Score: " + score, 40, 70);
  }

  requestAnimationFrame(update);
}

resetGame();
update();

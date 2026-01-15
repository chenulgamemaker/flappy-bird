const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ---------------------
   GAME STATE
--------------------- */
let state = "MAINMENU"; // MAINMENU, PLAYING, PAUSED, GAMEOVER, LEADERBOARD, SETTINGS, CREDITS

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
const gravity = 0.3;
const jump = -6;
const pipeGap = 180;
const pipeWidth = 70;
const groundHeight = 112;
const pipeSpeed = 2.5;

const leaderboardKey = "flappyLeaderboard";

/* ---------------------
   RESET GAME
--------------------- */
function resetGame() {
  bird = { x: 100, y: canvas.height / 2, size: 34, vel: 0, rot: 0 };
  pipes = [{ x: canvas.width, top: Math.random() * 250 + 50 }];
  score = 0;
  frame = 0;
}

/* ---------------------
   DRAW SCORE IMAGES
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
   LEADERBOARD FUNCTIONS
--------------------- */
function getLeaderboard() {
  const data = JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
  return data.sort((a,b)=>b-a).slice(0,5);
}

function updateLeaderboard(score) {
  let board = JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
  board.push(score);
  localStorage.setItem(leaderboardKey, JSON.stringify(board));
}

/* ---------------------
   INPUT
--------------------- */
function flap() {
  if (state === "PLAYING") {
    bird.vel = jump;
    wingSound.currentTime = 0;
    wingSound.play();
  } else if (state === "MAINMENU" || state === "GAMEOVER") {
    resetGame();
    state = "PLAYING";
    wingSound.currentTime = 0;
    wingSound.play();
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();
  if (e.code === "KeyP" && state === "PLAYING") state = "PAUSED";
  else if (e.code === "KeyP" && state === "PAUSED") state = "PLAYING";
});

canvas.addEventListener("mousedown", handleClick);
canvas.addEventListener("touchstart", handleClick);

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX || e.touches[0].clientX) - rect.left;
  const my = (e.clientY || e.touches[0].clientY) - rect.top;

  if (state === "MAINMENU") {
    // Menu buttons: rectangles
    if (mx > 200 && mx < 400) {
      if (my > 200 && my < 250) { state = "PLAYING"; resetGame(); }
      if (my > 260 && my < 310) state = "LEADERBOARD";
      if (my > 320 && my < 370) state = "SETTINGS";
      if (my > 380 && my < 430) state = "CREDITS";
    }
  } else if (state === "GAMEOVER") {
    flap(); // restart game on click
  } else if (["LEADERBOARD","SETTINGS","CREDITS"].includes(state)) {
    // Click anywhere to return to menu
    state = "MAINMENU";
  }
}

/* ---------------------
   DRAW MENU
--------------------- */
function drawMainMenu() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Flappy Bird", canvas.width/2, 120);

  // Buttons
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(200,200,200,50);
  ctx.fillRect(200,260,200,50);
  ctx.fillRect(200,320,200,50);
  ctx.fillRect(200,380,200,50);

  ctx.fillStyle = "black";
  ctx.font = "28px Arial";
  ctx.fillText("Play", canvas.width/2, 235);
  ctx.fillText("Leaderboard", canvas.width/2, 295);
  ctx.fillText("Settings", canvas.width/2, 355);
  ctx.fillText("Credits", canvas.width/2, 415);
}

/* ---------------------
   DRAW LEADERBOARD
--------------------- */
function drawLeaderboard() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Leaderboard", canvas.width/2, 100);

  const board = getLeaderboard();
  ctx.font = "28px Arial";
  board.forEach((s,i)=>{
    ctx.fillText(`${i+1}. ${s}`, canvas.width/2, 180 + i*40);
  });

  ctx.font = "24px Arial";
  ctx.fillText("Click anywhere to return", canvas.width/2, 400);
}

/* ---------------------
   DRAW SETTINGS
--------------------- */
function drawSettings() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Settings", canvas.width/2, 100);

  ctx.font = "24px Arial";
  ctx.fillText("Placeholder: add sound/music toggle here", canvas.width/2, 200);
  ctx.fillText("Click anywhere to return", canvas.width/2, 400);
}

/* ---------------------
   DRAW CREDITS
--------------------- */
function drawCredits() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Credits", canvas.width/2, 100);

  ctx.font = "28px Arial";
  ctx.fillText("Game by YOU", canvas.width/2, 200);
  ctx.fillText("Click anywhere to return", canvas.width/2, 400);
}

/* ---------------------
   GAME LOOP
--------------------- */
function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(state==="MAINMENU") drawMainMenu();
  else if(state==="LEADERBOARD") drawLeaderboard();
  else if(state==="SETTINGS") drawSettings();
  else if(state==="CREDITS") drawCredits();
  else if(state==="PLAYING") {
    frame++;

    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

    // Bird physics
    bird.vel += gravity;
    bird.y += bird.vel;
    bird.rot = Math.min(Math.PI/6,bird.vel/10);

    // Pipes
    pipes.forEach(p=>p.x-=pipeSpeed);

    if(pipes[0].x < canvas.width/2 && pipes.length===1)
      pipes.push({x:canvas.width,top:Math.random()*250+50});

    if(pipes[0].x<-pipeWidth){
      pipes.shift();
      score++;
      pointSound.play();
    }

    pipes.forEach(p=>{
      ctx.drawImage(pipeImg,p.x,p.top-320,pipeWidth,320);
      ctx.drawImage(pipeImg,p.x,p.top+pipeGap,pipeWidth,320);
    });

    const birdFrame = Math.floor(frame/6)%birdFrames.length;
    ctx.save();
    ctx.translate(bird.x+bird.size/2,bird.y+bird.size/2);
    ctx.rotate(bird.rot);
    ctx.drawImage(birdFrames[birdFrame],-bird.size/2,-bird.size/2,bird.size,bird.size);
    ctx.restore();

    ctx.drawImage(baseImg,0,canvas.height-groundHeight,canvas.width,groundHeight);

    // Collision
    let collided=false;
    pipes.forEach(p=>{
      if(bird.x+bird.size>p.x && bird.x<p.x+pipeWidth && (bird.y<p.top || bird.y+bird.size>p.top+pipeGap))
        collided=true;
    });
    if(bird.y<0 || bird.y+bird.size>canvas.height-groundHeight) collided=true;

    if(collided){
      hitSound.play();
      dieSound.play();
      state="GAMEOVER";
      updateLeaderboard(score);
    }

    drawScoreImages(score,30);
  }
  else if(state==="PAUSED"){
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
    drawScoreImages(score,30);
    ctx.fillStyle="white";
    ctx.font="48px Arial";
    ctx.textAlign="center";
    ctx.fillText("PAUSED",canvas.width/2,canvas.height/2);
  }
  else if(state==="GAMEOVER"){
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
    ctx.drawImage(gameOverImg,canvas.width/2-96,230);
    drawScoreImages(score,300);
  }

  requestAnimationFrame(update);
}

update();

"use strict";

/* ================= CANVAS ================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ================= GAME STATES ================= */
const STATE = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  GAMEOVER: "GAMEOVER",
  LEADERBOARD: "LEADERBOARD",
  SETTINGS: "SETTINGS",
  CREDITS: "CREDITS"
};
let state = STATE.MENU;

/* ================= ASSETS ================= */
// Game objects
const bgImg = new Image(); bgImg.src = "assets/background-day.png";
const pipeImg = new Image(); pipeImg.src = "assets/pipe-green.png";
const baseImg = new Image(); baseImg.src = "assets/base.png";

// Birds
const birdImgs = [
  "assets/Bird/yellowbird-upflap.png",
  "assets/Bird/yellowbird-midflap.png",
  "assets/Bird/yellowbird-downflap.png"
].map(src => { const i = new Image(); i.src = src; return i; });

// UI
const messageImg = new Image(); messageImg.src = "assets/UI/message.png";
const gameOverImg = new Image(); gameOverImg.src = "assets/UI/gameover.png";

// Sounds
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled"));
if(soundEnabled===null) soundEnabled=true;

const sounds = {
  wing: new Audio("assets/Sounds/wing.wav"),
  point: new Audio("assets/Sounds/point.wav"),
  hit: new Audio("assets/Sounds/hit.wav"),
  die: new Audio("assets/Sounds/die.wav")
};
function playSound(s){ if(!soundEnabled) return; s.currentTime=0; s.play(); }

/* ================= PLAYER & LEADERBOARD ================= */
let playerName = localStorage.getItem("playerName");
if(!playerName){
  playerName = prompt("Enter your name") || "Player";
  playerName = playerName.substring(0,12);
  localStorage.setItem("playerName", playerName);
}

function getLeaderboard(){ return JSON.parse(localStorage.getItem("leaderboard"))||[]; }
function saveScore(name,score){
  let board=getLeaderboard();
  board.push({name,score});
  board.sort((a,b)=>b.score-a.score);
  board=board.slice(0,5);
  localStorage.setItem("leaderboard",JSON.stringify(board));
}

/* ================= GAME VARIABLES ================= */
let bird, pipes, score, frame;
const gravity = 0.45;
const jump = -7;
const pipeGap = 140;
const pipeWidth = 52;
const pipeHeight = 320;

/* ================= RESET GAME ================= */
function resetGame(){
  bird={x:80,y:canvas.height/2,vel:0};
  pipes=[];
  score=0;
  frame=0;
}

/* ================= MENU BUTTONS ================= */
function button(x,y,w,h){return {x,y,w,h};}
function inside(px,py,b){return px>=b.x && px<=b.x+b.w && py>=b.y && py<=b.y+b.h;}
function menuButtons(){
  const cx = canvas.width/2 - 140;
  return {
    play: button(cx,240,280,55),
    board: button(cx,310,280,55),
    settings: button(cx,380,280,55),
    credits: button(cx,450,280,55)
  };
}
function backButton(){ return {x:canvas.width/2-100,y:canvas.height-80,w:200,h:50}; }

/* ================= INPUT ================= */
function flap(){
  if(state===STATE.PLAYING){
    bird.vel=jump;
    playSound(sounds.wing);
  }else if(state===STATE.GAMEOVER){
    resetGame();
    state=STATE.PLAYING;
  }
}

canvas.addEventListener("click",handleClick);
canvas.addEventListener("touchstart",e=>{e.preventDefault();handleClick(e.touches[0]);},{passive:false});
document.addEventListener("keydown",e=>{if(e.code==="Space") flap();});

function handleClick(e){
  const rect=canvas.getBoundingClientRect();
  const x=e.clientX-rect.left;
  const y=e.clientY-rect.top;

  const btn=menuButtons();
  const back=backButton();

  if(state===STATE.MENU){
    if(inside(x,y,btn.play)){resetGame();state=STATE.PLAYING;}
    else if(inside(x,y,btn.board)) state=STATE.LEADERBOARD;
    else if(inside(x,y,btn.settings)) state=STATE.SETTINGS;
    else if(inside(x,y,btn.credits)) state=STATE.CREDITS;
    return;
  }

  if(state===STATE.SETTINGS){
    if(inside(x,y,back)) state=STATE.MENU;
    else{ soundEnabled=!soundEnabled; localStorage.setItem("soundEnabled",soundEnabled);}
    return;
  }

  if(state===STATE.LEADERBOARD || state===STATE.CREDITS){
    if(inside(x,y,back)) state=STATE.MENU;
    return;
  }

  flap();
}

/* ================= DRAW HELPERS ================= */
function drawText(text,y,size=24){
  ctx.fillStyle="white";
  ctx.font=size+"px Arial";
  ctx.textAlign="center";
  ctx.fillText(text,canvas.width/2,y);
}
function drawButton(b,label){
  ctx.fillStyle="rgba(0,0,0,0.5)";
  ctx.fillRect(b.x,b.y,b.w,b.h);
  drawText(label,b.y+38);
}

/* ================= ASSET LOADING ================= */
let assetsLoaded=0;
const TOTAL_ASSETS=3+birdImgs.length+2; // bg+pipe+base+3 birds+2 UI
function assetReady(){assetsLoaded++;if(assetsLoaded===TOTAL_ASSETS){resetGame();update();}}
bgImg.onload=assetReady;
pipeImg.onload=assetReady;
baseImg.onload=assetReady;
birdImgs.forEach(img=>img.onload=assetReady);
messageImg.onload=assetReady;
gameOverImg.onload=assetReady;

/* ================= UPDATE LOOP ================= */
function update(){
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

  if(state===STATE.MENU){
    const btn=menuButtons();
    drawText("FLAPPY BIRD",160,42);
    drawButton(btn.play,"Play");
    drawButton(btn.board,"Leaderboard");
    drawButton(btn.settings,"Settings");
    drawButton(btn.credits,"Credits");
  }

  else if(state===STATE.PLAYING){
    frame++;
    bird.vel+=gravity;
    bird.y+=bird.vel;

    if(frame%90===0) pipes.push({x:canvas.width,top:Math.random()*(canvas.height-pipeGap-200)+100,passed:false});

    pipes.forEach(p=>{
      p.x-=2.5;
      // top pipe
      ctx.save();
      ctx.translate(p.x+pipeWidth/2,p.top);
      ctx.scale(1,-1);
      ctx.drawImage(pipeImg,-pipeWidth/2,0,pipeWidth,pipeHeight);
      ctx.restore();
      // bottom pipe
      ctx.drawImage(pipeImg,p.x,p.top+pipeGap,pipeWidth,pipeHeight);

      // collision
      if(bird.x+34>p.x && bird.x<p.x+pipeWidth && (bird.y<p.top || bird.y+24>p.top+pipeGap)){
        playSound(sounds.hit); playSound(sounds.die); saveScore(playerName,score); state=STATE.GAMEOVER;
      }

      if(!p.passed && p.x+pipeWidth<bird.x){score++; p.passed=true; playSound(sounds.point);}
    });

    pipes=pipes.filter(p=>p.x>-pipeWidth);

    if(bird.y<0 || bird.y+24>canvas.height){saveScore(playerName,score); state=STATE.GAMEOVER;}

    ctx.drawImage(birdImgs[Math.floor(frame/6)%3],bird.x,bird.y,34,24);
    ctx.drawImage(baseImg,0,canvas.height-112,canvas.width,112);
    drawText(score,80,36);
  }

  else if(state===STATE.GAMEOVER){
    ctx.drawImage(gameOverImg,canvas.width/2-gameOverImg.width/2,canvas.height/2-gameOverImg.height/2);
    ctx.drawImage(baseImg,0,canvas.height-112,canvas.width,112);
    drawText("Score: "+score,canvas.width/2,canvas.height/2+100);
    drawText("Tap to Restart",canvas.width/2,canvas.height/2+140);
  }

  else if(state===STATE.LEADERBOARD){
    drawText("Leaderboard",140,42);
    const board=getLeaderboard();
    board.forEach((e,i)=>drawText(`${i+1}. ${e.name} - ${e.score}`,220+i*36));
    if(!board.length) drawText("No scores yet",260);
    drawButton(backButton(),"Back");
  }

  else if(state===STATE.SETTINGS){
    drawText("Settings",220,42);
    drawText("Sound: "+(soundEnabled?"ON":"OFF"),290);
    drawText("Tap anywhere else to toggle",340);
    drawButton(backButton(),"Back");
  }

  else if(state===STATE.CREDITS){
    drawText("Credits",220,42);
    drawText("chenul",290);
    drawText("ChatGPT",330);
    drawButton(backButton(),"Back");
  }

  requestAnimationFrame(update);
}

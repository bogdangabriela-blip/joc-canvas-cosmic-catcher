const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart");

let score = 0;
let gameRunning = true;

// Obiect navă
const ship = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 120,
  width: 100,     // mărime emoji navă
  height: 100,
  speed: 8
};

// Array-uri
let stars = [];
let particles = [];

// Controale
let keys = {};
let mouseX = ship.x + ship.width / 2;

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup",   e => keys[e.key] = false);

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

// Generăm stele noi la fiecare ~1.2 secunde
setInterval(() => {
  if (!gameRunning) return;
  const size = Math.random() * 40 + 30;
  stars.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size: size,
    speed: Math.random() * 3.5 + 2.5,
    rotation: 0,
    rotSpeed: (Math.random() - 0.5) * 0.12
  });
}, 1200);

// Bucla principală de joc
function gameLoop() {
  if (!gameRunning) return;

  update();
  draw();

  requestAnimationFrame(gameLoop);
}

function update() {
  // Mișcare navă cu taste
  if (keys["ArrowLeft"] || keys["a"] || keys["A"])  ship.x -= ship.speed;
  if (keys["ArrowRight"]|| keys["d"] || keys["D"]) ship.x += ship.speed;

  // Urmărire mouse (smooth)
  ship.x += (mouseX - (ship.x + ship.width / 2)) * 0.18;

  // Limitează nava în ecran
  ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x));

  // Actualizare stele
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i];
    star.y += star.speed;
    star.rotation += star.rotSpeed;

    // Coliziune / capturare
    if (
      star.y + star.size > ship.y &&
      star.y < ship.y + ship.height &&
      star.x + star.size > ship.x &&
      star.x < ship.x + ship.width
    ) {
      score += 10;
      scoreElement.textContent = score;
      createParticles(star.x + star.size / 2, star.y + star.size / 2);
      stars.splice(i, 1);
      continue;
    }

    // Stea a ieșit de jos
    if (star.y > canvas.height + 100) {
      stars.splice(i, 1);
    }
  }

  // Particule (efect capturare)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function draw() {
  // Fundal cu trail ușor
  ctx.fillStyle = "rgba(0, 0, 20, 0.14)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stele mici de fundal (parallax)
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 100; i++) {
    let y = (Date.now() * 0.04 + i * 25) % (canvas.height + 100) - 50;
    ctx.globalAlpha = 0.4 + Math.random() * 0.6;
    ctx.fillRect(Math.random() * canvas.width, y, 1.8, 1.8);
  }
  ctx.globalAlpha = 1;

  // Desenăm stelele căzătoare cu emoji + glow
  stars.forEach(star => {
    ctx.save();
    ctx.translate(star.x + star.size / 2, star.y + star.size / 2);
    ctx.rotate(star.rotation);

    // Glow efect
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 25;

    ctx.font = `${star.size}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌟", 0, 0);

    ctx.shadowBlur = 0; // reset
    ctx.restore();
  });

  // Nava cu emoji
  ctx.save();
  ctx.font = `${ship.width}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🚀", ship.x + ship.width / 2, ship.y + ship.height / 2);
  ctx.restore();

  // Particule (scântei colorate)
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 35;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function createParticles(x, y) {
  for (let i = 0; i < 16; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 3,
      size: Math.random() * 6 + 3,
      life: 35,
      hue: Math.random() * 60 + 20   // tonuri galben-portocaliu
    });
  }
}

// Buton restart
restartBtn.addEventListener("click", () => {
  score = 0;
  scoreElement.textContent = "0";
  stars = [];
  particles = [];
  ship.x = canvas.width / 2 - 50;
  gameRunning = true;
  gameLoop();
});

// Pornim jocul
gameLoop();
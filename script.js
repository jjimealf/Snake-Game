const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const speedEl = document.getElementById('speed');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 24;
const CELLS = canvas.width / GRID_SIZE;
const STORAGE_KEY = 'snake-best-score';

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

let snake;
let food;
let direction;
let queuedDirection;
let score;
let bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
let tickMs;
let timer = null;
let status;

function initState() {
  const mid = Math.floor(CELLS / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid }
  ];
  direction = 'right';
  queuedDirection = 'right';
  food = spawnFood();
  score = 0;
  tickMs = 130;
  status = 'idle';
  updateHud();
  showOverlay('Presiona Iniciar', 'Usa flechas o WASD. Espacio para pausar.');
  draw();
}

function spawnFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS)
    };
  } while (snake && snake.some((part) => part.x === position.x && part.y === position.y));
  return position;
}

function setDirection(next) {
  if (!DIRECTIONS[next]) return;
  if (OPPOSITES[direction] === next || OPPOSITES[queuedDirection] === next) return;
  queuedDirection = next;
  if (status === 'idle') {
    startGame();
  }
}

function startLoop() {
  clearLoop();
  timer = setInterval(step, tickMs);
}

function clearLoop() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function startGame() {
  if (status === 'running') return;
  if (status === 'gameover') {
    initState();
  }
  status = 'running';
  hideOverlay();
  startLoop();
}

function pauseGame() {
  if (status !== 'running') return;
  status = 'paused';
  clearLoop();
  showOverlay('Pausado', 'Presiona Espacio o Iniciar para continuar.');
}

function resumeGame() {
  if (status !== 'paused') return;
  status = 'running';
  hideOverlay();
  startLoop();
}

function togglePause() {
  if (status === 'running') {
    pauseGame();
  } else if (status === 'paused') {
    resumeGame();
  }
}

function restartGame() {
  clearLoop();
  initState();
}

function gameOver() {
  status = 'gameover';
  clearLoop();
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(STORAGE_KEY, String(bestScore));
  }
  updateHud();
  showOverlay('Perdiste', 'Pulsa Reiniciar o Iniciar para jugar otra vez.');
}

function step() {
  direction = queuedDirection;
  const nextHead = {
    x: snake[0].x + DIRECTIONS[direction].x,
    y: snake[0].y + DIRECTIONS[direction].y
  };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= CELLS ||
    nextHead.y >= CELLS;

  const grows = nextHead.x === food.x && nextHead.y === food.y;
  const bodyToCheck = grows ? snake : snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some((part) => part.x === nextHead.x && part.y === nextHead.y);

  if (hitsWall || hitsSelf) {
    draw(true);
    gameOver();
    return;
  }

  snake.unshift(nextHead);
  if (grows) {
    score += 10;
    food = spawnFood();
    const newTick = Math.max(65, 130 - Math.floor(score / 30) * 5);
    if (newTick !== tickMs) {
      tickMs = newTick;
      if (status === 'running') {
        startLoop();
      }
    }
  } else {
    snake.pop();
  }

  updateHud();
  draw();
}

function updateHud() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(STORAGE_KEY, String(bestScore));
  }
  scoreEl.textContent = String(score);
  bestEl.textContent = String(bestScore);
  const speedFactor = (130 / tickMs).toFixed(1).replace('.0', '');
  speedEl.textContent = speedFactor + 'x';
}

function draw(gameOverFlash = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake(gameOverFlash);
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= CELLS; i += 1) {
    const p = i * GRID_SIZE + 0.5;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFood() {
  const x = food.x * GRID_SIZE;
  const y = food.y * GRID_SIZE;
  ctx.save();
  ctx.fillStyle = '#b9362f';
  ctx.beginPath();
  ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2f7f3d';
  ctx.fillRect(x + GRID_SIZE * 0.5, y + GRID_SIZE * 0.08, 3, 8);
  ctx.restore();
}

function drawSnake(flash) {
  snake.forEach((part, index) => {
    const x = part.x * GRID_SIZE;
    const y = part.y * GRID_SIZE;
    const isHead = index === 0;
    ctx.fillStyle = flash ? '#9f2c28' : isHead ? '#0f4127' : '#195f3a';
    roundRect(ctx, x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, isHead ? 7 : 6);
    ctx.fill();

    if (isHead) {
      ctx.fillStyle = '#eef4e8';
      const eyeOffsetX = direction === 'left' ? 7 : direction === 'right' ? GRID_SIZE - 10 : 8;
      const eyeOffsetY1 = direction === 'up' ? 7 : 8;
      const eyeOffsetY2 = direction === 'down' ? GRID_SIZE - 10 : GRID_SIZE - 12;
      const xEye = x + eyeOffsetX;
      ctx.beginPath();
      ctx.arc(xEye, y + eyeOffsetY1, 2, 0, Math.PI * 2);
      ctx.arc(xEye, y + eyeOffsetY2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function keyToDirection(key) {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up';
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down';
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left';
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right';
    default:
      return null;
  }
}

document.addEventListener('keydown', (event) => {
  const dir = keyToDirection(event.key);
  if (dir) {
    event.preventDefault();
    setDirection(dir);
    return;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    if (status === 'idle') {
      startGame();
    } else if (status === 'gameover') {
      restartGame();
      startGame();
    } else {
      togglePause();
    }
  }

  if (event.key === 'Enter' && status !== 'running') {
    startGame();
  }
});

startBtn.addEventListener('click', () => {
  if (status === 'paused') {
    resumeGame();
  } else {
    startGame();
  }
});

pauseBtn.addEventListener('click', () => {
  if (status === 'idle') return;
  togglePause();
});

restartBtn.addEventListener('click', () => {
  restartGame();
});

document.querySelectorAll('[data-dir]').forEach((button) => {
  const handle = (event) => {
    event.preventDefault();
    setDirection(button.dataset.dir);
  };
  button.addEventListener('click', handle);
  button.addEventListener('touchstart', handle, { passive: false });
});

initState();

import { BOARD_PX, CELLS, GRID_SIZE } from './constants.js';

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, BOARD_PX, BOARD_PX);
  gradient.addColorStop(0, '#050812');
  gradient.addColorStop(0.5, '#090f1f');
  gradient.addColorStop(1, '#04060d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

  for (let y = 0; y < CELLS; y += 1) {
    for (let x = 0; x < CELLS; x += 1) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.012)';
      } else {
        ctx.fillStyle = 'rgba(57,214,255,0.01)';
      }
      ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
  }
}

function drawGrid(ctx) {
  ctx.save();
  ctx.lineWidth = 1;

  for (let i = 0; i <= CELLS; i += 1) {
    const p = i * GRID_SIZE + 0.5;
    ctx.strokeStyle = i % 4 === 0 ? 'rgba(57,214,255,0.12)' : 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, BOARD_PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(BOARD_PX, p);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFood(ctx, food) {
  const x = food.x * GRID_SIZE;
  const y = food.y * GRID_SIZE;
  const cx = x + GRID_SIZE / 2;
  const cy = y + GRID_SIZE / 2;
  const pulse = 0.9 + Math.sin(performance.now() / 180) * 0.08;

  ctx.save();

  ctx.shadowColor = 'rgba(255,77,109,0.8)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = 'rgba(255,77,109,0.22)';
  ctx.beginPath();
  ctx.arc(cx, cy, GRID_SIZE * 0.48 * pulse, 0, Math.PI * 2);
  ctx.fill();

  const fill = ctx.createRadialGradient(cx - 3, cy - 4, 2, cx, cy, GRID_SIZE * 0.36);
  fill.addColorStop(0, '#ffd9e1');
  fill.addColorStop(0.28, '#ff8ba3');
  fill.addColorStop(0.65, '#ff4d6d');
  fill.addColorStop(1, '#be1038');
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(255,77,109,0.65)';
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, GRID_SIZE * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#58f1ab';
  ctx.fillRect(x + GRID_SIZE * 0.48, y + GRID_SIZE * 0.08, 4, 8);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 4, 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSnake(ctx, snake, direction, status) {
  const flash = status === 'gameover';

  snake.forEach((part, index) => {
    const x = part.x * GRID_SIZE;
    const y = part.y * GRID_SIZE;
    const isHead = index === 0;

    const bodyGradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
    if (flash) {
      bodyGradient.addColorStop(0, '#ff7088');
      bodyGradient.addColorStop(1, '#6e132b');
    } else if (isHead) {
      bodyGradient.addColorStop(0, '#78ffe2');
      bodyGradient.addColorStop(0.55, '#27e3a2');
      bodyGradient.addColorStop(1, '#0f6a4b');
    } else {
      bodyGradient.addColorStop(0, '#41f3ba');
      bodyGradient.addColorStop(0.55, '#14c98a');
      bodyGradient.addColorStop(1, '#0a6c53');
    }

    ctx.shadowColor = flash ? 'rgba(255,77,109,0.5)' : 'rgba(21,212,138,0.35)';
    ctx.shadowBlur = isHead ? 14 : 9;
    ctx.fillStyle = bodyGradient;
    roundRect(ctx, x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, isHead ? 7 : 6);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = flash ? 'rgba(255,255,255,0.12)' : 'rgba(225,255,246,0.18)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 1.5, y + 1.5, GRID_SIZE - 3, GRID_SIZE - 3, isHead ? 7 : 6);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, x + 4, y + 4, GRID_SIZE - 10, 5, 3);
    ctx.fill();

    if (!isHead) return;

    const eyeOffsetX = direction === 'left' ? 7 : direction === 'right' ? GRID_SIZE - 10 : 8.5;
    const eyeOffsetY1 = direction === 'up' ? 7 : 8;
    const eyeOffsetY2 = direction === 'down' ? GRID_SIZE - 10 : GRID_SIZE - 12;
    const xEye = x + eyeOffsetX;

    ctx.fillStyle = '#e8fbff';
    ctx.beginPath();
    ctx.arc(xEye, y + eyeOffsetY1, 2.2, 0, Math.PI * 2);
    ctx.arc(xEye, y + eyeOffsetY2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    let pupilX = 0;
    let pupilY = 0;
    if (direction === 'left') pupilX = -0.6;
    if (direction === 'right') pupilX = 0.6;
    if (direction === 'up') pupilY = -0.6;
    if (direction === 'down') pupilY = 0.6;

    ctx.fillStyle = '#03140f';
    ctx.beginPath();
    ctx.arc(xEye + pupilX, y + eyeOffsetY1 + pupilY, 0.9, 0, Math.PI * 2);
    ctx.arc(xEye + pupilX, y + eyeOffsetY2 + pupilY, 0.9, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);
  drawBackground(ctx);
  drawGrid(ctx);
  drawFood(ctx, game.food);
  drawSnake(ctx, game.snake, game.direction, game.status);

  if (game.status === 'gameover') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 77, 109, 0.08)';
    ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);
    ctx.restore();
  }
}

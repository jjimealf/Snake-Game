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

function drawGrid(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= CELLS; i += 1) {
    const p = i * GRID_SIZE + 0.5;
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
  ctx.save();
  ctx.fillStyle = '#b9362f';
  ctx.beginPath();
  ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2f7f3d';
  ctx.fillRect(x + GRID_SIZE * 0.5, y + GRID_SIZE * 0.08, 3, 8);
  ctx.restore();
}

function drawSnake(ctx, snake, direction, status) {
  const flash = status === 'gameover';

  snake.forEach((part, index) => {
    const x = part.x * GRID_SIZE;
    const y = part.y * GRID_SIZE;
    const isHead = index === 0;

    ctx.fillStyle = flash ? '#9f2c28' : isHead ? '#0f4127' : '#195f3a';
    roundRect(ctx, x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, isHead ? 7 : 6);
    ctx.fill();

    if (!isHead) return;

    ctx.fillStyle = '#eef4e8';
    const eyeOffsetX = direction === 'left' ? 7 : direction === 'right' ? GRID_SIZE - 10 : 8;
    const eyeOffsetY1 = direction === 'up' ? 7 : 8;
    const eyeOffsetY2 = direction === 'down' ? GRID_SIZE - 10 : GRID_SIZE - 12;
    const xEye = x + eyeOffsetX;
    ctx.beginPath();
    ctx.arc(xEye, y + eyeOffsetY1, 2, 0, Math.PI * 2);
    ctx.arc(xEye, y + eyeOffsetY2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);
  drawGrid(ctx);
  drawFood(ctx, game.food);
  drawSnake(ctx, game.snake, game.direction, game.status);
}

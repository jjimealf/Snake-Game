import { BOARD_PX, CELLS, GRID_SIZE } from './constants.js';
import { getCanvasPalette } from './themes.js';

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawBackground(ctx, palette) {
  const gradient = ctx.createLinearGradient(0, 0, BOARD_PX, BOARD_PX);
  gradient.addColorStop(0, palette.background[0]);
  gradient.addColorStop(0.5, palette.background[1]);
  gradient.addColorStop(1, palette.background[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

  for (let y = 0; y < CELLS; y += 1) {
    for (let x = 0; x < CELLS; x += 1) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = palette.checkerA;
      } else {
        ctx.fillStyle = palette.checkerB;
      }
      ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
  }
}

export function createEatParticles(foodCell, theme = 'retro') {
  const palette = getCanvasPalette(theme);
  const cx = foodCell.x * GRID_SIZE + GRID_SIZE / 2;
  const cy = foodCell.y * GRID_SIZE + GRID_SIZE / 2;
  const particles = [];

  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() * 0.35 - 0.175);
    const speed = 48 + Math.random() * 85;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 220 + Math.random() * 180,
      maxLife: 220 + Math.random() * 180,
      size: 1.8 + Math.random() * 2.6,
      hue: palette.particles.hues[i % palette.particles.hues.length]
    });
  }

  return particles;
}

export function stepParticles(particles, dtMs) {
  if (!particles.length) return particles;

  const dt = Math.min(50, dtMs) / 1000;

  return particles
    .map((particle) => {
      const nextLife = particle.life - dtMs;
      if (nextLife <= 0) return null;

      const drag = 0.985;
      const gravity = 80;

      return {
        ...particle,
        x: particle.x + particle.vx * dt,
        y: particle.y + particle.vy * dt,
        vx: particle.vx * drag,
        vy: particle.vy * drag + gravity * dt,
        life: nextLife
      };
    })
    .filter(Boolean);
}

function drawGrid(ctx, palette) {
  ctx.save();
  ctx.lineWidth = 1;

  for (let i = 0; i <= CELLS; i += 1) {
    const p = i * GRID_SIZE + 0.5;
    ctx.strokeStyle = i % 4 === 0 ? palette.gridMajor : palette.gridMinor;
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

function drawFood(ctx, food, timeMs, palette) {
  const x = food.x * GRID_SIZE;
  const y = food.y * GRID_SIZE;
  const cx = x + GRID_SIZE / 2;
  const cy = y + GRID_SIZE / 2;
  const pulse = 0.9 + Math.sin(timeMs / 180) * 0.08;

  ctx.save();

  ctx.shadowColor = palette.food.halo;
  ctx.shadowBlur = 18;
  ctx.fillStyle = palette.food.haloFill;
  ctx.beginPath();
  ctx.arc(cx, cy, GRID_SIZE * 0.48 * pulse, 0, Math.PI * 2);
  ctx.fill();

  const fill = ctx.createRadialGradient(cx - 3, cy - 4, 2, cx, cy, GRID_SIZE * 0.36);
  fill.addColorStop(0, palette.food.gradient[0]);
  fill.addColorStop(0.28, palette.food.gradient[1]);
  fill.addColorStop(0.65, palette.food.gradient[2]);
  fill.addColorStop(1, palette.food.gradient[3]);
  ctx.shadowBlur = 12;
  ctx.shadowColor = palette.food.coreGlow;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, GRID_SIZE * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = palette.food.stem;
  ctx.fillRect(x + GRID_SIZE * 0.48, y + GRID_SIZE * 0.08, 4, 8);

  ctx.fillStyle = palette.food.highlight;
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 4, 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawParticles(ctx, particles) {
  if (!particles || particles.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    const radius = p.size * (0.6 + alpha * 0.9);

    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, ${alpha * 0.6})`;
    ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSnake(ctx, snake, direction, status, timeMs, palette) {
  const flash = status === 'gameover';

  snake.forEach((part, index) => {
    const x = part.x * GRID_SIZE;
    const y = part.y * GRID_SIZE;
    const isHead = index === 0;
    const pulse = 0.7 + Math.sin(timeMs / 180 + index * 0.65) * 0.3;
    const inset = isHead ? 0.9 - pulse * 0.15 : 1;
    const size = GRID_SIZE - inset * 2;

    const bodyGradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
    if (flash) {
      bodyGradient.addColorStop(0, palette.snake.flashGradient[0]);
      bodyGradient.addColorStop(1, palette.snake.flashGradient[1]);
    } else if (isHead) {
      bodyGradient.addColorStop(0, palette.snake.headGradient[0]);
      bodyGradient.addColorStop(0.55, palette.snake.headGradient[1]);
      bodyGradient.addColorStop(1, palette.snake.headGradient[2]);
    } else {
      bodyGradient.addColorStop(0, palette.snake.bodyGradient[0]);
      bodyGradient.addColorStop(0.55, palette.snake.bodyGradient[1]);
      bodyGradient.addColorStop(1, palette.snake.bodyGradient[2]);
    }

    ctx.shadowColor = flash ? palette.snake.flashGlow : palette.snake.glow;
    ctx.shadowBlur = (isHead ? 11 : 7) + pulse * (isHead ? 7 : 4);
    ctx.fillStyle = bodyGradient;
    roundRect(ctx, x + inset, y + inset, size, size, isHead ? 7 : 6);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = flash ? palette.snake.flashStroke : palette.snake.stroke;
    ctx.lineWidth = 1;
    roundRect(ctx, x + inset + 0.5, y + inset + 0.5, size - 1, size - 1, isHead ? 7 : 6);
    ctx.stroke();

    ctx.fillStyle = `rgba(${palette.snake.glossBase},${0.04 + pulse * 0.06})`;
    roundRect(ctx, x + 4, y + 4, GRID_SIZE - 10, 5, 3);
    ctx.fill();

    if (!isHead) return;

    const eyeOffsetX = direction === 'left' ? 7 : direction === 'right' ? GRID_SIZE - 10 : 8.5;
    const eyeOffsetY1 = direction === 'up' ? 7 : 8;
    const eyeOffsetY2 = direction === 'down' ? GRID_SIZE - 10 : GRID_SIZE - 12;
    const xEye = x + eyeOffsetX;

    ctx.fillStyle = palette.snake.eyes;
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

    ctx.fillStyle = palette.snake.pupil;
    ctx.beginPath();
    ctx.arc(xEye + pupilX, y + eyeOffsetY1 + pupilY, 0.9, 0, Math.PI * 2);
    ctx.arc(xEye + pupilX, y + eyeOffsetY2 + pupilY, 0.9, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawGame(ctx, game, renderState = {}) {
  const timeMs = renderState.timeMs ?? performance.now();
  const particles = renderState.particles ?? [];
  const palette = getCanvasPalette(renderState.theme);

  ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);
  drawBackground(ctx, palette);
  drawGrid(ctx, palette);
  drawFood(ctx, game.food, timeMs, palette);
  drawParticles(ctx, particles);
  drawSnake(ctx, game.snake, game.direction, game.status, timeMs, palette);

  if (game.status === 'gameover') {
    ctx.save();
    ctx.fillStyle = palette.gameOverTint;
    ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);
    ctx.restore();
  }
}

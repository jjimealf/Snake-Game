import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../style.css';

const BOARD_PX = 480;
const GRID_SIZE = 24;
const CELLS = BOARD_PX / GRID_SIZE;
const BASE_TICK_MS = 130;
const MIN_TICK_MS = 65;
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

const MUSIC_PATTERN = [
  { freq: 392.0, len: 1 },
  { freq: 523.25, len: 1 },
  { freq: 659.25, len: 1 },
  { freq: 523.25, len: 1 },
  { freq: 392.0, len: 1 },
  { freq: 329.63, len: 1 },
  { freq: 392.0, len: 1 },
  { freq: 0, len: 1 },
  { freq: 440.0, len: 1 },
  { freq: 587.33, len: 1 },
  { freq: 698.46, len: 1 },
  { freq: 587.33, len: 1 },
  { freq: 440.0, len: 1 },
  { freq: 349.23, len: 1 },
  { freq: 440.0, len: 1 },
  { freq: 0, len: 1 }
];

function readBestScore() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY) || 0);
  } catch {
    return 0;
  }
}

function persistBestScore(score) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // Ignore storage failures.
  }
}

function spawnFood(snake) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS)
    };
  } while (snake.some((part) => part.x === position.x && part.y === position.y));
  return position;
}

function createInitialGame(bestScore) {
  const mid = Math.floor(CELLS / 2);
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid }
  ];

  return {
    snake,
    food: spawnFood(snake),
    direction: 'right',
    queuedDirection: 'right',
    score: 0,
    bestScore,
    tickMs: BASE_TICK_MS,
    status: 'idle'
  };
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

function drawGame(ctx, game) {
  ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);
  drawGrid(ctx);
  drawFood(ctx, game.food);
  drawSnake(ctx, game.snake, game.direction, game.status);
}

function getOverlayCopy(status) {
  switch (status) {
    case 'paused':
      return {
        title: 'Pausado',
        text: 'Presiona Espacio o Iniciar para continuar.'
      };
    case 'gameover':
      return {
        title: 'Perdiste',
        text: 'Pulsa Reiniciar o Iniciar para jugar otra vez.'
      };
    case 'idle':
    default:
      return {
        title: 'Presiona Iniciar',
        text: 'Usa flechas o WASD. Espacio para pausar. Come manzanas y evita chocar.'
      };
  }
}

function SnakeGame() {
  const canvasRef = useRef(null);
  const gameTimerRef = useRef(null);
  const musicTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicStepRef = useRef(0);
  const musicEnabledRef = useRef(false);

  const [game, setGame] = useState(() => createInitialGame(readBestScore()));
  const [musicEnabled, setMusicEnabled] = useState(false);

  musicEnabledRef.current = musicEnabled;

  function clearGameLoop() {
    if (gameTimerRef.current !== null) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }

  function clearMusicLoop() {
    if (musicTimerRef.current !== null) {
      clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }

  function getAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  }

  function playTone(freq, duration = 0.1, type = 'square', volume = 0.02) {
    if (!musicEnabledRef.current) return;

    const ctx = getAudioContext();
    if (!ctx || !freq) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playMusicTick() {
    if (!musicEnabledRef.current) return;
    const note = MUSIC_PATTERN[musicStepRef.current % MUSIC_PATTERN.length];
    musicStepRef.current += 1;
    if (note.freq > 0) {
      playTone(note.freq, 0.14 * note.len, 'square', 0.012);
    }
  }

  function handleDirection(nextDirection) {
    setGame((prev) => {
      if (!DIRECTIONS[nextDirection]) return prev;
      if (
        OPPOSITES[prev.direction] === nextDirection ||
        OPPOSITES[prev.queuedDirection] === nextDirection
      ) {
        return prev;
      }

      const nextStatus = prev.status === 'idle' ? 'running' : prev.status;
      return {
        ...prev,
        queuedDirection: nextDirection,
        status: nextStatus
      };
    });
  }

  function startGame() {
    setGame((prev) => {
      if (prev.status === 'running') return prev;
      if (prev.status === 'gameover') {
        return {
          ...createInitialGame(prev.bestScore),
          status: 'running'
        };
      }
      return { ...prev, status: 'running' };
    });
  }

  function pauseGame() {
    setGame((prev) => (prev.status === 'running' ? { ...prev, status: 'paused' } : prev));
  }

  function resumeGame() {
    setGame((prev) => (prev.status === 'paused' ? { ...prev, status: 'running' } : prev));
  }

  function togglePause() {
    setGame((prev) => {
      if (prev.status === 'running') return { ...prev, status: 'paused' };
      if (prev.status === 'paused') return { ...prev, status: 'running' };
      return prev;
    });
  }

  function restartGame() {
    setGame((prev) => createInitialGame(prev.bestScore));
  }

  function stepGame() {
    setGame((prev) => {
      if (prev.status !== 'running') return prev;

      const direction = prev.queuedDirection;
      const head = prev.snake[0];
      const nextHead = {
        x: head.x + DIRECTIONS[direction].x,
        y: head.y + DIRECTIONS[direction].y
      };

      const hitsWall =
        nextHead.x < 0 ||
        nextHead.y < 0 ||
        nextHead.x >= CELLS ||
        nextHead.y >= CELLS;

      const grows = nextHead.x === prev.food.x && nextHead.y === prev.food.y;
      const bodyToCheck = grows ? prev.snake : prev.snake.slice(0, -1);
      const hitsSelf = bodyToCheck.some(
        (part) => part.x === nextHead.x && part.y === nextHead.y
      );

      if (hitsWall || hitsSelf) {
        const nextBest = Math.max(prev.bestScore, prev.score);
        if (nextBest !== prev.bestScore) {
          persistBestScore(nextBest);
        }
        playTone(180, 0.15, 'square', 0.03);
        setTimeout(() => playTone(130, 0.22, 'square', 0.03), 90);
        return {
          ...prev,
          bestScore: nextBest,
          status: 'gameover'
        };
      }

      const nextSnake = [nextHead, ...prev.snake];
      let nextScore = prev.score;
      let nextFood = prev.food;
      let nextTickMs = prev.tickMs;

      if (grows) {
        nextScore += 10;
        playTone(880, 0.06, 'triangle', 0.018);
        nextFood = spawnFood(nextSnake);
        nextTickMs = Math.max(MIN_TICK_MS, BASE_TICK_MS - Math.floor(nextScore / 30) * 5);
      } else {
        nextSnake.pop();
      }

      const nextBest = Math.max(prev.bestScore, nextScore);
      if (nextBest !== prev.bestScore) {
        persistBestScore(nextBest);
      }

      return {
        ...prev,
        snake: nextSnake,
        food: nextFood,
        direction,
        queuedDirection: direction,
        score: nextScore,
        bestScore: nextBest,
        tickMs: nextTickMs
      };
    });
  }

  function toggleMusic() {
    setMusicEnabled((prev) => {
      const next = !prev;
      if (next) {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
      return next;
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawGame(ctx, game);
  }, [game]);

  useEffect(() => {
    clearGameLoop();
    if (game.status !== 'running') return undefined;

    gameTimerRef.current = setInterval(stepGame, game.tickMs);
    return clearGameLoop;
  }, [game.status, game.tickMs]);

  useEffect(() => {
    clearMusicLoop();

    if (!(musicEnabled && game.status === 'running')) {
      return undefined;
    }

    const ctx = getAudioContext();
    if (!ctx) {
      setMusicEnabled(false);
      return undefined;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    playMusicTick();
    musicTimerRef.current = setInterval(playMusicTick, 170);
    return clearMusicLoop;
  }, [musicEnabled, game.status]);

  useEffect(() => {
    function onKeyDown(event) {
      const dir = keyToDirection(event.key);
      if (dir) {
        event.preventDefault();
        handleDirection(dir);
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        if (game.status === 'idle') {
          startGame();
        } else if (game.status === 'gameover') {
          startGame();
        } else {
          togglePause();
        }
        return;
      }

      if (event.key === 'Enter' && game.status !== 'running') {
        event.preventDefault();
        startGame();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [game.status]);

  useEffect(() => {
    return () => {
      clearGameLoop();
      clearMusicLoop();
    };
  }, []);

  const overlay = getOverlayCopy(game.status);
  const overlayHidden = game.status === 'running';
  const speedFactor = (BASE_TICK_MS / game.tickMs).toFixed(1).replace('.0', '');
  const audioSupported = Boolean(window.AudioContext || window.webkitAudioContext);
  const musicActive = musicEnabled && game.status === 'running';

  return (
    <main className="game-shell" aria-label="Juego de la serpiente">
      <div className="topbar">
        <h1 className="title">Snake</h1>
        <div className="stats" aria-live="polite">
          <div className="pill">
            Puntaje <strong>{game.score}</strong>
          </div>
          <div className="pill">
            Record <strong>{game.bestScore}</strong>
          </div>
          <div className="pill">
            Velocidad <strong>{speedFactor}x</strong>
          </div>
        </div>
      </div>

      <section className="board-wrap" aria-label="Tablero">
        <canvas ref={canvasRef} width={BOARD_PX} height={BOARD_PX}></canvas>
        <div className={`overlay${overlayHidden ? ' hidden' : ''}`}>
          <div className="overlay-card">
            <h2>{overlay.title}</h2>
            <p>{overlay.text}</p>
          </div>
        </div>
      </section>

      <div className="controls">
        <div className="buttons">
          <button
            type="button"
            onClick={() => {
              if (game.status === 'paused') {
                resumeGame();
              } else {
                startGame();
              }
            }}
          >
            Iniciar
          </button>
          <button type="button" className="secondary" onClick={togglePause}>
            Pausar
          </button>
          <button type="button" className="warn" onClick={restartGame}>
            Reiniciar
          </button>
          <button
            type="button"
            className="secondary"
            onClick={toggleMusic}
            disabled={!audioSupported}
          >
            {audioSupported
              ? `Musica: ${musicEnabled ? 'On' : 'Off'}${musicActive ? ' (playing)' : ''}`
              : 'Musica: N/D'}
          </button>
        </div>
        <div className="hint">Controles: Flechas / WASD / Espacio</div>
      </div>

      <div className="touch-pad" aria-label="Controles tactiles">
        <div className="touch-row">
          <button
            className="touch-btn secondary"
            type="button"
            aria-label="Arriba"
            onClick={() => handleDirection('up')}
            onTouchStart={(event) => {
              event.preventDefault();
              handleDirection('up');
            }}
          >
            &uarr;
          </button>
        </div>
        <div className="touch-row">
          <button
            className="touch-btn secondary"
            type="button"
            aria-label="Izquierda"
            onClick={() => handleDirection('left')}
            onTouchStart={(event) => {
              event.preventDefault();
              handleDirection('left');
            }}
          >
            &larr;
          </button>
          <button
            className="touch-btn secondary"
            type="button"
            aria-label="Abajo"
            onClick={() => handleDirection('down')}
            onTouchStart={(event) => {
              event.preventDefault();
              handleDirection('down');
            }}
          >
            &darr;
          </button>
          <button
            className="touch-btn secondary"
            type="button"
            aria-label="Derecha"
            onClick={() => handleDirection('right')}
            onTouchStart={(event) => {
              event.preventDefault();
              handleDirection('right');
            }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<SnakeGame />);

import { useEffect, useRef, useState } from 'react';
import { playMusicTick, playTone, resumeAudioContext } from '../lib/audio.js';
import {
  BASE_TICK_MS,
  BOARD_PX,
  CELLS,
  DIRECTIONS,
  MIN_TICK_MS,
  OPPOSITES,
  STORAGE_KEY
} from '../lib/constants.js';
import { drawGame } from '../lib/drawGame.js';

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

export function useSnakeGame() {
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

  function playFx(freq, duration, type, volume) {
    playTone({
      audioContextRef,
      musicEnabledRef,
      freq,
      duration,
      type,
      volume
    });
  }

  function playMusicStep() {
    playMusicTick({
      audioContextRef,
      musicEnabledRef,
      musicStepRef
    });
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

      return {
        ...prev,
        queuedDirection: nextDirection,
        status: prev.status === 'idle' ? 'running' : prev.status
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
        playFx(180, 0.15, 'square', 0.03);
        setTimeout(() => playFx(130, 0.22, 'square', 0.03), 90);
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
        playFx(880, 0.06, 'triangle', 0.018);
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
        resumeAudioContext(audioContextRef);
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

    const ctx = resumeAudioContext(audioContextRef);
    if (!ctx) {
      setMusicEnabled(false);
      return undefined;
    }

    playMusicStep();
    musicTimerRef.current = setInterval(playMusicStep, 170);
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
        if (game.status === 'idle' || game.status === 'gameover') {
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

  useEffect(
    () => () => {
      clearGameLoop();
      clearMusicLoop();
    },
    []
  );

  const overlay = getOverlayCopy(game.status);
  const overlayHidden = game.status === 'running';
  const speedFactor = (BASE_TICK_MS / game.tickMs).toFixed(1).replace('.0', '');
  const audioSupported =
    typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);
  const musicActive = musicEnabled && game.status === 'running';

  return {
    boardSize: BOARD_PX,
    game,
    canvasRef,
    overlay,
    overlayHidden,
    speedFactor,
    audioSupported,
    musicEnabled,
    musicActive,
    handleDirection,
    startGame,
    resumeGame,
    togglePause,
    restartGame,
    toggleMusic
  };
}

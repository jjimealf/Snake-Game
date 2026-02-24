import {
  BASE_TICK_MS,
  CELLS,
  DIRECTIONS,
  MIN_TICK_MS
} from './constants.js';

export function spawnFood(snake) {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS)
    };
  } while (snake.some((part) => part.x === position.x && part.y === position.y));

  return position;
}

export function createInitialGame(bestScore) {
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

function hitsWall(position) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= CELLS ||
    position.y >= CELLS
  );
}

function hitsSelf(nextHead, snake, grows) {
  const bodyToCheck = grows ? snake : snake.slice(0, -1);
  return bodyToCheck.some((part) => part.x === nextHead.x && part.y === nextHead.y);
}

export function stepGameState(prev) {
  if (prev.status !== 'running') {
    return {
      nextGame: prev,
      outcome: { changed: false }
    };
  }

  const direction = prev.queuedDirection;
  const head = prev.snake[0];
  const nextHead = {
    x: head.x + DIRECTIONS[direction].x,
    y: head.y + DIRECTIONS[direction].y
  };

  const grows = nextHead.x === prev.food.x && nextHead.y === prev.food.y;

  if (hitsWall(nextHead) || hitsSelf(nextHead, prev.snake, grows)) {
    const nextBest = Math.max(prev.bestScore, prev.score);

    return {
      nextGame: {
        ...prev,
        bestScore: nextBest,
        status: 'gameover'
      },
      outcome: {
        changed: true,
        gameOver: true,
        ateFood: false,
        bestScoreChanged: nextBest !== prev.bestScore
      }
    };
  }

  const nextSnake = [nextHead, ...prev.snake];
  let nextScore = prev.score;
  let nextFood = prev.food;
  let nextTickMs = prev.tickMs;

  if (grows) {
    nextScore += 10;
    nextFood = spawnFood(nextSnake);
    nextTickMs = Math.max(MIN_TICK_MS, BASE_TICK_MS - Math.floor(nextScore / 30) * 5);
  } else {
    nextSnake.pop();
  }

  const nextBest = Math.max(prev.bestScore, nextScore);

  return {
    nextGame: {
      ...prev,
      snake: nextSnake,
      food: nextFood,
      direction,
      queuedDirection: direction,
      score: nextScore,
      bestScore: nextBest,
      tickMs: nextTickMs
    },
    outcome: {
      changed: true,
      gameOver: false,
      ateFood: grows,
      bestScoreChanged: nextBest !== prev.bestScore
    }
  };
}

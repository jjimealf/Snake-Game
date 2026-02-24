export const BOARD_PX = 480;
export const GRID_SIZE = 24;
export const CELLS = BOARD_PX / GRID_SIZE;
export const BASE_TICK_MS = 130;
export const MIN_TICK_MS = 65;
export const STORAGE_KEY = 'snake-best-score';

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const OPPOSITES = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

export const MUSIC_PATTERN = [
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

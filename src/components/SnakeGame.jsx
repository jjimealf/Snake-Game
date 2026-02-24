import { useEffect, useState } from 'react';
import Controls from './Controls.jsx';
import GameCanvas from './GameCanvas.jsx';
import { useSnakeGame } from '../hooks/useSnakeGame.js';
import {
  getThemeCssVars,
  isValidTheme,
  THEME_OPTIONS,
  THEME_STORAGE_KEY
} from '../lib/themes.js';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && isValidTheme(saved)) return saved;
  } catch {
    // Ignore storage failures.
  }
  return 'retro';
}

export default function SnakeGame() {
  const [theme, setTheme] = useState(getInitialTheme);
  const {
    boardSize,
    game,
    canvasRef,
    overlay,
    overlayHidden,
    boardShaking,
    speedFactor,
    speedIntensity,
    audioSupported,
    musicEnabled,
    musicActive,
    handleDirection,
    startGame,
    resumeGame,
    togglePause,
    restartGame,
    toggleMusic
  } = useSnakeGame(theme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;

    const cssVars = getThemeCssVars(theme);
    for (const [name, value] of Object.entries(cssVars)) {
      root.style.setProperty(name, value);
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme]);

  return (
    <main
      className="game-shell"
      aria-label="Juego de la serpiente"
      data-theme={theme}
      style={{ '--speed-glow': speedIntensity.toFixed(3) }}
    >
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

      <GameCanvas
        canvasRef={canvasRef}
        boardSize={boardSize}
        overlayTitle={overlay.title}
        overlayText={overlay.text}
        overlayHidden={overlayHidden}
        boardShaking={boardShaking}
      />

      <Controls
        status={game.status}
        audioSupported={audioSupported}
        musicEnabled={musicEnabled}
        musicActive={musicActive}
        theme={theme}
        themeOptions={THEME_OPTIONS}
        onStart={startGame}
        onResume={resumeGame}
        onTogglePause={togglePause}
        onRestart={restartGame}
        onToggleMusic={toggleMusic}
        onDirection={handleDirection}
        onThemeChange={setTheme}
      />
    </main>
  );
}

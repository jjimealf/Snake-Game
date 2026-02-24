import Controls from './Controls.jsx';
import GameCanvas from './GameCanvas.jsx';
import { useSnakeGame } from '../hooks/useSnakeGame.js';

export default function SnakeGame() {
  const {
    boardSize,
    game,
    canvasRef,
    overlay,
    overlayHidden,
    boardShaking,
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
  } = useSnakeGame();

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
        onStart={startGame}
        onResume={resumeGame}
        onTogglePause={togglePause}
        onRestart={restartGame}
        onToggleMusic={toggleMusic}
        onDirection={handleDirection}
      />
    </main>
  );
}

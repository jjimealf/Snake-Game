export default function GameCanvas({
  canvasRef,
  boardSize,
  overlayTitle,
  overlayText,
  overlayHidden,
  boardShaking
}) {
  return (
    <section className={`board-wrap${boardShaking ? ' is-shaking' : ''}`} aria-label="Tablero">
      <canvas ref={canvasRef} width={boardSize} height={boardSize}></canvas>
      <div className={`overlay${overlayHidden ? ' hidden' : ''}`}>
        <div className="overlay-card">
          <h2>{overlayTitle}</h2>
          <p>{overlayText}</p>
        </div>
      </div>
    </section>
  );
}

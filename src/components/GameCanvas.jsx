export default function GameCanvas({
  canvasRef,
  boardSize,
  overlayTitle,
  overlayText,
  overlayHidden
}) {
  return (
    <section className="board-wrap" aria-label="Tablero">
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

function TouchButton({ label, ariaLabel, direction, onDirection }) {
  const handleTouchStart = (event) => {
    event.preventDefault();
    onDirection(direction);
  };

  return (
    <button
      className="touch-btn secondary"
      type="button"
      aria-label={ariaLabel}
      onClick={() => onDirection(direction)}
      onTouchStart={handleTouchStart}
    >
      {label}
    </button>
  );
}

export default function Controls({
  status,
  audioSupported,
  musicEnabled,
  musicActive,
  theme,
  themeOptions,
  onStart,
  onResume,
  onTogglePause,
  onRestart,
  onToggleMusic,
  onDirection,
  onThemeChange
}) {
  return (
    <>
      <div className="controls">
        <div className="buttons">
          <button
            type="button"
            onClick={() => {
              if (status === 'paused') {
                onResume();
              } else {
                onStart();
              }
            }}
          >
            Iniciar
          </button>
          <button type="button" className="secondary" onClick={onTogglePause}>
            Pausar
          </button>
          <button type="button" className="warn" onClick={onRestart}>
            Reiniciar
          </button>
          <button
            type="button"
            className="secondary"
            onClick={onToggleMusic}
            disabled={!audioSupported}
          >
            {audioSupported
              ? `Musica: ${musicEnabled ? 'On' : 'Off'}${musicActive ? ' (playing)' : ''}`
              : 'Musica: N/D'}
          </button>
        </div>
        <div className="controls-side">
          <label className="theme-picker">
            <span>Tema</span>
            <select
              className="theme-select"
              value={theme}
              onChange={(event) => onThemeChange(event.target.value)}
              aria-label="Seleccionar tema visual"
            >
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="hint">Controles: Flechas / WASD / Espacio</div>
        </div>
      </div>

      <div className="touch-pad" aria-label="Controles tactiles">
        <div className="touch-row">
          <TouchButton
            label={'\u2191'}
            ariaLabel="Arriba"
            direction="up"
            onDirection={onDirection}
          />
        </div>
        <div className="touch-row">
          <TouchButton
            label={'\u2190'}
            ariaLabel="Izquierda"
            direction="left"
            onDirection={onDirection}
          />
          <TouchButton
            label={'\u2193'}
            ariaLabel="Abajo"
            direction="down"
            onDirection={onDirection}
          />
          <TouchButton
            label={'\u2192'}
            ariaLabel="Derecha"
            direction="right"
            onDirection={onDirection}
          />
        </div>
      </div>
    </>
  );
}

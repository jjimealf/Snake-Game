# Snake Game (React + Vite)

Juego de la serpiente para navegador hecho con React, Vite y `canvas`.

Incluye:
- Controles con teclado (`flechas`, `WASD`, `espacio`)
- Controles táctiles
- Puntaje, récord local (`localStorage`) y aumento de velocidad
- Música/FX con Web Audio API
- Temas visuales (`Retro`, `Neon Blue`, `Matrix`)
- Efectos visuales (partículas, glow dinámico, shake al perder)

## Requisitos

- `Node.js` 18+ (recomendado)
- `npm`

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Luego abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Controles del juego

- `Flechas` o `WASD`: mover la serpiente
- `Espacio`: pausar/reanudar (o iniciar)
- `Enter`: iniciar
- Botones UI: iniciar, pausar, reiniciar, música

## Selector de temas

Puedes cambiar el tema visual desde el desplegable `Tema` en la interfaz.

El tema se guarda en `localStorage` para futuras sesiones.

## Arquitectura (resumen)

- `src/components/`
  - `SnakeGame.jsx`: composición principal UI
  - `GameCanvas.jsx`: canvas + overlay
  - `Controls.jsx`: botones, selector de tema y controles táctiles
- `src/hooks/`
  - `useSnakeGame.js`: estado del juego, timers, input, audio y render loop
- `src/lib/`
  - `gameLogic.js`: lógica pura (spawn, colisiones, step)
  - `drawGame.js`: render del canvas + partículas
  - `audio.js`: utilidades Web Audio API
  - `themes.js`: configuración unificada de temas (UI + canvas)
  - `constants.js`: constantes del juego

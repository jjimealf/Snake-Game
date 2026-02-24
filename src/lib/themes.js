export const THEME_STORAGE_KEY = 'snake-theme';

const THEMES = {
  retro: {
    label: 'Retro',
    uiVars: {
      '--bg-1': '#05060f',
      '--bg-2': '#111427',
      '--bg-3': '#08131b',
      '--panel': 'rgba(9, 12, 28, 0.86)',
      '--panel-edge': 'rgba(95, 130, 255, 0.22)',
      '--ink': '#eef3ff',
      '--muted': '#9cadcb',
      '--accent': '#15d48a',
      '--accent-2': '#ffb323',
      '--danger': '#ff4d6d',
      '--cyan': '#39d6ff',
      '--pink': '#ff5ee5',
      '--theme-option-bg': '#0a1020',
      '--theme-option-text': '#eef3ff'
    },
    canvas: {
      background: ['#050812', '#090f1f', '#04060d'],
      checkerA: 'rgba(255,255,255,0.012)',
      checkerB: 'rgba(57,214,255,0.01)',
      gridMajor: 'rgba(57,214,255,0.12)',
      gridMinor: 'rgba(255,255,255,0.04)',
      food: {
        halo: 'rgba(255,77,109,0.8)',
        haloFill: 'rgba(255,77,109,0.22)',
        coreGlow: 'rgba(255,77,109,0.65)',
        gradient: ['#ffd9e1', '#ff8ba3', '#ff4d6d', '#be1038'],
        stem: '#58f1ab',
        highlight: 'rgba(255,255,255,0.9)'
      },
      particles: {
        hues: [340, 180, 130]
      },
      snake: {
        flashGradient: ['#ff7088', '#6e132b'],
        headGradient: ['#78ffe2', '#27e3a2', '#0f6a4b'],
        bodyGradient: ['#41f3ba', '#14c98a', '#0a6c53'],
        flashGlow: 'rgba(255,77,109,0.5)',
        glow: 'rgba(21,212,138,0.35)',
        flashStroke: 'rgba(255,255,255,0.12)',
        stroke: 'rgba(225,255,246,0.18)',
        glossBase: '255,255,255',
        eyes: '#e8fbff',
        pupil: '#03140f'
      },
      gameOverTint: 'rgba(255, 77, 109, 0.08)'
    }
  },
  'neon-blue': {
    label: 'Neon Blue',
    uiVars: {
      '--bg-1': '#030814',
      '--bg-2': '#06172f',
      '--bg-3': '#031020',
      '--panel': 'rgba(7, 14, 35, 0.86)',
      '--panel-edge': 'rgba(76, 171, 255, 0.28)',
      '--ink': '#e9f6ff',
      '--muted': '#a1bfd7',
      '--accent': '#39d6ff',
      '--accent-2': '#7aa7ff',
      '--danger': '#ff5678',
      '--cyan': '#60e3ff',
      '--pink': '#9d8bff',
      '--theme-option-bg': '#071427',
      '--theme-option-text': '#e9f6ff'
    },
    canvas: {
      background: ['#030913', '#071a33', '#031020'],
      checkerA: 'rgba(255,255,255,0.01)',
      checkerB: 'rgba(96,227,255,0.018)',
      gridMajor: 'rgba(96,227,255,0.16)',
      gridMinor: 'rgba(170,225,255,0.05)',
      food: {
        halo: 'rgba(122,167,255,0.8)',
        haloFill: 'rgba(122,167,255,0.2)',
        coreGlow: 'rgba(122,167,255,0.7)',
        gradient: ['#eef4ff', '#b7ceff', '#7aa7ff', '#3457cc'],
        stem: '#60e3ff',
        highlight: 'rgba(255,255,255,0.95)'
      },
      particles: {
        hues: [185, 205, 235]
      },
      snake: {
        flashGradient: ['#ff86aa', '#7d234d'],
        headGradient: ['#d8fbff', '#67e7ff', '#165e9e'],
        bodyGradient: ['#8de8ff', '#39cfff', '#146ca8'],
        flashGlow: 'rgba(255,86,120,0.45)',
        glow: 'rgba(57,214,255,0.38)',
        flashStroke: 'rgba(255,255,255,0.14)',
        stroke: 'rgba(228,247,255,0.2)',
        glossBase: '255,255,255',
        eyes: '#f1fbff',
        pupil: '#02162b'
      },
      gameOverTint: 'rgba(122, 167, 255, 0.06)'
    }
  },
  matrix: {
    label: 'Matrix',
    uiVars: {
      '--bg-1': '#020604',
      '--bg-2': '#06110a',
      '--bg-3': '#010403',
      '--panel': 'rgba(5, 13, 8, 0.88)',
      '--panel-edge': 'rgba(61, 255, 132, 0.2)',
      '--ink': '#d5ffe4',
      '--muted': '#7fb497',
      '--accent': '#29ea79',
      '--accent-2': '#6dff9f',
      '--danger': '#ff5b72',
      '--cyan': '#57ffb8',
      '--pink': '#36f28f',
      '--theme-option-bg': '#06110a',
      '--theme-option-text': '#d5ffe4'
    },
    canvas: {
      background: ['#010402', '#051109', '#010603'],
      checkerA: 'rgba(255,255,255,0.006)',
      checkerB: 'rgba(61,255,132,0.014)',
      gridMajor: 'rgba(61,255,132,0.14)',
      gridMinor: 'rgba(170,255,205,0.035)',
      food: {
        halo: 'rgba(255,91,114,0.75)',
        haloFill: 'rgba(255,91,114,0.18)',
        coreGlow: 'rgba(255,91,114,0.55)',
        gradient: ['#ffe8ec', '#ff9eb0', '#ff5b72', '#a81834'],
        stem: '#86ffc1',
        highlight: 'rgba(245,255,248,0.88)'
      },
      particles: {
        hues: [115, 132, 150]
      },
      snake: {
        flashGradient: ['#ff7c95', '#661827'],
        headGradient: ['#ccffd9', '#58ff9f', '#0a6b36'],
        bodyGradient: ['#90ffbb', '#2ee977', '#0c6d3c'],
        flashGlow: 'rgba(255,91,114,0.42)',
        glow: 'rgba(41,234,121,0.34)',
        flashStroke: 'rgba(255,255,255,0.12)',
        stroke: 'rgba(225,255,234,0.14)',
        glossBase: '220,255,232',
        eyes: '#f1fff6',
        pupil: '#03150a'
      },
      gameOverTint: 'rgba(255, 91, 114, 0.05)'
    }
  }
};

export const THEME_OPTIONS = Object.entries(THEMES).map(([value, config]) => ({
  value,
  label: config.label
}));

export function isValidTheme(value) {
  return value in THEMES;
}

export function getThemeConfig(value = 'retro') {
  return THEMES[value] || THEMES.retro;
}

export function getThemeCssVars(value = 'retro') {
  return getThemeConfig(value).uiVars;
}

export function getCanvasPalette(value = 'retro') {
  return getThemeConfig(value).canvas;
}

export const FONTS = {
  typewriter: 'CourierPrime_700Bold',
};

export const COLORS = {
  background: '#0f0f12',
  headerBg: '#1a1a22',

  correct: '#2d9f93',    // teal - distinct from Wordle green
  present: '#d4845e',    // terracotta - distinct from Wordle yellow
  absent: '#4a4258',     // charcoal purple - distinct from Wordle gray

  keyBg: '#6b6b7b',
  keyText: '#ffffff',

  cellBorder: '#4a4258',
  cellBorderActive: '#7a7a8e',

  text: '#ffffff',
  textSecondary: '#8888a0',

  modalBg: '#1a1a22',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const GAME_CONFIG = {
  MAX_ATTEMPTS: 10,
  STORAGE_KEYS: {
    STATS: '@aballer/stats',
    TODAY_GAME: '@aballer/todayGame',
    ALLTIME_STATS: '@aballer/alltime/stats',
    ALLTIME_TODAY_GAME: '@aballer/alltime/todayGame',
    AD_WATCHED_TODAY: '@aballer/adWatchedToday',
    ALLTIME_AD_WATCHED_TODAY: '@aballer/alltime/adWatchedToday',
  },
};

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export const SPACE_KEY = ' ';

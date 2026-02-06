import { create } from 'zustand';
import {
  Player,
  GameStatus,
  GameMode,
  GuessResult,
  StatsData,
  LetterStatus,
} from '../types';
import {
  createGuessResult,
  isCorrectGuess,
  getKeyboardStatuses,
  isValidCharacter,
} from '../utils/gameLogic';
import { getDailyPlayer, getTodayDateString } from '../utils/dailyPlayer';
import {
  getStats,
  getTodayGame,
  saveTodayGame,
  updateStatsOnWin,
  updateStatsOnLoss,
  clearTodayGame,
  hasWatchedAdToday,
  setAdWatchedToday,
} from '../utils/storage';
import { GAME_CONFIG } from '../constants';
import playersData from '../data/players.json';

interface GameStore {
  // Game mode
  gameMode: GameMode;

  // Current mode state
  guesses: GuessResult[];
  currentGuess: string;
  gameStatus: GameStatus;
  targetPlayer: Player | null;
  targetName: string;
  stats: StatsData;
  isLoading: boolean;
  keyboardStatuses: Map<string, LetterStatus>;
  adWatchedToday: boolean;

  // All-time mode state
  alltimeGuesses: GuessResult[];
  alltimeCurrentGuess: string;
  alltimeGameStatus: GameStatus;
  alltimeTargetPlayer: Player | null;
  alltimeTargetName: string;
  alltimeStats: StatsData;
  alltimeKeyboardStatuses: Map<string, LetterStatus>;
  alltimeAdWatchedToday: boolean;

  initGame: () => Promise<void>;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => Promise<void>;
  refreshStats: () => Promise<void>;
  resetGame: () => Promise<void>;
  switchMode: (mode: GameMode) => void;
  grantExtraAttempt: () => Promise<void>;
  confirmLoss: () => Promise<void>;

  // Active mode getters
  activeGuesses: () => GuessResult[];
  activeCurrentGuess: () => string;
  activeGameStatus: () => GameStatus;
  activeTargetName: () => string;
  activeStats: () => StatsData;
  activeKeyboardStatuses: () => Map<string, LetterStatus>;
  activeAdWatchedToday: () => boolean;
}

const defaultStats: StatsData = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
};

const useGameStore = create<GameStore>((set, get) => ({
  gameMode: 'modern',

  // Modern mode state
  guesses: [],
  currentGuess: '',
  gameStatus: 'playing',
  targetPlayer: null,
  targetName: '',
  stats: { ...defaultStats },
  isLoading: true,
  keyboardStatuses: new Map(),
  adWatchedToday: false,

  // All-time mode state
  alltimeGuesses: [],
  alltimeCurrentGuess: '',
  alltimeGameStatus: 'playing',
  alltimeTargetPlayer: null,
  alltimeTargetName: '',
  alltimeStats: { ...defaultStats },
  alltimeKeyboardStatuses: new Map(),
  alltimeAdWatchedToday: false,

  // Active mode getters
  activeGuesses: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeGuesses : state.guesses;
  },
  activeCurrentGuess: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeCurrentGuess : state.currentGuess;
  },
  activeGameStatus: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeGameStatus : state.gameStatus;
  },
  activeTargetName: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeTargetName : state.targetName;
  },
  activeStats: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeStats : state.stats;
  },
  activeKeyboardStatuses: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeKeyboardStatuses : state.keyboardStatuses;
  },
  activeAdWatchedToday: () => {
    const state = get();
    return state.gameMode === 'all-time' ? state.alltimeAdWatchedToday : state.adWatchedToday;
  },

  initGame: async () => {
    set({ isLoading: true });

    try {
      const allPlayers = playersData.players as Player[];
      const modernPlayers = allPlayers.filter(p => p.era !== 'all-time');
      const alltimePlayers = allPlayers.filter(p => p.era === 'all-time');

      const todayDate = getTodayDateString();

      // Load both modes in parallel
      const [modernStats, modernTodayGame, alltimeStats, alltimeTodayGame, modernAdWatched, alltimeAdWatched] = await Promise.all([
        getStats('modern'),
        getTodayGame('modern'),
        getStats('all-time'),
        getTodayGame('all-time'),
        hasWatchedAdToday('modern', todayDate),
        hasWatchedAdToday('all-time', todayDate),
      ]);

      const modernDailyPlayer = getDailyPlayer(modernPlayers, todayDate);
      const alltimeDailyPlayer = alltimePlayers.length > 0
        ? getDailyPlayer(alltimePlayers, todayDate)
        : null;

      // Modern mode state
      let modernState: any;
      let modernStatsToUse = modernStats;
      if (modernTodayGame && modernTodayGame.date === todayDate) {
        const kbStatuses = getKeyboardStatuses(modernTodayGame.guesses);

        // If game was lost but loss not yet recorded (user closed app before confirming)
        // and user can't watch ad anymore, record the loss now
        if (
          modernTodayGame.gameStatus === 'lost' &&
          modernStats.lastPlayedDate !== todayDate &&
          modernAdWatched // User already used their ad chance
        ) {
          modernStatsToUse = await updateStatsOnLoss(todayDate, 'modern');
        }

        modernState = {
          guesses: modernTodayGame.guesses,
          currentGuess: '',
          gameStatus: modernTodayGame.gameStatus,
          targetPlayer: modernDailyPlayer,
          targetName: modernDailyPlayer.name.toUpperCase(),
          stats: modernStatsToUse,
          keyboardStatuses: kbStatuses,
          adWatchedToday: modernAdWatched,
        };
      } else {
        await clearTodayGame('modern');
        modernState = {
          guesses: [],
          currentGuess: '',
          gameStatus: 'playing' as GameStatus,
          targetPlayer: modernDailyPlayer,
          targetName: modernDailyPlayer.name.toUpperCase(),
          stats: modernStats,
          keyboardStatuses: new Map(),
          adWatchedToday: false,
        };
      }

      // All-time mode state
      let alltimeState: any;
      let alltimeStatsToUse = alltimeStats;
      if (alltimeDailyPlayer) {
        if (alltimeTodayGame && alltimeTodayGame.date === todayDate) {
          const kbStatuses = getKeyboardStatuses(alltimeTodayGame.guesses);

          // If game was lost but loss not yet recorded (user closed app before confirming)
          // and user can't watch ad anymore, record the loss now
          if (
            alltimeTodayGame.gameStatus === 'lost' &&
            alltimeStats.lastPlayedDate !== todayDate &&
            alltimeAdWatched // User already used their ad chance
          ) {
            alltimeStatsToUse = await updateStatsOnLoss(todayDate, 'all-time');
          }

          alltimeState = {
            alltimeGuesses: alltimeTodayGame.guesses,
            alltimeCurrentGuess: '',
            alltimeGameStatus: alltimeTodayGame.gameStatus,
            alltimeTargetPlayer: alltimeDailyPlayer,
            alltimeTargetName: alltimeDailyPlayer.name.toUpperCase(),
            alltimeStats: alltimeStatsToUse,
            alltimeKeyboardStatuses: kbStatuses,
            alltimeAdWatchedToday: alltimeAdWatched,
          };
        } else {
          await clearTodayGame('all-time');
          alltimeState = {
            alltimeGuesses: [],
            alltimeCurrentGuess: '',
            alltimeGameStatus: 'playing' as GameStatus,
            alltimeTargetPlayer: alltimeDailyPlayer,
            alltimeTargetName: alltimeDailyPlayer.name.toUpperCase(),
            alltimeStats: alltimeStats,
            alltimeKeyboardStatuses: new Map(),
            alltimeAdWatchedToday: false,
          };
        }
      } else {
        alltimeState = {
          alltimeGuesses: [],
          alltimeCurrentGuess: '',
          alltimeGameStatus: 'playing' as GameStatus,
          alltimeTargetPlayer: null,
          alltimeTargetName: '',
          alltimeStats: alltimeStats,
          alltimeKeyboardStatuses: new Map(),
          alltimeAdWatchedToday: false,
        };
      }

      set({
        ...modernState,
        ...alltimeState,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing game:', error);
      set({ isLoading: false });
    }
  },

  switchMode: (mode: GameMode) => {
    set({ gameMode: mode });
  },

  addLetter: (letter: string) => {
    const state = get();
    const isAlltime = state.gameMode === 'all-time';

    const currentGuess = isAlltime ? state.alltimeCurrentGuess : state.currentGuess;
    const targetName = isAlltime ? state.alltimeTargetName : state.targetName;
    const gameStatus = isAlltime ? state.alltimeGameStatus : state.gameStatus;

    if (gameStatus !== 'playing') return;
    if (!isValidCharacter(letter)) return;

    let newGuess = currentGuess;

    // First, add any spaces that should come at the current position
    while (newGuess.length < targetName.length && targetName[newGuess.length] === ' ') {
      newGuess += ' ';
    }

    // Check if we can still add a letter after adding spaces
    if (newGuess.length >= targetName.length) return;

    // Add the letter
    newGuess += letter.toUpperCase();

    // Add any spaces that come immediately after this letter
    while (newGuess.length < targetName.length && targetName[newGuess.length] === ' ') {
      newGuess += ' ';
    }

    if (isAlltime) {
      set({ alltimeCurrentGuess: newGuess });
    } else {
      set({ currentGuess: newGuess });
    }
  },

  removeLetter: () => {
    const state = get();
    const isAlltime = state.gameMode === 'all-time';

    const currentGuess = isAlltime ? state.alltimeCurrentGuess : state.currentGuess;
    const gameStatus = isAlltime ? state.alltimeGameStatus : state.gameStatus;

    if (gameStatus !== 'playing') return;
    if (currentGuess.length === 0) return;

    let newGuess = currentGuess.slice(0, -1);

    while (newGuess.length > 0 && newGuess[newGuess.length - 1] === ' ') {
      newGuess = newGuess.slice(0, -1);
    }

    if (isAlltime) {
      set({ alltimeCurrentGuess: newGuess });
    } else {
      set({ currentGuess: newGuess });
    }
  },

  submitGuess: async () => {
    const state = get();
    const isAlltime = state.gameMode === 'all-time';

    const currentGuess = isAlltime ? state.alltimeCurrentGuess : state.currentGuess;
    const targetName = isAlltime ? state.alltimeTargetName : state.targetName;
    const guesses = isAlltime ? state.alltimeGuesses : state.guesses;
    const gameStatus = isAlltime ? state.alltimeGameStatus : state.gameStatus;
    const targetPlayer = isAlltime ? state.alltimeTargetPlayer : state.targetPlayer;

    if (gameStatus !== 'playing') return;
    if (currentGuess.length !== targetName.length) return;

    const guessResult = createGuessResult(currentGuess, targetName);
    const newGuesses = [...guesses, guessResult];
    const isWin = isCorrectGuess(guessResult.results);
    const isLoss = !isWin && newGuesses.length >= GAME_CONFIG.MAX_ATTEMPTS;

    const newGameStatus: GameStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';
    const keyboardStatuses = getKeyboardStatuses(newGuesses);

    if (isAlltime) {
      set({
        alltimeGuesses: newGuesses,
        alltimeCurrentGuess: '',
        alltimeGameStatus: newGameStatus,
        alltimeKeyboardStatuses: keyboardStatuses,
      });
    } else {
      set({
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus,
        keyboardStatuses,
      });
    }

    const todayDate = getTodayDateString();
    const mode = isAlltime ? 'all-time' : 'modern';

    await saveTodayGame({
      date: todayDate,
      guesses: newGuesses,
      gameStatus: newGameStatus,
      targetPlayerId: targetPlayer?.id ?? 0,
    }, mode);

    if (isWin) {
      const newStats = await updateStatsOnWin(newGuesses.length, todayDate, mode);
      if (isAlltime) {
        set({ alltimeStats: newStats });
      } else {
        set({ stats: newStats });
      }
    } else if (isLoss) {
      // Check if user can watch ad for extra attempt
      const adWatchedToday = isAlltime ? state.alltimeAdWatchedToday : state.adWatchedToday;
      const canWatchAd = !adWatchedToday && newGuesses.length === 10;

      // Only record loss immediately if user can't watch ad
      // Otherwise, wait for user to confirm they won't watch ad
      if (!canWatchAd) {
        const newStats = await updateStatsOnLoss(todayDate, mode);
        if (isAlltime) {
          set({ alltimeStats: newStats });
        } else {
          set({ stats: newStats });
        }
      }
    }
  },

  refreshStats: async () => {
    const [modernStats, alltimeStats] = await Promise.all([
      getStats('modern'),
      getStats('all-time'),
    ]);
    set({ stats: modernStats, alltimeStats });
  },

  resetGame: async () => {
    const { gameMode } = get();
    await clearTodayGame(gameMode);

    if (gameMode === 'all-time') {
      set({
        alltimeGuesses: [],
        alltimeCurrentGuess: '',
        alltimeGameStatus: 'playing',
        alltimeKeyboardStatuses: new Map(),
      });
    } else {
      set({
        guesses: [],
        currentGuess: '',
        gameStatus: 'playing',
        keyboardStatuses: new Map(),
      });
    }
  },

  grantExtraAttempt: async () => {
    const state = get();
    const isAlltime = state.gameMode === 'all-time';
    const gameStatus = isAlltime ? state.alltimeGameStatus : state.gameStatus;

    // Only allow if game was lost
    if (gameStatus !== 'lost') return;

    const todayDate = getTodayDateString();
    const mode = isAlltime ? 'all-time' : 'modern';

    // Mark ad as watched for today
    await setAdWatchedToday(mode, todayDate);

    // Get current guesses and remove the last (failed) guess
    const guesses = isAlltime ? state.alltimeGuesses : state.guesses;
    const newGuesses = guesses.slice(0, -1);
    const keyboardStatuses = getKeyboardStatuses(newGuesses);

    const targetPlayer = isAlltime ? state.alltimeTargetPlayer : state.targetPlayer;

    // Save updated game state
    await saveTodayGame({
      date: todayDate,
      guesses: newGuesses,
      gameStatus: 'playing',
      targetPlayerId: targetPlayer?.id ?? 0,
    }, mode);

    if (isAlltime) {
      set({
        alltimeGuesses: newGuesses,
        alltimeCurrentGuess: '',
        alltimeGameStatus: 'playing',
        alltimeKeyboardStatuses: keyboardStatuses,
        alltimeAdWatchedToday: true,
      });
    } else {
      set({
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: 'playing',
        keyboardStatuses,
        adWatchedToday: true,
      });
    }
  },

  confirmLoss: async () => {
    const state = get();
    const isAlltime = state.gameMode === 'all-time';
    const gameStatus = isAlltime ? state.alltimeGameStatus : state.gameStatus;

    // Only confirm if game is actually lost
    if (gameStatus !== 'lost') return;

    const todayDate = getTodayDateString();
    const mode = isAlltime ? 'all-time' : 'modern';

    // Check if loss was already recorded (lastPlayedDate === today)
    const stats = isAlltime ? state.alltimeStats : state.stats;
    if (stats.lastPlayedDate === todayDate) {
      // Loss already recorded, nothing to do
      return;
    }

    // Record the loss
    const newStats = await updateStatsOnLoss(todayDate, mode);
    if (isAlltime) {
      set({ alltimeStats: newStats });
    } else {
      set({ stats: newStats });
    }
  },
}));

export default useGameStore;

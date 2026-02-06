import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatsData, TodayGameState, GameMode } from '../types';
import { GAME_CONFIG } from '../constants';

const DEFAULT_STATS: StatsData = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
};

function getStorageKeys(mode: GameMode) {
  if (mode === 'all-time') {
    return {
      stats: GAME_CONFIG.STORAGE_KEYS.ALLTIME_STATS,
      todayGame: GAME_CONFIG.STORAGE_KEYS.ALLTIME_TODAY_GAME,
    };
  }
  return {
    stats: GAME_CONFIG.STORAGE_KEYS.STATS,
    todayGame: GAME_CONFIG.STORAGE_KEYS.TODAY_GAME,
  };
}

export async function getStats(mode: GameMode = 'modern'): Promise<StatsData> {
  try {
    const keys = getStorageKeys(mode);
    const data = await AsyncStorage.getItem(keys.stats);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Error loading stats:', error);
    return DEFAULT_STATS;
  }
}

export async function saveStats(stats: StatsData, mode: GameMode = 'modern'): Promise<void> {
  try {
    const keys = getStorageKeys(mode);
    await AsyncStorage.setItem(keys.stats, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

export async function getTodayGame(mode: GameMode = 'modern'): Promise<TodayGameState | null> {
  try {
    const keys = getStorageKeys(mode);
    const data = await AsyncStorage.getItem(keys.todayGame);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading today game:', error);
    return null;
  }
}

export async function saveTodayGame(gameState: TodayGameState, mode: GameMode = 'modern'): Promise<void> {
  try {
    const keys = getStorageKeys(mode);
    await AsyncStorage.setItem(keys.todayGame, JSON.stringify(gameState));
  } catch (error) {
    console.error('Error saving today game:', error);
  }
}

export async function clearTodayGame(mode: GameMode = 'modern'): Promise<void> {
  try {
    const keys = getStorageKeys(mode);
    await AsyncStorage.removeItem(keys.todayGame);
  } catch (error) {
    console.error('Error clearing today game:', error);
  }
}

export function calculateAverageGuesses(stats: StatsData): number {
  if (stats.gamesWon === 0) return 0;

  let totalGuesses = 0;
  for (let i = 0; i < stats.guessDistribution.length; i++) {
    totalGuesses += stats.guessDistribution[i] * (i + 1);
  }

  return Number((totalGuesses / stats.gamesWon).toFixed(1));
}

export function calculateWinPercentage(stats: StatsData): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
}

export async function updateStatsOnWin(
  attemptNumber: number,
  todayDate: string,
  mode: GameMode = 'modern'
): Promise<StatsData> {
  const stats = await getStats(mode);

  const isConsecutiveDay =
    stats.lastPlayedDate === null ||
    isNextDay(stats.lastPlayedDate, todayDate);

  const newStats: StatsData = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: isConsecutiveDay ? stats.currentStreak + 1 : 1,
    maxStreak: Math.max(
      stats.maxStreak,
      isConsecutiveDay ? stats.currentStreak + 1 : 1
    ),
    guessDistribution: [...stats.guessDistribution],
    lastPlayedDate: todayDate,
  };

  newStats.guessDistribution[attemptNumber - 1]++;

  await saveStats(newStats, mode);
  return newStats;
}

export async function updateStatsOnLoss(todayDate: string, mode: GameMode = 'modern'): Promise<StatsData> {
  const stats = await getStats(mode);

  const newStats: StatsData = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon,
    currentStreak: 0,
    maxStreak: stats.maxStreak,
    guessDistribution: [...stats.guessDistribution],
    lastPlayedDate: todayDate,
  };

  await saveStats(newStats, mode);
  return newStats;
}

function isNextDay(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate);
  const current = new Date(currentDate);

  last.setDate(last.getDate() + 1);

  return (
    last.getFullYear() === current.getFullYear() &&
    last.getMonth() === current.getMonth() &&
    last.getDate() === current.getDate()
  );
}

// Ad tracking functions
interface AdWatchedState {
  date: string;
  watched: boolean;
}

function getAdStorageKey(mode: GameMode): string {
  return mode === 'all-time'
    ? GAME_CONFIG.STORAGE_KEYS.ALLTIME_AD_WATCHED_TODAY
    : GAME_CONFIG.STORAGE_KEYS.AD_WATCHED_TODAY;
}

export async function hasWatchedAdToday(mode: GameMode, todayDate: string): Promise<boolean> {
  try {
    const key = getAdStorageKey(mode);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const state: AdWatchedState = JSON.parse(data);
      return state.date === todayDate && state.watched;
    }
    return false;
  } catch (error) {
    console.error('Error checking ad watched status:', error);
    return false;
  }
}

export async function setAdWatchedToday(mode: GameMode, todayDate: string): Promise<void> {
  try {
    const key = getAdStorageKey(mode);
    const state: AdWatchedState = {
      date: todayDate,
      watched: true,
    };
    await AsyncStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving ad watched status:', error);
  }
}

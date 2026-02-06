export interface Player {
  id: number;
  name: string;
  era: 'modern' | 'all-time';
}

export type GameMode = 'modern' | 'all-time';

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GuessResult {
  guess: string;
  results: LetterResult[];
}

export interface GameState {
  guesses: GuessResult[];
  currentGuess: string;
  gameStatus: GameStatus;
  targetPlayer: Player | null;
  targetName: string;
}

export interface StatsData {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastPlayedDate: string | null;
}

export interface TodayGameState {
  date: string;
  guesses: GuessResult[];
  gameStatus: GameStatus;
  targetPlayerId: number;
}

export interface KeyboardKey {
  key: string;
  status: LetterStatus;
  isWide?: boolean;
}

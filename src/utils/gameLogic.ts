import { LetterResult, LetterStatus, GuessResult } from '../types';

export function compareGuess(guess: string, target: string): LetterResult[] {
  const guessUpper = guess.toUpperCase();
  const targetUpper = target.toUpperCase();

  if (guessUpper.length !== targetUpper.length) {
    throw new Error('Guess and target must have the same length');
  }

  const results: LetterResult[] = [];
  const targetLetterCounts: Map<string, number> = new Map();

  for (const char of targetUpper) {
    targetLetterCounts.set(char, (targetLetterCounts.get(char) || 0) + 1);
  }

  for (let i = 0; i < guessUpper.length; i++) {
    const guessChar = guessUpper[i];
    const targetChar = targetUpper[i];

    if (guessChar === targetChar) {
      results.push({ letter: guess[i], status: 'correct' });
      targetLetterCounts.set(guessChar, targetLetterCounts.get(guessChar)! - 1);
    } else {
      results.push({ letter: guess[i], status: 'absent' });
    }
  }

  for (let i = 0; i < guessUpper.length; i++) {
    if (results[i].status === 'absent') {
      const guessChar = guessUpper[i];
      const remainingCount = targetLetterCounts.get(guessChar) || 0;

      if (remainingCount > 0) {
        results[i].status = 'present';
        targetLetterCounts.set(guessChar, remainingCount - 1);
      }
    }
  }

  return results;
}

export function createGuessResult(guess: string, target: string): GuessResult {
  return {
    guess,
    results: compareGuess(guess, target),
  };
}

export function isCorrectGuess(results: LetterResult[]): boolean {
  return results.every((r) => r.status === 'correct');
}

export function getKeyboardStatuses(
  guesses: GuessResult[]
): Map<string, LetterStatus> {
  const statuses = new Map<string, LetterStatus>();

  for (const guessResult of guesses) {
    for (const { letter, status } of guessResult.results) {
      const upperLetter = letter.toUpperCase();
      const currentStatus = statuses.get(upperLetter);

      if (currentStatus === 'correct') {
        continue;
      }

      if (status === 'correct') {
        statuses.set(upperLetter, 'correct');
      } else if (status === 'present') {
        statuses.set(upperLetter, 'present');
      } else if (!currentStatus) {
        statuses.set(upperLetter, status);
      }
    }
  }

  return statuses;
}

export function validateGuessLength(guess: string, targetLength: number): boolean {
  return guess.length === targetLength;
}

export function isValidCharacter(char: string): boolean {
  return /^[A-Za-z ]$/.test(char);
}

export function normalizePlayerName(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

import { Player } from '../types';

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Seeded random number generator (Mulberry32)
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with seed
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Get day of year (1-366)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Günlük futbolcu seçimi
 *
 * Algoritma:
 * 1. Tüm futbolcular yıl bazlı seed ile karıştırılır (Fisher-Yates)
 * 2. Yılın günü (1-366) index olarak kullanılır
 * 3. Her yıl 1 Ocak'ta yeni shuffle → tüm futbolcular havuza döner
 *
 * Garanti:
 * - Futbolcu sayısı >= 366 ise → takvim yılı içinde tekrar YOK
 * - Aynı gün, tüm kullanıcılar aynı futbolcuyu görür
 * - Liste büyüdükçe algoritma aynı şekilde çalışmaya devam eder
 */
export function getDailyPlayer(players: Player[], dateString?: string): Player {
  const date = dateString ? new Date(dateString) : new Date();
  const year = date.getFullYear();
  const dayOfYear = getDayOfYear(date);

  // Yılın başında tüm futbolcuları karıştır (yıl = seed)
  // Bu karıştırma tüm yıl boyunca sabit kalır
  const shuffledPlayers = shuffleWithSeed(players, year);

  // Yılın günü = index (0'dan başlıyor)
  // Eğer gün sayısı > futbolcu sayısı ise döngüye girer (olmamalı)
  const index = (dayOfYear - 1) % shuffledPlayers.length;

  return shuffledPlayers[index];
}

export function getDailySeed(dateString?: string): number {
  const date = dateString ? new Date(dateString) : new Date();
  return date.getFullYear() * 1000 + getDayOfYear(date);
}

export function isNewDay(lastPlayedDate: string | null): boolean {
  if (!lastPlayedDate) return true;
  return lastPlayedDate !== getTodayDateString();
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

export function formatTimeUntilMidnight(): string {
  const { hours, minutes, seconds } = getTimeUntilMidnight();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

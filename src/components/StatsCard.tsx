import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants';
import { StatsData } from '../types';
import { calculateAverageGuesses, calculateWinPercentage } from '../utils/storage';

interface StatsCardProps {
  stats: StatsData;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const winPercentage = calculateWinPercentage(stats);
  const averageGuesses = calculateAverageGuesses(stats);
  const maxDistribution = Math.max(...stats.guessDistribution, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
          <Text style={styles.statLabel}>Played</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{winPercentage}</Text>
          <Text style={styles.statLabel}>Win %</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Current{'\n'}Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.maxStreak}</Text>
          <Text style={styles.statLabel}>Max{'\n'}Streak</Text>
        </View>
      </View>

      {stats.gamesWon > 0 && (
        <View style={styles.averageContainer}>
          <Text style={styles.averageLabel}>Average guesses to win:</Text>
          <Text style={styles.averageValue}>{averageGuesses}</Text>
        </View>
      )}

      <Text style={styles.distributionTitle}>Guess Distribution</Text>

      <View style={styles.distribution}>
        {stats.guessDistribution.map((count, index) => (
          <View key={index} style={styles.distributionRow}>
            <Text style={styles.distributionLabel}>{index + 1}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${Math.max((count / maxDistribution) * 100, 8)}%`,
                    backgroundColor:
                      count > 0 ? COLORS.correct : COLORS.absent,
                  },
                ]}
              >
                <Text style={styles.barValue}>{count}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.headerBg,
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  averageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  averageLabel: {
    fontSize: 12,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  averageValue: {
    fontSize: 20,
    fontFamily: FONTS.typewriter,
    color: COLORS.correct,
  },
  distributionTitle: {
    fontSize: 14,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    marginBottom: 12,
  },
  distribution: {
    marginTop: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  distributionLabel: {
    width: 20,
    fontSize: 13,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    textAlign: 'right',
    marginRight: 8,
  },
  barContainer: {
    flex: 1,
  },
  bar: {
    minWidth: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  barValue: {
    fontSize: 11,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
  },
});

export default StatsCard;

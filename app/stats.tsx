import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import useGameStore from '../src/store/gameStore';
import { StatsCard } from '../src/components';
import { COLORS, FONTS } from '../src/constants';

export default function StatsScreen() {
  const { refreshStats, gameMode } = useGameStore();
  const activeStats = useGameStore(s => s.activeStats());
  const router = useRouter();

  useEffect(() => {
    refreshStats();
  }, []);

  const handleClose = () => {
    router.back();
  };

  const isAlltime = gameMode === 'all-time';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAlltime ? 'All-Time Stats' : 'Your Stats'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <StatsCard stats={activeStats} />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Play</Text>
          <Text style={styles.infoText}>
            Guess the footballer's full name in 10 tries.
          </Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.correct }]} />
            <Text style={styles.legendText}>
              Correct letter in the right spot
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.present }]} />
            <Text style={styles.legendText}>
              Correct letter in the wrong spot
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.absent }]} />
            <Text style={styles.legendText}>
              Letter not in the name
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          A new baller every day at midnight!
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cellBorder,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.headerBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: COLORS.headerBg,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 12,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});

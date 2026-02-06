import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import useGameStore from '../src/store/gameStore';
import {
  StreakBanner,
  GameGrid,
  Keyboard,
  GameOverModal,
} from '../src/components';
import { COLORS } from '../src/constants';

export default function GameScreen() {
  const { isLoading, initGame } = useGameStore();

  useEffect(() => {
    initGame();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.correct} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StreakBanner />

      <View style={styles.gameArea}>
        <GameGrid />
      </View>

      <Keyboard />

      <GameOverModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
});

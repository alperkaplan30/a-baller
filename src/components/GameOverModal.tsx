import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import useGameStore from '../store/gameStore';
import { COLORS, FONTS } from '../constants';
import { formatTimeUntilMidnight } from '../utils/dailyPlayer';
import { useRewardedAd } from '../utils/adMob';

const GameOverModal: React.FC = () => {
  const { gameMode, switchMode, grantExtraAttempt, confirmLoss } = useGameStore();
  const gameStatus = useGameStore(s => s.activeGameStatus());
  const guesses = useGameStore(s => s.activeGuesses());
  const targetName = useGameStore(s => s.activeTargetName());
  const adWatchedToday = useGameStore(s => s.activeAdWatchedToday());

  // Check if the other mode's game is already completed
  const otherModeStatus = useGameStore(s =>
    gameMode === 'modern' ? s.alltimeGameStatus : s.gameStatus
  );

  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(formatTimeUntilMidnight());
  const [scaleAnim] = useState(new Animated.Value(0));
  const [isDismissed, setIsDismissed] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  // Two-step flow: when user loses and can watch ad, first show ad prompt only
  const [showAdPromptOnly, setShowAdPromptOnly] = useState(true);

  const { isLoaded: adLoaded, isLoading: adLoading, showAd, loadAd } = useRewardedAd();

  const isGameOver = gameStatus === 'won' || gameStatus === 'lost';
  const isLost = gameStatus === 'lost';
  const isVisible = isGameOver && !isDismissed;

  const isOtherModeAvailable = otherModeStatus === 'playing';

  // Can show ad option only if: lost, haven't watched ad today, and it's the 10th guess
  const canWatchAd = isLost && !adWatchedToday && guesses.length === 10;

  // Reset dismissed state and ad prompt state when gameStatus or mode changes
  const prevGameStatus = useRef(gameStatus);
  const prevGameMode = useRef(gameMode);
  useEffect(() => {
    if (
      (prevGameStatus.current !== gameStatus && isGameOver) ||
      prevGameMode.current !== gameMode
    ) {
      setIsDismissed(false);
      setShowAdPromptOnly(true);
    }
    prevGameStatus.current = gameStatus;
    prevGameMode.current = gameMode;
  }, [gameStatus, isGameOver, gameMode]);

  // Also reset on mount (app reopen)
  useEffect(() => {
    if (isGameOver) {
      setIsDismissed(false);
      setShowAdPromptOnly(true);
    }
  }, []);

  // Load ad when modal becomes visible and user can watch ad
  useEffect(() => {
    if (isVisible && canWatchAd && !adLoaded && !adLoading) {
      loadAd();
    }
  }, [isVisible, canWatchAd, adLoaded, adLoading, loadAd]);

  useEffect(() => {
    if (isVisible) {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStatsPress = async () => {
    router.push('/stats');
  };

  const handleDismiss = async () => {
    setIsDismissed(true);
  };

  const handleSwitchMode = async () => {
    const newMode = gameMode === 'modern' ? 'all-time' : 'modern';
    switchMode(newMode);
    setIsDismissed(false);
  };

  // Handle declining the ad offer (X button on first step)
  const handleDeclineAd = async () => {
    // User declined ad, confirm the loss and show the answer
    await confirmLoss();
    setShowAdPromptOnly(false);
  };

  const handleWatchAd = async () => {
    if (!adLoaded || isWatchingAd) return;

    setIsWatchingAd(true);
    try {
      const rewarded = await showAd();
      if (rewarded) {
        // User watched the full ad, grant extra attempt
        await grantExtraAttempt();
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Error showing ad:', error);
    } finally {
      setIsWatchingAd(false);
    }
  };

  if (!isVisible) return null;

  const isAlltime = gameMode === 'all-time';
  const otherModeLabel = isAlltime
    ? "Guess the today's baller"
    : "Guess the today's all-time baller";

  // Two-step flow: First show only the ad prompt with X button
  if (isLost && canWatchAd && showAdPromptOnly) {
    return (
      <Modal transparent={true} visible={isVisible} animationType="fade">
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}
          >
            {/* X button to decline ad */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDeclineAd}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.emoji}>😢</Text>
            <Text style={styles.title}>One more chance?</Text>
            <Text style={styles.message}>
              Watch an ad to retry your last guess!
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.adButton, (!adLoaded || isWatchingAd) && styles.buttonDisabled]}
              onPress={handleWatchAd}
              disabled={!adLoaded || isWatchingAd}
            >
              {isWatchingAd || adLoading ? (
                <ActivityIndicator color={COLORS.text} size="small" />
              ) : (
                <Text style={styles.adButtonText}>
                  {adLoaded ? '▶ Watch Ad for Extra Try' : 'Loading ad...'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}
            >
              {gameStatus === 'won' ? (
                <>
                  <Text style={styles.emoji}>🎉</Text>
                  <Text style={styles.title}>Congratulations!</Text>
                  <Text style={styles.message}>
                    You found today's {isAlltime ? 'all-time ' : ''}baller in{' '}
                    <Text style={styles.highlight}>{guesses.length}</Text>{' '}
                    {guesses.length === 1 ? 'try' : 'tries'}!
                  </Text>
                  <View style={styles.playerReveal}>
                    <Text style={styles.playerName}>{targetName}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.emoji}>😢</Text>
                  <Text style={styles.title}>Better luck tomorrow!</Text>
                  <Text style={styles.message}>The {isAlltime ? 'all-time ' : ''}baller was:</Text>
                  <View style={styles.playerReveal}>
                    <Text style={styles.playerName}>{targetName}</Text>
                  </View>
                  <Text style={styles.tomorrowText}>
                    Tomorrow's baller is loading 👀
                  </Text>
                </>
              )}

              <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>Next baller in</Text>
                <Text style={styles.timerValue}>{timeLeft}</Text>
              </View>

              {isOtherModeAvailable && (
                <TouchableOpacity
                  style={[styles.button, styles.switchButton]}
                  onPress={handleSwitchMode}
                >
                  <Text style={styles.switchButtonText}>{otherModeLabel}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.button} onPress={handleStatsPress}>
                <Text style={styles.buttonText}>View Statistics</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.modalBg,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cellBorder,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.typewriter,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  highlight: {
    color: COLORS.correct,
    fontFamily: FONTS.typewriter,
  },
  playerReveal: {
    backgroundColor: COLORS.correct,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  playerName: {
    fontSize: 16,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    textAlign: 'center',
  },
  tomorrowText: {
    fontSize: 13,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  orText: {
    fontSize: 12,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 11,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
  },
  timerValue: {
    fontSize: 26,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.correct,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  adButton: {
    backgroundColor: '#e63946',
    marginBottom: 8,
  },
  adButtonText: {
    fontSize: 14,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    textAlign: 'center',
  },
  switchButton: {
    backgroundColor: '#FFD700',
    marginBottom: 10,
  },
  switchButtonText: {
    fontSize: 14,
    fontFamily: FONTS.typewriter,
    color: '#0f0f12',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default GameOverModal;

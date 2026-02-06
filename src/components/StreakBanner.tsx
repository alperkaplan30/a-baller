import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import useGameStore from '../store/gameStore';
import { COLORS, FONTS } from '../constants';

const LOGO_ASPECT = 676 / 369; // original image aspect ratio
const LOGO_HEIGHT = 40;
const LOGO_WIDTH = LOGO_HEIGHT * LOGO_ASPECT;

const StreakBanner: React.FC = () => {
  const { gameMode, switchMode } = useGameStore();
  const activeStats = useGameStore(s => s.activeStats());
  const router = useRouter();

  const handleStatsPress = () => {
    router.push('/stats');
  };

  const handleLogoPress = () => {
    switchMode(gameMode === 'modern' ? 'all-time' : 'modern');
  };

  const isAlltime = gameMode === 'all-time';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.titleContainer} onPress={handleLogoPress} activeOpacity={0.7}>
        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/AppIcons/logo-nobg.png')}
            style={[
              styles.logo,
              { tintColor: isAlltime ? '#FFD700' : COLORS.text },
            ]}
            resizeMode="contain"
          />
          {isAlltime && (
            <View style={styles.alltimeBadge}>
              <Text style={styles.alltimeBadgeText}>ALL-TIME</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          {isAlltime ? "Guess the today's all-time baller" : "Guess the today's baller"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.streakContainer} onPress={handleStatsPress}>
        <Text style={styles.streakLabel}>STREAK</Text>
        <Text style={styles.streakValue}>{activeStats.currentStreak}</Text>
      </TouchableOpacity>
    </View>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: STATUSBAR_HEIGHT + 6,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cellBorder,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  alltimeBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  alltimeBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.typewriter,
    color: '#0f0f12',
  },
  subtitle: {
    fontSize: 11,
    fontFamily: FONTS.typewriter,
    color: COLORS.textSecondary,
    marginTop: 0,
    marginLeft: 2,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.correct,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  streakLabel: {
    fontSize: 9,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
    opacity: 0.9,
  },
  streakValue: {
    fontSize: 20,
    fontFamily: FONTS.typewriter,
    color: COLORS.text,
  },
});

export default StreakBanner;

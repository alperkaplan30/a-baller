import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LetterStatus } from '../types';
import { COLORS, FONTS } from '../constants';

interface KeyboardKeyProps {
  keyValue: string;
  status?: LetterStatus;
  onPress: (key: string) => void;
  isWide?: boolean;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  keyValue,
  status,
  onPress,
  isWide = false,
}) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'correct':
        return COLORS.correct;
      case 'present':
        return COLORS.present;
      case 'absent':
        return COLORS.absent;
      default:
        return COLORS.keyBg;
    }
  };

  const displayValue = keyValue === 'ENTER' ? 'GO' : keyValue === '⌫' ? '⌫' : keyValue;

  return (
    <TouchableOpacity
      style={[
        styles.key,
        { backgroundColor: getBackgroundColor() },
        isWide && styles.wideKey,
      ]}
      onPress={() => onPress(keyValue)}
      activeOpacity={0.7}
    >
      <Text style={[styles.keyText, isWide && styles.wideKeyText]}>
        {displayValue}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  key: {
    minWidth: 30,
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2.5,
    paddingHorizontal: 6,
  },
  wideKey: {
    minWidth: 44,
    paddingHorizontal: 8,
  },
  keyText: {
    fontSize: 15,
    fontFamily: FONTS.typewriter,
    color: COLORS.keyText,
  },
  wideKeyText: {
    fontSize: 12,
  },
});

export default KeyboardKey;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LetterStatus } from '../types';
import { COLORS, FONTS } from '../constants';

interface LetterCellProps {
  letter: string;
  status: LetterStatus;
  isCurrentRow?: boolean;
  size?: number;
}

const LetterCell: React.FC<LetterCellProps> = ({
  letter,
  status,
  isCurrentRow = false,
  size = 32,
}) => {
  const isSpace = letter === ' ';

  const getBackgroundColor = () => {
    if (isSpace && status !== 'empty') return 'transparent';
    switch (status) {
      case 'correct':
        return COLORS.correct;
      case 'present':
        return COLORS.present;
      case 'absent':
        return COLORS.absent;
      default:
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (isSpace) return 'transparent';
    if (status !== 'empty') return getBackgroundColor();
    if (letter) return COLORS.cellBorderActive;
    return COLORS.cellBorder;
  };

  const cellHeight = Math.round(size * 1.25);
  const fontSize = Math.max(12, Math.round(size * 0.55));
  const borderRadius = Math.round(size * 0.15);

  return (
    <View
      style={[
        styles.cell,
        {
          width: isSpace ? size * 0.5 : size,
          height: cellHeight,
          borderRadius: borderRadius,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isSpace ? 0 : 2,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize, fontFamily: FONTS.typewriter }]}>
        {letter.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2.5,
  },
  letter: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default LetterCell;

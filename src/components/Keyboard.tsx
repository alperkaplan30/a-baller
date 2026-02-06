import React from 'react';
import { View, StyleSheet } from 'react-native';
import KeyboardKey from './KeyboardKey';
import useGameStore from '../store/gameStore';
import { KEYBOARD_ROWS } from '../constants';

const Keyboard: React.FC = () => {
  const { addLetter, removeLetter, submitGuess } = useGameStore();
  const keyboardStatuses = useGameStore(s => s.activeKeyboardStatuses());
  const gameStatus = useGameStore(s => s.activeGameStatus());

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === '⌫') {
      removeLetter();
    } else {
      addLetter(key);
    }
  };

  return (
    <View style={styles.container}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <KeyboardKey
              key={key}
              keyValue={key}
              status={keyboardStatuses.get(key)}
              onPress={handleKeyPress}
              isWide={key === 'ENTER' || key === '⌫'}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
});

export default Keyboard;

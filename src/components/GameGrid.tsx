import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import LetterCell from './LetterCell';
import useGameStore from '../store/gameStore';
import { GAME_CONFIG } from '../constants';
import { LetterStatus } from '../types';

const MIN_CELL_SIZE = 14; // Minimum readable cell size
const MAX_CELL_SIZE = 36; // Maximum cell size for short names
const CELL_MARGIN = 5; // 2.5px on each side
const HORIZONTAL_PADDING = 12;

const GameGrid: React.FC = () => {
  const store = useGameStore();
  const guesses = store.activeGuesses();
  const currentGuess = store.activeCurrentGuess();
  const targetName = store.activeTargetName();
  const gameStatus = store.activeGameStatus();
  const { width: screenWidth } = useWindowDimensions();

  const targetLength = targetName.length;
  const totalRows = GAME_CONFIG.MAX_ATTEMPTS;

  // Count spaces in target name
  const spaceCount = (targetName.match(/ /g) || []).length;
  const letterCount = targetLength - spaceCount;

  // Calculate cell size that fits the screen
  const availableWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const totalMargins = (letterCount + spaceCount) * CELL_MARGIN;
  // Effective letter count for width calculation (spaces are 0.5 width)
  const effectiveLetterCount = letterCount + (spaceCount * 0.5);

  // Calculate the ideal cell width to fit the screen
  const idealCellWidth = Math.floor((availableWidth - totalMargins) / effectiveLetterCount);

  // Clamp between min and max, but prefer fitting the screen
  const cellWidth = Math.min(Math.max(idealCellWidth, MIN_CELL_SIZE), MAX_CELL_SIZE);

  // Check if we need horizontal scroll (when even minimum size doesn't fit)
  const totalRowWidth = letterCount * (cellWidth + CELL_MARGIN) +
                        spaceCount * (cellWidth * 0.5 + CELL_MARGIN);
  const needsHorizontalScroll = totalRowWidth > availableWidth;

  const renderRow = (rowIndex: number) => {
    const isSubmittedRow = rowIndex < guesses.length;
    const isCurrentRow = rowIndex === guesses.length && gameStatus === 'playing';

    let letters: string[] = [];
    let statuses: LetterStatus[] = [];

    if (isSubmittedRow) {
      const guessResult = guesses[rowIndex];
      letters = guessResult.guess.split('');
      statuses = guessResult.results.map((r) => r.status);
    } else if (isCurrentRow) {
      // For current row, show what user has typed so far
      // Pad with empty strings to match target length
      const currentLetters = currentGuess.split('');
      letters = [];
      for (let i = 0; i < targetLength; i++) {
        if (i < currentLetters.length) {
          letters.push(currentLetters[i]);
        } else {
          // Show space placeholder if target has space at this position
          letters.push(targetName[i] === ' ' ? ' ' : '');
        }
      }
      statuses = letters.map(() => 'empty');
    } else {
      // For empty rows, show spaces where target has them
      letters = targetName.split('').map(char => char === ' ' ? ' ' : '');
      statuses = letters.map(() => 'empty');
    }

    return (
      <View key={rowIndex} style={styles.row}>
        {letters.map((letter, colIndex) => (
          <LetterCell
            key={`${rowIndex}-${colIndex}`}
            letter={letter}
            status={statuses[colIndex]}
            isCurrentRow={isCurrentRow}
            size={cellWidth}
          />
        ))}
      </View>
    );
  };

  const renderGrid = () => (
    <>
      {Array.from({ length: totalRows }, (_, i) => renderRow(i))}
    </>
  );

  // If horizontal scroll is needed, wrap each row in its own horizontal ScrollView
  if (needsHorizontalScroll) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: totalRows }, (_, rowIndex) => (
          <ScrollView
            key={rowIndex}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRow}
          >
            {renderRow(rowIndex)}
          </ScrollView>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {renderGrid()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  horizontalRow: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
});

export default GameGrid;

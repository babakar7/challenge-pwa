import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { colors } from '@/lib/constants/theme';

export interface ConfettiCelebrationRef {
  celebrate: () => void;
  bigCelebrate: () => void;
}

interface ConfettiCelebrationProps {
  // Optional custom colors (defaults to theme colors)
  customColors?: string[];
}

const DEFAULT_COLORS = [
  colors.primary,      // Revive purple
  colors.success,      // Green
  colors.streak,       // Orange
  colors.meals,        // Rose
  '#FFD700',           // Gold
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ConfettiCelebration = forwardRef<ConfettiCelebrationRef, ConfettiCelebrationProps>(
  ({ customColors }, ref) => {
    const confettiRef = useRef<ConfettiCannon>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiCount, setConfettiCount] = useState(100);

    useImperativeHandle(ref, () => ({
      celebrate: () => {
        setConfettiCount(100);
        setShowConfetti(true);
        // Auto-hide after animation completes
        setTimeout(() => setShowConfetti(false), 4000);
      },
      bigCelebrate: () => {
        setConfettiCount(200);
        setShowConfetti(true);
        // Longer display for big celebration
        setTimeout(() => setShowConfetti(false), 5000);
      },
    }));

    if (!showConfetti) return null;

    return (
      <View style={styles.container} pointerEvents="none">
        <ConfettiCannon
          ref={confettiRef}
          count={confettiCount}
          origin={{ x: screenWidth / 2, y: -20 }}
          autoStart
          fadeOut
          fallSpeed={3000}
          explosionSpeed={350}
          colors={customColors || DEFAULT_COLORS}
        />
      </View>
    );
  }
);

ConfettiCelebration.displayName = 'ConfettiCelebration';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

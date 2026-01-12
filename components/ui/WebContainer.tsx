import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/lib/utils/responsive';
import { colors } from '@/lib/constants/theme';

interface WebContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Container that centers content with max-width on desktop web.
 * No effect on mobile native apps.
 */
export function WebContainer({ children, style }: WebContainerProps) {
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return <View style={[styles.base, style]}>{children}</View>;
  }

  return (
    <View style={styles.desktopWrapper}>
      <View style={[styles.base, styles.desktopContainer, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desktopWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  desktopContainer: {
    maxWidth: MAX_CONTENT_WIDTH,
    width: '100%',
    // Add subtle shadow on desktop for depth
    shadowColor: '#413733',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
});

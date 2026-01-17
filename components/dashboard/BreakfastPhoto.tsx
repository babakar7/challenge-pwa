import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { useBreakfastPhoto } from '@/lib/hooks/useBreakfastPhoto';
import { format, parseISO } from 'date-fns';

interface BreakfastPhotoProps {
  disabled?: boolean;
  selectedDate?: string | null;
}

const getToday = () => new Date().toISOString().split('T')[0];

export function BreakfastPhoto({ disabled = false, selectedDate = null }: BreakfastPhotoProps) {
  const targetDate = selectedDate || getToday();
  const isLocked = useAppStore((state) => !!state.checkIns[targetDate]) || disabled;

  const {
    photo,
    photoUrl,
    isUploading,
    error,
    showPicker,
  } = useBreakfastPhoto(selectedDate);

  const hasPhoto = !!photo;

  // Format upload time
  const formatUploadTime = (uploadedAt: string) => {
    try {
      const date = parseISO(uploadedAt);
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  // Uploading state
  if (isUploading) {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, styles.iconContainerUploading]}>
            <ActivityIndicator size="small" color={colors.breakfast} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Photo petit-déjeuner</Text>
            <Text style={styles.uploadingText}>Téléchargement...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Locked state (after check-in or challenge ended)
  if (isLocked && hasPhoto) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.row}>
          <View style={styles.thumbnailContainer}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Ionicons name="image-outline" size={24} color={colors.textMuted} />
              </View>
            )}
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Photo petit-déjeuner</Text>
            <Text style={styles.uploadedTime}>
              Téléchargé à {photo?.uploaded_at ? formatUploadTime(photo.uploaded_at) : ''}
            </Text>
          </View>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        </View>
      </View>
    );
  }

  // Locked state without photo
  if (isLocked && !hasPhoto) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera-outline" size={20} color={colors.breakfast} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Photo petit-déjeuner</Text>
            <Text style={styles.helperText}>Aucune photo</Text>
          </View>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        </View>
      </View>
    );
  }

  // Photo uploaded - show thumbnail with replace option
  if (hasPhoto) {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <TouchableOpacity onPress={showPicker} style={styles.thumbnailContainer}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Ionicons name="image-outline" size={24} color={colors.textMuted} />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.content}>
            <Text style={styles.label}>Photo petit-déjeuner</Text>
            <Text style={styles.uploadedTime}>
              Téléchargé à {photo?.uploaded_at ? formatUploadTime(photo.uploaded_at) : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={showPicker}>
            <Ionicons name="pencil" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state - no photo yet
  return (
    <TouchableOpacity style={styles.card} onPress={showPicker} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons name="camera-outline" size={20} color={colors.breakfast} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>Photo petit-déjeuner</Text>
          <View style={styles.helperRow}>
            <Text style={styles.helperText}>Appuyez pour ajouter</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>Optionnel</Text>
            </View>
          </View>
        </View>
        <View style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.breakfast} />
        </View>
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLocked: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.breakfastMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainerUploading: {
    backgroundColor: colors.breakfastMuted,
  },
  thumbnailContainer: {
    marginRight: spacing.md,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.breakfastMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  helperText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  uploadingText: {
    fontSize: 15,
    color: colors.breakfast,
    fontWeight: '500',
  },
  uploadedTime: {
    fontSize: 14,
    color: colors.textMuted,
  },
  optionalBadge: {
    backgroundColor: colors.breakfastMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.breakfast,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.breakfastMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.sm,
  },
});

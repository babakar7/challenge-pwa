import { useState, useEffect, useCallback } from 'react';
import { Platform, ActionSheetIOS, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';
import { format } from 'date-fns';

const getToday = () => format(new Date(), 'yyyy-MM-dd');

export function useBreakfastPhoto(selectedDate: string | null) {
  const targetDate = selectedDate || getToday();
  const photo = useAppStore((state) => state.breakfastPhotos[targetDate]);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Load signed URL when photo exists
  useEffect(() => {
    let isMounted = true;

    const loadPhotoUrl = async () => {
      if (photo?.storage_path) {
        const url = await dataSync.getBreakfastPhotoUrl(photo.storage_path);
        if (isMounted) {
          setPhotoUrl(url);
        }
      } else {
        if (isMounted) {
          setPhotoUrl(null);
        }
      }
    };

    loadPhotoUrl();

    return () => {
      isMounted = false;
    };
  }, [photo?.storage_path]);

  // Request camera/library permissions
  const requestPermissions = async (type: 'camera' | 'library'): Promise<boolean> => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Please allow camera access to take breakfast photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission',
          'Please allow photo library access to select breakfast photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // Pick image from camera
  const pickFromCamera = async (): Promise<string | null> => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return result.assets[0].uri;
  };

  // Pick image from library
  const pickFromLibrary = async (): Promise<string | null> => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return result.assets[0].uri;
  };

  // Upload photo
  const uploadPhoto = async (imageUri: string): Promise<boolean> => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await dataSync.uploadBreakfastPhoto(targetDate, imageUri);

      if (!result.success) {
        setError(result.error || 'Upload failed');
        return false;
      }

      // Refresh the photo URL
      const url = await dataSync.getBreakfastPhotoUrl(`${dataSync.getUserId()}/${targetDate}.jpg`);
      setPhotoUrl(url);

      return true;
    } catch (err) {
      setError('Upload failed');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Main action to pick and upload photo
  const pickAndUpload = useCallback(async (source: 'camera' | 'library') => {
    let imageUri: string | null = null;

    if (source === 'camera') {
      imageUri = await pickFromCamera();
    } else {
      imageUri = await pickFromLibrary();
    }

    if (imageUri) {
      await uploadPhoto(imageUri);
    }
  }, [targetDate]);

  // Show action sheet to choose source
  const showPicker = useCallback(() => {
    if (Platform.OS === 'web') {
      // On web, just use library picker (browser handles camera option)
      pickAndUpload('library');
    } else if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickAndUpload('camera');
          } else if (buttonIndex === 2) {
            pickAndUpload('library');
          }
        }
      );
    } else {
      // Android - show alert with options
      Alert.alert(
        'Add Breakfast Photo',
        'Choose how to add your photo',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => pickAndUpload('camera') },
          { text: 'Choose from Library', onPress: () => pickAndUpload('library') },
        ]
      );
    }
  }, [pickAndUpload]);

  // Delete photo
  const deletePhoto = useCallback(async () => {
    const success = await dataSync.deleteBreakfastPhoto(targetDate);
    if (success) {
      setPhotoUrl(null);
    }
    return success;
  }, [targetDate]);

  return {
    photo,
    photoUrl,
    isUploading,
    error,
    showPicker,
    pickAndUpload,
    deletePhoto,
  };
}

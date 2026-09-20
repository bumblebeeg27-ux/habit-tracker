import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';
import { Exercise } from '../types/workout';
import { findExerciseImageUrl } from '../utils/exerciseImage';

export function ExerciseRow({
  exercise,
  onSave,
  onDelete,
}: {
  exercise: Exercise;
  onSave: (patch: Partial<Exercise>) => void;
  onDelete?: () => void;
}) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [editing, setEditing] = useState(false);
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(exercise.reps);
  const [restSec, setRestSec] = useState(String(exercise.restSec));
  const [videoUrl, setVideoUrl] = useState(exercise.customVideoUrl ?? '');
  const [customImageUri, setCustomImageUri] = useState(exercise.customImageUri);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const autoImageUrl = useMemo(() => findExerciseImageUrl(exercise.name), [exercise.name]);
  const thumbnailUri = exercise.customImageUri ?? autoImageUrl;

  function handleDone() {
    onSave({
      sets: Number(sets) || exercise.sets,
      reps: reps.trim() || exercise.reps,
      restSec: Number(restSec) || exercise.restSec,
      customVideoUrl: videoUrl.trim() || undefined,
      customImageUri: customImageUri || undefined,
    });
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert('Remove exercise?', `This removes ${exercise.name} from this day.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onDelete },
    ]);
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Enable photo library access in Settings to attach a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setCustomImageUri(result.assets[0].uri);
    }
  }

  function handleOpenVideo() {
    if (exercise.customVideoUrl) Linking.openURL(exercise.customVideoUrl);
  }

  if (editing) {
    return (
      <View style={styles.row}>
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.editRow}>
          <TextInput
            style={styles.miniInput}
            value={sets}
            onChangeText={setSets}
            keyboardType="number-pad"
            placeholder="Sets"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.miniInput}
            value={reps}
            onChangeText={setReps}
            placeholder="Reps"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.miniInput}
            value={restSec}
            onChangeText={setRestSec}
            keyboardType="number-pad"
            placeholder="Rest s"
            placeholderTextColor={colors.textMuted}
          />
          <Pressable style={styles.doneChip} onPress={handleDone}>
            <Text style={styles.doneChipText}>✓</Text>
          </Pressable>
        </View>

        <View style={styles.mediaEditRow}>
          <Pressable style={styles.photoPickButton} onPress={handlePickPhoto}>
            {customImageUri ? (
              <Image source={{ uri: customImageUri }} style={styles.photoPickPreview} />
            ) : (
              <Text style={styles.photoPickText}>📷 Add photo</Text>
            )}
          </Pressable>
          {customImageUri && (
            <Pressable style={styles.photoRemoveButton} onPress={() => setCustomImageUri(undefined)}>
              <Text style={styles.photoRemoveText}>Remove photo</Text>
            </Pressable>
          )}
        </View>
        <TextInput
          style={styles.videoInput}
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="Video link (optional)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.thumbnail}
          disabled={!thumbnailUri}
          onPress={() => setImageExpanded((e) => !e)}
        >
          {thumbnailUri && !imageFailed ? (
            <>
              <Image
                source={{ uri: thumbnailUri }}
                style={styles.thumbnailImage}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageFailed(true)}
              />
              {imageLoading && (
                <ActivityIndicator size="small" color={colors.textSecondary} style={StyleSheet.absoluteFill} />
              )}
            </>
          ) : (
            <Text style={styles.thumbnailFallback}>{exercise.name.slice(0, 1)}</Text>
          )}
          {exercise.customVideoUrl && (
            <View style={styles.videoBadge}>
              <Text style={styles.videoBadgeIcon}>▶</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>
            {exercise.sets} × {exercise.reps} · rest {exercise.restSec}s
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={() => setEditing(true)}>
            <Text style={styles.actionIcon}>✎</Text>
          </Pressable>
          {onDelete && (
            <Pressable style={styles.actionButton} onPress={handleDelete}>
              <Text style={[styles.actionIcon, styles.deleteIcon]}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>
      {exercise.notes ? <Text style={styles.notes}>{exercise.notes}</Text> : null}
      {imageExpanded && thumbnailUri && !imageFailed && (
        <Image source={{ uri: thumbnailUri }} style={styles.expandedImage} resizeMode="contain" />
      )}
      {exercise.customVideoUrl && (
        <Pressable style={styles.videoLink} onPress={handleOpenVideo}>
          <Text style={styles.videoLinkText}>▶ Watch video</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    thumbnail: {
      width: 48,
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardSolid,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
    },
    thumbnailFallback: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '700',
    },
    videoBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.accentFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoBadgeIcon: {
      color: colors.onAccent,
      fontSize: 8,
    },
    headerText: {
      flex: 1,
    },
    name: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteIcon: {
      color: colors.danger,
    },
    actionIcon: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    meta: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    expandedImage: {
      width: '100%',
      height: 220,
      borderRadius: 12,
      marginTop: 10,
      backgroundColor: colors.cardSolid,
    },
    notes: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
      fontStyle: 'italic',
    },
    videoLink: {
      marginTop: 8,
    },
    videoLinkText: {
      color: colors.accentText,
      fontSize: 13,
      fontWeight: '600',
    },
    editRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 6,
      alignItems: 'center',
    },
    miniInput: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      color: colors.textPrimary,
      fontSize: 13,
      backgroundColor: colors.bg,
    },
    doneChip: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.accentFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneChipText: {
      color: colors.onAccent,
      fontWeight: '700',
    },
    mediaEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
    },
    photoPickButton: {
      width: 48,
      height: 48,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    photoPickPreview: {
      width: '100%',
      height: '100%',
    },
    photoPickText: {
      color: colors.textSecondary,
      fontSize: 9,
      textAlign: 'center',
    },
    photoRemoveButton: {
      flex: 1,
    },
    photoRemoveText: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '600',
    },
    videoInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.textPrimary,
      fontSize: 13,
      backgroundColor: colors.bg,
      marginTop: 8,
    },
  });
}

import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Exercise } from '../types/workout';
import { findExerciseImageUrl } from '../utils/exerciseImage';

export function ExerciseRow({
  exercise,
  onSave,
}: {
  exercise: Exercise;
  onSave: (patch: Partial<Exercise>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(exercise.reps);
  const [restSec, setRestSec] = useState(String(exercise.restSec));
  const [imageExpanded, setImageExpanded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = useMemo(() => findExerciseImageUrl(exercise.name), [exercise.name]);

  function handleDone() {
    onSave({
      sets: Number(sets) || exercise.sets,
      reps: reps.trim() || exercise.reps,
      restSec: Number(restSec) || exercise.restSec,
    });
    setEditing(false);
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
            placeholderTextColor="#5C6658"
          />
          <TextInput
            style={styles.miniInput}
            value={reps}
            onChangeText={setReps}
            placeholder="Reps"
            placeholderTextColor="#5C6658"
          />
          <TextInput
            style={styles.miniInput}
            value={restSec}
            onChangeText={setRestSec}
            keyboardType="number-pad"
            placeholder="Rest s"
            placeholderTextColor="#5C6658"
          />
          <Pressable style={styles.doneChip} onPress={handleDone}>
            <Text style={styles.doneChipText}>✓</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.thumbnail}
          disabled={!imageUrl}
          onPress={() => setImageExpanded((e) => !e)}
        >
          {imageUrl && !imageFailed ? (
            <>
              <Image
                source={{ uri: imageUrl }}
                style={styles.thumbnailImage}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageFailed(true)}
              />
              {imageLoading && (
                <ActivityIndicator size="small" color="#7C8A78" style={StyleSheet.absoluteFill} />
              )}
            </>
          ) : (
            <Text style={styles.thumbnailFallback}>{exercise.name.slice(0, 1)}</Text>
          )}
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>
            {exercise.sets} × {exercise.reps} · rest {exercise.restSec}s
          </Text>
        </View>
        <Pressable style={styles.actionButton} onPress={() => setEditing(true)}>
          <Text style={styles.actionIcon}>✎</Text>
        </Pressable>
      </View>
      {exercise.notes ? <Text style={styles.notes}>{exercise.notes}</Text> : null}
      {imageExpanded && imageUrl && !imageFailed && (
        <Image source={{ uri: imageUrl }} style={styles.expandedImage} resizeMode="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1C2318',
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
    borderColor: '#1C2318',
    backgroundColor: '#0A0F0C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    color: '#5C6658',
    fontSize: 16,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: '#EAFFEF',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C2318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    color: '#7C8A78',
    fontSize: 12,
  },
  meta: {
    color: '#7C8A78',
    fontSize: 13,
    marginTop: 2,
  },
  expandedImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#0A0F0C',
  },
  notes: {
    color: '#5C6658',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
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
    borderColor: '#1C2318',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#EAFFEF',
    fontSize: 13,
    backgroundColor: '#05070A',
  },
  doneChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#B6FF3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneChipText: {
    color: '#0A1400',
    fontWeight: '700',
  },
});

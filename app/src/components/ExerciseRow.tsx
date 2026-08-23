import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Exercise } from '../types/workout';

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

  function handleDone() {
    onSave({
      sets: Number(sets) || exercise.sets,
      reps: reps.trim() || exercise.reps,
      restSec: Number(restSec) || exercise.restSec,
    });
    setEditing(false);
  }

  function openVideo() {
    const query = encodeURIComponent(`${exercise.name} exercise proper form`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
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
            placeholderTextColor="#5B655F"
          />
          <TextInput
            style={styles.miniInput}
            value={reps}
            onChangeText={setReps}
            placeholder="Reps"
            placeholderTextColor="#5B655F"
          />
          <TextInput
            style={styles.miniInput}
            value={restSec}
            onChangeText={setRestSec}
            keyboardType="number-pad"
            placeholder="Rest s"
            placeholderTextColor="#5B655F"
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
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={openVideo}>
            <Text style={styles.actionIcon}>▶</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setEditing(true)}>
            <Text style={styles.actionIcon}>✎</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.meta}>
        {exercise.sets} × {exercise.reps} · rest {exercise.restSec}s
      </Text>
      {exercise.notes ? <Text style={styles.notes}>{exercise.notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2A24',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
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
    borderColor: '#1F2A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    color: '#8A8A8E',
    fontSize: 12,
  },
  meta: {
    color: '#8A8A8E',
    fontSize: 13,
    marginTop: 2,
  },
  notes: {
    color: '#5B655F',
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
    borderColor: '#1F2A24',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 13,
    backgroundColor: '#0B0F0D',
  },
  doneChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneChipText: {
    color: '#04150B',
    fontWeight: '700',
  },
});

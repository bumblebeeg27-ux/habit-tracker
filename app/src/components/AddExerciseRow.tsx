import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';
import { Exercise } from '../types/workout';

export function AddExerciseRow({ onAdd }: { onAdd: (exercise: Exercise) => void }) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [restSec, setRestSec] = useState('60');

  function reset() {
    setName('');
    setSets('3');
    setReps('10');
    setRestSec('60');
    setAdding(false);
  }

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      sets: Number(sets) || 3,
      reps: reps.trim() || '10',
      restSec: Number(restSec) || 60,
    });
    reset();
  }

  if (!adding) {
    return (
      <Pressable style={styles.addButton} onPress={() => setAdding(true)}>
        <Text style={styles.addButtonText}>+ Add your own exercise</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={setName}
        placeholder="Exercise name"
        placeholderTextColor={colors.textMuted}
        autoFocus
      />
      <View style={styles.row}>
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
      </View>
      <View style={styles.row}>
        <Pressable style={styles.cancelButton} onPress={reset}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.confirmButton, !name.trim() && styles.confirmButtonDisabled]} onPress={handleAdd}>
          <Text style={styles.confirmButtonText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    addButton: {
      borderWidth: 1.5,
      borderColor: colors.accentText,
      backgroundColor: colors.accentBg,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    addButtonText: {
      color: colors.accentLight,
      fontSize: 14,
      fontWeight: '700',
    },
    form: {
      marginTop: 12,
      padding: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      gap: 8,
    },
    nameInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.textPrimary,
      fontSize: 14,
      backgroundColor: colors.bg,
    },
    row: {
      flexDirection: 'row',
      gap: 6,
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
    cancelButton: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    confirmButton: {
      flex: 1,
      backgroundColor: colors.accentFill,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
    confirmButtonText: {
      color: colors.onAccent,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}

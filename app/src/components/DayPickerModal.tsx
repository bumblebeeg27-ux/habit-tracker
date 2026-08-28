import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WorkoutProgram } from '../types/workout';

const FULL_WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function DayPickerModal({
  visible,
  weekday,
  program,
  currentDayIndex,
  onSelect,
  onClose,
}: {
  visible: boolean;
  weekday: number;
  program: WorkoutProgram;
  currentDayIndex: number | null;
  onSelect: (dayIndex: number | null) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Set {FULL_WEEKDAY_NAMES[weekday]}</Text>
          <ScrollView style={styles.list}>
            <Option
              label="Rest day"
              subtitle="No workout scheduled"
              selected={currentDayIndex === null}
              onPress={() => {
                onSelect(null);
                onClose();
              }}
            />
            {program.days.map((day) => (
              <Option
                key={day.dayIndex}
                label={`Day ${day.dayIndex}`}
                subtitle={day.focus}
                selected={currentDayIndex === day.dayIndex}
                onPress={() => {
                  onSelect(day.dayIndex);
                  onClose();
                }}
              />
            ))}
          </ScrollView>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Option({
  label,
  subtitle,
  selected,
  onPress,
}: {
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12181F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A423E',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  list: {
    maxHeight: 380,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#16321F',
  },
  optionText: {
    flexShrink: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionLabelSelected: {
    color: '#4ADE80',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#8A8A8E',
    marginTop: 2,
  },
  checkmark: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8A8A8E',
    fontSize: 15,
    fontWeight: '600',
  },
});

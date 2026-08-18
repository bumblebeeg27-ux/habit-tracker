import { Pressable, StyleSheet, Text, View } from 'react-native';

export function OptionPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string; description?: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.option, selected ? styles.optionSelected : undefined]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : undefined]}>
              {option.label}
            </Text>
            {option.description ? (
              <Text style={styles.description}>{option.description}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#12181580',
  },
  optionSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#16321F',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  labelSelected: {
    color: '#4ADE80',
  },
  description: {
    fontSize: 13,
    color: '#8A8A8E',
    marginTop: 4,
  },
});

import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

export function LabeledInput({
  label,
  containerStyle,
  style,
  ...inputProps
}: { label: string; containerStyle?: ViewStyle } & TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#5C6658"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C8A78',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#EAFFEF',
    backgroundColor: '#0A0F0C80',
  },
});

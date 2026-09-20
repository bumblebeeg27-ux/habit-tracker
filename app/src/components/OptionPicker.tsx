import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';

export function OptionPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string; description?: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 12,
    },
    option: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      backgroundColor: colors.card,
    },
    optionSelected: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentBg,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    labelSelected: {
      color: colors.accentLight,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
}

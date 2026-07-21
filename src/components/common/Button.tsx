import { Theme } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export default function Button({
  title,
  variant = 'primary',
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.button,

        isPrimary
          ? styles.primaryButton
          : styles.secondaryButton,

        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,

          isPrimary
            ? styles.primaryText
            : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radius.md,
  },

  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },

  secondaryButton: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  text: {
    ...Theme.typography.bodyLarge,
  },

  primaryText: {
    color: Theme.colors.white,
  },

  secondaryText: {
    color: Theme.colors.textPrimary,
  },
});
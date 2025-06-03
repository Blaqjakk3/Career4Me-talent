import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: ViewStyle;
  textStyles?: TextStyle;
  isLoading?: boolean;
  disabled?: boolean;
}

const CustomButton = ({
  title,
  handlePress,
  containerStyles = {},
  textStyles = {},
  isLoading = false,
  disabled = false
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      style={[styles.CustomButton, containerStyles]}
      disabled={isLoading || disabled}
    >
      <Text style={[styles.buttonText, textStyles]}>
        {isLoading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  CustomButton: {
    backgroundColor: '#5badec',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CustomButton;
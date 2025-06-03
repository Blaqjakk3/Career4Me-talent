import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, TextInputProps, KeyboardAvoidingView, StyleSheet } from "react-native";


// Define the props interface with TypeScript
interface FormFieldProps extends TextInputProps {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
}

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles = "",
  ...props
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // These would typically come from your constants file
  const icons = {
    eye: require("@/assets/icons/eye.png"),
    eyeHide: require("@/assets/icons/eye-hide.png"),
  };

  return (
    <KeyboardAvoidingView>
      <View className={`space-y-2 ${otherStyles}`}>
        <Text className="text-base text-gray-800 font-medium">{title}</Text>

        <View 
          className="w-full h-16 px-4 bg-gray-50 rounded-3xl border-2 border flex flex-row items-center"
          style={styles.inputContainer}
        >
          <TextInput
            className="flex-1 text-black text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onChangeText={handleChangeText}
            secureTextEntry={title === "Password" && !showPassword}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {title === "Password" && (
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Image
                source={!showPassword ? icons.eye : icons.eyeHide}
                style={styles.eyeImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Define styles
const styles = StyleSheet.create({
  inputContainer: {
    height: 56, // Adjust height to match email field
  },
  eyeIcon: {
    padding: 8, // Adjust padding to make the icon smaller
  },
  eyeImage: {
    width: 20, // Adjust icon size
    height: 20,
  },
});

export default FormField;
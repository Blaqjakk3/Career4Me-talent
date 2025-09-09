"use client"

import { useState } from "react"
import { Text, View, TouchableOpacity, Animated, Keyboard, Modal, ScrollView, Alert } from "react-native"
import { Link, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useRef } from "react"
import FormField from "@/components/FormField"
import { KeyboardAvoidingView } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker" 
import { createUser } from "@/lib/appwrite"
import CustomButton from "@/components/CustomButton"
import { useGlobalContext } from "@/context/GlobalProvider"
import { Ionicons } from "@expo/vector-icons"
import SuccessModal from "@/components/SuccessModal"

const SignUp = () => {
  const router = useRouter()
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    careerStage: "",
    dateofBirth: new Date(),
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerVisible, setDatePickerVisible] = useState(false)
  const [isDropdownVisible, setDropdownVisible] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const {isLoading, isLoggedIn} = useGlobalContext();

  const isValidFullName = (name: string) => /^[a-zA-Z\s]+$/.test(name.trim());

  const isValidDateOfBirth = (date: Date) => {
    const now = new Date();
    if (date > now) return false; // Future date

    const age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    const dayDiff = now.getDate() - date.getDate();

    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }

    if (actualAge < 15 || actualAge > 80) return false;
    return true;
  };

  const submit = async () => {
    if(!form.fullname || !form.email || !form.careerStage || !form.dateofBirth || !form.password) {
      Alert.alert("Please fill in all fields")
      return
    }
    if (!isValidFullName(form.fullname)) {
      Alert.alert("Invalid Name", "Full Name should contain only letters and spaces.");
      return;
    }
    if (!isValidDateOfBirth(form.dateofBirth)) {
      Alert.alert(
        "Invalid Date of Birth",
        "Please enter a valid date of birth. You must be between 15 and 80 years old, and the date cannot be in the future."
      );
      return;
    }
    setIsSubmitting(true); 
    try {
      const result = await createUser(form.fullname, form.email, form.password, form.careerStage, form.dateofBirth.toISOString())
      
      // Show success modal instead of immediately navigating
      setShowSuccessModal(true);
    } catch (error: unknown) {
      // Extract message and show friendly message for email validation errors
      let message = "An unknown error occurred";
      if (error instanceof Error && error.message) message = error.message;
      else if (typeof error === "string") message = error;

      // If Appwrite returned an email validation error, show a clearer alert
      if (message.toLowerCase().includes("email") || message.toLowerCase().includes("valid email")) {
        Alert.alert("Invalid Email", "Please check your email and enter a valid email address.");
      } else {
        Alert.alert("Error", message);
      }
    }finally{
      setIsSubmitting(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/dashboard");
  }

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {})
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {})

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(false)
    if (selectedDate) {
      setForm({ ...form, dateofBirth: selectedDate })
    }
  }

  const careerStages = [
    { label: "Pathfinder", value: "Pathfinder", icon: "compass-outline", description: "Just starting the journey, exploring options" },
    { label: "Trailblazer", value: "Trailblazer", icon: "trending-up-outline", description: "Building expertise and progressing in their field" },
    { label: "Horizon Changer", value: "Horizon Changer", icon: "refresh-outline", description: "Pivoting into new domains, seeking new opportunities" },
  ]

  const selectedCareerStage = careerStages.find((stage) => stage.value === form.careerStage)

  return (
    <SafeAreaView style={{ flex: 1 }} className="h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Animated.View
          className="flex-1 p-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Back Button */}
                  <TouchableOpacity
                     onPress={() => router.replace("/signin")}
                    className="mt-4"
                  >
                   <View className="flex-row items-center">
                  <Ionicons name="arrow-back" size={24} color="#5badec" />
                  <Text className="ml-2 text-[#5badec] text-lg font-semibold">Back</Text>
                   </View>
                  </TouchableOpacity>
          {/* Sign Up Header */}
          <View className="mt-8 mb-10">
            <Text className="text-3xl font-bold text-gray-800">
              Sign Up to Career<Text className="text-[#5badec]">4Me</Text>
            </Text>
            <Text className="text-gray-500 mt-2">Hello there! Enter your details to create your account.</Text>
          </View>

          <KeyboardAvoidingView keyboardVerticalOffset={30} behavior="padding">
            {/* Form Fields */}
            <View className="space-y-6">
              <FormField
                title="Full Name"
                value={form.fullname}
                placeholder="Enter your full name"
                handleChangeText={(text) => {
                  // Only allow letters and spaces
                  const filtered = text.replace(/[^a-zA-Z\s]/g, "");
                  setForm({ ...form, fullname: filtered });
                }}
                keyboardType="default"
                autoCapitalize="words"
              />
              <FormField
                title="Email"
                value={form.email}
                placeholder="Enter your email"
                handleChangeText={(text) => setForm({ ...form, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Career Stage Dropdown */}
              <Text className="text-base text-gray-800 font-medium">Career Stage</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(true)}>
                <View className="w-full h-16 px-4 bg-gray-50 rounded-3xl border-2 border-black-100 border flex flex-row items-center">
                  <Text className={`text-base flex-1 ${form.careerStage ? "text-black" : "text-gray-400"}`}>
                    {form.careerStage || "Select your career stage"}
                  </Text>
                  {selectedCareerStage && (
                    <Ionicons name={selectedCareerStage.icon as any} size={20} color="#6b7280" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Dropdown Modal */}
              <Modal
                visible={isDropdownVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setDropdownVisible(false)}
              >
                <View className="flex-1 justify-center items-center bg-black/50">
                  <View className="w-80 bg-white rounded-lg p-4 max-h-[80%]">
                    {/* X Close Button */}
                    <TouchableOpacity
                      onPress={() => setDropdownVisible(false)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        padding: 4,
                      }}
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={24} color="#5badec" />
                    </TouchableOpacity>
                    <ScrollView style={{ marginTop: 28 }}>
                      {careerStages.map((stage) => (
                        <TouchableOpacity
                          key={stage.value}
                          onPress={() => {
                            setForm({ ...form, careerStage: stage.value })
                            setDropdownVisible(false)
                          }}
                          className="p-3 border-b border-gray-200"
                        >
                          <View className="flex-row items-center">
                            <Ionicons name={stage.icon as any} size={20} color="#5badec" />
                            <View className="ml-2 flex-1">
                              <Text className="text-base text-gray-800">{stage.label}</Text>
                              <Text className="text-sm text-gray-500 mt-1">{stage.description}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              {/* Date of Birth Field */}
              <Text className="text-base text-gray-800 font-medium">Date of Birth</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <View className="w-full h-16 px-4 bg-gray-50 rounded-3xl border-2 border-black-100 border flex flex-row items-center">
                  <Text className="text-gray-400 text-base flex-1">
                    {form.dateofBirth.toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Date Picker */}
              {isDatePickerVisible && (
                <DateTimePicker
                  value={form.dateofBirth}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              <FormField
                title="Password"
                value={form.password}
                placeholder="Enter your password"
                handleChangeText={(text) => setForm({ ...form, password: text })}
                autoCapitalize="none"
              />
            </View>

            {/* Sign Up Button */}
            <View className="mt-8">
              <Animated.View>
                <CustomButton
                  title="Sign Up"
                  handlePress={submit}
                  isLoading={isSubmitting}
                />
              </Animated.View>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-12 mb-4">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="./signin">
                <Text className="text-[#5badec] font-semibold">Sign In</Text>
              </Link>
            </View>
          </KeyboardAvoidingView>

          {/* Success Modal */}
          <SuccessModal
            visible={showSuccessModal}
            onClose={handleSuccessModalClose}
            title="Account Created Successfully!"
            message="Welcome to Career4Me! Your account has been created and you're now signed in. Let's start your career journey!"
            buttonText="Get Started"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp
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


const SignUp = () => {
  const router = useRouter()
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    careerStage: "", // Add career stage to the form state
    dateofBirth: new Date(), // Add date of birth to the form state
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerVisible, setDatePickerVisible] = useState(false) // State to control date picker visibility
  const [isDropdownVisible, setDropdownVisible] = useState(false) // State to control dropdown visibility
   const {isLoading, isLoggedIn} = useGlobalContext();
  const submit = async () => {
    if(!form.fullname || !form.email || !form.careerStage || !form.dateofBirth || !form.password) {
      Alert.alert("Please fill in all fields")
      return
    }
    setIsSubmitting(true); 
    try {
      const result = await createUser(form.fullname, form.email, form.password, form.careerStage, form.dateofBirth.toISOString())
     
      // set it to global state

      router.replace("/dashboard")
    } catch (error) {
      Alert.alert('Error', error.message)
    }finally{
      setIsSubmitting(false)
    }
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

    // Add keyboard listeners to adjust layout when keyboard appears
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      // You could add animation here if needed
    })
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      // You could add animation here if needed
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  

  // Date picker handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(false) // Hide the date picker
    if (selectedDate) {
      setForm({ ...form, dateofBirth: selectedDate }) // Update the form state with the selected date
    }
  }

  // Career stage options
  const careerStages = [
    { label: "Pathfinder", value: "Pathfinder", icon: "compass-outline", description: "Just starting the journey, exploring options" },
    { label: "Trailblazer", value: "Trailblazer", icon: "trending-up-outline", description: "Building expertise and progressing in their field" },
    { label: "Horizon Changer", value: "Horizon Changer", icon: "refresh-outline", description: "Pivoting into new domains, seeking new opportunities" },
  ]

  // Get the selected career stage's icon
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
          {/* Sign In Header */}
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
                handleChangeText={(text) => setForm({ ...form, fullname: text })}
                keyboardType="default"
                autoCapitalize="none"
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
                    <ScrollView>
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
                    {form.dateofBirth.toLocaleDateString()} {/* Display selected date */}
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
              <Animated.View
              >
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
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp



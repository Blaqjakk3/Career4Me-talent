"use client"

import { useState } from "react"
import { Text, View, TouchableOpacity, Animated, Keyboard, Alert } from "react-native"
import { Link, useFocusEffect, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useRef } from "react"
import FormField from "@/components/FormField"
import { KeyboardAvoidingView } from "react-native"
import CustomButton from "@/components/CustomButton"
import { getCurrentUser, signIn } from "@/lib/appwrite"
import { deleteCurrentSession } from "@/lib/appwrite"
import React from "react"

const SignIn = () => {
  const router = useRouter()
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      const handleFocus = async () => {
        try {
          await deleteCurrentSession();
        } catch (error) {
          // Silently handle any errors during session deletion
          // This is expected for new/guest users
        }
      };

      handleFocus();
    }, [])
  );
  

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

  const handleSignIn = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/(tabs)/dashboard")
    }, 1500)
  }

  // Button animation
  const [buttonScale] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

   const submit = async () => {
      if(!form.email ||  !form.password) {
        Alert.alert("Please fill in all fields")
        return
      }
      setIsSubmitting(true); 
      try {
        await signIn( form.email, form.password);
        const result = await getCurrentUser();
        // set it to global state
  
        router.replace("/dashboard")
      } catch (error) {
        Alert.alert('Error', (error as Error).message)
      }finally{
        setIsSubmitting(false)
      }
    }

  return (
    <SafeAreaView style={{ flex: 1 }} className="h-full bg-white">
      <Animated.View
        className="flex-1 p-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
           onPress={() => router.replace("/")}
          className="mt-4"
        >
         <View className="flex-row items-center">
        <Ionicons name="arrow-back" size={24} color="#5badec" />
        <Text className="ml-2 text-[#5badec] text-lg font-semibold">Back</Text>
         </View>
        </TouchableOpacity>

        {/* Sign In Header */}
        <View className="mt-8 mb-10">
          <Text className="text-3xl font-bold text-gray-800">
            Sign In to Career<Text className="text-[#5badec]">4Me</Text>
          </Text>
          <Text className="text-gray-500 mt-2">Welcome back! Please enter your details.</Text>
        </View>

        <KeyboardAvoidingView 
    keyboardVerticalOffset={30}
    behavior="padding">
        {/* Form Fields */}
        <View className="space-y-6">
          <FormField
            title="Email"
            value={form.email}
            placeholder="Enter your email"
            handleChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            title="Password"
            value={form.password}
            placeholder="Enter your password"
            handleChangeText={(text) => setForm({ ...form, password: text })}
            autoCapitalize="none"
          />

        </View>

        {/* Sign In Button */}
        <View className="mt-8">
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
           <CustomButton
           title="Sign In"
           handlePress={submit}
           isLoading={isSubmitting}
           />
            
          
          </Animated.View>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-12 mb-4">
          <Text className="text-gray-600">Not Registered? </Text>
          <TouchableOpacity onPress={() => router.push("./signup")}>
            <Text className="text-[#5badec] font-semibold">Create an account</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  )
}

export default SignIn

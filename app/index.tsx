"use client"

import { Image, Text, View, Pressable, Animated, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useState, useEffect, useRef } from "react"
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { useGlobalContext } from "../context/GlobalProvider"

export default function Index() {
  const router = useRouter()
  const { width } = Dimensions.get("window")
  const { isLoggedIn, isLoading } = useGlobalContext()

  // Initialize all animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const [buttonScale] = useState(new Animated.Value(1))

  // Check authentication status and handle animations
  useEffect(() => {
    const checkAuthAndAnimate = async () => {
      if (isLoggedIn && !isLoading) {
        router.replace("/(tabs)/dashboard")
        return
      }

      // Start animations only if user is not logged in
      if (!isLoggedIn && !isLoading) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start()
      }
    }

    checkAuthAndAnimate()
  }, [isLoggedIn, isLoading, fadeAnim, slideAnim, scaleAnim])

  const handleGetStarted = () => {
    router.push("./(auth)/signin")
  }

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

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    )
  }

  // Feature cards data
  const features = [
    {
      icon: "compass",
      title: "Find Your Path",
      description: "Discover the right career path tailored to your skills and interests",
    },
    {
      icon: "school",
      title: "Learn & Grow",
      description: "Access resources to develop skills for your chosen career",
    },
    {
      icon: "briefcase-search",
      title: "Opportunities",
      description: "Connect with job and internship openings in your field",
    },
  ]

  return (
    <SafeAreaView className="bg-white h-full">
      <Animated.ScrollView
        contentContainerClassName="flex justify-between"
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Hero section with overlay text */}
          <View className="relative">
            <Image source={require("../assets/images/corporate.jpg")} className="w-full h-72" resizeMode="cover" />

            {/* Gradient overlay */}
            <View className="absolute inset-0 bg-black/30" />

            {/* Floating card with logo and title */}
            <Animated.View
              className="absolute bottom-0 left-0 right-0 bg-white mx-6 p-6 rounded-t-3xl shadow-lg"
              style={{
                transform: [{ translateY: 50 }, { scale: scaleAnim }],
              }}
            >
              <View className="flex-row items-center justify-center mb-2">
                <View className="bg-[#5badec] h-10 w-10 rounded-full items-center justify-center mr-2">
                  <FontAwesome5 name="briefcase" size={18} color="white" />
                </View>
                <Text className="text-3xl font-bold text-gray-800">
                  Career<Text className="text-[#5badec]">4Me</Text>
                </Text>
              </View>

              <Text className="text-center text-gray-600 text-base">
                Explore Career Opportunities and Growth Like Never Before
              </Text>
            </Animated.View>
          </View>

          {/* Features section */}
          <View className="mt-16 px-6">
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }}
            >
              <Text className="text-xl font-bold text-gray-800 mb-4">Why Choose Us?</Text>

              <View>
                {features.map((feature, index) => (
                  <View key={index} className="bg-gray-50 rounded-xl p-4 mb-4 shadow-sm flex-row items-center">
                    <View className="bg-[#5badec]/10 h-12 w-12 rounded-full items-center justify-center mr-3">
                      <MaterialCommunityIcons name={feature.icon as any} size={24} color="#5badec" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800 mb-1">{feature.title}</Text>
                      <Text className="text-gray-600 text-xs">{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

           
          </View>
        </View>

        {/* CTA Button */}
        <View className="px-10 pb-8 mt-4">
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
            <Pressable
              onPress={handleGetStarted}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className="bg-[#5badec] py-4 rounded-full shadow-lg"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white text-center font-bold text-lg mr-2">Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </Pressable>
          </Animated.View>

          <Text className="text-center text-gray-500 text-sm mt-4">
            Join many professionals and newbies finding their dream careers!
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}


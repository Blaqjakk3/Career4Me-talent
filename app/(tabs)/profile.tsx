import { View, Text, Pressable, Alert, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../context/GlobalProvider'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCurrentUser } from '../../lib/appwrite'


const Profile = () => {
  const { logOut } = useGlobalContext()
  const router = useRouter()
  interface UserData {
    fullname: string;
    email: string;
    avatar: string;
    careerStage: string;
  }

  const { user, setUser, setIsLogged } = useGlobalContext();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          const mappedUserData: UserData = {
            fullname: currentUser.fullname,
            email: currentUser.email,
            avatar: currentUser.avatar,
            careerStage: currentUser.careerStage,
          }
          setUserData(mappedUserData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        Alert.alert('Error', 'Failed to load profile information')
      }
    }

    fetchUserData()
  }, [])

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: async () => {
            try {
              await logOut()
              router.replace('/')
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          },
          style: 'destructive'
        }
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <Text className="text-2xl font-bold mb-4">Profile</Text>
        {userData && (
          <View className="mb-6">
            <Image 
                source={{ uri: userData.avatar }}
                className="w-32 h-32 rounded-full mb-4"
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            <Text className="text-lg">Welcome, {userData.fullname}</Text>
            <Text className="text-gray-600">{userData.email}</Text>
            <Text className="text-gray-600">{userData.careerStage}</Text>
          </View>
        )}
        
        <Pressable
          onPress={handleSignOut}
          className="bg-red-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Profile
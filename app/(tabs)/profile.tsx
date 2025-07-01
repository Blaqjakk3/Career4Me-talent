import { View, Text, Pressable, Alert, Image, TextInput, ScrollView, ActivityIndicator, Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../context/GlobalProvider'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCurrentUser, updateUserProfile, updateUserPassword, uploadAvatar, getCareerPathById } from '../../lib/appwrite'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'


const Profile = () => {
  const { logOut } = useGlobalContext()
  const router = useRouter()
  
  interface UserData {
    fullname: string;
    email: string;
    avatar: string;
    careerStage: string;
    selectedPath?: string;
  }

  const { user, setUser, setIsLogged, updateUser } = useGlobalContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedCareerPath, setSelectedCareerPath] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Edit form states
  const [editedData, setEditedData] = useState<UserData | null>(null);
  
  // Password form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const careerStages = [
    { value: 'Pathfinder', label: 'Pathfinder', icon: 'compass-outline', description: 'Just starting the journey, exploring options' },
    { value: 'Trailblazer', label: 'Trailblazer', icon: 'trending-up-outline', description: 'Building expertise and progressing in their field' },
    { value: 'Horizon Changer', label: 'Horizon Changer', icon: 'refresh-outline', description: 'Pivoting into new domains, seeking new opportunities' },
  ];

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [careerStageModalVisible, setCareerStageModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        const mappedUserData: UserData = {
          fullname: currentUser.fullname,
          email: currentUser.email,
          avatar: currentUser.avatar,
          careerStage: currentUser.careerStage,
          selectedPath: currentUser.selectedPath,
        }
        setUserData(mappedUserData)
        setEditedData(mappedUserData)

        // Fetch selected career path details if available
        if (currentUser.selectedPath) {
          const careerPath = await getCareerPathById(currentUser.selectedPath);
          setSelectedCareerPath(careerPath);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      Alert.alert('Error', 'Failed to load profile information')
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditedData(userData);
    }
    setIsEditing(!isEditing);
    setShowSettings(false);
  };

  const handleSaveProfile = async () => {
    if (!editedData) return;
    
    setLoading(true);
    try {
      const result = await updateUserProfile(editedData);
      if (result.success) {
        setUserData(editedData);
        setIsEditing(false);
        await updateUser(editedData);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.currentPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      const result = await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        setShowSettings(false);
        Alert.alert('Success', 'Password updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUploading(true);
        
        const uploadResult = await uploadAvatar(result.assets[0].uri);
        
        if (uploadResult.success && uploadResult.avatarUrl) {
          const newUserData = { ...userData!, avatar: uploadResult.avatarUrl };
          const newEditedData = { ...editedData!, avatar: uploadResult.avatarUrl };
          
          setUserData(newUserData);
          setEditedData(newEditedData);
          
          Alert.alert('Success', 'Avatar updated successfully');
        } else {
          Alert.alert('Error', uploadResult.error || 'Failed to upload avatar');
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

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

  if (!userData || !editedData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#5badec" />
          <Text className="mt-2 text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <View className="flex-row space-x-3">
              {!isChangingPassword && !showSettings && (
                <Pressable onPress={handleEditToggle} className="p-2">
                  <Ionicons 
                    name={isEditing ? "close" : "pencil"} 
                    size={24} 
                    color={isEditing ? "#ef4444" : "#5badec"} 
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Avatar Section */}
          <View className="items-center mb-6">
            <View className="relative">
              <Image 
                source={{ uri: isEditing ? editedData.avatar : userData.avatar }}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
              {avatarUploading && (
                <View className="absolute inset-0 bg-black bg-opacity-50 rounded-full justify-center items-center">
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
              {isEditing && !avatarUploading && (
                <Pressable 
                  onPress={handleAvatarUpload}
                  className="absolute bottom-2 right-2 bg-[#5badec] w-10 h-10 rounded-full justify-center items-center shadow-lg"
                >
                  <Ionicons name="camera" size={20} color="white" />
                </Pressable>
              )}
            </View>
            {isEditing && !avatarUploading && (
              <Pressable onPress={handleAvatarUpload} className="mt-2">
                <Text className="text-[#5badec] text-sm font-medium">Change Avatar</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Profile Information Card */}
        <View className="mx-4 mt-4 bg-white rounded-xl shadow-sm p-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Personal Information</Text>
          
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
            {isEditing ? (
              <TextInput
                value={editedData.fullname}
                onChangeText={(text) => setEditedData({...editedData, fullname: text})}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                placeholder="Enter your full name"
              />
            ) : (
              <Text className="text-lg text-gray-900">{userData.fullname}</Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            {isEditing ? (
              <TextInput
                value={editedData.email}
                onChangeText={(text) => setEditedData({...editedData, email: text})}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text className="text-gray-600">{userData.email}</Text>
            )}
          </View>

          {/* Career Stage */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Career Stage</Text>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={() => setCareerStageModalVisible(true)}>
                  <View className="w-full h-12 px-4 bg-gray-50 rounded-lg border border-gray-300 flex-row items-center">
                    {editedData.careerStage && (
                      <Ionicons
                        name={
                          careerStages.find(s => s.value === editedData.careerStage)?.icon as any
                        }
                        size={20}
                        color="#5badec"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text className={`text-base flex-1 ${editedData.careerStage ? "text-black" : "text-gray-400"}`}>
                      {careerStages.find(s => s.value === editedData.careerStage)?.label || "Select your career stage"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Modal
                  visible={careerStageModalVisible}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setCareerStageModalVisible(false)}
                >
                  <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-80 bg-white rounded-lg p-4 max-h-[80%]">
                      <ScrollView>
                        {careerStages.map((stage) => (
                          <TouchableOpacity
                            key={stage.value}
                            onPress={() => {
                              setEditedData({ ...editedData, careerStage: stage.value });
                              setCareerStageModalVisible(false);
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
              </>
            ) : (
              <View className="flex-row items-center">
                {userData.careerStage && (
                  <Ionicons
                    name={
                      careerStages.find(s => s.value === userData.careerStage)?.icon as any
                    }
                    size={20}
                    color="#5badec"
                    style={{ marginRight: 8 }}
                  />
                )}
                <View>
                  <Text className="text-gray-900">{careerStages.find(s => s.value === userData.careerStage)?.label}</Text>
                  <Text className="text-xs text-gray-500">
                    {careerStages.find(s => s.value === userData.careerStage)?.description}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Selected Career Path */}
          {selectedCareerPath && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Selected Career Path</Text>
              <View className="flex-row items-center">
                <Ionicons name="briefcase-outline" size={20} color="#5badec" style={{ marginRight: 8 }} />
                <View>
                  <Text className="text-gray-900">{selectedCareerPath.title}</Text>
                  <Text className="text-xs text-gray-500">{selectedCareerPath.industry}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <View className="mx-4 mt-4 mb-6">
            <Pressable
              onPress={handleSaveProfile}
              disabled={loading}
              className="bg-[#5badec] py-4 px-6 rounded-xl shadow-sm"
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">Save Changes</Text>
              )}
            </Pressable>
          </View>
        ) : (
          !showSettings && !isChangingPassword && (
            <View className="mx-4 mt-4">
              {/* Settings Card */}
              <View className="bg-white rounded-xl shadow-sm p-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Settings</Text>
                
                {/* Change Password */}
                <Pressable
                  onPress={() => setIsChangingPassword(true)}
                  className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-3"
                >
                  <View className="w-10 h-10 bg-[#5badec] rounded-full justify-center items-center mr-4">
                    <Ionicons name="lock-closed-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">Change Password</Text>
                    <Text className="text-gray-500 text-sm">Update your account password</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </Pressable>

                {/* Notifications */}
                <Pressable
                  onPress={() => {
                    // Navigate to notifications settings
                    Alert.alert('Coming Soon', 'Notifications settings will be available soon');
                  }}
                  className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-3"
                >
                  <View className="w-10 h-10 bg-[#5badec] rounded-full justify-center items-center mr-4">
                    <Ionicons name="notifications-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">Notifications</Text>
                    <Text className="text-gray-500 text-sm">Manage your notification preferences</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </Pressable>

                {/* Sign Out */}
                <Pressable
                  onPress={handleSignOut}
                  className="flex-row items-center p-4 bg-red-50 rounded-lg"
                >
                  <View className="w-10 h-10 bg-red-500 rounded-full justify-center items-center mr-4">
                    <Ionicons name="log-out-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-red-600 font-medium">Sign Out</Text>
                    <Text className="text-red-400 text-sm">Sign out of your account</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )
        )}

        {/* Password Change Section */}
        {isChangingPassword && (
          <View className="mx-4 mt-4 mb-6">
            <View className="bg-white rounded-xl shadow-sm p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">Change Password</Text>
                <Pressable onPress={() => setIsChangingPassword(false)}>
                  <Ionicons name="close" size={24} color="#ef4444" />
                </Pressable>
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Current Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-gray-50">
                  <TextInput
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                    className="flex-1 py-3 text-base"
                    placeholder="Enter current password"
                    secureTextEntry={!showPassword.current}
                  />
                  <Pressable onPress={() => setShowPassword(s => ({ ...s, current: !s.current }))}>
                    <Ionicons name={showPassword.current ? "eye-off" : "eye"} size={20} color="gray" />
                  </Pressable>
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">New Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-gray-50">
                  <TextInput
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                    className="flex-1 py-3 text-base"
                    placeholder="Enter new password"
                    secureTextEntry={!showPassword.new}
                  />
                  <Pressable onPress={() => setShowPassword(s => ({ ...s, new: !s.new }))}>
                    <Ionicons name={showPassword.new ? "eye-off" : "eye"} size={20} color="gray" />
                  </Pressable>
                </View>
              </View>
              
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Confirm New Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-gray-50">
                  <TextInput
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                    className="flex-1 py-3 text-base"
                    placeholder="Confirm new password"
                    secureTextEntry={!showPassword.confirm}
                  />
                  <Pressable onPress={() => setShowPassword(s => ({ ...s, confirm: !s.confirm }))}>
                    <Ionicons name={showPassword.confirm ? "eye-off" : "eye"} size={20} color="gray" />
                  </Pressable>
                </View>
              </View>
              
              <Pressable
                onPress={handlePasswordChange}
                disabled={loading}
                className="bg-[#5badec] py-4 px-6 rounded-xl"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">Update Password</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
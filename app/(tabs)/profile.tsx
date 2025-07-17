import { View, Text, Pressable, Alert, Image, TextInput, ScrollView, ActivityIndicator, Modal, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../context/GlobalProvider'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCurrentUser, updateUserProfile, updateUserPassword, uploadAvatar, getCareerPathById } from '../../lib/appwrite'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window');

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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5badec" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b', fontWeight: '500' }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient Background */}
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1e293b', letterSpacing: -0.5 }}>Profile</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {!isChangingPassword && !showSettings && (
                <Pressable 
                  onPress={handleEditToggle}
                  style={({ pressed }) => ({
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: pressed ? '#f1f5f9' : 'transparent',
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Ionicons 
                    name={isEditing ? "close" : "pencil"} 
                    size={24} 
                    color={isEditing ? "#ef4444" : "#5badec"} 
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Enhanced Avatar Section */}
          <View style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative', marginBottom: 20 }}>
              {/* Avatar Ring */}
              <View style={{
                width: 144,
                height: 144,
                borderRadius: 72,
                backgroundColor: '#5badec',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#5badec',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 12,
              }}>
                <Image 
                  source={{ uri: isEditing ? editedData.avatar : userData.avatar }}
                  style={{
                    width: 136,
                    height: 136,
                    borderRadius: 68,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                  resizeMode="cover"
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
              </View>
              
              {avatarUploading && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 72,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
              
              {isEditing && !avatarUploading && (
                <Pressable 
                  onPress={handleAvatarUpload}
                  style={({ pressed }) => ({
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: '#5badec',
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#5badec',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  })}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </Pressable>
              )}
            </View>
            
            {/* User Name */}
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
              {userData.fullname}
            </Text>
            
            {/* Career Stage Badge */}
            {userData.careerStage && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f0f9ff',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#e0f2fe',
              }}>
                <Ionicons
                  name={careerStages.find(s => s.value === userData.careerStage)?.icon as any}
                  size={16}
                  color="#0369a1"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0369a1' }}>
                  {careerStages.find(s => s.value === userData.careerStage)?.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Information Card */}
        <View style={{
          marginHorizontal: 20,
          marginTop: 24,
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 8,
        }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 24 }}>Personal Information</Text>
          
          {/* Full Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</Text>
            {isEditing ? (
              <TextInput
                value={editedData.fullname}
                onChangeText={(text) => setEditedData({...editedData, fullname: text})}
                style={{
                  borderWidth: 2,
                  borderColor: '#e2e8f0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: '500',
                }}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>{userData.fullname}</Text>
            )}
          </View>

          {/* Email */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</Text>
            {isEditing ? (
              <TextInput
                value={editedData.email}
                onChangeText={(text) => setEditedData({...editedData, email: text})}
                style={{
                  borderWidth: 2,
                  borderColor: '#e2e8f0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: '500',
                }}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#64748b', fontWeight: '500' }}>{userData.email}</Text>
            )}
          </View>

          {/* Career Stage */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Career Stage</Text>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  onPress={() => setCareerStageModalVisible(true)}
                  style={{
                    borderWidth: 2,
                    borderColor: '#e2e8f0',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    backgroundColor: '#f8fafc',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {editedData.careerStage && (
                    <Ionicons
                      name={careerStages.find(s => s.value === editedData.careerStage)?.icon as any}
                      size={20}
                      color="#5badec"
                      style={{ marginRight: 12 }}
                    />
                  )}
                  <Text style={{
                    fontSize: 16,
                    flex: 1,
                    color: editedData.careerStage ? '#1e293b' : '#94a3b8',
                    fontWeight: '500',
                  }}>
                    {careerStages.find(s => s.value === editedData.careerStage)?.label || "Select your career stage"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>
                
                <Modal
                  visible={careerStageModalVisible}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setCareerStageModalVisible(false)}
                >
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{
                      width: width - 40,
                      backgroundColor: 'white',
                      borderRadius: 24,
                      padding: 24,
                      maxHeight: '80%',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 20 },
                      shadowOpacity: 0.25,
                      shadowRadius: 25,
                      elevation: 25,
                    }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 20, textAlign: 'center' }}>
                        Select Career Stage
                      </Text>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {careerStages.map((stage, index) => (
                          <TouchableOpacity
                            key={stage.value}
                            onPress={() => {
                              setEditedData({ ...editedData, careerStage: stage.value });
                              setCareerStageModalVisible(false);
                            }}
                            style={{
                              padding: 20,
                              borderRadius: 16,
                              backgroundColor: '#f8fafc',
                              marginBottom: index < careerStages.length - 1 ? 12 : 0,
                              borderWidth: editedData.careerStage === stage.value ? 2 : 0,
                              borderColor: '#5badec',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: editedData.careerStage === stage.value ? '#5badec' : '#e2e8f0',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 16,
                              }}>
                                <Ionicons 
                                  name={stage.icon as any} 
                                  size={24} 
                                  color={editedData.careerStage === stage.value ? 'white' : '#64748b'} 
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  fontSize: 16,
                                  fontWeight: '600',
                                  color: editedData.careerStage === stage.value ? '#5badec' : '#1e293b',
                                  marginBottom: 4,
                                }}>
                                  {stage.label}
                                </Text>
                                <Text style={{
                                  fontSize: 14,
                                  color: '#64748b',
                                  lineHeight: 20,
                                }}>
                                  {stage.description}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      
                      <TouchableOpacity
                        onPress={() => setCareerStageModalVisible(false)}
                        style={{
                          marginTop: 20,
                          padding: 16,
                          backgroundColor: '#f1f5f9',
                          borderRadius: 16,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {userData.careerStage && (
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#f0f9ff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons
                      name={careerStages.find(s => s.value === userData.careerStage)?.icon as any}
                      size={20}
                      color="#0369a1"
                    />
                  </View>
                )}
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
                    {careerStages.find(s => s.value === userData.careerStage)?.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {careerStages.find(s => s.value === userData.careerStage)?.description}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Selected Career Path */}
          {selectedCareerPath && (
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Career Path</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f0fdf4',
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#bbf7d0',
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#22c55e',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="briefcase" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#15803d' }}>{selectedCareerPath.title}</Text>
                  <Text style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>{selectedCareerPath.industry}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <View style={{ marginHorizontal: 20, marginTop: 24, marginBottom: 24 }}>
            <Pressable
              onPress={handleSaveProfile}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#3b82f6' : '#5badec',
                paddingVertical: 18,
                paddingHorizontal: 24,
                borderRadius: 20,
                shadowColor: '#5badec',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 12,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700', fontSize: 18 }}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        ) : (
          !showSettings && !isChangingPassword && (
            <View style={{ marginHorizontal: 20, marginTop: 24 }}>
              {/* Settings Card */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
                elevation: 8,
              }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 20 }}>Settings</Text>
                
                {/* Change Password */}
                <Pressable
                  onPress={() => setIsChangingPassword(true)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: pressed ? '#f8fafc' : '#f1f5f9',
                    borderRadius: 20,
                    marginBottom: 16,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#5badec',
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}>
                    <Ionicons name="lock-closed" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>Change Password</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>Update your account password</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </Pressable>

                {/* Notifications */}
                <Pressable
                  onPress={() => {
                    Alert.alert('Coming Soon', 'Notifications settings will be available soon');
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: pressed ? '#f8fafc' : '#f1f5f9',
                    borderRadius: 20,
                    marginBottom: 16,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}>
                    <Ionicons name="notifications" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>Notifications</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>Manage your notification preferences</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </Pressable>

                {/* Sign Out */}
                <Pressable
                  onPress={handleSignOut}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: pressed ? '#fef2f2' : '#fef2f2',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#fecaca',
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#ef4444',
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}>
                    <Ionicons name="log-out" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626' }}>Sign Out</Text>
                    <Text style={{ fontSize: 14, color: '#ef4444', marginTop: 2 }}>Sign out of your account</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )
        )}

        {/* Password Change Section */}
        {isChangingPassword && (
          <View style={{ marginHorizontal: 20, marginTop: 24, marginBottom: 24 }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>Change Password</Text>
                <Pressable 
                  onPress={() => setIsChangingPassword(false)}
                  style={({ pressed }) => ({
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor: pressed ? '#fef2f2' : 'transparent',
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  })}
                >
                  <Ionicons name="close" size={24} color="#ef4444" />
                </Pressable>
              </View>
              
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Password</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#e2e8f0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  backgroundColor: '#f8fafc',
                }}>
                  <TextInput
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1e293b',
                      fontWeight: '500',
                    }}
                    placeholder="Enter current password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword.current}
                  />
                  <Pressable 
                    onPress={() => setShowPassword(s => ({ ...s, current: !s.current }))}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name={showPassword.current ? "eye-off" : "eye"} size={20} color="#64748b" />
                  </Pressable>
                </View>
              </View>
              
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>New Password</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#e2e8f0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  backgroundColor: '#f8fafc',
                }}>
                  <TextInput
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1e293b',
                      fontWeight: '500',
                    }}
                    placeholder="Enter new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword.new}
                  />
                  <Pressable 
                    onPress={() => setShowPassword(s => ({ ...s, new: !s.new }))}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name={showPassword.new ? "eye-off" : "eye"} size={20} color="#64748b" />
                  </Pressable>
                </View>
              </View>
              
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm New Password</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#e2e8f0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  backgroundColor: '#f8fafc',
                }}>
                  <TextInput
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1e293b',
                      fontWeight: '500',
                    }}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword.confirm}
                  />
                  <Pressable 
                    onPress={() => setShowPassword(s => ({ ...s, confirm: !s.confirm }))}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name={showPassword.confirm ? "eye-off" : "eye"} size={20} color="#64748b" />
                  </Pressable>
                </View>
              </View>
              
              <Pressable
                onPress={handlePasswordChange}
                disabled={loading}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#3b82f6' : '#5badec',
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  borderRadius: 20,
                  shadowColor: '#5badec',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 12,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700', fontSize: 18 }}>Update Password</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
        
        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
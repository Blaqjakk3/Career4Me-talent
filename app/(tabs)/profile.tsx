import { View, Text, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../context/GlobalProvider'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCurrentUser, updateUserProfile, updateUserPassword, uploadAvatar, getCareerPathById } from '../../lib/appwrite'
import * as ImagePicker from 'expo-image-picker'

// Import the new components
import ProfileHeader from '../../components/ProfileHeader'
import ProfileInfoCard from '../../components/ProfileInfoCard'
import AdditionalInfoCard from '../../components/AdditionalInfoCard'
import PasswordChangeForm from '../../components/PasswordChangeForm'
import SettingsCard from '../../components/SettingsCard'
import CareerStageModal from '../../components/CareerStageModal'

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

  interface AdditionalInfo {
    degrees: string[];
    certifications: string[];
    skills: string[];
    interests: string[];
    interestedFields: string[];
  }

  const { user, setUser, setIsLogged } = useGlobalContext(); // Remove updateUser
  const [userData, setUserData] = useState<UserData | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({
    degrees: [],
    certifications: [],
    skills: [],
    interests: [],
    interestedFields: []
  });
  const [selectedCareerPath, setSelectedCareerPath] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Edit form states
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [editedAdditionalInfo, setEditedAdditionalInfo] = useState<AdditionalInfo>({
    degrees: [],
    certifications: [],
    skills: [],
    interests: [],
    interestedFields: []
  });
  
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
        
        const mappedAdditionalInfo: AdditionalInfo = {
          degrees: currentUser.degrees || [],
          certifications: currentUser.certifications || [],
          skills: currentUser.skills || [],
          interests: currentUser.interests || [],
          interestedFields: currentUser.interestedFields || []
        }
        
        setUserData(mappedUserData)
        setAdditionalInfo(mappedAdditionalInfo)
        setEditedData(mappedUserData)
        setEditedAdditionalInfo(mappedAdditionalInfo)

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
      setEditedAdditionalInfo(additionalInfo);
    }
    setIsEditing(!isEditing);
    setShowSettings(false);
  };

  const handleSaveProfile = async () => {
    if (!editedData) return;
    
    setLoading(true);
    try {
      const result = await updateUserProfile({
        ...editedData,
        ...editedAdditionalInfo
      });
      if (result.success) {
        setUserData(editedData);
        setAdditionalInfo(editedAdditionalInfo);
        setIsEditing(false);
        setUser({ ...editedData, ...editedAdditionalInfo }); // Use setUser instead of updateUser
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

  const handleCareerStageSelect = (careerStage: string) => {
    if (editedData) {
      setEditedData({ ...editedData, careerStage });
    }
  };

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
        {/* Profile Header Component */}
        <ProfileHeader
          userData={userData}
          editedData={editedData}
          isEditing={isEditing}
          avatarUploading={avatarUploading}
          careerStages={careerStages}
          onEditToggle={handleEditToggle}
          onAvatarUpload={handleAvatarUpload}
        />

        {/* Profile Info Card Component */}
        <ProfileInfoCard
          userData={userData}
          editedData={editedData}
          isEditing={isEditing}
          careerStages={careerStages}
          selectedCareerPath={selectedCareerPath}
          onEditDataChange={setEditedData}
          onCareerStageModalOpen={() => setCareerStageModalVisible(true)}
        />

        {/* Additional Info Card Component */}
        <AdditionalInfoCard
          additionalInfo={additionalInfo}
          editedAdditionalInfo={editedAdditionalInfo}
          isEditing={isEditing}
          onEditDataChange={setEditedAdditionalInfo}
        />

        {/* Action Buttons */}
        {isEditing ? (
          <View style={{ marginHorizontal: 20, marginTop: 24, marginBottom: 24 }}>
            <Pressable
              onPress={handleSaveProfile}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#a5c8e8' : '#5badec', // Always #5badec unless disabled
                paddingVertical: 18,
                paddingHorizontal: 24,
                borderRadius: 20,
                shadowColor: '#5badec',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 12,
                opacity: loading ? 0.7 : 1,
              }}
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
            <SettingsCard
              onPasswordChange={() => setIsChangingPassword(true)}
              onSignOut={handleSignOut}
            />
          )
        )}

        {/* Password Change Form Component */}
        {isChangingPassword && (
          <PasswordChangeForm
            passwordData={passwordData}
            showPassword={showPassword}
            loading={loading}
            onPasswordDataChange={setPasswordData}
            onShowPasswordChange={setShowPassword}
            onPasswordChange={handlePasswordChange}
            onClose={() => setIsChangingPassword(false)}
          />
        )}
        
        {/* Career Stage Modal Component */}
        <CareerStageModal
          visible={careerStageModalVisible}
          careerStages={careerStages}
          selectedCareerStage={editedData.careerStage}
          onSelectCareerStage={handleCareerStageSelect}
          onClose={() => setCareerStageModalVisible(false)}
        />
        
        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
import React from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserData {
  fullname: string;
  email: string;
  avatar: string;
  careerStage: string;
  selectedPath?: string;
}

interface CareerStage {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface ProfileHeaderProps {
  userData: UserData;
  editedData: UserData;
  isEditing: boolean;
  avatarUploading: boolean;
  careerStages: CareerStage[];
  onEditToggle: () => void;
  onAvatarUpload: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  editedData,
  isEditing,
  avatarUploading,
  careerStages,
  onEditToggle,
  onAvatarUpload,
}) => {
  return (
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
          <Pressable 
            onPress={onEditToggle}
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
            <Pressable 
              onPress={isEditing ? onAvatarUpload : undefined}
              disabled={!isEditing || avatarUploading}
              style={({ pressed }) => ({
                width: 136,
                height: 136,
                borderRadius: 68,
                borderWidth: 4,
                borderColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isEditing && pressed ? 'rgba(91, 173, 236, 0.1)' : 'transparent',
                transform: [{ scale: isEditing && pressed ? 0.98 : 1 }],
              })}
            >
              <Image 
                source={{ uri: isEditing ? editedData.avatar : userData.avatar }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                }}
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
              
              {/* Edit Mode Overlay - Visual Indicator */}
              {isEditing && !avatarUploading && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(91, 173, 236, 0.15)',
                  borderRadius: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}>
                    <Ionicons name="camera" size={16} color="#5badec" style={{ marginRight: 6 }} />
                    <Text style={{ 
                      color: '#5badec', 
                      fontSize: 12, 
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      Tap to change
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
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
  );
};

export default ProfileHeader;
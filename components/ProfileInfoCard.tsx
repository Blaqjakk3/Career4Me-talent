import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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

interface ProfileInfoCardProps {
  userData: UserData;
  editedData: UserData;
  isEditing: boolean;
  careerStages: CareerStage[];
  selectedCareerPath: any;
  onEditDataChange: (data: UserData) => void;
  onCareerStageModalOpen: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  userData,
  editedData,
  isEditing,
  careerStages,
  selectedCareerPath,
  onEditDataChange,
  onCareerStageModalOpen,
}) => {
  return (
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
            onChangeText={(text) => onEditDataChange({...editedData, fullname: text})}
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
            onChangeText={(text) => onEditDataChange({...editedData, email: text})}
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
          <TouchableOpacity 
            onPress={onCareerStageModalOpen}
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
  );
};

export default ProfileInfoCard; 
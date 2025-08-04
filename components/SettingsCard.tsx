import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsCardProps {
  onPasswordChange: () => void;
  onSignOut: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  onPasswordChange,
  onSignOut,
}) => {
  return (
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
          onPress={onPasswordChange}
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
          onPress={onSignOut}
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
  );
};

export default SettingsCard; 
import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPassword {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface PasswordChangeFormProps {
  passwordData: PasswordData;
  showPassword: ShowPassword;
  loading: boolean;
  onPasswordDataChange: (data: PasswordData) => void;
  onShowPasswordChange: (showPassword: ShowPassword) => void;
  onPasswordChange: () => void;
  onClose: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  passwordData,
  showPassword,
  loading,
  onPasswordDataChange,
  onShowPasswordChange,
  onPasswordChange,
  onClose,
}) => {
  return (
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
            onPress={onClose}
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
              onChangeText={(text) => onPasswordDataChange({...passwordData, currentPassword: text})}
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
              onPress={() => onShowPasswordChange({ ...showPassword, current: !showPassword.current })}
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
              onChangeText={(text) => onPasswordDataChange({...passwordData, newPassword: text})}
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
              onPress={() => onShowPasswordChange({ ...showPassword, new: !showPassword.new })}
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
              onChangeText={(text) => onPasswordDataChange({...passwordData, confirmPassword: text})}
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
              onPress={() => onShowPasswordChange({ ...showPassword, confirm: !showPassword.confirm })}
              style={{ padding: 8 }}
            >
              <Ionicons name={showPassword.confirm ? "eye-off" : "eye"} size={20} color="#64748b" />
            </Pressable>
          </View>
        </View>
        
        <Pressable
          onPress={onPasswordChange}
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
  );
};

export default PasswordChangeForm; 
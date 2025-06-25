import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Changed import

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState = ({ message, actionText, onAction }: EmptyStateProps) => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      backgroundColor: '#f9fafb'
    }}>
      <Ionicons name="search-outline" size={56} color="#9ca3af" /> {/* Changed icon */}
      
      <Text style={{ 
        fontSize: 16,
        color: '#4b5563', 
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8
      }}>
        {message}
      </Text>
      
      {onAction && actionText && (
        <TouchableOpacity 
          style={{ 
            marginTop: 16, 
            backgroundColor: '#4f46e5', 
            paddingVertical: 8, 
            paddingHorizontal: 16, 
            borderRadius: 8 
          }}
          onPress={onAction}
        >
          <Text style={{ color: '#fff' }}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  actionText?: string;
}

const ErrorState = ({ message, onRetry, actionText = 'Try Again' }: ErrorStateProps) => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      backgroundColor: '#f9fafb'
    }}>
      <Text style={{ 
        fontSize: 16,
        color: '#ef4444', 
        textAlign: 'center',
        marginBottom: 8
      }}>
        {message}
      </Text>
      
      {onRetry && (
        <TouchableOpacity 
          style={{ 
            marginTop: 16, 
            backgroundColor: '#4f46e5', 
            paddingVertical: 8, 
            paddingHorizontal: 16, 
            borderRadius: 8 
          }}
          onPress={onRetry}
        >
          <Text style={{ color: '#fff' }}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
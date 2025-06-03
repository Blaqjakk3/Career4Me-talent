import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <ActivityIndicator size="large" color="#4f46e5" />
      
      {message && (
        <Text style={{ 
          marginTop: 12,
          fontSize: 14,
          color: '#6b7280'
        }}>
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingState;
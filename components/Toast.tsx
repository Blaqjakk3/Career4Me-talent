import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ visible, message, type, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'info';
      default:
        return 'bell';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'info':
        return '#5badec';
      default:
        return '#6B7280';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Feather name={getIconName()} size={18} color="white" />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1000,
  },
  message: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Toast;
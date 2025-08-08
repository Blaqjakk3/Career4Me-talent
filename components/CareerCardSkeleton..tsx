import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const CareerCardSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Title skeleton */}
      <Animated.View style={{
        height: 20,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 8,
        width: '70%',
        opacity: pulseAnim,
      }} />
      
      {/* Description skeleton - multiple lines */}
      <Animated.View style={{
        height: 14,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 6,
        width: '100%',
        opacity: pulseAnim,
      }} />
      <Animated.View style={{
        height: 14,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 6,
        width: '85%',
        opacity: pulseAnim,
      }} />
      <Animated.View style={{
        height: 14,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 12,
        width: '60%',
        opacity: pulseAnim,
      }} />

      {/* Skills section skeleton */}
      <View style={{ marginBottom: 8 }}>
        <Animated.View style={{
          height: 16,
          backgroundColor: '#e5e7eb',
          borderRadius: 4,
          marginBottom: 8,
          width: '30%',
          opacity: pulseAnim,
        }} />
        
        {/* Skills tags skeleton */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Animated.View style={{
            height: 24,
            backgroundColor: '#e5e7eb',
            borderRadius: 12,
            width: 80,
            opacity: pulseAnim,
          }} />
          <Animated.View style={{
            height: 24,
            backgroundColor: '#e5e7eb',
            borderRadius: 12,
            width: 100,
            opacity: pulseAnim,
          }} />
          <Animated.View style={{
            height: 24,
            backgroundColor: '#e5e7eb',
            borderRadius: 12,
            width: 70,
            opacity: pulseAnim,
          }} />
        </View>
      </View>

      {/* Bottom section with button skeleton */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 8
      }}>
        <Animated.View style={{
          height: 32,
          backgroundColor: '#e5e7eb',
          borderRadius: 8,
          width: 100,
          opacity: pulseAnim,
        }} />
        <Animated.View style={{
          height: 24,
          width: 24,
          backgroundColor: '#e5e7eb',
          borderRadius: 12,
          opacity: pulseAnim,
        }} />
      </View>
    </View>
  );
};

export default CareerCardSkeleton;
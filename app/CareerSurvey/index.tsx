import React from 'react';
import { View, StyleSheet } from 'react-native';
import CareerTestCheck from '@/components/CareerTestCheck';
import { getCurrentUser } from '@/lib/appwrite';

const CareerSurveyScreen = () => {
  return (
    <View style={styles.container}>
      <CareerTestCheck />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default CareerSurveyScreen;
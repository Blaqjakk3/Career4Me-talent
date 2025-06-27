import { View, SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import InterviewQuestions from '@/components/InterviewQuestions'
import { router } from 'expo-router';
import Header from '@/components/Header';


const handleBackPress = () => {
    router.back();
  };
const Interviewprep = () => {
  return (
     <SafeAreaView style={styles.container}>
      <Header title="Interview Practice" onBackPress={handleBackPress} />
      <View style={styles.content}>
        <InterviewQuestions />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  }
});

export default Interviewprep
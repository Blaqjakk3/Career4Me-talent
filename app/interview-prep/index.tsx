import { View, SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import InterviewPrepHeader from '@/components/InterviewPrepHeader'
import InterviewQuestions from '@/components/InterviewQuestions'
import { router } from 'expo-router';

const Interviewprep = () => {
  return (
     <SafeAreaView style={styles.container}>
      <InterviewPrepHeader onBackPress={() => router.back()} />
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
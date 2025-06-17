import { View, SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';


const TestInfoScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
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
    padding: 16,
  }
});

export default TestInfoScreen;
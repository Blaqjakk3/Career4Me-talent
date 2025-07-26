// components/CareerTestCheck.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, Button } from 'react-native';
import { getCurrentUser, runCareerMatch } from '../lib/appwrite';
import CareerTest from './CareerTest';
import CareerResults from './CareerResults';

interface Answers {
  [key: string]: string | string[];
}

const CareerTestCheck = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testTaken, setTestTaken] = useState<boolean>(false);
  const [showTest, setShowTest] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setTestTaken(currentUser?.testTaken || false);
        
        // If test was taken, try to get cached results
        if (currentUser?.testTaken) {
          // You might want to store results in user document or separate collection
          // For now, we'll just show the retake option
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleStartTest = () => {
    setResults(null); // Clear any previous results
    setShowTest(true);
  };

  const handleRetakeTest = () => {
    Alert.alert(
      "Retake Test",
      "Are you sure you want to retake the career matching test? This will replace your previous results.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Retake",
          onPress: () => {
            setResults(null);
            setShowTest(true);
          }
        }
      ]
    );
  };

  const handleTestComplete = async (answers: Answers) => {
    try {
      setLoading(true);
      console.log('Test answers:', answers); // Debug log
      
      // Pass the survey answers to the career match function
      const result = await runCareerMatch(answers);
      console.log('Career match result:', result); // Debug log
      
      if (result?.success) {
        setResults(result);
        setTestTaken(true);
        setUser((prev: any) => prev ? { ...prev, testTaken: true } : prev);
      } else {
        throw new Error(result?.error || "Failed to get results");
      }
    } catch (error: any) {
      console.error("Error completing test:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to complete test. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => handleTestComplete(answers)
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } finally {
      setLoading(false);
      setShowTest(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          Please log in to take the career matching test.
        </Text>
      </View>
    );
  }

  if (showTest) {
    return <CareerTest onComplete={handleTestComplete} careerStage={user?.careerStage} />;
  }

  if (results || testTaken) {
    return (
      <CareerResults 
        results={results} 
        onRetake={handleRetakeTest} 
        careerStage={user?.careerStage}
      />
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
        Career Matching Test
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' }}>
        Take our career matching test to discover the best career paths for you as a {user?.careerStage}.
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 30, textAlign: 'center', fontStyle: 'italic' }}>
        This will analyze your skills, interests, and experience to recommend personalized career paths.
      </Text>
      <Button title="Start Career Test" onPress={handleStartTest} />
    </View>
  );
};

export default CareerTestCheck;
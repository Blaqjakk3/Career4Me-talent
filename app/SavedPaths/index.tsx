import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // Updated import
import { router } from 'expo-router';
import CareerCard from '@/components/careerpathcard';
import { getSavedCareerPaths } from '@/lib/appwrite';
import Header from '@/components/Header';

const SavedPaths = () => {
  const [savedPaths, setSavedPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSavedPaths();
  }, []);

  const fetchSavedPaths = async () => {
    setLoading(true);
    try {
      const paths = await getSavedCareerPaths();
      setSavedPaths(paths);
    } catch (error) {
      console.error("Error fetching saved paths:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Header title="Saved Career Paths" onBackPress={handleBackPress} />
      <View style={{ padding: 16, backgroundColor: '#f9fafb' }}>
        

        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Your Saved Paths</Text>
        <Text style={{ color: '#4b5563', marginBottom: 16 }}>
          Career paths you've bookmarked for future reference.
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#5badec" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>Loading saved paths...</Text>
          </View>
        ) : savedPaths.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Feather name="bookmark" size={50} color="#9CA3AF" />
            <Text style={{ marginTop: 8, color: '#6b7280', fontWeight: '500' }}>No saved career paths</Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', maxWidth: '80%', marginTop: 4 }}>
              Bookmark career paths you're interested in to see them here
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#5badec',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginTop: 24
              }}
              onPress={() => router.push('/CareerBrowse')}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>Browse Career Paths</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {savedPaths.map((careerPath) => (
              <View key={careerPath.$id} style={{ marginBottom: 16 }}>
                <CareerCard
                  id={careerPath.$id}
                  title={careerPath.title}
                  description={careerPath.description || 'No description available'}
                  skills={careerPath.requiredSkills || []}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SavedPaths;
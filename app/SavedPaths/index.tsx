import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import CareerCard from '@/components/careerpathcard';
import { getSavedCareerPaths } from '@/lib/appwrite';
import { Feather } from '@expo/vector-icons';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ padding: 16, backgroundColor: '#f9fafb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            style={{ padding: 8, borderRadius: 9999, backgroundColor: '#f9fafb' }}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Saved Career Paths</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

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
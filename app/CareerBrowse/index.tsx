import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import CareerCard from '@/components/careerpathcard';
import { databases, Query, config } from '@/lib/appwrite';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Toast from '@/components/Toast';
import { BookmarkPlus } from 'lucide-react-native';

const CareerBrowse = () => {
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await databases.listDocuments(
          config.databaseId,
          config.careerPathsCollectionId
        );

        const uniqueIndustries = Array.from(
          new Set(response.documents.map((doc: any) => doc.industry))
        ).filter(Boolean);

        setIndustries(uniqueIndustries as string[]);
        if (uniqueIndustries.length > 0) {
          setSelectedIndustry(uniqueIndustries[0] as string);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching industries:', error);
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  useEffect(() => {
    const fetchCareerPaths = async () => {
      if (!selectedIndustry) return;

      setLoading(true);
      try {
        const response = await databases.listDocuments(
          config.databaseId,
          config.careerPathsCollectionId,
          [Query.equal('industry', selectedIndustry)]
        );

        let filteredPaths = response.documents;

        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase().trim();
          filteredPaths = filteredPaths.filter(path => {
            const titleMatch = path.title && path.title.toLowerCase().includes(searchLower);
            const skillsMatch = path.requiredSkills &&
              path.requiredSkills.some((skill: string) =>
                skill.toLowerCase().includes(searchLower)
              );
            return titleMatch || skillsMatch;
          });
        }

        setCareerPaths(filteredPaths);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching career paths:', error);
        setLoading(false);
      }
    };

    fetchCareerPaths();
  }, [selectedIndustry, searchQuery]);

  // Function to show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Function to navigate to saved paths
  const navigateToSavedPaths = () => {
    router.push('/SavedPaths');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Toast notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <View style={{ padding: 12, backgroundColor: '#f9fafb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            style={{ padding: 6, borderRadius: 9999, backgroundColor: '#f9fafb' }}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1f2937' }}>Career Browse</Text>
          </View>
          <TouchableOpacity
            style={{ padding: 6, borderRadius: 9999, backgroundColor: '#f9fafb' }}
            onPress={navigateToSavedPaths}
            accessibilityLabel="View saved paths"
          >
            <BookmarkPlus size={20} color="#5badec" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>Career Paths</Text>
        <Text style={{ color: '#4b5563', marginBottom: 10, fontSize: 13 }}>
          Browse and save career paths. Pick the ONE you want to pursue.
          Want tailored options? Take our career survey!
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 8, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1 }}>
            <TextInput
              style={{ flex: 1, color: '#374151', marginRight: 8, fontSize: 13 }}
              placeholder="Search by title or skill..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => { }}>
              <Feather name="search" size={18} color="#5badec" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: '#5badec', borderRadius: 8, paddingHorizontal: 10, justifyContent: 'center' }}
            onPress={() => router.push('/CareerSurvey')}
          >
            <Text style={{ color: 'white', fontWeight: '500', fontSize: 13 }}>Take Survey</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ backgroundColor: '#f9fafb', paddingHorizontal: 12, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 12 }}
        >
          {industries.map((industry, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIndustry(industry)}
              style={{
                marginRight: 10,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 9999,
                backgroundColor: selectedIndustry === industry ? '#5badec' : '#e5e7eb'
              }}
            >
              <Text style={{
                fontWeight: '500',
                fontSize: 13,
                color: selectedIndustry === industry ? 'white' : '#4b5563'
              }}>
                {industry}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#5badec" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>Loading career paths...</Text>
          </View>
        ) : careerPaths.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
            <MaterialIcons name="search-off" size={50} color="#9CA3AF" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>No career paths found</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {careerPaths.map((careerPath) => (
              <View key={careerPath.$id} style={{ marginBottom: 12 }}>
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

export default CareerBrowse;
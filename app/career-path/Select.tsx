import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CareerPathCard from '@/components/CareerCard';
import Header from '@/components/Header';

const handleBackPress = () => {
    router.replace('/dashboard');
  };
const CareerDiscovery: React.FC = () => {
  return (
    <View className="flex-1 bg-white ">
     
      <Header title="Career Discovery" onBackPress={handleBackPress} />

      {/* Screen Content */}
      <View className="p-4">
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-800">Discover Your</Text>
          <Text className="text-3xl font-bold text-[#5badec]">Perfect Career</Text>
        </View>
        
        <Text className="text-base text-gray-600 mb-6">
          Explore career paths that match your skills, interests, and aspirations.
        </Text>
        
        {/* Career Cards */}
        <View className="space-y-4">
          {/* Card 1: Select Your Own Career Path */}
          <CareerPathCard
            icon={<Ionicons name="list-outline" size={24} color="#333" />}
            title="Take the Career Survey"
            description="Answer a few questions to get personalized career recommendations"
            buttonText="Start Survey"
            onButtonPress={() => router.push('/CareerSurvey')}
          />
          
          {/* Divider with "or" */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-0.5 bg-gray-200" />
            <Text className="mx-4 text-gray-500 font-medium">or</Text>
            <View className="flex-1 h-0.5 bg-gray-200" />
          </View>
          
          {/* Card 2: Take the Career Survey */}
          <CareerPathCard
            icon={<Ionicons name="compass-outline" size={24} color="#333" />}
            title="Select Your Own Career Path"
            description="Browse through different industries and career paths to find what interests you most"
            buttonText="Browse Career Paths"
            onButtonPress={() => router.push('/CareerBrowse')}
          />
        </View>
      </View>
    </View>
  );
};

export default CareerDiscovery;
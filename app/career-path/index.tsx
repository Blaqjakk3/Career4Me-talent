import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { ArrowLeft, Compass, ClipboardList } from 'lucide-react-native';
import { router } from 'expo-router';
import CareerPathCard from '@/components/CareerCard';

const CareerDiscovery: React.FC = () => {
  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity 
          className="p-2 rounded-full bg-gray-50" 
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-800">Career Discovery</Text>
        </View>
        <View style={{ width: 40 }}>{/* Spacer for balanced layout */}</View>
      </View>

      {/* Screen Content */}
      <View className="px-2">
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
            icon={<Compass size={24} color="#333" />}
            title="Select Your Own Career Path"
            description="Browse through different industries and career paths to find what interests you most"
            buttonText="Browse Career Paths"
            onButtonPress={() => router.push('/CareerBrowse')}
          />
          
          {/* Divider with "or" */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-0.5 bg-gray-200" />
            <Text className="mx-4 text-gray-500 font-medium">or</Text>
            <View className="flex-1 h-0.5 bg-gray-200" />
          </View>
          
          {/* Card 2: Take the Career Survey */}
          <CareerPathCard
            icon={<ClipboardList size={24} color="#333" />}
            title="Take the Career Survey"
            description="Answer a few questions to get personalized career recommendations"
            buttonText="Start Survey"
            onButtonPress={() => router.push('/CareerSurvey')}
          />
        </View>
      </View>
    </View>
  );
};

export default CareerDiscovery;
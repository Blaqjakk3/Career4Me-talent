import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Changed import

interface SelectedItemsListProps {
  title: string;
  items: string[];
  onRemove: (item: string) => void;
}

const SelectedItemsList: React.FC<SelectedItemsListProps> = ({ 
  title, 
  items, 
  onRemove 
}) => {
  if (!items || items.length === 0) return null;
  
  return (
    <View className="mb-4">
      <Text className="font-semibold text-gray-700 mb-2">{title}:</Text>
      <View className="flex-row flex-wrap">
        {items.map((item, index) => (
          <View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
            <Text className="text-blue-800">{item}</Text>
            <TouchableOpacity onPress={() => onRemove(item)} className="ml-1">
              <Ionicons name="close" size={16} color="#1e40af" /> {/* Changed icon */}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SelectedItemsList;
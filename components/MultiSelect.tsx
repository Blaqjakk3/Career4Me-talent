import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface MultiSelectProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  title, 
  items, 
  selectedItems, 
  onToggleItem 
}) => {
  return (
    <View className="mb-4">
      <Text className="font-semibold text-gray-700 mb-2">{title}:</Text>
      <View className="flex-row flex-wrap">
        {items.map((item, index) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity
              key={index}
              className={`rounded-full px-3 py-1 mr-2 mb-2 ${
                isSelected ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onPress={() => onToggleItem(item)}
            >
              <Text className={isSelected ? 'text-white' : 'text-gray-800'}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MultiSelect;
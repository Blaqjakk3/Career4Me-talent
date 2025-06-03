import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface ModalSelectorButtonProps {
  title: string;
  selectedItems: string[];
  onPress: () => void;
}

const ModalSelectorButton: React.FC<ModalSelectorButtonProps> = ({
  title,
  selectedItems,
  onPress
}) => {
  return (
    <View className="mb-4">
      <Text className="font-semibold text-gray-700 mb-2">{title}:</Text>
      
      <TouchableOpacity
        className="flex-row justify-between items-center border border-gray-200 rounded-lg p-3 bg-white"
        onPress={onPress}
      >
        <View className="flex-1">
          {selectedItems.length === 0 ? (
            <Text className="text-gray-500">Select {title.toLowerCase()}</Text>
          ) : (
            <View>
              <Text className="text-gray-900 font-medium">
                {selectedItems.length} selected
              </Text>
              
              {/* Preview of selected items */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mt-1"
              >
                <View className="flex-row">
                  {selectedItems.slice(0, 3).map((item, index) => (
                    <View 
                      key={index} 
                      className="bg-blue-100 rounded-full px-2 py-1 mr-2"
                    >
                      <Text className="text-blue-800 text-sm">{item}</Text>
                    </View>
                  ))}
                  {selectedItems.length > 3 && (
                    <View className="justify-center">
                      <Text className="text-gray-500 text-sm">
                        +{selectedItems.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
        <ChevronRight size={20} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
};

export default ModalSelectorButton;
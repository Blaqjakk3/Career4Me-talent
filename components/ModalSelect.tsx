import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  SafeAreaView,
  TextInput
} from 'react-native';
import { X, Search, Check, CheckCircle } from 'lucide-react-native';

interface ModalSelectProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  onClose: () => void;
  visible: boolean;
  singleSelect?: boolean; // New prop for single selection mode
}

const ModalSelect: React.FC<ModalSelectProps> = ({
  title,
  items,
  selectedItems,
  onToggleItem,
  onClose,
  visible,
  singleSelect = false // Default to multi-select mode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredItems = searchQuery.trim() === '' 
    ? items 
    : items.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle item selection based on mode
  const handleItemPress = (item: string) => {
    onToggleItem(item);
    // For single select, close the modal after selection
    if (singleSelect) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
            <TouchableOpacity 
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100"
            >
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
            <Search size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder={`Search ${title.toLowerCase()}`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Count - Hide for single select when nothing is selected */}
          {(!singleSelect || selectedItems.length > 0) && (
            <Text className="text-gray-600 mb-2">
              {singleSelect 
                ? selectedItems.length > 0 ? "Currently selected" : ""
                : `${selectedItems.length} selected`
              }
            </Text>
          )}

          {/* Items List */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedItems.includes(item);
              return (
                <TouchableOpacity 
                  className={`flex-row justify-between items-center p-3 border-b border-gray-100 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onPress={() => handleItemPress(item)}
                >
                  <Text className={`text-base ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-800'}`}>
                    {item}
                  </Text>
                  {isSelected && (
                    singleSelect ? (
                      <CheckCircle size={20} color="#2563eb" />
                    ) : (
                      <Check size={20} color="#2563eb" />
                    )
                  )}
                </TouchableOpacity>
              );
            }}
          />

          {/* Done Button - Only show for multi-select mode */}
          {!singleSelect && (
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-3 items-center mt-4"
              onPress={onClose}
            >
              <Text className="text-white font-semibold text-lg">Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ModalSelect;
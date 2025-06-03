import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, Platform } from 'react-native';
import { Plus, Search } from 'lucide-react-native';

interface AutoCompleteProps {
  items: string[];
  onAdd: (item: string) => void;
  placeholder: string;
  inputValue: string;
  setInputValue: (value: string) => void;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  items,
  onAdd,
  placeholder,
  inputValue,
  setInputValue
}) => {
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (inputValue) {
      // Get more relevant matches first
      const filtered = items
        .filter(item => item.toLowerCase().includes(inputValue.toLowerCase()))
        .sort((a, b) => {
          // Sort by whether it starts with the input (more relevant) then by length
          const aStartsWith = a.toLowerCase().startsWith(inputValue.toLowerCase());
          const bStartsWith = b.toLowerCase().startsWith(inputValue.toLowerCase());
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.length - b.length; // Shorter items first
        });
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [inputValue, items]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleItemSelect = (item: string) => {
    // Cancel any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    // Immediately add the item
    onAdd(item);
    setInputValue('');
    Keyboard.dismiss();
    
    // Maintain focus state for a moment to ensure the selection completes
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  };

  return (
    <View className="mb-4 relative">
      <View className="flex-row items-center border border-gray-300 rounded-lg p-2 bg-white">
        <Search size={18} color="#6b7280" />
        <TextInput
          ref={inputRef}
          className="flex-1 ml-2 text-base text-gray-800"
          placeholder={placeholder}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Use a ref to store the timeout so we can cancel it if needed
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
              blurTimeoutRef.current = null;
            }, 200);
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (inputValue.trim()) {
              onAdd(inputValue.trim());
              setInputValue('');
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }
          }}
        >
          <Plus size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      
      {isFocused && filteredItems.length > 0 && (
        <View className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-lg z-10 shadow-md">
          <ScrollView keyboardShouldPersistTaps="always">
            {filteredItems.slice(0, 2).map((item, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 border-b border-gray-200 bg-white active:bg-blue-50"
                onPress={() => handleItemSelect(item)}
                activeOpacity={0.6}
              >
                <Text className="text-gray-800">{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      
      {isFocused && inputValue && filteredItems.length === 0 && (
        <View className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-lg z-10 shadow-md">
          <View className="p-3">
            <Text className="text-gray-500 italic">No matches found</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default AutoComplete;
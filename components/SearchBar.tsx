import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
};

const SearchBar = ({ 
  value, 
  onChangeText, 
  onClear, 
  placeholder = 'Search for jobs, employers, or skills' 
}: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <X size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
import React from 'react'
import { View, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (text: string) => void
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search by job title, employer, or skills" 
}) => {
  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }}>
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 16 }}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  )
})

export default SearchBar
import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface TabButtonProps {
  title: string
  count: number
  isActive: boolean
  onPress: () => void
}

const TabButton: React.FC<TabButtonProps> = React.memo(({ 
  title, 
  count, 
  isActive, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: isActive ? '#5badec' : 'transparent',
        marginHorizontal: 4,
      }}
      onPress={onPress}
    >
      <Text style={{
        fontSize: 15,
        fontWeight: '700',
        color: isActive ? 'white' : '#6b7280'
      }}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  )
})

export default TabButton 
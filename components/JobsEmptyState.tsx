import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

interface JobsEmptyStateProps {
  type: 'no-jobs' | 'no-saved-paths' | 'loading'
  title: string
  subtitle: string
  icon: string
}

const JobsEmptyState: React.FC<JobsEmptyStateProps> = React.memo(({ 
  type, 
  title, 
  subtitle, 
  icon 
}) => {
  const renderIcon = () => {
    if (type === 'loading') {
      return <ActivityIndicator size="large" color="#5badec" />
    }

    const iconColor = "#5badec"
    const iconSize = 32

    switch (icon) {
      case 'briefcase':
        return <Ionicons name="briefcase-outline" size={iconSize} color={iconColor} />
      case 'bookmark':
        return <MaterialCommunityIcons name="bookmark-check-outline" size={iconSize} color={iconColor} />
      default:
        return <Ionicons name="briefcase-outline" size={iconSize} color={iconColor} />
    }
  }

  if (type === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 8,
        }}>
          {renderIcon()}
          <Text style={{
            marginTop: 16,
            fontSize: 16,
            color: '#6b7280',
            fontWeight: '500'
          }}>Loading opportunities...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
      }}>
        <View style={{
          backgroundColor: '#dbeafe',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16
        }}>
          {renderIcon()}
        </View>
        <Text style={{ fontSize: 18, color: '#111827', fontWeight: '700', textAlign: 'center' }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
          {subtitle}
        </Text>
      </View>
    </View>
  )
})

export default JobsEmptyState 
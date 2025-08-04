import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SavedPathSection as SavedPathSectionType, Employer } from '../types/jobs'
import JobCard from './JobCard'

interface SavedPathSectionProps {
  item: SavedPathSectionType
  onToggle: (pathId: string) => void
  employers: Record<string, Employer>
  onJobPress: (jobId: string) => void
}

const SavedPathSection: React.FC<SavedPathSectionProps> = React.memo(({ 
  item, 
  onToggle, 
  employers, 
  onJobPress 
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeftWidth: 4,
          borderLeftColor: '#5badec',
        }}
        onPress={() => onToggle(item.pathId)}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: 4
          }}>
            {item.pathTitle}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '500' }}>
            {item.jobs.length} job{item.jobs.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        {item.isExpanded ? (
          <Ionicons name="chevron-down" size={24} color="#5badec" />
        ) : (
          <Ionicons name="chevron-forward" size={24} color="#5badec" />
        )}
      </TouchableOpacity>

      {item.isExpanded && (
        <View style={{ marginTop: 16 }}>
          {item.jobs.length > 0 ? (
            item.jobs.map((job) => (
              <View key={job.$id}>
                <JobCard 
                  item={job} 
                  employers={employers} 
                  onPress={onJobPress} 
                />
              </View>
            ))
          ) : (
            <View style={{ 
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                No available jobs for this path
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
})

export default SavedPathSection 
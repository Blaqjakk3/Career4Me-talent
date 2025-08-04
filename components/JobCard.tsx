import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5 
} from '@expo/vector-icons'
import { Job, Employer } from '../types/jobs'

interface InfoPillProps {
  icon: React.ReactNode
  text: string
  variant?: 'primary' | 'secondary' | 'accent'
}

const InfoPill: React.FC<InfoPillProps> = ({ icon, text, variant = 'primary' }) => {
  const getColors = () => {
    switch (variant) {
      case 'secondary': return { bg: '#10b981', text: 'white' }
      case 'accent': return { bg: '#f59e0b', text: 'white' }
      default: return { bg: '#5badec', text: 'white' }
    }
  }

  const colors = getColors()

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 4,
      marginBottom: 4,
      shadowColor: colors.bg,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    }}>
      {icon}
      <Text style={{ 
        marginLeft: 3, 
        fontSize: 11, 
        color: colors.text,
        fontWeight: '600'
      }}>{text}</Text>
    </View>
  )
}

interface JobCardProps {
  item: Job
  employers: Record<string, Employer>
  onPress: (jobId: string) => void
}

const JobCard: React.FC<JobCardProps> = React.memo(({ item, employers, onPress }) => {
  const employer = employers[item.employer] || {}

  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 3,
        borderLeftColor: '#5badec',
      }}
      onPress={() => onPress(item.$id)}
    >
      {/* Header with company logo and job title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Image
          source={{ uri: employer.avatar || 'https://via.placeholder.com/40' }}
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#f3f4f6'
          }}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: 2
          }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 13, color: '#5badec', fontWeight: '600' }}>
            {employer.name}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4
      }}>
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text style={{ 
          marginLeft: 6, 
          fontSize: 13, 
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {item.location}
        </Text>
      </View>

      {/* Job details pills - more compact */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        <InfoPill 
          icon={<Ionicons name="time-outline" size={12} color="white" />} 
          text={item.jobtype} 
          variant="primary"
        />
        <InfoPill 
          icon={<FontAwesome5 name="building" size={12} color="white" />} 
          text={item.workenvironment}
          variant="secondary"
        />
        <InfoPill 
          icon={<MaterialCommunityIcons name="medal-outline" size={12} color="white" />} 
          text={item.seniorityLevel}
          variant="accent"
        />
        {item.industry && (
          <InfoPill 
            icon={<Ionicons name="briefcase-outline" size={12} color="white" />} 
            text={item.industry}
            variant="primary"
          />
        )}
      </View>
    </TouchableOpacity>
  )
})

export default JobCard 
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// JobCard component to display individual job listings
const JobCard = ({ job, onPress }) => {
  // Generate avatar initials if no logo is provided
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Employer Logo/Avatar */}
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 8,
            backgroundColor: '#4f46e5',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          {job.employerAvatar ? (
            <Image
              source={{ uri: job.employerAvatar }}
              style={{ width: 50, height: 50, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {getInitials(job.employer || 'Company')}
            </Text>
          )}
        </View>

        {/* Job Information */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>
            {job.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 6 }}>
            {job.employerName || 'Company'}
          </Text>

          {/* Job Details Row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {/* Location */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 }}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                {job.location || 'Remote'}
              </Text>
            </View>

            {/* Job Type */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 }}>
              <Ionicons name="briefcase-outline" size={14} color="#6b7280" />
              <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                {job.jobtype || 'Full-time'}
              </Text>
            </View>

            {/* Seniority Level */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="bar-chart-outline" size={14} color="#6b7280" />
              <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                {job.senirorityLevel || 'Entry-Level'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default JobCard;
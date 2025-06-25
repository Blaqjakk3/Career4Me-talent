import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { avatars } from '@/lib/appwrite';
import SkillTags from './SkillTags';

type JobCardProps = {
  job: {
    $id: string;
    name: string;
    location: string;
    jobType: string;
    seniorityLevel: string;
    employer: string;
    employerName?: string;
    employerAvatar?: string;
    skills?: string[];
  };
  onPress?: () => void;
};

const JobCard = ({ job, onPress }: JobCardProps) => {
  // Function to get job type icon
  const getJobTypeIcon = () => {
    switch (job.jobType) {
      case 'Full-time':
        return <Ionicons name="time-outline" size={16} color="#4b5563" />;
      case 'Internship':
        return <Ionicons name="briefcase-outline" size={16} color="#4b5563" />;
      case 'Contract':
        return <Ionicons name="briefcase-outline" size={16} color="#4b5563" />;
      case 'Part-time':
        return <Ionicons name="time-outline" size={16} color="#4b5563" />;
      default:
        return <Ionicons name="time-outline" size={16} color="#4b5563" />;
    }
  };

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/jobs/jobsdetails/[id]',
        params: { id: job.$id }
      });
    }
  };

  // Get avatar placeholder if no employer avatar
  const avatarUrl = job.employerAvatar || 
    (job.employerName ? avatars.getInitials(job.employerName).toString() : '');

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatar} 
        />
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.name}</Text>
          <Text style={styles.companyName} numberOfLines={1}>{job.employerName || 'Loading...'}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#4b5563" />
          <Text style={styles.detailText} numberOfLines={1}>{job.location}</Text>
        </View>

        <View style={styles.detailItem}>
          {getJobTypeIcon()}
          <Text style={styles.detailText}>{job.jobType}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="business-outline" size={16} color="#4b5563" />
          <Text style={styles.detailText}>{job.seniorityLevel}</Text>
        </View>
      </View>
      
      {job.skills && job.skills.length > 0 && (
        <SkillTags skills={job.skills} limit={3} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  titleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#4b5563',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
});

export default JobCard;
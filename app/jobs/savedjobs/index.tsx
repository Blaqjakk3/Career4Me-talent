import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { 
  Ionicons, 
  Feather, 
  MaterialCommunityIcons 
} from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  getSavedJobs,
  saveJob,
  databases,
  config,
  Query
} from '../../../lib/appwrite'
import Header from '@/components/Header'

// Define types
type Job = {
  $id: string
  name: string
  location: string
  jobtype: string
  workenvironment: string
  seniorityLevel: string
  applylink: string
  employer: string
  relatedpaths: string[]
  skills?: string[]
  numViews?: number
  numClicks?: number
  description?: string
  responsibilities?: string
  industry?: string
  dateofUpload?: string
}

type Employer = {
  employerId: string
  name: string
  avatar?: string
}

const SavedJobs = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [employers, setEmployers] = useState<Record<string, Employer>>({})
  const [removingJobId, setRemovingJobId] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    try {
      setLoading(true)
      const jobs = await getSavedJobs()
      // Map Document[] to Job[]
      const mappedJobs: Job[] = jobs.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        location: doc.location,
        jobtype: doc.jobtype,
        workenvironment: doc.workenvironment,
        seniorityLevel: doc.seniorityLevel,
        applylink: doc.applylink,
        employer: doc.employer,
        relatedpaths: doc.relatedpaths,
        skills: doc.skills,
        numViews: doc.numViews,
        numClicks: doc.numClicks,
        description: doc.description,
        responsibilities: doc.responsibilities,
        industry: doc.industry,
        dateofUpload: doc.dateofUpload
      }))
      setSavedJobs(mappedJobs)
      
      if (mappedJobs.length > 0) {
        await fetchEmployersData(mappedJobs)
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      Alert.alert('Error', 'Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployersData = async (jobs: Job[]) => {
    try {
      const employerIds = [...new Set(jobs.map(job => job.employer))]
      
      const employersResponse = await databases.listDocuments(
        config.databaseId,
        config.employersCollectionId,
        [Query.equal('employerId', employerIds)]
      )

      const employersMap: Record<string, Employer> = {}
      employersResponse.documents.forEach(employer => {
        employersMap[employer.employerId] = {
          employerId: employer.employerId,
          name: employer.name,
          avatar: employer.avatar
        }
      })

      setEmployers(employersMap)
    } catch (error) {
      console.error('Error fetching employers:', error)
    }
  }

  const handleBackPress = () => {
    router.back();
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      setRemovingJobId(jobId)
      const result = await saveJob(jobId) // This will toggle/remove the job from saved
      
      if (result.success) {
        // Refresh the saved jobs list
        await fetchSavedJobs()
      } else {
        Alert.alert('Error', 'Failed to remove job from saved list')
      }
    } catch (error) {
      console.error('Error removing saved job:', error)
      Alert.alert('Error', 'Failed to remove job from saved list')
    } finally {
      setRemovingJobId(null)
    }
  }

  const navigateToJobDetails = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`)
  }

  const renderJobItem = ({ item }: { item: Job }) => {
    const employer = employers[item.employer] || {}
    const isRemoving = removingJobId === item.$id

    return (
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          opacity: isRemoving ? 0.5 : 1
        }}
        onPress={() => navigateToJobDetails(item.$id)}
        disabled={isRemoving}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Image
            source={{ uri: employer.avatar || 'https://via.placeholder.com/40' }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>
              {employer.name}
            </Text>
          </View>
          
          {/* Unsave Button */}
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#fee2e2'
            }}
            onPress={() => handleUnsaveJob(item.$id)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Feather name="bookmark" size={20} color="#dc2626" />
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Feather name="map-pin" size={16} color="#6b7280" />
          <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280' }}>
            {item.location}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <InfoPill icon={<Feather name="clock" size={14} color="#6b7280" />} text={item.jobtype} />
          <InfoPill icon={<Feather name="briefcase" size={14} color="#6b7280" />} text={item.workenvironment} />
          <InfoPill icon={<Feather name="award" size={14} color="#6b7280" />} text={item.seniorityLevel} />
        </View>

        {/* Date saved (if available) */}
        {item.dateofUpload && (
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Posted: {new Date(item.dateofUpload).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  const InfoPill = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 8
    }}>
      {icon}
      <Text style={{ marginLeft: 4, fontSize: 12, color: '#6b7280' }}>{text}</Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
     <Header title="Saved Jobs" onBackPress={handleBackPress} />
      <View style={{ padding: 16, backgroundColor: '#f9fafb' }}>
        {/* Job count */}
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#6b7280' }}>
            Loading saved jobs...
          </Text>
        </View>
      ) : savedJobs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginTop: 16, textAlign: 'center' }}>
            No Saved Jobs Yet
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            Start exploring job opportunities and save the ones that interest you. They'll appear here for easy access.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#4f46e5',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 24
            }}
            onPress={() => router.push('/jobs')}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Explore Jobs
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchSavedJobs}
        />
      )}
    </SafeAreaView>
  )
}

export default SavedJobs
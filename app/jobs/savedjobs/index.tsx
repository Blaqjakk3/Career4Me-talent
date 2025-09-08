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
// Type definition for the Job object.
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

// Type definition for the Employer object, containing only the fields needed for this screen.
type Employer = {
  employerId: string
  name: string
  avatar?: string
}

/**
 * SavedJobs Screen
 * This component displays a list of all jobs that the user has saved.
 * It allows users to view the details of a saved job or remove it from their saved list.
 */
const SavedJobs = () => {
  // State to manage loading status while fetching data.
  const [loading, setLoading] = useState<boolean>(true)
  // State to store the array of saved job objects.
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  // State to store employer data as a key-value map for efficient lookups.
  const [employers, setEmployers] = useState<Record<string, Employer>>({})
  // State to track the ID of the job currently being removed, to show a specific loading state.
  const [removingJobId, setRemovingJobId] = useState<string | null>(null)

  // useEffect hook to fetch the saved jobs when the component mounts.
  useEffect(() => {
    fetchSavedJobs()
  }, [])

  // Fetches the list of saved jobs for the current user from the Appwrite backend.
  const fetchSavedJobs = async () => {
    try {
      setLoading(true)
      const jobs = await getSavedJobs()
      // Map Document[] to Job[]
      // Map the raw Appwrite Document[] to our strongly-typed Job[] array.
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
      
      // If jobs were found, fetch the associated employer data.
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

  // Fetches data for all employers associated with the saved jobs in a single batch request.
  const fetchEmployersData = async (jobs: Job[]) => {
    try {
      // Create a unique set of employer IDs to avoid duplicate fetches.
      const employerIds = [...new Set(jobs.map(job => job.employer))]
      
      const employersResponse = await databases.listDocuments(
        config.databaseId,
        config.employersCollectionId,
        // Use a 'Query.equal' with an array of IDs to get multiple documents at once.
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

  // Navigates back to the previous screen.
  const handleBackPress = () => {
    router.back();
  };

  // Handles the action of unsaving a job.
  const handleUnsaveJob = async (jobId: string) => {
    try {
      setRemovingJobId(jobId)
      const result = await saveJob(jobId) // This will toggle/remove the job from saved
      // The `saveJob` function in appwrite.js toggles the saved state.
      const result = await saveJob(jobId)
      
      if (result.success) {
        // Refresh the saved jobs list
        // If successful, refresh the entire list to reflect the change.
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

  // Navigates to the job details page for the selected job.
  const navigateToJobDetails = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`)
  }

  /**
   * Renders a single saved job item in the FlatList.
   * Each item is a card showing job and employer info, with an "unsave" button.
   */
  const renderJobItem = ({ item }: { item: Job }) => {
    const employer = employers[item.employer] || {}
    const employer = employers[item.employer] || {} // Safely access employer data.
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
        {/* Job Header: Employer avatar, job title, and employer name */}
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
          {/* Unsave Button with a loading indicator */}
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

        {/* Job Location */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Feather name="map-pin" size={16} color="#6b7280" />
          <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280' }}>
            {item.location}
          </Text>
        </View>

        {/* Job Info Pills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <InfoPill icon={<Feather name="clock" size={14} color="#6b7280" />} text={item.jobtype} />
          <InfoPill icon={<Feather name="briefcase" size={14} color="#6b7280" />} text={item.workenvironment} />
          <InfoPill icon={<Feather name="award" size={14} color="#6b7280" />} text={item.seniorityLevel} />
        </View>

        {/* Date saved (if available) */}
        {/* Date Posted */}
        {item.dateofUpload && (
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Posted: {new Date(item.dateofUpload).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  /**
   * InfoPill Component
   * A small, styled pill to display job attributes.
   */
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
     {/* Page Header */}
     <Header title="Saved Jobs" onBackPress={handleBackPress} />
      <View style={{ padding: 16, backgroundColor: '#f9fafb' }}>
        {/* Job count */}
        {/* Display the total count of saved jobs. */}
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        // Loading state indicator.
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#6b7280' }}>
            Loading saved jobs...
          </Text>
        </View>
        // Empty state component shown when there are no saved jobs.
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
        // FlatList to render the list of saved jobs.
        <FlatList
          data={savedJobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          // Enable pull-to-refresh functionality.
          refreshing={loading}
          onRefresh={fetchSavedJobs}
        />
      )}
    </SafeAreaView>
  )
}

export default SavedJobs
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native'
import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Search,
  MapPin,
  Building2,
  Clock,
  Award
} from 'lucide-react-native'
import { router } from 'expo-router'
import {
  config,
  databases,
  getCurrentUser,
  Query
} from '../../lib/appwrite'
import debounce from 'lodash/debounce'

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
}

type Employer = {
  employerId: string
  name: string
  avatar?: string
}

type CareerPath = {
  $id: string
  title: string
}

type User = {
  $id: string
  selectedPath?: string
}

const Jobs = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [employers, setEmployers] = useState<Record<string, Employer>>({})

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)

      const user: User | null = await getCurrentUser()
      if (!user?.selectedPath) {
        setLoading(false)
        return
      }

      const selectedPath = await databases.getDocument<CareerPath>(
        config.databaseId,
        config.careerPathsCollectionId,
        user.selectedPath
      )

      if (!selectedPath) {
        setLoading(false)
        return
      }

      const jobsData = await databases.listDocuments<Job>(
        config.databaseId,
        config.jobsCollectionId,
        [Query.search('relatedpaths', selectedPath.title)]
      )

      if (jobsData.documents.length > 0) {
        const employerIds = [...new Set(jobsData.documents.map(job => job.employer))]
        const employersData: Record<string, Employer> = {}

        const employersResponse = await databases.listDocuments<Employer>(
          config.databaseId,
          config.employersCollectionId,
          [Query.equal('employerId', employerIds)]
        )

        employersResponse.documents.forEach(employer => {
          employersData[employer.employerId] = employer
        })

        setEmployers(employersData)

        const updatedJobs = await Promise.all(
          jobsData.documents.map(async job => {
            const updatedJob = await incrementJobViews(job.$id, job.numViews || 0)
            return updatedJob ?? job
          })
        )

        setJobs(updatedJobs)
        setFilteredJobs(updatedJobs)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setLoading(false)
    }
  }

  const incrementJobViews = async (jobId: string, currentViews: number) => {
    try {
      const updatedJob = await databases.updateDocument<Job>(
        config.databaseId,
        config.jobsCollectionId,
        jobId,
        {
          numViews: currentViews + 1
        }
      )
      return updatedJob
    } catch (error) {
      console.error('Error incrementing job views:', error)
      return null
    }
  }

  const handleSearch = debounce((text: string) => {
    if (!text) {
      setFilteredJobs(jobs)
      return
    }

    const query = text.toLowerCase()
    const filtered = jobs.filter(job => {
      const nameMatch = job.name?.toLowerCase().includes(query)
      const employerMatch = employers[job.employer]?.name?.toLowerCase().includes(query)
      const skillsMatch = job.skills?.some(skill => skill.toLowerCase().includes(query))

      return nameMatch || employerMatch || skillsMatch
    })

    setFilteredJobs(filtered)
  }, 300)

  const onSearchChange = (text: string) => {
    setSearchQuery(text)
    handleSearch(text)
  }

  const navigateToJobDetails = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`)
  }

  const renderJobItem = ({ item }: { item: Job }) => {
    const employer = employers[item.employer] || {}

    return (
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2
        }}
        onPress={() => navigateToJobDetails(item.$id)}
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
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <MapPin size={16} color="#6b7280" />
          <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280' }}>
            {item.location}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <InfoPill icon={<Clock size={14} color="#6b7280" />} text={item.jobtype} />
          <InfoPill icon={<Building2 size={14} color="#6b7280" />} text={item.workenvironment} />
          <InfoPill icon={<Award size={14} color="#6b7280" />} text={item.seniorityLevel} />
        </View>
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
      <View style={{ padding: 12, backgroundColor: '#f9fafb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            style={{ padding: 6, borderRadius: 9999, backgroundColor: '#f9fafb' }}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1f2937' }}>
              Job Opportunities
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1
        }}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 }}
            placeholder="Search by job title, employer, or skills"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : filteredJobs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
            No job opportunities found matching your career path.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

export default Jobs
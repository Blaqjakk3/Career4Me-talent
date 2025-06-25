import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  MaterialIcons 
} from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  config,
  databases,
  getCurrentUser,
  Query
} from '../../lib/appwrite'
import debounce from 'lodash/debounce'

// Types
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
  viewers?: string[]
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
  savedPaths?: string[]
  careerStage: string
  currentSeniorityLevel?: string
  interestedFields?: string[]
}

type SavedPathSection = {
  pathId: string
  pathTitle: string
  jobs: Job[]
  isExpanded: boolean
}

// Job matching logic
const getIntelligentJobMatches = (userTalent: User, allJobs: Job[], pathTitle: string) => {
  if (!userTalent.careerStage) return allJobs

  const filteredJobs = allJobs.filter(job => {
    return job.relatedpaths?.some(path => 
      path.toLowerCase().includes(pathTitle.toLowerCase())
    )
  })

  return filteredJobs.sort((a, b) => {
    // Simple sorting by job type priority and date
    const getJobTypePriority = (jobType: string) => {
      const priorities = { 'Internship': 1, 'Contract': 2, 'Full Time': 3, 'Part Time': 4 }
      return priorities[jobType] || 5
    }

    const priorityDiff = getJobTypePriority(a.jobtype) - getJobTypePriority(b.jobtype)
    if (priorityDiff !== 0) return priorityDiff

    // Sort by upload date if available
    if (a.dateofUpload && b.dateofUpload) {
      return new Date(b.dateofUpload).getTime() - new Date(a.dateofUpload).getTime()
    }

    return (b.numViews || 0) - (a.numViews || 0)
  })
}

const Jobs = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'selected' | 'saved'>('selected')
  const [selectedPathJobs, setSelectedPathJobs] = useState<Job[]>([])
  const [savedPathSections, setSavedPathSections] = useState<SavedPathSection[]>([])
  const [filteredSelectedJobs, setFilteredSelectedJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [employers, setEmployers] = useState<Record<string, Employer>>({})
  const [selectedPathTitle, setSelectedPathTitle] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [savedPathsLoaded, setSavedPathsLoaded] = useState<boolean>(false)
  const [viewedJobs, setViewedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSelectedPathJobs()
  }, [])

  // Job view tracking
  const trackJobView = async (job: Job, userId: string) => {
    try {
      const currentViewers = job.viewers || []
      if (!currentViewers.includes(userId)) {
        const updatedViewers = [...currentViewers, userId]
        await databases.updateDocument<Job>(
          config.databaseId,
          config.jobsCollectionId,
          job.$id,
          {
            viewers: updatedViewers,
            numViews: updatedViewers.length
          }
        )
      }
    } catch (error) {
      console.error('Error tracking job view:', error)
    }
  }

  const batchTrackJobViews = async (jobs: Job[], userId: string) => {
    for (const job of jobs) {
      if (!viewedJobs.has(job.$id)) {
        await trackJobView(job, userId)
        setViewedJobs(prev => new Set(prev).add(job.$id))
      }
    }
  }

  const fetchSelectedPathJobs = async () => {
    try {
      setLoading(true)

      const currentUser: User | null = await getCurrentUser()
      if (!currentUser?.selectedPath) {
        setLoading(false)
        return
      }

      setUser(currentUser)

      const selectedPath = await databases.getDocument<CareerPath>(
        config.databaseId,
        config.careerPathsCollectionId,
        currentUser.selectedPath
      )

      if (!selectedPath) {
        setLoading(false)
        return
      }

      setSelectedPathTitle(selectedPath.title)

      const jobsData = await databases.listDocuments<Job>(
        config.databaseId,
        config.jobsCollectionId,
        [Query.search('relatedpaths', selectedPath.title)]
      )

      if (jobsData.documents.length > 0) {
        await fetchEmployersData(jobsData.documents)
        await batchTrackJobViews(jobsData.documents, currentUser.$id)

        const intelligentlyMatchedJobs = getIntelligentJobMatches(
          currentUser, 
          jobsData.documents, 
          selectedPath.title
        )

        setSelectedPathJobs(intelligentlyMatchedJobs)
        setFilteredSelectedJobs(intelligentlyMatchedJobs)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching selected path jobs:', error)
      setLoading(false)
    }
  }

  const fetchSavedPathsJobs = async () => {
    if (!user?.savedPaths || user.savedPaths.length === 0 || savedPathsLoaded) return

    try {
      const savedPathSections: SavedPathSection[] = []

      for (const savedPathId of user.savedPaths) {
        try {
          const savedPath = await databases.getDocument<CareerPath>(
            config.databaseId,
            config.careerPathsCollectionId,
            savedPathId
          )

          if (savedPath) {
            const jobsData = await databases.listDocuments<Job>(
              config.databaseId,
              config.jobsCollectionId,
              [Query.search('relatedpaths', savedPath.title), Query.limit(50)]
            )

            const intelligentlyMatchedJobs = jobsData.documents.length > 0
              ? getIntelligentJobMatches(user, jobsData.documents, savedPath.title)
              : []

            if (jobsData.documents.length > 0) {
              await fetchEmployersData(jobsData.documents)
            }

            const sortedJobs = intelligentlyMatchedJobs.slice(0, 3)

            savedPathSections.push({
              pathId: savedPathId,
              pathTitle: savedPath.title,
              jobs: sortedJobs,
              isExpanded: false
            })
          }
        } catch (pathError) {
          console.error(`Error fetching saved path ${savedPathId}:`, pathError)
        }
      }

      setSavedPathSections(savedPathSections)
      setSavedPathsLoaded(true)
    } catch (error) {
      console.error('Error fetching saved paths jobs:', error)
    }
  }

  const fetchEmployersData = async (jobs: Job[]) => {
    const employerIds = [...new Set(jobs.map(job => job.employer))]
    const newEmployers: Record<string, Employer> = { ...employers }

    const missingEmployerIds = employerIds.filter(id => !newEmployers[id])

    if (missingEmployerIds.length > 0) {
      const employersResponse = await databases.listDocuments<Employer>(
        config.databaseId,
        config.employersCollectionId,
        [Query.equal('employerId', missingEmployerIds)]
      )

      employersResponse.documents.forEach(employer => {
        newEmployers[employer.employerId] = employer
      })

      setEmployers(newEmployers)
    }
  }

  const handleTabSwitch = (tab: 'selected' | 'saved') => {
    if (tab === activeTab) return
    setActiveTab(tab)
    if (tab === 'saved') {
      fetchSavedPathsJobs()
    }
    setSearchQuery('')
  }

  const toggleSavedPathSection = async (pathId: string) => {
    const section = savedPathSections.find(s => s.pathId === pathId)
    const isExpanding = section && !section.isExpanded
    
    setSavedPathSections(prev =>
      prev.map(section =>
        section.pathId === pathId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    )

    if (isExpanding && section && section.jobs.length > 0 && user) {
      await batchTrackJobViews(section.jobs, user.$id)
    }
  }

  const handleSearch = debounce((text: string) => {
    if (activeTab === 'selected') {
      if (!text) {
        setFilteredSelectedJobs(selectedPathJobs)
        return
      }

      const query = text.toLowerCase()
      const filtered = selectedPathJobs.filter(job => {
        const nameMatch = job.name?.toLowerCase().includes(query)
        const employerMatch = employers[job.employer]?.name?.toLowerCase().includes(query)
        const skillsMatch = job.skills?.some(skill => skill.toLowerCase().includes(query))
        return nameMatch || employerMatch || skillsMatch
      })

      setFilteredSelectedJobs(filtered)
    }
  }, 300)

  const onSearchChange = (text: string) => {
    setSearchQuery(text)
    handleSearch(text)
  }

  const navigateToJobDetails = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`)
  }

  // Components
  const InfoPill = ({ icon, text, variant = 'primary' }: { 
  icon: React.ReactNode; 
  text: string;
  variant?: 'primary' | 'secondary' | 'accent';
}) => {
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

 const JobCard = ({ item }: { item: Job }) => {
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
      onPress={() => navigateToJobDetails(item.$id)}
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
}


  const SavedPathSection = ({ item }: { item: SavedPathSection }) => (
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
        onPress={() => toggleSavedPathSection(item.pathId)}
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
                <JobCard item={job} />
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

  const TabButton = ({ title, count, isActive, onPress }: {
    title: string;
    count: number;
    isActive: boolean;
    onPress: () => void;
  }) => (
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

  const getSelectedJobsCount = () => filteredSelectedJobs.length
  const getSavedJobsCount = () => savedPathSections.reduce((total, section) => total + section.jobs.length, 0)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <TouchableOpacity
          style={{ 
            padding: 8, 
            borderRadius: 12,
            backgroundColor: '#f9fafb'
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#1f2937'
        }}>Job Opportunities</Text>
        <TouchableOpacity
          style={{ 
            padding: 8, 
            borderRadius: 12,
            backgroundColor: '#f9fafb'
          }}
          onPress={() => router.push('/jobs/savedjobs')}
        >
          <MaterialCommunityIcons name="bookmark-check-outline" size={22} color="#5badec" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 6,
        flexDirection: 'row',
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <TabButton
          title={selectedPathTitle || 'Selected Path'}
          count={getSelectedJobsCount()}
          isActive={activeTab === 'selected'}
          onPress={() => handleTabSwitch('selected')}
        />
        <TabButton
          title="Saved Paths"
          count={getSavedJobsCount()}
          isActive={activeTab === 'saved'}
          onPress={() => handleTabSwitch('saved')}
        />
      </View>

      {/* Search Bar */}
      {activeTab === 'selected' && (
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
            placeholder="Search by job title, employer, or skills"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      )}

      {/* Content */}
      {loading ? (
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
            <ActivityIndicator size="large" color="#5badec" />
            <Text style={{
              marginTop: 16,
              fontSize: 16,
              color: '#6b7280',
              fontWeight: '500'
            }}>Loading opportunities...</Text>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {activeTab === 'selected' ? (
            filteredSelectedJobs.length === 0 ? (
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
                    <Ionicons name="briefcase-outline" size={32} color="#5badec" />
                  </View>
                  <Text style={{ fontSize: 18, color: '#111827', fontWeight: '700', textAlign: 'center' }}>
                    No job opportunities found
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
                    Try adjusting your search or check back later
                  </Text>
                </View>
              </View>
            ) : (
              <FlatList
                data={filteredSelectedJobs}
                renderItem={JobCard}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : (
            savedPathSections.length === 0 ? (
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
                    <MaterialCommunityIcons name="bookmark-check-outline" size={32} color="#5badec" />
                  </View>
                  <Text style={{ fontSize: 18, color: '#111827', fontWeight: '700', textAlign: 'center' }}>
                    {user?.savedPaths?.length === 0 
                      ? "No saved paths yet"
                      : "Loading saved paths..."
                    }
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
                    Explore career paths to start building your collection!
                  </Text>
                </View>
              </View>
            ) : (
              <FlatList
                data={savedPathSections}
                renderItem={SavedPathSection}
                keyExtractor={(item) => item.pathId}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
            )
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

export default Jobs
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions
} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import {
  ArrowLeft,
  Search,
  MapPin,
  Building2,
  Clock,
  Award,
  ChevronDown,
  ChevronRight,
  BookmarkCheck
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
  description?: string
  responsibilities?: string
  industry?: string
  dateofUpload?: string
  viewers?: string[] // New attribute for tracking unique viewers
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

type TabType = 'selected' | 'saved'

type SavedPathSection = {
  pathId: string
  pathTitle: string
  jobs: Job[]
  isExpanded: boolean
}

// Enhanced job matching logic (same as original)
const getIntelligentJobMatches = (userTalent: User, allJobs: Job[], pathTitle: string) => {
  if (!userTalent.careerStage) {
    return allJobs
  }

  let filteredJobs: Job[] = []

  switch (userTalent.careerStage) {
    case 'Pathfinder':
      filteredJobs = getPathfinderMatches(allJobs, pathTitle)
      break
    case 'Trailblazer':
      filteredJobs = getTrailblazerMatches(userTalent, allJobs, pathTitle)
      break
    case 'Horizon Changer':
      filteredJobs = getHorizonChangerMatches(userTalent, allJobs, pathTitle)
      break
    default:
      filteredJobs = allJobs
  }

  return filteredJobs
}

const getPathfinderMatches = (jobs: Job[], selectedPathTitle: string) => {
  const pathfinderJobs = jobs.filter(job => {
    if (job.seniorityLevel !== 'Entry-Level') return false
    
    const isRelatedPath = job.relatedpaths?.some(path => 
      path.toLowerCase().includes(selectedPathTitle.toLowerCase())
    )
    
    return isRelatedPath
  })

  return pathfinderJobs.sort((a, b) => {
    const getJobTypePriority = (jobType: string) => {
      switch (jobType) {
        case 'Internship': return 1
        case 'Contract': return 2
        case 'Full Time': return 3
        case 'Part Time': return 4
        default: return 5
      }
    }

    const priorityA = getJobTypePriority(a.jobtype)
    const priorityB = getJobTypePriority(b.jobtype)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    const hasDescriptionA = (a.description && a.description.length > 100) || 
                           (a.responsibilities && a.responsibilities.length > 100)
    const hasDescriptionB = (b.description && b.description.length > 100) || 
                           (b.responsibilities && b.responsibilities.length > 100)
    
    if (hasDescriptionA && !hasDescriptionB) return -1
    if (!hasDescriptionA && hasDescriptionB) return 1
    
    return 0
  })
}

const getTrailblazerMatches = (userTalent: User, jobs: Job[], selectedPathTitle: string) => {
  const trailblazerJobs = jobs.filter(job => {
    if (job.jobtype === 'Internship') return false
    
    const isRelatedPath = job.relatedpaths?.some(path => 
      path.toLowerCase().includes(selectedPathTitle.toLowerCase())
    )
    
    if (!isRelatedPath) return false

    const userSeniority = userTalent.currentSeniorityLevel
    if (!userSeniority) return true

    if (job.seniorityLevel === userSeniority) return true
    
    if (userSeniority === 'Entry-Level' && job.seniorityLevel === 'Mid-Level') return true
    if (userSeniority === 'Mid-Level' && job.seniorityLevel === 'Senior-Level') return true
    
    return false
  })

  return trailblazerJobs.sort((a, b) => {
    const getTrailblazerScore = (job: Job) => {
      let score = 0
      const userSeniority = userTalent.currentSeniorityLevel

      if (job.jobtype === 'Full Time') score += 100
      else if (job.jobtype === 'Contract') score += 70
      else if (job.jobtype === 'Part Time') score += 50

      if (job.seniorityLevel === userSeniority) {
        score += 50
      } else if (
        (userSeniority === 'Entry-Level' && job.seniorityLevel === 'Mid-Level') ||
        (userSeniority === 'Mid-Level' && job.seniorityLevel === 'Senior-Level')
      ) {
        score += 30
      }

      return score
    }

    return getTrailblazerScore(b) - getTrailblazerScore(a)
  })
}

const getHorizonChangerMatches = (userTalent: User, jobs: Job[], selectedPathTitle: string) => {
  const horizonChangerJobs = jobs.filter(job => {
    if (job.jobtype === 'Internship') return false
    
    if (userTalent.interestedFields && userTalent.interestedFields.length > 0) {
      const isInInterestedField = userTalent.interestedFields.some(field =>
        job.relatedpaths?.some(path => 
          path.toLowerCase().includes(field.toLowerCase())
        ) || job.industry?.toLowerCase().includes(field.toLowerCase())
      )
      
      if (isInInterestedField) {
        return job.seniorityLevel === 'Entry-Level' || job.seniorityLevel === 'Mid-Level'
      }
    }
    
    const isRelatedPath = job.relatedpaths?.some(path => 
      path.toLowerCase().includes(selectedPathTitle.toLowerCase())
    )
    
    return isRelatedPath
  })

  return horizonChangerJobs.sort((a, b) => {
    const getHorizonChangerScore = (job: Job) => {
      let score = 0
      
      if (userTalent.interestedFields && userTalent.interestedFields.length > 0) {
        const isInInterestedField = userTalent.interestedFields.some(field =>
          job.relatedpaths?.some(path => 
            path.toLowerCase().includes(field.toLowerCase())
          ) || job.industry?.toLowerCase().includes(field.toLowerCase())
        )
        
        if (isInInterestedField) score += 100
      }

      if (job.seniorityLevel === 'Entry-Level') {
        score += 80
      } else if (job.seniorityLevel === 'Mid-Level') {
        score += 60
      } else if (job.seniorityLevel === 'Senior-Level') {
        score += 40
      }

      if (job.jobtype === 'Full Time') score += 30
      else if (job.jobtype === 'Contract') score += 20
      else if (job.jobtype === 'Part Time') score += 10

      return score
    }

    return getHorizonChangerScore(b) - getHorizonChangerScore(a)
  })
}

const Jobs = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<TabType>('selected')
  const [selectedPathJobs, setSelectedPathJobs] = useState<Job[]>([])
  const [savedPathSections, setSavedPathSections] = useState<SavedPathSection[]>([])
  const [filteredSelectedJobs, setFilteredSelectedJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [employers, setEmployers] = useState<Record<string, Employer>>({})
  const [selectedPathTitle, setSelectedPathTitle] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [savedPathsLoaded, setSavedPathsLoaded] = useState<boolean>(false)
  const [tabContainerWidth, setTabContainerWidth] = useState<number>(0)
  const [viewedJobs, setViewedJobs] = useState<Set<string>>(new Set()) // Track jobs viewed in this session

  const tabAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchSelectedPathJobs()
  }, [])

  // New function to handle job view tracking
  const trackJobView = async (job: Job, userId: string) => {
    try {
      // Check if user has already viewed this job
      const currentViewers = job.viewers || []
      const hasUserViewed = currentViewers.includes(userId)
      
      // If user hasn't viewed this job before, add them to viewers
      if (!hasUserViewed) {
        const updatedViewers = [...currentViewers, userId]
        
        // Update the job document with new viewer and updated view count
        const updatedJob = await databases.updateDocument<Job>(
          config.databaseId,
          config.jobsCollectionId,
          job.$id,
          {
            viewers: updatedViewers,
            numViews: updatedViewers.length
          }
        )
        
        return updatedJob
      }
      
      return job // Return original job if already viewed
    } catch (error) {
      console.error('Error tracking job view:', error)
      return job
    }
  }

  // Function to batch track job views for multiple jobs
  const batchTrackJobViews = async (jobs: Job[], userId: string) => {
    const updatedJobs: Job[] = []
    
    for (const job of jobs) {
      // Only track view if not already viewed in this session
      if (!viewedJobs.has(job.$id)) {
        const updatedJob = await trackJobView(job, userId)
        updatedJobs.push(updatedJob)
        // Mark as viewed in this session to avoid duplicate tracking
        setViewedJobs(prev => new Set(prev).add(job.$id))
      } else {
        updatedJobs.push(job)
      }
    }
    
    return updatedJobs
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

        // Track views for all jobs displayed to the user
        const updatedJobs = await batchTrackJobViews(jobsData.documents, currentUser.$id)

        const intelligentlyMatchedJobs = getIntelligentJobMatches(
          currentUser, 
          updatedJobs, 
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
    if (!user?.savedPaths || user.savedPaths.length === 0 || savedPathsLoaded) {
      return;
    }

    try {
      const savedPathSections: SavedPathSection[] = [];

      for (const savedPathId of user.savedPaths) {
        try {
          const savedPath = await databases.getDocument<CareerPath>(
            config.databaseId,
            config.careerPathsCollectionId,
            savedPathId
          );

          if (savedPath) {
            const jobsData = await databases.listDocuments<Job>(
              config.databaseId,
              config.jobsCollectionId,
              [Query.search('relatedpaths', savedPath.title), Query.limit(50)]
            );

            // Always create a section for the saved path, even if there are no jobs
            const intelligentlyMatchedJobs = jobsData.documents.length > 0
              ? getIntelligentJobMatches(user, jobsData.documents, savedPath.title)
              : [];

            // Add employer data if there are jobs
            if (jobsData.documents.length > 0) {
              await fetchEmployersData(jobsData.documents);
            }

            // Sort jobs if there are any and get top 3
            const sortedJobs = intelligentlyMatchedJobs
              .sort((a, b) => {
                if (a.dateofUpload && b.dateofUpload) {
                  return new Date(b.dateofUpload).getTime() - new Date(a.dateofUpload).getTime();
                }
                return (b.numViews || 0) - (a.numViews || 0);
              })
              .slice(0, 3);

            savedPathSections.push({
              pathId: savedPathId,
              pathTitle: savedPath.title,
              jobs: sortedJobs,
              isExpanded: false
            });
          }
        } catch (pathError) {
          console.error(`Error fetching saved path ${savedPathId}:`, pathError);
        }
      }

      setSavedPathSections(savedPathSections);
      setSavedPathsLoaded(true);
    } catch (error) {
      console.error('Error fetching saved paths jobs:', error);
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

  const handleTabSwitch = (tab: TabType) => {
    if (tab === activeTab) return

    setActiveTab(tab)
    
    // Animate tab indicator
    Animated.timing(tabAnimation, {
      toValue: tab === 'selected' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start()

    // Lazy load saved paths when switching to saved tab
    if (tab === 'saved') {
      fetchSavedPathsJobs()
    }

    // Clear search when switching tabs
    setSearchQuery('')
  }

  const toggleSavedPathSection = async (pathId: string) => {
    const section = savedPathSections.find(s => s.pathId === pathId)
    const isExpanding = section && !section.isExpanded
    
    // Update the expanded state
    setSavedPathSections(prev =>
      prev.map(section =>
        section.pathId === pathId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    )

    // Track views when section is expanded (jobs become visible)
    if (isExpanding && section && section.jobs.length > 0 && user) {
      try {
        const updatedJobs = await batchTrackJobViews(section.jobs, user.$id)
        
        // Update the section with the updated jobs (with new view counts)
        setSavedPathSections(prev =>
          prev.map(s =>
            s.pathId === pathId
              ? { ...s, jobs: updatedJobs }
              : s
          )
        )
      } catch (error) {
        console.error('Error tracking views for expanded section:', error)
      }
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
    // Note: Search is not implemented for saved paths as per requirements
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
          marginBottom: 12,
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

  const renderSavedPathSection = ({ item }: { item: SavedPathSection }) => (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onPress={() => toggleSavedPathSection(item.pathId)}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
            {item.pathTitle}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
            {item.jobs.length} job{item.jobs.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        {item.isExpanded ? (
          <ChevronDown size={20} color="#6b7280" />
        ) : (
          <ChevronRight size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {item.isExpanded && (
        <View style={{ marginTop: 12 }}>
          {item.jobs.length > 0 ? (
            item.jobs.map((job, index) => (
              <View key={job.$id} style={{ marginBottom: index === item.jobs.length - 1 ? 0 : 12 }}>
                {renderJobItem({ item: job })}
              </View>
            ))
          ) : (
            <View style={{ 
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                There are no available jobs for you in this path
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )

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

  const getSelectedJobsCount = () => filteredSelectedJobs.length
  const getSavedJobsCount = () => savedPathSections.reduce((total, section) => total + section.jobs.length, 0)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ padding: 12, backgroundColor: '#f9fafb' }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 16,
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity
            style={{ padding: 6, borderRadius: 9999, backgroundColor: '#f9fafb' }}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>
          <Text style={{ 
            fontSize: 17, 
            fontWeight: 'bold', 
            color: '#1f2937',
            flex: 1,
            textAlign: 'center'
          }}>
            Job Opportunities
          </Text>
          <TouchableOpacity
            style={{ 
              padding: 6, 
              borderRadius: 9999, 
              backgroundColor: '#f9fafb'
            }}
            onPress={() => router.push('/jobs/savedjobs')}
            accessibilityLabel="View saved jobs"
          >
            <BookmarkCheck size={22} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View 
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 4,
            flexDirection: 'row',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            position: 'relative'
          }}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout
            setTabContainerWidth(width)
          }}
        >
          {/* Tab Indicator */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              width: tabContainerWidth > 0 ? (tabContainerWidth - 8) / 2 : 0,
              left: tabAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [4, tabContainerWidth > 0 ? (tabContainerWidth / 2) : 0]
              }),
              backgroundColor: '#4f46e5',
              borderRadius: 8,
            }}
          />

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
              zIndex: 1
            }}
            onPress={() => handleTabSwitch('selected')}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'selected' ? 'white' : '#6b7280'
            }}>
              {selectedPathTitle || 'Selected Path'} ({getSelectedJobsCount()})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
              zIndex: 1
            }}
            onPress={() => handleTabSwitch('saved')}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'saved' ? 'white' : '#6b7280'
            }}>
              Saved Paths ({getSavedJobsCount()})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar (only for selected path) */}
        {activeTab === 'selected' && (
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
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {activeTab === 'selected' ? (
            // Selected Path Jobs
            filteredSelectedJobs.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                  No job opportunities found matching your selected career path.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredSelectedJobs}
                renderItem={renderJobItem}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : (
            // Saved Paths Jobs
            savedPathSections.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                  {user?.savedPaths?.length === 0 
                    ? "No saved paths yet. Explore career paths to start building your collection!"
                    : "Loading saved paths..."
                  }
                </Text>
              </View>
            ) : (
              <FlatList
                data={savedPathSections}
                renderItem={renderSavedPathSection}
                keyExtractor={(item) => item.pathId}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                      No saved paths yet. Explore career paths to start building your collection!
                    </Text>
                  </View>
                )}
              />
            )
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

export default Jobs
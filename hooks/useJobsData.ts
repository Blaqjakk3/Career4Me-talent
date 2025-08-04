import { useState, useEffect } from 'react'
import {
  config,
  databases,
  getCurrentUser,
  Query
} from '../lib/appwrite'
import { Job, Employer, CareerPath, User, SavedPathSection } from '../types/jobs'
import { getIntelligentJobMatches } from '../utils/jobMatching'

export const useJobsData = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPathJobs, setSelectedPathJobs] = useState<Job[]>([])
  const [savedPathSections, setSavedPathSections] = useState<SavedPathSection[]>([])
  const [filteredSelectedJobs, setFilteredSelectedJobs] = useState<Job[]>([])
  const [employers, setEmployers] = useState<Record<string, Employer>>({})
  const [selectedPathTitle, setSelectedPathTitle] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [savedPathsLoaded, setSavedPathsLoaded] = useState<boolean>(false)
  const [viewedJobs, setViewedJobs] = useState<Set<string>>(new Set())

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

  const updateFilteredJobs = (filteredJobs: Job[]) => {
    setFilteredSelectedJobs(filteredJobs)
  }

  useEffect(() => {
    fetchSelectedPathJobs()
  }, [])

  return {
    loading,
    selectedPathJobs,
    savedPathSections,
    filteredSelectedJobs,
    employers,
    selectedPathTitle,
    user,
    savedPathsLoaded,
    fetchSelectedPathJobs,
    fetchSavedPathsJobs,
    fetchEmployersData,
    trackJobView,
    batchTrackJobViews,
    toggleSavedPathSection,
    updateFilteredJobs
  }
} 
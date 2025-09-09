import { Job, User } from '../types/jobs'

/**
 * Get intelligent job matches based on user career stage and selected career path
 * @param userTalent - User object containing career information
 * @param allJobs - Array of all available jobs
 * @param pathTitle - Title of the career path to match against
 * @returns Filtered and sorted array of jobs
 */
export const getIntelligentJobMatches = (userTalent: User, allJobs: Job[], pathTitle: string): Job[] => {
  if (!userTalent.careerStage) return allJobs

  // First filter by career path
  const pathFilteredJobs = allJobs.filter(job => {
    return job.relatedpaths?.some(path => 
      path.toLowerCase().includes(pathTitle.toLowerCase())
    )
  })

  // Then filter by career stage compatibility
  const careerStageFilteredJobs = pathFilteredJobs.filter(job => {
    return isJobSuitableForCareerStage(userTalent.careerStage!, job)
  })

  return careerStageFilteredJobs.sort((a, b) => {
    // Enhanced sorting that considers career stage relevance
    const getJobRelevanceScore = (job: Job) => {
      let score = 0
      
      // Career stage alignment score
      if (isOptimalJobForCareerStage(userTalent.careerStage!, job)) {
        score += 100
      }
      
      // Job type priority based on career stage
      score += getJobTypePriorityForCareerStage(userTalent.careerStage!, job.jobtype)
      
      // Seniority level alignment
      score += getSeniorityAlignmentScore(userTalent.careerStage!, job.seniorityLevel)
      
      return score
    }

    const scoreA = getJobRelevanceScore(a)
    const scoreB = getJobRelevanceScore(b)
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA // Higher score first
    }

    // Secondary sorting by upload date
    if (a.dateofUpload && b.dateofUpload) {
      return new Date(b.dateofUpload).getTime() - new Date(a.dateofUpload).getTime()
    }

    // Tertiary sorting by views
    return (b.numViews || 0) - (a.numViews || 0)
  })
}

/**
 * Check if a job is suitable for a specific career stage
 */
const isJobSuitableForCareerStage = (careerStage: string, job: Job): boolean => {
  const jobType = job.jobtype?.toLowerCase()
  const seniorityLevel = job.seniorityLevel?.toLowerCase()

  switch (careerStage) {
    case 'Pathfinder':
      // Pathfinders should see entry-level and mid-level positions, all job types including internships
      return (
        seniorityLevel !== 'senior-level' &&
        (jobType === 'internship' || 
         jobType === 'part time' || 
         jobType === 'full time' || 
         jobType === 'contract')
      )

    case 'Trailblazer':
      // Trailblazers should not see internships, focus on mid-level and senior positions
      return (
        jobType !== 'internship' &&
        (seniorityLevel === 'mid-level' || 
         seniorityLevel === 'senior-level' ||
         seniorityLevel === 'entry-level') // Still show entry-level for career growth
      )

    case 'Horizon Changer':
      // Horizon Changers are pivoting, so they might take entry or mid-level in new field
      // but shouldn't see internships
      return (
        jobType !== 'internship' &&
        (seniorityLevel === 'entry-level' || 
         seniorityLevel === 'mid-level' ||
         seniorityLevel === 'senior-level')
      )

    default:
      return true
  }
}

/**
 * Check if a job is optimal for a specific career stage
 */
const isOptimalJobForCareerStage = (careerStage: string, job: Job): boolean => {
  const jobType = job.jobtype?.toLowerCase()
  const seniorityLevel = job.seniorityLevel?.toLowerCase()

  switch (careerStage) {
    case 'Pathfinder':
      return (
        (jobType === 'internship' && seniorityLevel === 'entry-level') ||
        (jobType === 'full time' && seniorityLevel === 'entry-level') ||
        (jobType === 'part time' && seniorityLevel === 'entry-level')
      )

    case 'Trailblazer':
      return (
        (jobType === 'full time' && (seniorityLevel === 'mid-level' || seniorityLevel === 'senior-level')) ||
        (jobType === 'contract' && seniorityLevel === 'mid-level')
      )

    case 'Horizon Changer':
      return (
        (jobType === 'full time' && (seniorityLevel === 'entry-level' || seniorityLevel === 'mid-level')) ||
        (jobType === 'contract' && seniorityLevel === 'entry-level')
      )

    default:
      return false
  }
}

/**
 * Get job type priority score based on career stage
 */
const getJobTypePriorityForCareerStage = (careerStage: string, jobType: string): number => {
  const type = jobType?.toLowerCase()

  switch (careerStage) {
    case 'Pathfinder':
      const pathfinderPriorities = { 
        'internship': 50, 
        'full time': 40, 
        'part time': 30, 
        'contract': 20 
      }
      return pathfinderPriorities[type] || 0

    case 'Trailblazer':
      const trailblazerPriorities = { 
        'full time': 50, 
        'contract': 40, 
        'part time': 20 
        // Note: internship excluded as they shouldn't see them
      }
      return trailblazerPriorities[type] || 0

    case 'Horizon Changer':
      const horizonChangerPriorities = { 
        'full time': 50, 
        'contract': 45, // Contracts can be good for career transitions
        'part time': 25 
        // Note: internship excluded as they shouldn't see them
      }
      return horizonChangerPriorities[type] || 0

    default:
      return 0
  }
}

/**
 * Get seniority level alignment score based on career stage
 */
const getSeniorityAlignmentScore = (careerStage: string, seniorityLevel: string): number => {
  const level = seniorityLevel?.toLowerCase()

  switch (careerStage) {
    case 'Pathfinder':
      const pathfinderSeniority = { 
        'entry-level': 30, 
        'mid-level': 15 
        // senior-level excluded
      }
      return pathfinderSeniority[level] || 0

    case 'Trailblazer':
      const trailblazerSeniority = { 
        'senior-level': 30, 
        'mid-level': 25, 
        'entry-level': 10 
      }
      return trailblazerSeniority[level] || 0

    case 'Horizon Changer':
      const horizonChangerSeniority = { 
        'entry-level': 30, // Good for pivoting to new field
        'mid-level': 25, 
        'senior-level': 15 
      }
      return horizonChangerSeniority[level] || 0

    default:
      return 0
  }
}
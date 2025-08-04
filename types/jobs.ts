export type Job = {
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

export type Employer = {
  employerId: string
  name: string
  avatar?: string
}

export type CareerPath = {
  $id: string
  title: string
}

export type User = {
  $id: string
  selectedPath?: string
  savedPaths?: string[]
  careerStage: string
  currentSeniorityLevel?: string
  interestedFields?: string[]
}

export type SavedPathSection = {
  pathId: string
  pathTitle: string
  jobs: Job[]
  isExpanded: boolean
} 
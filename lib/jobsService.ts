import { databases, config, getCurrentUser, Query } from './appwrite';

/**
 * Fetches jobs that match the user's selected career path
 * @returns Array of matching job documents
 */
export const getMatchingJobs = async () => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.selectedPath) {
      return [];
    }
    
    // Get the selected career path
    const selectedPath = await databases.getDocument(
      config.databaseId,
      config.careerPathsCollectionId,
      currentUser.selectedPath
    );
    
    if (!selectedPath) {
      return [];
    }
    
    // Query jobs that match the user's selected career path title
    const jobs = await databases.listDocuments(
      config.databaseId,
      config.jobsCollectionId,
      [Query.search("relatedpaths", selectedPath.title)]
    );
    
    return jobs.documents;
  } catch (error) {
    console.error("Error fetching matching jobs:", error);
    return [];
  }
};

/**
 * Fetches an employer by their ID
 * @param employerId - The ID of the employer to fetch
 * @returns The employer document or null if not found
 */
export const getEmployerById = async (employerId: string) => {
  try {
    const employer = await databases.getDocument(
      config.databaseId,
      config.employersCollectionId,
      employerId
    );
    
    return employer;
  } catch (error) {
    console.error("Error fetching employer:", error);
    return null;
  }
};

/**
 * Searches for jobs based on query text
 * @param query - The search query text
 * @returns Array of job documents matching the search
 */
export const searchJobs = async (query: string) => {
  if (!query.trim()) {
    return getMatchingJobs(); // Return all matching jobs if query is empty
  }
  
  try {
    const jobs = await databases.listDocuments(
      config.databaseId,
      config.jobsCollectionId,
      [
        Query.search("name", query),
        Query.limit(20)
      ]
    );
    
    return jobs.documents;
  } catch (error) {
    console.error("Error searching jobs:", error);
    return [];
  }
};

/**
 * Increments the view count for a job
 * @param jobId - The ID of the job to increment views for
 */
export const incrementJobViews = async (jobId: string) => {
  try {
    // First get the current job to get the current view count
    const job = await databases.getDocument(
      config.databaseId,
      config.jobsCollectionId,
      jobId
    );
    
    // Increment the view count
    const currentViews = job.numViews || 0;
    
    await databases.updateDocument(
      config.databaseId,
      config.jobsCollectionId,
      jobId,
      {
        numViews: currentViews + 1
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error incrementing job views:", error);
    return false;
  }
};

/**
 * Increments the click count for a job when user clicks apply
 * @param jobId - The ID of the job to increment clicks for
 */
export const incrementJobClicks = async (jobId: string) => {
  try {
    // First get the current job to get the current click count
    const job = await databases.getDocument(
      config.databaseId,
      config.jobsCollectionId,
      jobId
    );
    
    // Increment the click count
    const currentClicks = job.numClicks || 0;
    
    await databases.updateDocument(
      config.databaseId,
      config.jobsCollectionId,
      jobId,
      {
        numClicks: currentClicks + 1
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error incrementing job clicks:", error);
    return false;
  }
};
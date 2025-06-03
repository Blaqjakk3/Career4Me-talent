import { databases, config, getCurrentUser } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { CareerPath, calculateMatchScore } from './careerMatching';

export interface TrailblazerMatchCriteria {
  currentPath: string;
  skills: string[];
  interests: string[];
  degrees: string[];
  certifications: string[];
  industries: string[];
}

/**
 * Calculates similarity score between current path and another path
 * 
 * @param currentPathData - The user's current career path data
 * @param targetPathData - The potential related career path
 * @returns A similarity score between 0-1
 */
const calculateSimilarityScore = (
  currentPathData: any,
  targetPathData: any
): number => {
  if (!currentPathData || !targetPathData) return 0;
  
  // Calculate similarity based on shared skills, interests, and industry
  const currentSkills = currentPathData.requiredSkills || [];
  const targetSkills = targetPathData.requiredSkills || [];
  
  const currentInterests = currentPathData.requiredInterests || [];
  const targetInterests = targetPathData.requiredInterests || [];
  
  // Count shared skills and interests
  const sharedSkills = currentSkills.filter(skill => 
    targetSkills.some(targetSkill => 
      targetSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(targetSkill.toLowerCase())
    )
  ).length;
  
  const sharedInterests = currentInterests.filter(interest => 
    targetInterests.some(targetInterest => 
      targetInterest.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(targetInterest.toLowerCase())
    )
  ).length;
  
  // Calculate industry similarity
  const industrySimilarity = currentPathData.industry === targetPathData.industry ? 1 : 0;
  
  // Calculate overall similarity score
  const skillWeight = 0.5;
  const interestWeight = 0.3;
  const industryWeight = 0.2;
  
  const skillScore = currentSkills.length > 0 ? sharedSkills / currentSkills.length : 0;
  const interestScore = currentInterests.length > 0 ? sharedInterests / currentInterests.length : 0;
  
  return (skillScore * skillWeight) + (interestScore * interestWeight) + (industrySimilarity * industryWeight);
};

/**
 * Find career matches for a trailblazer based on their current path
 * 
 * @param criteria - The user's selected criteria including current path
 * @param limit - Maximum number of results to return (default 5)
 * @returns An array of career paths similar to current path
 */
export const findCareerMatchesForTrailblazer = async (
  criteria: TrailblazerMatchCriteria,
  limit: number = 5
): Promise<CareerPath[]> => {
  try {
    // Ensure criteria object has all required properties
    const validatedCriteria: TrailblazerMatchCriteria = {
      currentPath: criteria.currentPath || '',
      skills: criteria.skills || [],
      interests: criteria.interests || [],
      degrees: criteria.degrees || [],
      certifications: criteria.certifications || [],
      industries: criteria.industries || []
    };
    
    // Make sure current path is provided
    if (!validatedCriteria.currentPath) {
      throw new Error("Current career path must be specified");
    }
    
    // Get current career path data
    const currentPathQuery = await databases.listDocuments(
      config.databaseId,
      config.careerPathsCollectionId,
      [Query.equal('title', validatedCriteria.currentPath), Query.limit(1)]
    );
    
    if (!currentPathQuery || currentPathQuery.documents.length === 0) {
      throw new Error("Current career path not found in database");
    }
    
    const currentPathData = currentPathQuery.documents[0];
    
    // Fetch all career paths from the database
    const careerPathsResult = await databases.listDocuments(
      config.databaseId,
      config.careerPathsCollectionId,
      [Query.limit(200)] // Get a large number of possible paths
    );
    
    if (!careerPathsResult || careerPathsResult.documents.length === 0) {
      throw new Error("No career paths available");
    }
    
    // Convert the documents to CareerPath objects, excluding current path
    const otherPaths = careerPathsResult.documents
      .filter(doc => doc.title !== validatedCriteria.currentPath)
      .map(doc => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        requiredSkills: doc.requiredSkills || [],
        requiredInterests: doc.requiredInterests || [],
        requiredCertifications: doc.requiredCertifications || [],
        suggestedDegrees: doc.suggestedDegrees || [],
        industry: doc.industry || ''
      })) as CareerPath[];
    
    // Calculate standard match scores for each career path
    const scoredPaths = otherPaths.map(path => {
      // Calculate standard match score
      const standardMatchResult = calculateMatchScore(path, {
        skills: validatedCriteria.skills,
        interests: validatedCriteria.interests,
        degrees: validatedCriteria.degrees,
        certifications: validatedCriteria.certifications,
        industries: validatedCriteria.industries
      });
      
      // Calculate similarity to current path
      const similarityScore = calculateSimilarityScore(currentPathData, path);
      
      // Adjust the match score based on similarity to current path
      const adjustedScore = Math.round(
        standardMatchResult.score * 0.6 + // Base match score (60% weight)
        (similarityScore * 100) * 0.4     // Similarity to current path (40% weight)
      );
      
      return {
        ...path,
        matchScore: adjustedScore,
        matchDetails: {
          ...standardMatchResult.details,
          similarityScore: Math.round(similarityScore * 100)
        }
      };
    });
    
    // Sort paths by adjusted match score (descending)
    const sortedPaths = scoredPaths.sort((a, b) => b.matchScore - a.matchScore);
    
    // Filter to paths with decent similarity to current path
    const filteredPaths = sortedPaths.filter(path => 
      path.matchDetails.similarityScore >= 30 && // At least 30% similar to current path
      path.matchScore >= 40                      // And a decent overall match
    );
    
    // Return the top matches
    return filteredPaths.slice(0, limit);
  } catch (error) {
    console.error("Error finding career matches for trailblazer:", error);
    throw error;
  }
};

/**
 * Saves the trailblazer's survey data to their profile
 * 
 * @param data - The user's survey data including current path
 * @returns The updated user document
 */
export const saveSurveyDataForTrailblazer = async (data: {
  currentPath: string;
  degrees: string[];
  certifications: string[];
  skills: string[];
  interests: string[];
  interestedFields: string[];
}) => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Update the user profile with all survey data
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        currentPath: data.currentPath,
        degrees: data.degrees,
        certifications: data.certifications,
        skills: data.skills,
        interests: data.interests,
        interestedFields: data.interestedFields
      }
    );
    
    return updatedUser;
  } catch (error) {
    console.error("Error saving trailblazer survey data:", error);
    throw error;
  }
};

/**
 * Completes the survey process for trailblazers
 * 
 * @param pathId - The ID of the current career path
 * @returns Boolean indicating success
 */
export const completeTrailblazerSurvey = async (pathId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Update the user's selected path
    await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        selectedPath: pathId,
        testTaken: true,
        isCareerChanger: false  // They're staying in their current career path
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error completing trailblazer survey:", error);
    return false;
  }
};

/**
 * Get growth recommendations for the current career path
 * 
 * @param pathId - The ID of the career path
 * @param userSkills - The user's current skills
 * @returns Recommended skills and certifications for growth
 */
export const getGrowthRecommendations = async (
  pathId: string,
  userSkills: string[] = []
): Promise<{
  recommendedSkills: string[];
  recommendedCertifications: string[];
}> => {
  try {
    // Get the career path
    const pathData = await databases.getDocument(
      config.databaseId,
      config.careerPathsCollectionId,
      pathId
    );
    
    if (!pathData) {
      throw new Error("Career path not found");
    }
    
    const pathSkills = pathData.requiredSkills || [];
    const pathCerts = pathData.requiredCertifications || [];
    
    // Find skills the user doesn't have yet
    const recommendedSkills = pathSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    // Return recommendations
    return {
      recommendedSkills,
      recommendedCertifications: pathCerts
    };
  } catch (error) {
    console.error("Error getting growth recommendations:", error);
    throw error;
  }
};
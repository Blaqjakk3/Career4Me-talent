import { databases, config, getCurrentUser } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';

export interface CareerPath {
  $id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  requiredInterests: string[];
  requiredCertifications: string[];
  suggestedDegrees: string[];
  industry: string;
  matchScore?: number;
  matchDetails?: {
    skillScore: number;
    interestScore: number;
    certificationScore: number;
    degreeScore: number;
    industryScore: number;
  };
}

export interface MatchCriteria {
  skills: string[];
  interests: string[];
  degrees: string[];
  certifications: string[];
  industries: string[];
}

/**
 * Calculates the match percentage between two arrays with partial matching
 * 
 * @param required - The array of required items
 * @param userItems - The array of user's selected items
 * @returns A score between 0-1 representing match percentage
 */
const calculateArrayMatch = (required: string[], userItems: string[]): number => {
  if (!required || required.length === 0) return 1; // If no requirements, it's a perfect match
  if (!userItems || userItems.length === 0) return 0.3; // If user has nothing, give a base score instead of 0
  
  // Count how many required items the user has
  const matchingItems = required.filter(item => 
    userItems.some(userItem => userItem.toLowerCase().includes(item.toLowerCase()) || 
                   item.toLowerCase().includes(userItem.toLowerCase()))
  ).length;
  
  // Return the percentage of matched items (0 to 1) with minimum base score
  return Math.max(0.3, matchingItems / required.length);
};

/**
 * Calculates industry match with improved matching logic
 * 
 * @param careerIndustry - The career path's industry
 * @param userIndustries - The user's selected industries
 * @returns A score between 0-1 representing match quality
 */
const calculateIndustryMatch = (careerIndustry: string, userIndustries: string[]): number => {
  if (!careerIndustry) return 0.4; // If career path has no industry listed, give a moderate match
  if (!userIndustries || userIndustries.length === 0) return 0.5; // If user selected no industries, give a default match
  
  // If the career's industry is in the user's selections, perfect match
  if (userIndustries.includes(careerIndustry)) {
    return 1;
  }
  
  // Check for partial matches (e.g., "Finance" might be related to "Business")
  const relatedIndustries: Record<string, string[]> = {
    'Finance': ['Business'],
    'Business': ['Finance'],
    'Technology': ['Business', 'Engineering'],
    'Engineering': ['Technology'],
    'Science': ['Technology', 'Engineering', 'Healthcare', 'Environment'],
    'Healthcare': ['Science'],
    'Creative Arts': ['Education'],
    'Education': ['Science', 'Creative Arts'],
    'Environment': ['Science', 'Engineering']
  };
  
  // Check if any of the user's industries are related to the career industry
  const relatedToCareer = relatedIndustries[careerIndustry] || [];
  for (const userIndustry of userIndustries) {
    if (relatedToCareer.includes(userIndustry)) {
      return 0.7; // Related industry match
    }
  }
  
  // No direct match but still return a base score
  return 0.2;
};

/**
 * Calculates degree relevance with more flexible matching
 * 
 * @param suggestedDegrees - Career path's suggested degrees
 * @param userDegrees - User's degrees
 * @returns A score between 0-1 representing match quality
 */
const calculateDegreeMatch = (suggestedDegrees: string[], userDegrees: string[]): number => {
  if (!suggestedDegrees || suggestedDegrees.length === 0) return 0.6; // No specific degree requirements
  if (!userDegrees || userDegrees.length === 0) return 0.3; // User has no degrees, moderate penalty
  
  // Check for exact matches
  const exactMatches = suggestedDegrees.filter(degree => 
    userDegrees.some(userDegree => userDegree === degree)
  ).length;
  
  if (exactMatches > 0) {
    return 1; // At least one exact match found
  }
  
  // Check for partial matches (e.g., "Accounting" might be related to "Finance")
  const relatedDegrees: Record<string, string[]> = {
    'Accounting': ['Finance', 'Business Administration', 'Economics', 'Taxation'],
    'Finance': ['Accounting', 'Economics', 'Business Administration', 'Banking'],
    'Computer Science': ['Software Engineering', 'Information Technology', 'Data Science', 'Information Systems'],
    'Business Administration': ['Management', 'Marketing', 'Finance', 'Accounting', 'Economics'],
    // Add more related degrees as needed
  };
  
  // Check if user degrees are related to any suggested degrees
  for (const suggestedDegree of suggestedDegrees) {
    const relatedToDegree = relatedDegrees[suggestedDegree] || [];
    for (const userDegree of userDegrees) {
      if (relatedToDegree.includes(userDegree)) {
        return 0.8; // Related degree match
      }
      
      // Check for keyword match (partial match)
      if (suggestedDegree.toLowerCase().includes(userDegree.toLowerCase()) || 
          userDegree.toLowerCase().includes(suggestedDegree.toLowerCase())) {
        return 0.7; // Keyword match
      }
    }
  }
  
  // No match, but still return a moderate score
  return 0.4;
};

/**
 * Calculates a comprehensive match score between user criteria and a career path
 * with improved emphasis on industry and degree relevance
 * 
 * @param path - The career path to evaluate
 * @param criteria - The user's selected criteria
 * @returns A score between 0-100 representing the match quality and detailed breakdown
 */
export const calculateMatchScore = (path: CareerPath, criteria: MatchCriteria): { 
  score: number, 
  details: { 
    skillScore: number, 
    interestScore: number, 
    certificationScore: number, 
    degreeScore: number, 
    industryScore: number 
  } 
} => {
  // Initialize weights for different matching criteria - adjusted to prioritize industry and degrees
  const weights = {
    industry: 30,     // Very important - career field must match user's interest
    degrees: 25,      // Highly important - education should align with career
    skills: 20,       // Important but can be learned
    interests: 15,    // Important for satisfaction
    certifications: 10 // Can be obtained later
  };
  
  // Calculate match scores for each criteria (0-1 range)
  const skillScore = calculateArrayMatch(path.requiredSkills || [], criteria.skills);
  const interestScore = calculateArrayMatch(path.requiredInterests || [], criteria.interests);
  const certificationScore = calculateArrayMatch(path.requiredCertifications || [], criteria.certifications);
  const degreeScore = calculateDegreeMatch(path.suggestedDegrees || [], criteria.degrees);
  const industryScore = calculateIndustryMatch(path.industry, criteria.industries);
  
  // Calculate the final weighted score (0-100 range)
  const finalScore = (
    (skillScore * weights.skills) +
    (interestScore * weights.interests) +
    (industryScore * weights.industry) +
    (certificationScore * weights.certifications) +
    (degreeScore * weights.degrees)
  );
  
  // Calculate a more meaningful score that better reflects match quality
  return {
    score: Math.round(finalScore),
    details: {
      skillScore: Math.round(skillScore * 100),
      interestScore: Math.round(interestScore * 100),
      certificationScore: Math.round(certificationScore * 100),
      degreeScore: Math.round(degreeScore * 100),
      industryScore: Math.round(industryScore * 100)
    }
  };
};

/**
 * Finds career path matches based on user criteria with improved matching algorithm
 * 
 * @param criteria - The user's selected criteria
 * @param limit - Maximum number of results to return (default 20)
 * @returns An array of career paths sorted by match score
 */
export const findCareerMatches = async (criteria: MatchCriteria, limit: number = 20): Promise<CareerPath[]> => {
  try {
    // Ensure criteria object has all required properties
    const validatedCriteria: MatchCriteria = {
      skills: criteria.skills || [],
      interests: criteria.interests || [],
      degrees: criteria.degrees || [],
      certifications: criteria.certifications || [],
      industries: criteria.industries || []
    };
    
    // Check if user provided any criteria at all
    const hasCriteria = Object.values(validatedCriteria).some(arr => arr.length > 0);
    
    if (!hasCriteria) {
      throw new Error("Please provide at least one selection in the survey");
    }

    // Logging for debugging
    console.log("Matching with criteria:", {
      skills: validatedCriteria.skills,
      interests: validatedCriteria.interests,
      degrees: validatedCriteria.degrees, 
      certifications: validatedCriteria.certifications,
      industries: validatedCriteria.industries
    });
    
    // Fetch all career paths from the database - increase limit to 100+ paths
    const careerPathsResult = await databases.listDocuments(
      config.databaseId,
      config.careerPathsCollectionId,
      [Query.limit(200)] // Increased limit to get more career paths
    );
    
    if (!careerPathsResult || careerPathsResult.documents.length === 0) {
      throw new Error("No career paths available");
    }
    
    // Convert the documents to CareerPath objects
    const allPaths = careerPathsResult.documents.map(doc => ({
      $id: doc.$id,
      title: doc.title,
      description: doc.description,
      requiredSkills: doc.requiredSkills || [],
      requiredInterests: doc.requiredInterests || [],
      requiredCertifications: doc.requiredCertifications || [],
      suggestedDegrees: doc.suggestedDegrees || [],
      industry: doc.industry || ''
    })) as CareerPath[];
    
    console.log(`Evaluating ${allPaths.length} career paths`);
    
    // Calculate match scores for each career path
    const scoredPaths = allPaths.map(path => {
      const matchResult = calculateMatchScore(path, validatedCriteria);
      
      return {
        ...path,
        matchScore: matchResult.score,
        matchDetails: matchResult.details
      };
    });
    
    // Log some sample scores for debugging
    console.log("Sample match scores:", 
      scoredPaths.slice(0, 3).map(p => ({
        title: p.title, 
        score: p.matchScore,
        industry: p.industry,
        details: p.matchDetails
      }))
    );
    
    // Sort paths by match score (descending)
    const sortedPaths = scoredPaths.sort((a, b) => b.matchScore - a.matchScore);
    
    // Less restrictive filtering for better results
    let filteredPaths = sortedPaths;
    
    if (validatedCriteria.industries.length > 0) {
      // Get industry-matched paths including related industries
      const industryMatches = sortedPaths.filter(
        path => path.matchDetails?.industryScore >= 60 // Lowered threshold for industry score
      );
      
      // If we have enough industry matches, prioritize those
      if (industryMatches.length >= 3) {
        console.log(`Found ${industryMatches.length} paths with good industry matches`);
        filteredPaths = industryMatches;
      } else {
        // Otherwise, keep top paths but still filter very low industry scores
        filteredPaths = sortedPaths.filter(
          path => path.matchDetails?.industryScore >= 20
        );
      }
    }
    
    // Less restrictive degree filtering to find more matches
    if (validatedCriteria.degrees.length > 0 && filteredPaths.length >= 5) {
      // Find paths with reasonable degree matches
      const degreeMatches = filteredPaths.filter(
        path => path.matchDetails?.degreeScore >= 40 // Lowered threshold for degree score
      );
      
      // If we have enough degree matches, prioritize those
      if (degreeMatches.length >= 3) {
        console.log(`Found ${degreeMatches.length} paths with reasonable degree matches`);
        filteredPaths = degreeMatches;
      }
    }
    
    // Ensure we have a minimum number of results
    if (filteredPaths.length < 3) {
      console.log("Not enough matches, reverting to score-based filtering");
      // If too few matches, just use the top scoring paths
      filteredPaths = sortedPaths.filter(path => path.matchScore >= 25);
    }
    
    // Make sure we return at least 3 results if available
    const minResults = Math.min(3, sortedPaths.length);
    
    // If we still don't have enough results, take the top scoring paths
    if (filteredPaths.length < minResults) {
      console.log("Using top scoring paths to ensure minimum results");
      filteredPaths = sortedPaths.slice(0, minResults);
    }
    
    console.log(`Returning ${Math.min(filteredPaths.length, limit)} career paths`);
    
    return filteredPaths.slice(0, limit);
  } catch (error) {
    console.error("Error finding career matches:", error);
    throw error;
  }
};

/**
 * Saves the user's survey data to their profile
 * 
 * @param data - The user's survey data
 * @returns The updated user document
 */
export const saveSurveyData = async (data: {
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
    
    // Completely replace the existing data with new selections
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        degrees: data.degrees,
        certifications: data.certifications,
        skills: data.skills,
        interests: data.interests,
        interestedFields: data.interestedFields
      }
    );
    
    return updatedUser;
  } catch (error) {
    console.error("Error saving survey data:", error);
    throw error;
  }
};

/**
 * Completes the survey process and marks it as taken
 * 
 * @param pathId - The ID of the selected career path
 * @returns Boolean indicating success
 */
export const completeSurvey = async (pathId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Update the user's selected path and mark the test as taken
    await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        selectedPath: pathId,
        testTaken: true
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error completing survey:", error);
    return false;
  }
};

/**
 * Gets recommended skill gaps for a specific career path
 * 
 * @param careerPathId - The ID of the career path
 * @returns Array of skills the user should acquire
 */
export const getCareerPathSkillGaps = async (careerPathId: string): Promise<string[]> => {
  try {
    // Get the career path
    const careerPath = await databases.getDocument(
      config.databaseId,
      config.careerPathsCollectionId,
      careerPathId
    );
    
    if (!careerPath) {
      throw new Error("Career path not found");
    }
    
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userSkills = currentUser.skills || [];
    const requiredSkills = careerPath.requiredSkills || [];
    
    // Find skills the user is missing
    const skillGaps = requiredSkills.filter(skill => !userSkills.includes(skill));
    
    return skillGaps;
  } catch (error) {
    console.error("Error getting skill gaps:", error);
    throw error;
  }
};

/**
 * Saves a career path to user's bookmarks
 * 
 * @param pathId - The ID of the career path to save
 * @returns Object indicating success and saved status
 */
export const saveCareerPath = async (pathId: string): Promise<{ success: boolean, isSaved: boolean }> => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Get user's current saved paths
    const savedPaths = currentUser.savedPaths || [];
    
    // Check if path is already saved
    const pathIndex = savedPaths.indexOf(pathId);
    let isSaved = false;
    
    if (pathIndex >= 0) {
      // Path is already saved, so remove it (unsave)
      savedPaths.splice(pathIndex, 1);
    } else {
      // Path is not saved, so add it
      savedPaths.push(pathId);
      isSaved = true;
    }
    
    // Update the user document
    await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        savedPaths: savedPaths
      }
    );
    
    return { success: true, isSaved };
  } catch (error) {
    console.error("Error saving career path:", error);
    return { success: false, isSaved: false };
  }
};

/**
 * Checks if a career path is saved by the user
 * 
 * @param pathId - The ID of the career path to check
 * @returns Boolean indicating if the path is saved
 */
export const isCareerPathSaved = async (pathId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Get user's current saved paths
    const savedPaths = currentUser.savedPaths || [];
    
    // Check if path is in the saved paths
    return savedPaths.includes(pathId);
  } catch (error) {
    console.error("Error checking if path is saved:", error);
    return false;
  }
};
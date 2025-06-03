import { databases, config, getCurrentUser } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { CareerPath, calculateMatchScore } from './careerMatching';

export interface ChangerMatchCriteria {
  currentPath: string;
  skills: string[];
  interests: string[];
  degrees: string[];
  certifications: string[];
  industries: string[];
}

/**
 * Calculates transferable skills matching for career changers
 * 
 * @param currentPath - The user's current career path
 * @param targetPath - The potential new career path
 * @param userSkills - The user's skills
 * @returns A transferable skills score between 0-1
 */
const calculateTransferableSkillsScore = (
  currentPathSkills: string[],
  targetPathSkills: string[],
  userSkills: string[]
): number => {
  if (!targetPathSkills || targetPathSkills.length === 0) return 0.5;
  if (!userSkills || userSkills.length === 0) return 0.3;
  
  // Find skills that are transferable (in both paths)
  const transferableSkills = currentPathSkills.filter(skill => 
    targetPathSkills.some(targetSkill => 
      targetSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(targetSkill.toLowerCase())
    )
  );
  
  // Count how many transferable skills the user has
  const userTransferableSkills = transferableSkills.filter(skill =>
    userSkills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  ).length;
  
  // Calculate transferability score
  const transferabilityScore = transferableSkills.length > 0 
    ? userTransferableSkills / transferableSkills.length 
    : 0.4;
  
  // Give a boost if user has many transferable skills
  return Math.min(1, transferabilityScore * 1.5);
};

/**
 * Calculate career transition difficulty score
 * 
 * @param currentIndustry - User's current industry
 * @param targetIndustry - Potential new industry
 * @returns A score where lower means easier transition (0.2-1 range)
 */
const calculateTransitionDifficulty = (
  currentIndustry: string,
  targetIndustry: string
): number => {
  // Easy transitions (same industry)
  if (currentIndustry === targetIndustry) {
    return 0.2; // Very easy transition
  }
  
  // Define industry relationships for transition difficulty
  const relatedIndustries: Record<string, { easy: string[], moderate: string[] }> = {
    'Technology': {
      easy: ['Engineering', 'Business'],
      moderate: ['Finance', 'Science', 'Education']
    },
    'Business': {
      easy: ['Finance', 'Technology'],
      moderate: ['Creative Arts', 'Education', 'Healthcare']
    },
    'Healthcare': {
      easy: ['Science'],
      moderate: ['Education', 'Business', 'Technology']
    },
    'Finance': {
      easy: ['Business'],
      moderate: ['Technology', 'Education']
    },
    'Creative Arts': {
      easy: ['Education'],
      moderate: ['Business', 'Technology']
    },
    'Engineering': {
      easy: ['Technology', 'Science'],
      moderate: ['Environment', 'Education']
    },
    'Science': {
      easy: ['Engineering', 'Healthcare', 'Environment'],
      moderate: ['Technology', 'Education']
    },
    'Education': {
      easy: ['Creative Arts', 'Science'],
      moderate: ['Business', 'Healthcare', 'Technology']
    },
    'Environment': {
      easy: ['Science', 'Engineering'],
      moderate: ['Education']
    }
  };
  
  // Check transition difficulty based on industry relationships
  const relationships = relatedIndustries[currentIndustry] || { easy: [], moderate: [] };
  
  if (relationships.easy.includes(targetIndustry)) {
    return 0.4; // Easy transition
  } else if (relationships.moderate.includes(targetIndustry)) {
    return 0.6; // Moderate transition
  } else {
    return 0.8; // Hard transition
  }
};

/**
 * Finds career path matches for career changers, excluding current path
 * with emphasis on transferable skills and reasonable transitions
 * 
 * @param criteria - The user's selected criteria including current path
 * @param limit - Maximum number of results to return (default 20)
 * @returns An array of career paths sorted by match score
 */
export const findCareerMatchesForChanger = async (
  criteria: ChangerMatchCriteria, 
  limit: number = 20
): Promise<CareerPath[]> => {
  try {
    // Ensure criteria object has all required properties
    const validatedCriteria: ChangerMatchCriteria = {
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
    const currentPathSkills = currentPathData.requiredSkills || [];
    const currentPathIndustry = currentPathData.industry || '';
    
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
    const allPaths = careerPathsResult.documents
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
    
    console.log(`Evaluating ${allPaths.length} potential new career paths`);
    
    // Calculate match scores for each career path with additional career changer criteria
    const scoredPaths = allPaths.map(path => {
      // Calculate standard match score first
      const standardMatchResult = calculateMatchScore(path, {
        skills: validatedCriteria.skills,
        interests: validatedCriteria.interests,
        degrees: validatedCriteria.degrees,
        certifications: validatedCriteria.certifications,
        industries: validatedCriteria.industries
      });
      
      // Calculate additional career changer metrics
      const transferableSkillsScore = calculateTransferableSkillsScore(
        currentPathSkills,
        path.requiredSkills || [],
        validatedCriteria.skills
      );
      
      const transitionDifficulty = calculateTransitionDifficulty(
        currentPathIndustry,
        path.industry || ''
      );
      
      // Adjust the match score based on transferable skills and transition difficulty
      // Give a boost to paths with high transferable skills and penalize difficult transitions
      const adjustedScore = Math.round(
        standardMatchResult.score * 0.7 + // Base match score (70% weight)
        (transferableSkillsScore * 100) * 0.2 + // Transferable skills (20% weight)
        ((1 - transitionDifficulty) * 100) * 0.1 // Ease of transition (10% weight)
      );
      
      return {
        ...path,
        matchScore: adjustedScore,
        matchDetails: {
          ...standardMatchResult.details,
          transferableSkillsScore: Math.round(transferableSkillsScore * 100),
          transitionDifficulty: Math.round(transitionDifficulty * 100)
        }
      };
    });
    
    // Sort paths by adjusted match score (descending)
    const sortedPaths = scoredPaths.sort((a, b) => b.matchScore - a.matchScore);
    
    // Apply filters for career changers - favor paths with higher transferable skills
    const filteredPaths = sortedPaths.filter(path => 
      // Ensure the path has at least a moderate match score
      path.matchScore >= 40 &&
      // And reasonable transferable skills
      path.matchDetails.transferableSkillsScore >= 30
    );
    
    // If filtering results in too few paths, relax the criteria
    if (filteredPaths.length < 3) {
      // Just use the top scoring paths
      return sortedPaths.slice(0, Math.min(limit, sortedPaths.length));
    }
    
    // Return filtered paths within the limit
    return filteredPaths.slice(0, limit);
  } catch (error) {
    console.error("Error finding career matches for changer:", error);
    throw error;
  }
};

/**
 * Saves the career changer's survey data to their profile
 * 
 * @param data - The user's survey data including current path
 * @returns The updated user document
 */
export const saveSurveyDataForChanger = async (data: {
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
    console.error("Error saving changer survey data:", error);
    throw error;
  }
};

/**
 * Completes the survey process for career changers
 * 
 * @param pathId - The ID of the selected new career path
 * @returns Boolean indicating success
 */
export const completeChangerSurvey = async (pathId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Update the user's selected path and mark as a career changer
    await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        selectedPath: pathId,
        testTaken: true,
        isCareerChanger: true,
        previousPath: currentUser.currentPath || null
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error completing changer survey:", error);
    return false;
  }
};

/**
 * Gets the skill gaps between current path and target path
 * 
 * @param currentPathId - The ID of the current career path
 * @param targetPathId - The ID of the target career path
 * @param userSkills - The user's current skills
 * @returns Array of skills the user needs to acquire for the transition
 */
export const getCareerTransitionSkillGaps = async (
  currentPathId: string,
  targetPathId: string,
  userSkills: string[] = []
): Promise<string[]> => {
  try {
    // Get the current and target career paths
    const currentPath = await databases.getDocument(
      config.databaseId,
      config.careerPathsCollectionId,
      currentPathId
    );
    
    const targetPath = await databases.getDocument(
      config.databaseId,
      config.careerPathsCollectionId,
      targetPathId
    );
    
    if (!currentPath || !targetPath) {
      throw new Error("Career path not found");
    }
    
    const currentPathSkills = currentPath.requiredSkills || [];
    const targetPathSkills = targetPath.requiredSkills || [];
    
    // Find required skills in target path that are not in current path
    // and that the user doesn't already have
    const newSkillsNeeded = targetPathSkills.filter(skill => 
      !currentPathSkills.includes(skill) && 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    return newSkillsNeeded;
  } catch (error) {
    console.error("Error getting transition skill gaps:", error);
    throw error;
  }
};
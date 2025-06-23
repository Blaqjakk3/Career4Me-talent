import { functions } from './appwrite';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';


interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  professionalSummary: string;
   education: Array<{
    degree: string;
    institution: string;
    year: string; // This will combine start and end years
    gpa?: string;
    relevantCoursework?: string[];
    honors?: string[];
  }>;
  workExperience: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
    technologies?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration: string;
    link?: string;
    keyFeatures: string[];
    impact?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  additionalSections: {
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    volunteer: Array<{
      role: string;
      organization: string;
      duration: string;
      description: string;
    }>;
    awards: Array<{
      title: string;
      issuer: string;
      date: string;
      description: string;
    }>;
    publications: Array<{
      title: string;
      journal: string;
      date: string;
      link?: string;
    }>;
  };
  careerPathAlignment: {
    targetCareer: string;
    alignmentScore: number;
    matchingSkills: string[];
    recommendedSkills: string[];
    nextSteps: string[];
  };
  cvOptimization: {
    atsScore: number;
    keywords: string[];
    suggestions: string[];
    strengthAreas: string[];
    improvementAreas: string[];
  };
}

interface AdditionalInfo {
  experiences?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    achievements?: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    duration: string;
    link?: string;
    features?: string[];
  }>;
  phoneNumber?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  summary?: string;
}

interface CVGenerationResponse {
  cvData: CVData;
  metadata: {
    talent: {
      id: string;
      fullname: string;
      careerStage: string;
    };
    careerPath: {
      id: string;
      title: string;
    } | null;
    generatedAt: string;
    executionTime: number;
    additionalInfoProvided: {
      hasExperiences: boolean;
      hasProjects: boolean;
      hasContactInfo: boolean;
      hasSocialLinks: boolean;
      hasSummary: boolean;
    };
  };
}


/**
 * Optimized CV generation - single call, no fallback
 * @param talentId - The talentId field value (NOT the document $id)
 * @param additionalInfo - Additional information provided by user
 * @returns CV generation response
 */
export const generateComprehensiveCV = async (
  talentId: string,
  additionalInfo: AdditionalInfo
): Promise<CVGenerationResponse> => {
  console.log('Starting optimized CV generation for:', talentId);
  
  try {
    // Validate and clean input data first
    const cleanedInfo = validateAdditionalInfo(additionalInfo);
    
    // Create execution with optimized timeout
    const execution = await functions.createExecution(
      'Generate-CV',
      JSON.stringify({
        talentId,
        additionalInfo: cleanedInfo
      }),
      false // async = false for immediate response
    );
    
    console.log('CV generation execution status:', execution.status);

    // Handle execution results
    if (execution.status === 'failed') {
      const errorMsg = execution.stderr || 'CV generation failed';
      console.error('CV generation failed:', errorMsg);
      throw new Error(errorMsg);
    }

    // Parse response efficiently
    const rawResponse = execution.responseBody || execution.response || execution.stdout;
    if (!rawResponse) {
      throw new Error('No response data received from CV generation');
    }

    const responseData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    if (!responseData?.success) {
      const errorMessage = responseData?.error || 'Unknown CV generation error';
      console.error('CV generation function error:', errorMessage);
      
      // Specific error handling without generic fallback
      switch (responseData?.statusCode) {
        case 404:
          throw new Error('User profile not found. Please log in again.');
        case 408:
          throw new Error('CV generation timed out. Please try again.');
        case 400:
          throw new Error(`Invalid request: ${errorMessage}`);
        default:
          throw new Error(errorMessage);
      }
    }

    if (!responseData.cvData) {
      console.error('Invalid response structure:', responseData);
      throw new Error('Invalid CV generation response format');
    }

    console.log('Successfully generated CV in', responseData.metadata?.executionTime, 'ms');
    return {
      cvData: responseData.cvData,
      metadata: responseData.metadata
    };

  } catch (error) {
    console.error('CV generation error:', error);
    
    // Clean error handling without fallback retry
    if (error.message.includes('timeout')) {
      throw new Error('CV generation timed out. Please try again.');
    } else if (error.message.includes('not found')) {
      throw new Error('User profile not found. Please log in again.');
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw error;
    }
  }
};

/**
 * Fast input validation with minimal overhead
 * @param additionalInfo - Additional information to validate
 * @returns Cleaned and validated additional info object
 */
export const validateAdditionalInfo = (additionalInfo: AdditionalInfo): AdditionalInfo => {
  const validated: AdditionalInfo = {};
  
  // Quick validation with early returns
  if (additionalInfo.experiences?.length) {
    validated.experiences = additionalInfo.experiences.filter(exp => 
      exp.position?.trim() && exp.company?.trim()
    );
  }
  
  if (additionalInfo.projects?.length) {
    validated.projects = additionalInfo.projects.filter(project => 
      project.name?.trim() && project.description?.trim()
    );
  }
  
  // Direct assignment for simple fields
  const simpleFields = ['phoneNumber', 'address', 'linkedin', 'portfolio', 'github', 'summary'];
  simpleFields.forEach(field => {
    const value = additionalInfo[field]?.trim();
    if (value) validated[field] = value;
  });
  
  return validated;
};

/**
 * Calculate CV completeness score efficiently
 * @param cvData - Generated CV data
 * @returns Completeness score (0-100)
 */
export const calculateCVCompleteness = (cvData: CVData): number => {
  let score = 0;
  
  // Personal info (25 points)
  const personalFields = ['fullName', 'email', 'phone', 'address'];
  const personalScore = personalFields.filter(field => 
    cvData.personalInfo[field as keyof typeof cvData.personalInfo]?.trim()
  ).length;
  score += (personalScore / personalFields.length) * 25;
  
  // Core sections (15 points each)
  if (cvData.professionalSummary?.trim()) score += 15;
  if (cvData.education?.length) score += 15;
  if (cvData.workExperience?.length) score += 15;
  
  // Skills (15 points)
  const skillCount = Object.values(cvData.skills).flat().length;
  if (skillCount > 0) score += 15;
  
  // Optional sections (5 points each)
  if (cvData.projects?.length) score += 5;
  if (cvData.certifications?.length) score += 5;
  if (cvData.careerPathAlignment?.targetCareer) score += 5;
  if (cvData.cvOptimization?.atsScore > 0) score += 5;
  
  return Math.round(score);
};

/**
 * Format CV data for display with essential info only
 * @param cvData - Raw CV data
 * @returns Formatted CV data with display properties
 */
export const formatCVForDisplay = (cvData: CVData) => {
  return {
    ...cvData,
    completenessScore: calculateCVCompleteness(cvData),
    sectionCounts: {
      education: cvData.education?.length || 0,
      workExperience: cvData.workExperience?.length || 0,
      projects: cvData.projects?.length || 0,
      certifications: cvData.certifications?.length || 0,
      totalSkills: Object.values(cvData.skills).flat().length || 0
    },
    displayMetrics: {
      atsScore: cvData.cvOptimization?.atsScore || 0,
      alignmentScore: cvData.careerPathAlignment?.alignmentScore || 0,
      keywordCount: cvData.cvOptimization?.keywords?.length || 0
    }
  };
};

/**
 * Get user-friendly status messages
 * @param stage - Current processing stage
 * @returns Human-readable status message
 */
export const getGenerationStatus = (stage: string): string => {
  const statusMap = {
    'validating': 'Validating your information...',
    'fetching': 'Fetching your profile...',
    'generating': 'Generating your CV with AI...',
    'optimizing': 'Optimizing for job applications...',
    'completed': 'CV generated successfully!'
  };
  
  return statusMap[stage] || 'Processing...';
};

/**
 * Utility to check if CV data is complete enough for download
 * @param cvData - CV data to check
 * @returns Whether CV is ready for download
 */
export const isCVReadyForDownload = (cvData: CVData): boolean => {
  const completenessScore = calculateCVCompleteness(cvData);
  const hasEssentials = !!(
    cvData.personalInfo?.fullName &&
    cvData.personalInfo?.email &&
    cvData.professionalSummary &&
    (cvData.education?.length || cvData.workExperience?.length || cvData.projects?.length)
  );
  
  return completenessScore >= 60 && hasEssentials;
};

/**
 * Extract key insights from generated CV
 * @param cvData - Generated CV data
 * @returns Key insights object
 */
export const extractCVInsights = (cvData: CVData) => {
  return {
    strengthAreas: cvData.cvOptimization?.strengthAreas || [],
    improvementAreas: cvData.cvOptimization?.improvementAreas || [],
    recommendedSkills: cvData.careerPathAlignment?.recommendedSkills || [],
    nextSteps: cvData.careerPathAlignment?.nextSteps || [],
    keywordOptimization: {
      score: cvData.cvOptimization?.atsScore || 0,
      keywords: cvData.cvOptimization?.keywords || [],
      suggestions: cvData.cvOptimization?.suggestions || []
    }
  };
};
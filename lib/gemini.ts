import { functions } from './appwrite';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; // Add this import

interface Project {
  title: string;
  objectives: string[];
  steps: string[];
  tools: string[];
  timeCommitment: string;
  realWorldRelevance: string;
}

interface InterviewQuestion {
  id: number;
  question: string;
  answer: string;
  tips: string[];
}

interface InterviewQuestionsResponse {
  questions: InterviewQuestion[];
  metadata: {
    totalQuestions: number;
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
    executionTime?: number;
    usedFallback?: boolean;
  };
}
interface CVAnalysisResponse {
  analysis: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    profileVsCvGaps: {
      missingFromCV: string[];
      missingFromProfile: string[];
      inconsistencies: string[];
    };
    careerPathAlignment?: {
      alignmentScore: number;
      matchingSkills: string[];
      missingSkills: string[];
      matchingCertifications: string[];
      missingCertifications: string[];
      relevantExperience: string[];
      additionalRequirements: string[];
    };
    recommendations: string[];
    nextSteps: string[];
    marketability: {
      score: number;
      summary: string;
      competitiveAdvantages: string[];
      improvementAreas: string[];
    };
  };
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
    fileName: string;
    analyzedAt: string;
    executionTime: number;
    usedFallback: boolean;
  };
}
interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  location?: string;
}

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string;
  link?: string;
  details: string[];
}

interface Certification {
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

interface ContactInfo {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  phone?: string;
}

export interface CVGenerationRequest {
  talentId: string;
  additionalSkills?: string[];
  educationDetails?: Education[];
  workExperiences?: WorkExperience[];
  projects?: Project[];
  certifications?: Certification[];
  contactInfo?: ContactInfo;
}

export interface CVGenerationResponse {
  success: boolean;
  pdfData?: string;
  metadata?: {
    talentName: string;
    generatedAt: string;
    sections: string[];
  };
  error?: string;
  details?: string;
}





/**
 * Picks a CV document from the device
 * @returns DocumentPicker result or null if cancelled
 */
export const pickCVDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ],
      copyToCacheDirectory: true,
      multiple: false
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    
    // Validate file size (max 5MB for free tier optimization)
    if (file.size && file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    return file;
  } catch (error) {
    console.error('Error picking document:', error);
    throw error;
  }
};

/**
 * Converts file to base64 for API transmission
 * @param fileUri - Local file URI
 * @returns Base64 encoded string
 */
const convertFileToBase64 = async (fileUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw new Error('Failed to process file');
  }
};

/**
 * Analyzes a CV document using Gemini AI
 * @param talentId - The talentId field value (NOT the document $id)
 * @param fileUri - Local URI of the CV file
 * @param fileName - Name of the file
 * @returns CV analysis results
 */
export const analyzeCVDocument = async (
  talentId: string,
  fileUri: string,
  fileName: string
): Promise<CVAnalysisResponse> => {
  try {
    console.log('Starting CV analysis for talentId:', talentId);
    
    // ⚠️ IMPORTANT: Ensure you're passing the correct talentId field value
    // This should be the same value used successfully in generateInterviewQuestions
    // NOT the document $id from the talents collection
    
    // Convert file to base64
    console.log('Converting file to base64...');
    const fileData = await convertFileToBase64(fileUri);
    
    // Create execution with timeout
    const executionPromise = functions.createExecution(
      'General-CV-Analysis',
      JSON.stringify({
        talentId, // This MUST be the talentId field value, same as for interview questions
        fileData,
        fileName
      }),
      false
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Client timeout: CV analysis took too long')), 30000);
    });

    const execution = await Promise.race([executionPromise, timeoutPromise]);
    
    console.log('CV analysis execution completed:', execution.status);

    if (execution.status === 'failed') {
      console.error('CV analysis failed:', execution.stderr);
      throw new Error(execution.stderr || 'CV analysis failed');
    }

    const rawResponse = execution.responseBody || execution.response || execution.stdout;
    if (!rawResponse) {
      console.error('No response data found');
      throw new Error('No response data found in execution object');
    }

    const responseData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    if (!responseData?.success) {
      const errorMessage = responseData?.error || 'Unknown analysis error';
      console.error('Analysis function returned error:', errorMessage);
      
      if (responseData?.statusCode === 408) {
        throw new Error('Analysis timeout - the request took too long. Please try again.');
      } else if (responseData?.statusCode === 404) {
        throw new Error('User not found. Please log in again.');
      } else if (responseData?.statusCode === 400) {
        throw new Error(errorMessage);
      } else {
        throw new Error(errorMessage);
      }
    }

    if (!responseData.analysis) {
      console.error('Invalid response structure:', responseData);
      throw new Error('Invalid analysis response format');
    }

    console.log('Successfully received CV analysis');
    return {
      analysis: responseData.analysis,
      metadata: responseData.metadata
    };

  } catch (error) {
    console.error('Error in CV analysis:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('The analysis timed out. Please try again with a smaller file.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message.includes('not found')) {
      throw new Error('User not found. Please log in again.');
    } else if (error.message.includes('File size')) {
      throw error;
    } else {
      throw error;
    }
  }
};

/**
 * Analyzes CV with retry mechanism for better reliability
 * @param talentId - The talentId field value (NOT the document $id)
 * @param fileUri - Local URI of the CV file
 * @param fileName - Name of the file
 * @param maxRetries - Maximum number of retry attempts
 * @returns CV analysis results
 */
export const analyzeCVWithRetry = async (
  talentId: string,
  fileUri: string,
  fileName: string,
  maxRetries: number = 2
): Promise<CVAnalysisResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`CV analysis attempt ${attempt} of ${maxRetries}`);
      const result = await analyzeCVDocument(talentId, fileUri, fileName);
      console.log('Successfully completed CV analysis');
      return result;
      
    } catch (error) {
      console.error(`CV analysis attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      // Don't retry for certain types of errors
      if (error.message.includes('not found') || 
          error.message.includes('authentication') ||
          error.message.includes('File size') ||
          error.message.includes('Unsupported file type')) {
        console.error('Non-retryable error, stopping attempts');
        throw error;
      }
      
      if (attempt === maxRetries) break;
      
      // Exponential backoff with jitter
      const baseWaitTime = Math.pow(2, attempt) * 1000;
      const jitter = Math.random() * 1000;
      const waitTime = baseWaitTime + jitter;
      
      console.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`Failed to analyze CV after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}`);
};

/**
 * Utility function to get score color based on score value
 * @param score - Numerical score (0-100)
 * @returns Color string for UI
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // Green
  if (score >= 60) return '#f59e0b'; // Yellow
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

/**
 * Utility function to get score description
 * @param score - Numerical score (0-100)
 * @returns Human-readable score description
 */
export const getScoreDescription = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

/**
 * Formats the analysis data for easy display
 * @param analysis - Raw analysis data
 * @returns Formatted analysis object
 */
export const formatAnalysisForDisplay = (analysis: CVAnalysisResponse['analysis']) => {
  return {
    ...analysis,
    overallScoreFormatted: {
      score: analysis.overallScore,
      color: getScoreColor(analysis.overallScore),
      description: getScoreDescription(analysis.overallScore)
    },
    marketabilityFormatted: {
      ...analysis.marketability,
      color: getScoreColor(analysis.marketability.score),
      description: getScoreDescription(analysis.marketability.score)
    },
    careerAlignmentFormatted: analysis.careerPathAlignment ? {
      ...analysis.careerPathAlignment,
      color: getScoreColor(analysis.careerPathAlignment.alignmentScore),
      description: getScoreDescription(analysis.careerPathAlignment.alignmentScore)
    } : null
  };
};

/**
 * Generates interview questions for a talent
 * @param talentId - The talentId field value (NOT the document $id)
 * @returns Interview questions response
 */
export const generateInterviewQuestions = async (
  talentId: string
): Promise<InterviewQuestionsResponse> => {
  try {
    console.log('Calling interview questions function with talentId:', talentId);
    
    const executionPromise = functions.createExecution(
      'generateinterviewquestions',
      JSON.stringify({ talentId }), // This should be the talentId field value
      false
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Client timeout: Function took too long to respond')), 20000);
    });

    const execution = await Promise.race([executionPromise, timeoutPromise]);
    
    console.log('Function execution completed:', execution.status);

    if (execution.status === 'failed') {
      console.error('Function execution failed:', execution.stderr);
      throw new Error(execution.stderr || 'Function execution failed');
    }

    const rawResponse = execution.responseBody || execution.response || execution.stdout;
    if (!rawResponse) {
      console.error('No response data found');
      throw new Error('No response data found in execution object');
    }

    const responseData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    if (!responseData?.success) {
      const errorMessage = responseData?.error || 'Unknown function error';
      console.error('Function returned error:', errorMessage);
      
      if (responseData?.statusCode === 408) {
        throw new Error('Function timeout - the request took too long. Please try again.');
      } else if (responseData?.statusCode === 404) {
        throw new Error('User not found. Please log in again.');
      } else {
        throw new Error(errorMessage);
      }
    }

    if (!Array.isArray(responseData.questions) || responseData.questions.length === 0) {
      console.error('Invalid response structure:', responseData);
      throw new Error('No questions were generated');
    }

    console.log(`Successfully received ${responseData.questions.length} questions`);
    return {
      questions: responseData.questions,
      metadata: responseData.metadata
    };

  } catch (error) {
    console.error('Error calling interview questions function:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('The request timed out. Please try again in a moment.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message.includes('not found')) {
      throw new Error('User not found. Please log in again.');
    } else {
      throw error;
    }
  }
};

export const generateInterviewQuestionsWithRetry = async (
  talentId: string,
  maxRetries: number = 3
): Promise<InterviewQuestionsResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Interview questions attempt ${attempt} of ${maxRetries}`);
      const result = await generateInterviewQuestions(talentId);
      console.log('Successfully generated interview questions:', result.metadata.totalQuestions, 'questions');
      return result;
      
    } catch (error) {
      console.error(`Interview questions attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      if (error.message.includes('not found') || error.message.includes('authentication')) {
        console.error('Non-retryable error, stopping attempts');
        throw error;
      }
      
      if (attempt === maxRetries) break;
      
      const baseWaitTime = Math.pow(2, attempt) * 1000;
      const jitter = Math.random() * 1000;
      const waitTime = baseWaitTime + jitter;
      
      console.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`Failed to generate interview questions after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}`);
};

export const generateProjects = async (
  careerPathId: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<Project[]> => {
  try {
    console.log('Calling function with:', { careerPathId, difficulty });
    
    const execution = await functions.createExecution(
      'generate-projects',
      JSON.stringify({ careerPathId, difficulty }),
      false
    );

    console.log('Raw execution response:', JSON.stringify(execution, null, 2));

    const rawResponse = execution.responseBody || execution.response || execution.stdout;
    if (!rawResponse) throw new Error('No response data found in execution object');

    const responseData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    if (!responseData) throw new Error('Empty response data');

    if (responseData.success && Array.isArray(responseData.projects)) {
      return responseData.projects;
    }

    if (responseData.error) throw new Error(responseData.error);
    throw new Error('Invalid response format from function');

  } catch (error) {
    console.error('Error calling Appwrite function:', error);
    throw error;
  }
};

export const generateProjectsWithRetry = async (
  careerPathId: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  maxRetries: number = 3
): Promise<Project[]> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}`);
      const projects = await generateProjects(careerPathId, difficulty);
      console.log('Successfully generated projects:', projects);
      return projects;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('All retry attempts failed');
        throw new Error('Failed to generate projects after multiple attempts');
      }
      
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('All retry attempts failed');
};

/**
 * Helper function to debug talent ID issues
 * This function will help you identify what values you're passing
 * @param description - Description of where this is being called from
 * @param talentId - The talent ID you're about to use
 */
export const debugTalentId = (description: string, talentId: string) => {
  console.log(`🔍 DEBUG ${description}:`, {
    talentId,
    length: talentId.length,
    isObjectId: /^[0-9a-fA-F]{24}$/.test(talentId), // MongoDB ObjectId pattern
    isAppwriteId: /^[0-9a-fA-F]{16,}$/.test(talentId) // Appwrite ID pattern
  });
};

/**
 * Generates a professional CV using AI and PDF generation
 * @param request - CV generation request parameters
 * @returns Promise<CVGenerationResponse>
 */
export const generateCV = async (request: CVGenerationRequest): Promise<CVGenerationResponse> => {
  try {
    console.log('Starting CV generation for talentId:', request.talentId);
    
    // Validate request before sending
    validateCVRequest(request);
    
    const executionPromise = functions.createExecution(
      'Generate-CV',
      JSON.stringify(request),
      false
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('CV generation timeout - request took longer than 45 seconds')), 45000);
    });

    const execution = await Promise.race([executionPromise, timeoutPromise]);
    
    console.log('CV generation execution completed with status:', execution.status);

    if (execution.status === 'failed') {
      const errorMessage = execution.stderr || execution.responseBody || 'CV generation failed';
      console.error('CV generation failed:', errorMessage);
      throw new Error(errorMessage);
    }

    // Parse response from different possible sources
    const rawResponse = execution.responseBody || execution.response || execution.stdout;
    if (!rawResponse) {
      throw new Error('No response data received from CV generation function');
    }

    let responseData: CVGenerationResponse;
    try {
      responseData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
    } catch (parseError) {
      console.error('Failed to parse CV generation response:', parseError);
      throw new Error('Invalid response format from CV generation function');
    }

    if (!responseData?.success) {
      const errorMessage = responseData?.error || 'Unknown CV generation error';
      console.error('CV generation function returned error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!responseData.pdfData) {
      throw new Error('No PDF data received from CV generation function');
    }

    console.log('Successfully generated CV for:', responseData.metadata?.talentName || 'unknown user');
    return responseData;

  } catch (error) {
    console.error('Error in CV generation:', error);
    
    // Return a proper error response format
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during CV generation'
    };
  }
};

/**
 * Downloads the generated CV to device with improved error handling
 * @param pdfData - Base64 encoded PDF data
 * @param fileName - Name for the downloaded file
 * @returns Promise<boolean> - Success status
 */
export const downloadCV = async (pdfData: string, fileName: string = 'my-cv.pdf'): Promise<boolean> => {
  try {
    console.log('Starting CV download...');
    
    if (!pdfData) {
      throw new Error('No PDF data provided for download');
    }

    // Ensure fileName has .pdf extension
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName += '.pdf';
    }
    
    // Create file path in document directory
    const fileUri = FileSystem.documentDirectory + fileName;
    
    // Write PDF data to file
    await FileSystem.writeAsStringAsync(fileUri, pdfData, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('CV saved to:', fileUri);
    
    // Check if sharing is available and share the file
    const sharingAvailable = await Sharing.isAvailableAsync();
    if (sharingAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Your CV',
      });
      console.log('CV shared successfully');
      return true;
    } else {
      console.log('Sharing not available on this device - file saved to documents');
      // File is still saved to device storage even if sharing isn't available
      return true;
    }
    
  } catch (error) {
    console.error('Error downloading CV:', error);
    throw new Error(`Failed to download CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generates CV with retry mechanism for better reliability
 * @param request - CV generation request
 * @param maxRetries - Maximum retry attempts (default: 2)
 * @returns Promise<CVGenerationResponse>
 */
export const generateCVWithRetry = async (
  request: CVGenerationRequest,
  maxRetries: number = 2
): Promise<CVGenerationResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`CV generation attempt ${attempt} of ${maxRetries}`);
      const result = await generateCV(request);
      
      if (result.success) {
        console.log('Successfully generated CV on attempt', attempt);
        return result;
      } else {
        // If the function returned an error response, treat it as an error
        throw new Error(result.error || 'CV generation failed');
      }
      
    } catch (error) {
      console.error(`CV generation attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      // Don't retry for certain types of errors
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      if (errorMessage.includes('not found') || 
          errorMessage.includes('not authorized') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('permission')) {
        console.log('Non-retryable error detected, stopping retries');
        break;
      }
      
      if (attempt === maxRetries) {
        console.log('Max retries reached');
        break;
      }
      
      // Exponential backoff before retry
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // Return error response instead of throwing
  return {
    success: false,
    error: `Failed to generate CV after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  };
};

/**
 * Validates CV generation request data
 * @param request - CV generation request
 * @throws Error if validation fails
 */
export const validateCVRequest = (request: CVGenerationRequest): void => {
  if (!request.talentId || typeof request.talentId !== 'string') {
    throw new Error('Valid talent ID is required');
  }
  
  // Validate education details if provided
  if (request.educationDetails && Array.isArray(request.educationDetails)) {
    for (const [index, edu] of request.educationDetails.entries()) {
      if (!edu.degree || !edu.degree.trim()) {
        throw new Error(`Education entry ${index + 1}: Degree is required`);
      }
      if (!edu.institution || !edu.institution.trim()) {
        throw new Error(`Education entry ${index + 1}: Institution is required`);
      }
    }
  }
  
  // Validate work experiences if provided
  if (request.workExperiences && Array.isArray(request.workExperiences)) {
    for (const [index, exp] of request.workExperiences.entries()) {
      if (!exp.company || !exp.company.trim()) {
        throw new Error(`Work experience ${index + 1}: Company is required`);
      }
      if (!exp.position || !exp.position.trim()) {
        throw new Error(`Work experience ${index + 1}: Position is required`);
      }
    }
  }
  
  // Validate projects if provided
  if (request.projects && Array.isArray(request.projects)) {
    for (const [index, project] of request.projects.entries()) {
      if (!project.title || !project.title.trim()) {
        throw new Error(`Project ${index + 1}: Title is required`);
      }
      if (!project.description || !project.description.trim()) {
        throw new Error(`Project ${index + 1}: Description is required`);
      }
    }
  }
  
  // Validate certifications if provided
  if (request.certifications && Array.isArray(request.certifications)) {
    for (const [index, cert] of request.certifications.entries()) {
      if (!cert.title || !cert.title.trim()) {
        throw new Error(`Certification ${index + 1}: Title is required`);
      }
      if (!cert.issuer || !cert.issuer.trim()) {
        throw new Error(`Certification ${index + 1}: Issuer is required`);
      }
    }
  }
  
  console.log('CV request validation passed');
};

/**
 * Formats date for CV display
 * @param dateString - Date string to format
 * @returns string - Formatted date or original string if parsing fails
 */
export const formatCVDate = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {
    return '';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return dateString; // Return original string if formatting fails
  }
};

/**
 * Generates a preview of CV content (without PDF generation)
 * @param request - CV generation request
 * @returns Promise<string> - Text preview of CV content
 */
export const generateCVPreview = async (request: CVGenerationRequest): Promise<string> => {
  try {
    validateCVRequest(request);
    
    let preview = `CV Preview for Talent ID: ${request.talentId}\n\n`;
    
    if (request.additionalSkills && request.additionalSkills.length > 0) {
      preview += `Additional Skills: ${request.additionalSkills.join(', ')}\n\n`;
    }
    
    if (request.educationDetails && request.educationDetails.length > 0) {
      preview += 'Education:\n';
      request.educationDetails.forEach((edu, index) => {
        preview += `${index + 1}. ${edu.degree} at ${edu.institution}`;
        if (edu.startDate || edu.endDate) {
          preview += ` (${edu.startDate} - ${edu.endDate})`;
        }
        if (edu.location) {
          preview += ` - ${edu.location}`;
        }
        preview += '\n';
      });
      preview += '\n';
    }
    
    if (request.workExperiences && request.workExperiences.length > 0) {
      preview += 'Work Experience:\n';
      request.workExperiences.forEach((exp, index) => {
        preview += `${index + 1}. ${exp.position} at ${exp.company}`;
        if (exp.startDate || exp.endDate) {
          preview += ` (${exp.startDate} - ${exp.endDate})`;
        }
        if (exp.location) {
          preview += ` - ${exp.location}`;
        }
        preview += '\n';
        if (exp.description) {
          preview += `   ${exp.description}\n`;
        }
      });
      preview += '\n';
    }
    
    if (request.projects && request.projects.length > 0) {
      preview += 'Projects:\n';
      request.projects.forEach((project, index) => {
        preview += `${index + 1}. ${project.title}\n`;
        preview += `   ${project.description}\n`;
        if (project.technologies) {
          preview += `   Technologies: ${project.technologies}\n`;
        }
        if (project.link) {
          preview += `   Link: ${project.link}\n`;
        }
      });
      preview += '\n';
    }
    
    if (request.certifications && request.certifications.length > 0) {
      preview += 'Certifications:\n';
      request.certifications.forEach((cert, index) => {
        preview += `${index + 1}. ${cert.title} by ${cert.issuer}`;
        if (cert.date) {
          preview += ` (${cert.date})`;
        }
        preview += '\n';
      });
    }
    
    return preview;
    
  } catch (error) {
    throw new Error(`Failed to generate CV preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export types for use in other files
export type { Education, WorkExperience, Project, Certification, ContactInfo };

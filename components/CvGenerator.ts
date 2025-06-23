import { functions } from '@/lib/appwrite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface CVData {
  // Personal Information
  fullname: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  
  // Professional Summary
  professionalSummary?: string;
  
  // Education (with additional details)
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    coursework?: string[];
  }>;
  
  // Experience
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    location?: string;
    responsibilities: string[];
    achievements?: string[];
  }>;
  
  // Projects
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    link?: string;
  }>;
  
  // Skills
  skills: string[];
  
  // Certifications
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  
  // Additional sections
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  
  interests?: string[];
}

export interface GenerateCVResponse {
  success: boolean;
  cvData?: CVData;
  pdfBase64?: string;
  error?: string;
  metadata?: {
    talent: {
      id: string;
      fullname: string;
      careerStage: string;
    };
    generatedAt: string;
    executionTime: number;
  };
}

/**
 * Generates a CV using Gemini AI based on talent profile and additional data
 * @param talentId - The talentId field value
 * @param additionalData - Additional CV data provided by user
 * @returns CV generation response with PDF
 */
export const generateCV = async (
  talentId: string,
  additionalData: Partial<CVData> = {}
): Promise<GenerateCVResponse> => {
  try {
    console.log('Starting CV generation for talentId:', talentId);
    
    const executionPromise = functions.createExecution(
      'Generate-CV',
      JSON.stringify({ 
        talentId,
        additionalData 
      }),
      false
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('CV generation timeout')), 45000);
    });

    const execution = await Promise.race([executionPromise, timeoutPromise]);
    
    console.log('CV generation execution completed:', execution.status);

    if (execution.status === 'failed') {
      console.error('CV generation failed:', execution.stderr);
      throw new Error(execution.stderr || 'CV generation failed');
    }

    const rawResponse = execution.responseBody || execution.response || execution.stdout;
    if (!rawResponse) {
      throw new Error('No response data found');
    }

    const responseData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    if (!responseData?.success) {
      const errorMessage = responseData?.error || 'CV generation failed';
      console.error('CV generation error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('CV generated successfully');
    return responseData;

  } catch (error) {
    console.error('Error generating CV:', error);
    throw error;
  }
};

/**
 * Downloads the generated CV as PDF
 * @param pdfBase64 - Base64 encoded PDF data
 * @param filename - Filename for the PDF
 * @returns Promise<void>
 */
export const downloadCV = async (pdfBase64: string, filename: string = 'CV.pdf'): Promise<void> => {
  try {
    // Create file path
    const fileUri = FileSystem.documentDirectory + filename;
    
    // Write PDF to file system
    await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Share the file (this will open system's share/save dialog)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save CV',
        UTI: 'com.adobe.pdf'
      });
    } else {
      console.log('PDF saved to:', fileUri);
    }
    
  } catch (error) {
    console.error('Error downloading CV:', error);
    throw new Error('Failed to download CV');
  }
};

/**
 * Prepares CV data by merging talent profile with additional user input
 * @param talent - Talent profile from database
 * @param additionalData - Additional data provided by user
 * @returns Merged CV data
 */
export const prepareCVData = (talent: any, additionalData: Partial<CVData> = {}): CVData => {
  return {
    // Personal Information from talent profile
    fullname: talent.fullname || '',
    email: talent.email || '',
    phone: additionalData.phone || '',
    linkedin: additionalData.linkedin || '',
    github: additionalData.github || '',
    portfolio: additionalData.portfolio || '',
    location: additionalData.location || '',
    
    // Professional Summary (AI will generate if not provided)
    professionalSummary: additionalData.professionalSummary || '',
    
    // Education with details
    education: additionalData.education || talent.degrees?.map((degree: string) => ({
      degree,
      institution: '',
      startDate: '',
      endDate: '',
    })) || [],
    
    // Experience
    experience: additionalData.experience || [],
    
    // Projects
    projects: additionalData.projects || [],
    
    // Skills from talent profile
    skills: additionalData.skills || talent.skills || [],
    
    // Certifications
    certifications: additionalData.certifications || talent.certifications?.map((cert: string) => ({
      name: cert,
      issuer: '',
      date: '',
    })) || [],
    
    // Languages
    languages: additionalData.languages || [],
    
    // Interests
    interests: additionalData.interests || talent.interests || [],
  };
};

/**
 * Validates CV data before generation
 * @param cvData - CV data to validate
 * @returns Validation result
 */
export const validateCVData = (cvData: CVData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!cvData.fullname.trim()) {
    errors.push('Full name is required');
  }
  
  if (!cvData.email.trim()) {
    errors.push('Email is required');
  }
  
  if (cvData.education.length === 0) {
    errors.push('At least one education entry is required');
  }
  
  // Validate education entries
  cvData.education.forEach((edu, index) => {
    if (!edu.degree.trim()) {
      errors.push(`Education entry ${index + 1}: Degree is required`);
    }
    if (!edu.institution.trim()) {
      errors.push(`Education entry ${index + 1}: Institution is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
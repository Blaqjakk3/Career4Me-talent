import { functions } from './appwrite';

interface Project {
  title: string;
  objectives: string[];
  steps: string[];
  tools: string[];
  timeCommitment: string;
  realWorldRelevance: string;
}

export const generateProjects = async (
  careerPathId: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<Project[]> => {
  try {
    console.log('Calling function with:', { careerPathId, difficulty });
    
    const execution = await functions.createExecution(
      'generate-projects',
      JSON.stringify({
        careerPathId,
        difficulty
      }),
      false // Synchronous execution
    );

    console.log('Raw execution response:', JSON.stringify(execution, null, 2));

    // Handle different response formats
    let responseData;
    try {
      // First try to get response from responseBody (newer SDK versions)
      if (execution.responseBody) {
        responseData = typeof execution.responseBody === 'string' 
          ? JSON.parse(execution.responseBody)
          : execution.responseBody;
      }
      // Fallback to checking response (older SDK versions)
      else if (execution.response) {
        responseData = typeof execution.response === 'string'
          ? JSON.parse(execution.response)
          : execution.response;
      }
      // Final fallback to stdout (legacy)
      else if (execution.stdout) {
        responseData = JSON.parse(execution.stdout);
      } else {
        throw new Error('No response data found in execution object');
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Failed to parse function response');
    }

    // Validate response structure
    if (!responseData) {
      throw new Error('Empty response data');
    }

    if (responseData.success && Array.isArray(responseData.projects)) {
      return responseData.projects;
    }

    if (responseData.error) {
      throw new Error(responseData.error);
    }

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
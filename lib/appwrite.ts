import SignIn from "@/app/(auth)/signin";
import { Client, Databases, Account, ID, Avatars, Query, Storage, Functions } from "react-native-appwrite";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';

export const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  platform: 'com.career4me.talent',
  projectId: '67d074d0001dadc04f94',
  databaseId: 'career4me',
  talentsCollectionId: 'talents',
  quotesCollectionId: 'quotes',
  jobsCollectionId: 'jobs',
  employersCollectionId: '67d870d800046e4c2a61',
  skillsCollectionId: 'skills',
  userProgessCollectionId: 'userProgress',
  projectsCollectionId: 'projects',
  certificationsCollectionId: 'certifications',
  freeResourcesCollectionId: 'learningResources',
  premiumResourcesCollectionId: 'premiumResources',
  topicsCollectionId: 'topics',
  learningStagesId: 'learningStages',
  careerPathsCollectionId: 'careerPaths',
  applicationsCollectionId: 'applications',
  talentNotificationsCollectionId: 'talentNotifications',
  employerNotificationsCollectionId: 'employerNotifications',
  storageId: 'avatars',
}

const client = new Client();
client
  .setEndpoint(config.endpoint) // Your API Endpoint
  .setProject(config.projectId) // Replace with your project ID
  .setPlatform(config.platform) // Replace with your platform


const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);


export {
  client,
  account,
  databases,
  storage,
  avatars,
  functions,
  ID,
  Query
};
export const createUser = async (fullname: string, email: string, password: string, careerStage: string, dateofBirth: string) => {
  try {
    // Create new user account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      fullname
    );

    if (!newAccount) throw new Error("Account creation failed.");

    // Generate avatar URL
    const avatarUrl = avatars.getInitials(fullname);

    // Add the new user to the talents collection
    const newTalent = await databases.createDocument(
      config.databaseId,
      config.talentsCollectionId,
      ID.unique(),
      {
        talentId: newAccount.$id,
        email,
        fullname,
        careerStage,
        dateofBirth,
        avatar: avatarUrl,
      }
    );

    if (!newTalent) throw new Error("Failed to add user to talents collection.");

    // Now sign in only after the user has been added to the talents collection
    await signIn(email, password);

    return newTalent;
  } catch (error) {
    console.log(error);
    throw new Error(typeof error === "string" ? error : "An unknown error occurred");
  }
};


export async function signIn(email: string, password: string) {
  try {
    // Create session
    const session = await account.createEmailPasswordSession(email, password);

    // Get user details
    const user = await account.get();

    // Check if the user exists in the `talents` collection
    const talentQuery = await databases.listDocuments(
      config.databaseId,
      config.talentsCollectionId,
      [Query.equal("talentId", user.$id)]
    );

    if (talentQuery.documents.length === 0) {
      await deleteCurrentSession();
      Alert.alert("Access Denied", "Please sign in with a talent account.");
      throw new Error("Sign In with a talent Account.");
    }

    const currentUser = talentQuery.documents[0];
    await AsyncStorage.setItem("user", JSON.stringify(currentUser));
    return { session, user: currentUser }; // Return both session and user data
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(error.message || "An error occurred during sign-in.");
    } else {
      throw new Error("An unknown error occurred during sign-in.");
    }
  }
}


export const deleteCurrentSession = async () => {
  try {
    // Check if there's an active session first
    const currentUser = await account.get();
    if (currentUser) {
      await account.deleteSession('current');
      console.log('Current session deleted.');
    }
  } catch (error) {
    // Silently ignore the error for guests
    // This is expected behavior when no session exists
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error("No account found");

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.talentsCollectionId,
      [Query.equal("talentId", currentAccount.$id)]
    );

    if (!currentUser || !currentUser.documents.length) {
      throw new Error("User not found in talents collection");
    }

    return currentUser.documents[0];
  } catch (error: unknown) {
    console.error("getCurrentUser error:", error);
    return null;
  }
};

export const getDailyQuote = async () => {
  try {
    const storedQuote = await AsyncStorage.getItem("dailyQuote");
    const storedTimestamp = await AsyncStorage.getItem("quoteTimestamp");
    const currentTime = new Date().getTime();

    if (storedQuote && storedTimestamp) {
      const elapsedTime = currentTime - parseInt(storedTimestamp, 10);
      if (elapsedTime < 24 * 60 * 60 * 1000) {
        return JSON.parse(storedQuote);
      }
    }

    const quotes = await databases.listDocuments(
      config.databaseId,
      config.quotesCollectionId,
      [Query.limit(50)]
    );

    if (!quotes || quotes.documents.length === 0) {
      throw new Error("No quotes available");
    }

    const randomIndex = Math.floor(Math.random() * quotes.documents.length);
    const randomQuote = quotes.documents[randomIndex];

    await AsyncStorage.setItem("dailyQuote", JSON.stringify(randomQuote));
    await AsyncStorage.setItem("quoteTimestamp", currentTime.toString());

    return randomQuote;
  } catch (error: unknown) {
    console.error("Error fetching quote:", error);
    return null;
  }
};

export const saveCareerPath = async (careerPathId: string) => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Get the user's existing saved paths (if any)
    let savedPaths = currentUser.savedPaths || [];

    // Check if path is already saved
    if (savedPaths.includes(careerPathId)) {
      // If already saved, remove it (toggle functionality)
      savedPaths = savedPaths.filter((id: string) => id !== careerPathId);
    } else {
      // If not saved, add it
      savedPaths.push(careerPathId);
    }

    // Update the user document in the database
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        savedPaths: savedPaths
      }
    );

    // Update the local storage with the updated user
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      success: true,
      isSaved: savedPaths.includes(careerPathId),
      savedPaths
    };
  } catch (error: unknown) {
    console.error("Error saving career path:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

// Add this function to check if a path is saved
export const isCareerPathSaved = async (careerPathId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const savedPaths = currentUser.savedPaths || [];
    return savedPaths.includes(careerPathId);
  } catch (error: unknown) {
    console.error("Error checking saved path:", error);
    return false;
  }
};
export const getSavedCareerPaths = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const savedPathIds = currentUser.savedPaths || [];

    if (savedPathIds.length === 0) {
      return [];
    }

    // Fetch all saved career paths
    const savedPaths = await databases.listDocuments(
      config.databaseId,
      config.careerPathsCollectionId,
      [Query.equal("$id", savedPathIds)]
    );

    return savedPaths.documents;
  } catch (error) {
    console.error("Error fetching saved career paths:", error);
    return [];
  }
};
/**
 * Fetches a specific career path by its ID
 * @param careerPathId - The ID of the career path to fetch
 * @returns The career path document or null if not found
 */
export const getCareerPathById = async (careerPathId: string) => {
  try {
    if (!careerPathId) {
      throw new Error("Career path ID is required");
    }

    const careerPath = await databases.getDocument(
      config.databaseId,
      config.careerPathsCollectionId,
      careerPathId
    );

    return careerPath;
  } catch (error: unknown) {
    console.error("Error fetching career path:", error);
    return null;
  }
};

/**
 * Updates a user's selected career path
 * @param careerPathId - The ID of the career path to select
 * @returns Object with success status and updated user document
 */
export const selectCareerPath = async (careerPathId: string) => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Update the user document in the database
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        selectedPath: careerPathId
      }
    );

    // Update the local storage with the updated user
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      success: true,
      user: updatedUser
    };
  } catch (error: unknown) {
    console.error("Error selecting career path:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

/**
 * Checks if a career path is currently selected by the user
 * @param careerPathId - The ID of the career path to check
 * @returns Boolean indicating if the path is selected
 */
export const isCareerPathSelected = async (careerPathId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    return currentUser.selectedPath === careerPathId;
  } catch (error: unknown) {
    console.error("Error checking selected path:", error);
    return false;
  }
};

/**
 * Saves or unsaves a job for the current user
 * @param jobId - The ID of the job to save/unsave
 * @returns Object with success status and updated savedJobs array
 */
export const saveJob = async (jobId: string) => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Get the user's existing saved jobs (if any)
    let savedJobs = currentUser.savedJobs || [];

    // Check if job is already saved
    if (savedJobs.includes(jobId)) {
      // If already saved, remove it (toggle functionality)
      savedJobs = savedJobs.filter((id: string) => id !== jobId);
    } else {
      // If not saved, add it
      savedJobs.push(jobId);
    }

    // Update the user document in the database
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        savedJobs: savedJobs
      }
    );

    // Update the local storage with the updated user
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      success: true,
      isSaved: savedJobs.includes(jobId),
      savedJobs
    };
  } catch (error: unknown) {
    console.error("Error saving job:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

/**
 * Checks if a job is currently saved by the user
 * @param jobId - The ID of the job to check
 * @returns Boolean indicating if the job is saved
 */
export const isJobSaved = async (jobId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const savedJobs = currentUser.savedJobs || [];
    return savedJobs.includes(jobId);
  } catch (error: unknown) {
    console.error("Error checking saved job:", error);
    return false;
  }
};

/**
 * Fetches all saved jobs for the current user
 * @returns Array of saved job documents
 */
export const getSavedJobs = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const savedJobIds = currentUser.savedJobs || [];

    if (savedJobIds.length === 0) {
      return [];
    }

    // Fetch all saved jobs
    const savedJobs = await databases.listDocuments(
      config.databaseId,
      config.jobsCollectionId,
      [Query.equal("$id", savedJobIds)]
    );

    return savedJobs.documents;
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return [];
  }
};

export const updateUserProfile = async (profileData: {
  fullname: string;
  email: string;
  careerStage: string;
  avatar?: string;
  degrees?: string[];
  certifications?: string[];
  skills?: string[];
  interests?: string[];
  interestedFields?: string[];
}) => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Prepare update data
    const updateData: any = {
      fullname: profileData.fullname,
      email: profileData.email,
      careerStage: profileData.careerStage,
    };

    // Add optional fields if provided
    if (profileData.avatar) updateData.avatar = profileData.avatar;
    if (profileData.degrees) updateData.degrees = profileData.degrees;
    if (profileData.certifications) updateData.certifications = profileData.certifications;
    if (profileData.skills) updateData.skills = profileData.skills;
    if (profileData.interests) updateData.interests = profileData.interests;
    if (profileData.interestedFields) updateData.interestedFields = profileData.interestedFields;

    // Update the user document in the talents collection
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      updateData
    );

    // Update the account name if it changed
    if (profileData.fullname !== currentUser.fullname) {
      try {
        await account.updateName(profileData.fullname);
      } catch (error) {
        console.warn("Failed to update account name:", error);
        // Don't fail the whole operation if account name update fails
      }
    }

    // Update the account email if it changed
    if (profileData.email !== currentUser.email) {
      try {
        await account.updateEmail(profileData.email, ""); // Empty password for now
      } catch (error) {
        console.warn("Failed to update account email:", error);
        // Don't fail the whole operation if account email update fails
      }
    }

    // Update the local storage with the updated user
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      success: true,
      user: updatedUser
    };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

/**
 * Updates user password
 * @param currentPassword - The user's current password
 * @param newPassword - The new password
 * @returns Object with success status and error message if any
 */
export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  try {
    // Update the password using Appwrite's account service
    await account.updatePassword(newPassword, currentPassword);

    return {
      success: true
    };
  } catch (error: unknown) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

/**
 * Uploads an avatar image to Appwrite storage and updates user profile
 * @param imageUri - The local URI of the image to upload
 * @returns Object with success status, avatar URL, and error message if any
 */
export const uploadAvatar = async (imageUri: string) => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Read the file using Expo FileSystem
    const fileInfo = await FileSystem.getInfoAsync(imageUri);

    if (!fileInfo.exists) {
      throw new Error("Selected image file does not exist");
    }

    // Create a unique filename
    const fileName = `avatar_${currentUser.$id}_${Date.now()}.jpg`;

    // Create file object for upload
    const file = {
      name: fileName,
      type: 'image/jpeg',
      size: fileInfo.size || 0,
      uri: imageUri
    };

    // Upload the file to Appwrite storage
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      file
    );

    // Get the file view URL
    const avatarUrl = storage.getFileView(config.storageId, uploadedFile.$id);

    // Update the user's avatar in the database
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        avatar: avatarUrl.toString()
      }
    );

    // Update the local storage with the updated user
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    // Delete the old avatar file if it exists and is not the default initials avatar
    if (currentUser.avatar && !currentUser.avatar.includes('avatars.appwrite.io')) {
      try {
        // Extract file ID from the old avatar URL
        // Appwrite storage URLs typically look like: https://cloud.appwrite.io/v1/storage/buckets/[BUCKET_ID]/files/[FILE_ID]/view
        const urlParts = currentUser.avatar.split('/');
        const filesIndex = urlParts.indexOf('files');
        
        if (filesIndex !== -1 && filesIndex + 1 < urlParts.length) {
          const oldFileId = urlParts[filesIndex + 1];
          // Remove any query parameters
          const cleanFileId = oldFileId.split('?')[0];
          
          if (cleanFileId && cleanFileId !== 'view') {
            await storage.deleteFile(config.storageId, cleanFileId);
            console.log('Old avatar deleted successfully');
          }
        }
      } catch (error) {
        console.warn("Failed to delete old avatar:", error);
        // Don't fail the operation if old file deletion fails
      }
    }

    return {
      success: true,
      avatarUrl: avatarUrl.toString(),
      user: updatedUser
    };
  } catch (error: unknown) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload avatar"
    };
  }
};

/**
 * Deletes a user's avatar from storage and resets to default
 * @returns Object with success status and error message if any
 */
export const deleteAvatar = async () => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Generate default avatar URL
    const defaultAvatarUrl = avatars.getInitials(currentUser.fullname);

    // Update the user's avatar in the database to default
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        avatar: defaultAvatarUrl.toString()
      }
    );

    // Delete the old avatar file if it exists and is not the default initials avatar
    if (currentUser.avatar && !currentUser.avatar.includes('avatars.appwrite.io')) {
      try {
        // Extract file ID from the avatar URL
        // Appwrite storage URLs typically look like: https://cloud.appwrite.io/v1/storage/buckets/[BUCKET_ID]/files/[FILE_ID]/view
        const urlParts = currentUser.avatar.split('/');
        const filesIndex = urlParts.indexOf('files');
        
        if (filesIndex !== -1 && filesIndex + 1 < urlParts.length) {
          const fileId = urlParts[filesIndex + 1];
          // Remove any query parameters
          const cleanFileId = fileId.split('?')[0];
          
          if (cleanFileId && cleanFileId !== 'view') {
            await storage.deleteFile(config.storageId, cleanFileId);
            console.log('Avatar deleted successfully');
          }
        }
      } catch (error) {
        console.warn("Failed to delete avatar file:", error);
        // Don't fail the operation if file deletion fails
      }
    }

    // Update the local storage with the updated user
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      success: true,
      user: updatedUser
    };
  } catch (error: unknown) {
    console.error("Error deleting avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete avatar"
    };
  }
};
export const runCareerMatch = async (surveyAnswers?: any) => {
  try {
    // Get the current user first
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Prepare the payload with user ID and survey answers
    const payload = {
      userId: currentUser.talentId,
      surveyAnswers: surveyAnswers || null
    };

    console.log('Sending payload to career match function:', {
      userId: payload.userId,
      hasSurveyAnswers: !!payload.surveyAnswers,
      surveyAnswersKeys: payload.surveyAnswers ? Object.keys(payload.surveyAnswers) : []
    });

    // Execute the Appwrite function with user ID and survey answers in the payload
    const response = await functions.createExecution(
      'ai-career-matching', // Your function ID
      JSON.stringify(payload),
      false // Run synchronously
    );
    
    console.log('Appwrite function response:', {
      statusCode: response.responseStatusCode,
      body: response.responseBody
    });

    if (response.responseStatusCode >= 400) {
      throw new Error(response.responseBody || "Failed to run career match");
    }

    // Check if responseBody is empty
    if (!response.responseBody || response.responseBody.trim() === '') {
      throw new Error("Empty response from career match function");
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.responseBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response body:", response.responseBody);
      throw new Error("Failed to parse response from career match function");
    }

    return parsedResponse;
    
  } catch (error: unknown) {
    console.error("Error running career match:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

export const uploadFile = async (file) => {
  try {
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      file
    );
    return storage.getFileView(config.storageId, uploadedFile.$id);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file.');
  }
};

export const createApplication = async (applicationData) => {
  try {
    return await databases.createDocument(
      config.databaseId,
      config.applicationsCollectionId,
      ID.unique(),
      applicationData
    );
  } catch (error) {
    console.error('Error creating application:', error);
    throw new Error('Failed to create application.');
  }
};

export const createEmployerNotification = async (notificationData) => {
  try {
    return await databases.createDocument(
      config.databaseId,
      config.employerNotificationsCollectionId,
      ID.unique(),
      {
        ...notificationData,
        createdAt: new Date().toISOString(),
        isRead: false
      }
    );
  } catch (error) {
    console.error('Error creating employer notification:', error);
    throw new Error('Failed to create employer notification.');
  }
};

export const createTalentNotification = async (notificationData) => {
  try {
    return await databases.createDocument(
      config.databaseId,
      config.talentNotificationsCollectionId,
      ID.unique(),
      {
        ...notificationData,
        createdAt: new Date().toISOString(),
        isRead: false
      }
    );
  } catch (error) {
    console.error('Error creating talent notification:', error);
    throw new Error('Failed to create talent notification.');
  }
};

export const getTalentApplications = async (talentId) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.applicationsCollectionId,
            [Query.equal('talentId', talentId)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching talent applications:', error);
        throw new Error('Failed to fetch talent applications.');
    }
};

export const getJobById = async (jobId) => {
    try {
        const job = await databases.getDocument(
            config.databaseId,
            config.jobsCollectionId,
            jobId
        );
        return job;
    } catch (error) {
        console.error('Error fetching job by ID:', error);
        throw new Error('Failed to fetch job details.');
    }
};

export const updateApplicationStatus = async (applicationId, status) => {
    try {
        return await databases.updateDocument(
            config.databaseId,
            config.applicationsCollectionId,
            applicationId,
            { status }
        );
    } catch (error) {
        console.error('Error updating application status:', error);
        throw new Error('Failed to update application status.');
    }
};

/**
 * Checks if a talent has already applied to a specific job with pending or shortlisted status
 * @param talentId - The ID of the talent
 * @param jobId - The ID of the job
 * @returns Object with hasApplied boolean and application details if exists
 */
export const checkExistingApplication = async (talentId: string, jobId: string) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.applicationsCollectionId,
            [
                Query.equal('talentId', talentId),
                Query.equal('jobId', jobId),
                Query.equal('status', ['pending', 'shortlisted'])
            ]
        );

        if (response.documents.length > 0) {
            const result = {
                hasApplied: true,
                application: response.documents[0],
                status: response.documents[0].status
            };
            return result;
        }

        const result = {
            hasApplied: false,
            application: null,
            status: null
        };
        return result;
    } catch (error) {
        console.error('Error checking existing application:', error);
        // Return false on error to allow application attempt
        return {
            hasApplied: false,
            application: null,
            status: null
        };
    }
};

/**
 * Gets the application status for a talent and job (including all statuses)
 * @param talentId - The ID of the talent
 * @param jobId - The ID of the job
 * @returns Object with application details if exists
 */
export const getTalentJobApplicationStatus = async (talentId: string, jobId: string) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.applicationsCollectionId,
            [
                Query.equal('talentId', talentId),
                Query.equal('jobId', jobId)
            ]
        );

        if (response.documents.length > 0) {
            // Return the most recent application (in case there are multiple)
            const sortedApplications = response.documents.sort((a, b) =>
                new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
            );

            return {
                hasApplication: true,
                application: sortedApplications[0],
                status: sortedApplications[0].status
            };
        }

        return {
            hasApplication: false,
            application: null,
            status: null
        };
    } catch (error) {
        console.error('Error getting talent job application status:', error);
        return {
            hasApplication: false,
            application: null,
            status: null
        };
    }
};

/**
 * Debug function to test application queries
 * @param talentId - The ID of the talent
 * @param jobId - The ID of the job
 */
export const debugApplicationQuery = async (talentId: string, jobId: string) => {
    try {
        console.log('=== DEBUG APPLICATION QUERY ===');
        console.log('Input parameters:', { talentId, jobId });
        console.log('Database config:', {
            databaseId: config.databaseId,
            applicationsCollectionId: config.applicationsCollectionId
        });

        // First, get ALL applications for this talent
        const allTalentApplications = await databases.listDocuments(
            config.databaseId,
            config.applicationsCollectionId,
            [Query.equal('talentId', talentId)]
        );

        console.log('All applications for talent:', {
            count: allTalentApplications.documents.length,
            applications: allTalentApplications.documents.map(app => ({
                id: app.$id,
                talentId: app.talentId,
                jobId: app.jobId,
                status: app.status,
                applicationDate: app.applicationDate
            }))
        });

        // Then, get applications for this specific job
        const jobApplications = await databases.listDocuments(
            config.databaseId,
            config.applicationsCollectionId,
            [
                Query.equal('talentId', talentId),
                Query.equal('jobId', jobId)
            ]
        );

        console.log('Applications for this job:', {
            count: jobApplications.documents.length,
            applications: jobApplications.documents.map(app => ({
                id: app.$id,
                talentId: app.talentId,
                jobId: app.jobId,
                status: app.status,
                applicationDate: app.applicationDate
            }))
        });

        // Finally, get pending/shortlisted applications for this job
        const pendingApplications = await databases.listDocuments(
            config.databaseId,
            config.applicationsCollectionId,
            [
                Query.equal('talentId', talentId),
                Query.equal('jobId', jobId),
                Query.equal('status', ['pending', 'shortlisted'])
            ]
        );

        console.log('Pending/shortlisted applications for this job:', {
            count: pendingApplications.documents.length,
            applications: pendingApplications.documents.map(app => ({
                id: app.$id,
                talentId: app.talentId,
                jobId: app.jobId,
                status: app.status,
                applicationDate: app.applicationDate
            }))
        });

        console.log('=== END DEBUG ===');

        return {
            allTalentApplications: allTalentApplications.documents.length,
            jobApplications: jobApplications.documents.length,
            pendingApplications: pendingApplications.documents.length
        };
    } catch (error) {
        console.error('Debug query error:', error);
        return { error: error.message };
    }
};

export const updateApplicationStatusWithNotification = async (applicationId, status, jobTitle = 'a job') => {
    try {
        // First, get the application to get the talentId
        const application = await databases.getDocument(
            config.databaseId,
            config.applicationsCollectionId,
            applicationId
        );

        // Update the application status
        const updatedApplication = await databases.updateDocument(
            config.databaseId,
            config.applicationsCollectionId,
            applicationId,
            { status }
        );

        // Create a notification for the talent
        let notificationTitle = '';
        let notificationMessage = '';

        switch (status) {
            case 'shortlisted':
                notificationTitle = 'Application Shortlisted!';
                notificationMessage = `Great news! Your application for ${jobTitle} has been shortlisted.`;
                break;
            case 'rejected':
                notificationTitle = 'Application Update';
                notificationMessage = `Your application for ${jobTitle} was not selected this time. Keep applying!`;
                break;
            default:
                notificationTitle = 'Application Status Update';
                notificationMessage = `Your application for ${jobTitle} status has been updated to ${status}.`;
        }

        await createTalentNotification({
            talentId: application.talentId,
            type: 'application_status',
            title: notificationTitle,
            message: notificationMessage,
            relatedJobId: application.jobId,
            relatedApplicationId: applicationId
        });

        return updatedApplication;
    } catch (error) {
        console.error('Error updating application status with notification:', error);
        throw new Error('Failed to update application status.');
    }
};

export const getTalentNotifications = async (talentId) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.talentNotificationsCollectionId,
            [Query.equal('talentId', talentId)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching talent notifications:', error);
        throw new Error('Failed to fetch talent notifications.');
    }
};

export const updateNotificationStatus = async (notificationId, isRead) => {
    try {
        return await databases.updateDocument(
            config.databaseId,
            config.talentNotificationsCollectionId,
            notificationId,
            { isRead }
        );
    } catch (error) {
        console.error('Error updating notification status:', error);
        throw new Error('Failed to update notification status.');
    }
};
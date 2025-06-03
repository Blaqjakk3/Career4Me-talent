import { Client, Databases } from "appwrite";
import { careerPathsUpdates } from "./updatepaths.js";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67d074d0001dadc04f94');

const databases = new Databases(client);

// Config
const databaseId = 'career4me';
const collectionId = 'careerPaths';

/**
 * Updates career paths in the Appwrite database using the provided document IDs
 */
async function updateCareerPaths() {
  try {
    console.log(`Starting update of ${careerPathsUpdates.length} career paths...`);
    
    // Track updates
    let successCount = 0;
    let failedUpdates = [];
    
    // Process each career path update
    for (const careerPath of careerPathsUpdates) {
      try {
        // Extract the ID from the career path object
        const { id, ...updateData } = careerPath;
        
        // Update the document
        await databases.updateDocument(
          databaseId,
          collectionId,
          id,  // Use the ID directly from the update data
          updateData
        );
        
        console.log(`✅ Updated: ${careerPath.title} (ID: ${id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${careerPath.title} (ID: ${careerPath.id}):`, error);
        failedUpdates.push({
          title: careerPath.title,
          id: careerPath.id,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    // Report results
    console.log("\n--- Update Summary ---");
    console.log(`Total career paths processed: ${careerPathsUpdates.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed updates: ${failedUpdates.length}`);
    
    if (failedUpdates.length > 0) {
      console.log("\nFailed updates details:");
      failedUpdates.forEach((fail, index) => {
        console.log(`${index + 1}. ${fail.title} (ID: ${fail.id}) - ${fail.error}`);
      });
    }
    
    console.log("\nUpdate process completed!");
  } catch (error) {
    console.error("A global error occurred during the update process:", error);
  }
}

// Run the update function
updateCareerPaths();
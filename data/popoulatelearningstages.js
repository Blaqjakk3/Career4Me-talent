import { Client, Databases } from "appwrite";
import { learningStages } from "./learningStages.js";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client); // Fix the variable name (it was "database" earlier)

const databaseId = 'career4me';
const collectionId = 'learningStages';

async function populateDatabase() {
  try {
    for (const stage of learningStages) {
      // Create a new document for each learning stage
      await databases.createDocument(databaseId, collectionId, 'unique()', stage);
      console.log(`Added: ${stage.title}`);
    }
    console.log("All learnning stages added successfully!");
  } catch (error) {
    console.error("Error adding learning stages:", error);
  }
}

// Run the function
populateDatabase();
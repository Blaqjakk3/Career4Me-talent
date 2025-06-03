import { Client, Databases } from "appwrite";
import { resources } from "./freeresources.js";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client);

const databaseId = 'career4me';
const collectionId = 'learningResources';

// Configuration for batch processing
const BATCH_SIZE = 10; // Number of resources to process per batch
const DELAY_BETWEEN_BATCHES = 2000; // Delay in milliseconds (2 seconds)

// Helper function to create a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to process a batch of resources
async function processBatch(batch, batchNumber) {
  console.log(`\nProcessing batch ${batchNumber} (${batch.length} resources)...`);
  
  const promises = batch.map(async (resource) => {
    try {
      await databases.createDocument(databaseId, collectionId, 'unique()', resource);
      console.log(`✓ Added: ${resource.title}`);
      return { success: true, resource: resource.title };
    } catch (error) {
      console.error(`✗ Failed to add ${resource.title}:`, error.message);
      return { success: false, resource: resource.title, error: error.message };
    }
  });

  return await Promise.all(promises);
}

async function populateDatabase() {
  try {
    console.log(`Starting to populate database with ${resources.length} resources...`);
    console.log(`Batch size: ${BATCH_SIZE}, Delay between batches: ${DELAY_BETWEEN_BATCHES}ms\n`);

    const totalBatches = Math.ceil(resources.length / BATCH_SIZE);
    let successCount = 0;
    let failureCount = 0;

    // Process resources in batches
    for (let i = 0; i < resources.length; i += BATCH_SIZE) {
      const batch = resources.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      // Process current batch
      const results = await processBatch(batch, batchNumber);
      
      // Count successes and failures
      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      // Add delay between batches (except for the last batch)
      if (batchNumber < totalBatches) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("DATABASE POPULATION COMPLETE!");
    console.log(`✓ Successfully added: ${successCount} resources`);
    if (failureCount > 0) {
      console.log(`✗ Failed to add: ${failureCount} resources`);
    }
    console.log("=".repeat(50));

  } catch (error) {
    console.error("Critical error during database population:", error);
  }
}

// Run the function
populateDatabase();
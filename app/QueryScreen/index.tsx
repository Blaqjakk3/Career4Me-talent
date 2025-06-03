import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { config } from '@/lib/appwrite';

interface TopicData {
  id: string;
  title: string;
  description: string;
  order: number;
}

const QueryScreen = () => {
  const [topicsData, setTopicsData] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFetched, setTotalFetched] = useState(0);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      setTopicsData([]);
      setTotalFetched(0);

      console.log('Fetching all topics...');
      
      // Query all documents from topics collection
      const response = await databases.listDocuments(
        config.databaseId,
        config.topicsCollectionId,
        [
          Query.limit(500), // Increase limit to get all documents
          Query.orderAsc('order') // Order by the 'order' field
        ]
      );
      
      console.log(`Found ${response.documents.length} topics`);
      
      // Process all documents
      const allTopics: TopicData[] = response.documents.map((doc) => ({
        id: doc.$id,
        title: doc.title || 'Untitled',
        description: doc.description || 'No description available',
        order: doc.order || 0
      }));
      
      // Sort by order field
      allTopics.sort((a, b) => a.order - b.order);
      
      // Log all topics
      allTopics.forEach((topic, index) => {
        console.log(`${index + 1}. ID: ${topic.id} | Title: ${topic.title} |  Description: ${topic.description} | Order: ${topic.order}`);
      });
      
      console.log(`\nTotal topics: ${allTopics.length}`);
      
      setTopicsData(allTopics);
      setTotalFetched(allTopics.length);
      
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.queryButton} onPress={fetchTopics}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Topics Query</Text>
      
      <TouchableOpacity 
        style={[styles.queryButton, loading && styles.queryButtonDisabled]} 
        onPress={fetchTopics}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Fetching Topics...' : 'Query Topics'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Fetching topics in batches...</Text>
          <Text style={styles.progressText}>Processed: {totalFetched}/~252 topics</Text>
          <Text style={styles.batchInfoText}>Check console for copyable batch data</Text>
        </View>
      )}

      {topicsData.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Total Results: {topicsData.length} topics fetched
          </Text>
        </View>
      )}
      
      {topicsData.length === 0 && !loading ? (
        <Text style={styles.noDataText}>
          Click "Query Topics" to fetch all topics
        </Text>
      ) : (
        topicsData.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.indexText}>{index + 1}.</Text>
            
            <View style={styles.itemContent}>
              <Text style={styles.label}>Document ID:</Text>
              <Text style={styles.value}>{item.id}</Text>
              
              <Text style={styles.label}>Title:</Text>
              <Text style={styles.value}>{item.title}</Text>

              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{item.description}</Text>
              
              <Text style={styles.label}>Order:</Text>
              <Text style={styles.value}>{item.order}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  queryButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  queryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  batchInfoText: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 4,
    fontStyle: 'italic',
  },
  summaryContainer: {
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#d32f2f',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
    fontStyle: 'italic',
  },
  itemContainer: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  indexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 8,
  },
  itemContent: {
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
  },
});

export default QueryScreen;
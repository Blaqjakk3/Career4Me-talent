import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import CVUploadComponent from '@/components/CVUploadComponent';
import AnalysisResultsComponent from '@/components/AnalysisResultsComponent';
import { pickCVDocument, analyzeCVWithRetry } from '../../lib/gemini';
import { getCurrentUser } from '../../lib/appwrite';

const CVAnalysisScreen = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);
      
      // Get current user to access talentId
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('You need to be logged in to analyze your CV');
      }

      // Pick document from device
      const file = await pickCVDocument();
      if (!file) {
        setIsUploading(false);
        return; // User cancelled
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      // Analyze the document with retry mechanism
      const result = await analyzeCVWithRetry(
        currentUser.talentId, // Using the talentId from user document
        file.uri,
        file.name
      );

      setAnalysis(result.analysis);
      setMetadata(result.metadata);
      setIsAnalyzing(false);
      
    } catch (err) {
      setIsUploading(false);
      setIsAnalyzing(false);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      Alert.alert('Analysis Error', errorMessage);
      console.error('CV analysis error:', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {!analysis ? (
          <CVUploadComponent
            onUpload={handleUpload}
            isUploading={isUploading}
            isAnalyzing={isAnalyzing}
            error={error}
          />
        ) : (
          <AnalysisResultsComponent
            analysis={analysis}
            metadata={metadata}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
});

export default CVAnalysisScreen;
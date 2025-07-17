import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import CVUploadComponent from '@/components/CVUploadComponent';
import AnalysisResultsComponent from '@/components/AnalysisResultsComponent';
import { pickCVDocument, analyzeCVWithRetry } from '../../lib/gemini';
import { getCurrentUser } from '../../lib/appwrite';
import { router } from 'expo-router';
import Header from '@/components/Header';

const CVAnalysisScreen = () => {
  const [currentView, setCurrentView] = useState<'tips' | 'upload' | 'results'>('tips');
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
      setCurrentView('results');
      
    } catch (err) {
      setIsUploading(false);
      setIsAnalyzing(false);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      Alert.alert('Analysis Error', errorMessage);
      console.error('CV analysis error:', err);
    }
  };

  const handleBackPress = () => {
    if (currentView === 'upload') {
      setCurrentView('tips');
    } else if (currentView === 'results') {
      setCurrentView('upload');
    } else {
      router.back();
    }
  };

  const CVTipsComponent = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>CV Writing Tips & Best Practices</Text>
      
      <View style={styles.tipCard}>
        <Text style={styles.tipCardTitle}>📝 Structure & Format</Text>
        <Text style={styles.tipText}>• Keep it concise (1-2 pages maximum)</Text>
        <Text style={styles.tipText}>• Use clear, professional fonts (Arial, Calibri)</Text>
        <Text style={styles.tipText}>• Maintain consistent formatting throughout</Text>
        <Text style={styles.tipText}>• Include white space for readability</Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipCardTitle}>🎯 Content Essentials</Text>
        <Text style={styles.tipText}>• Start with a compelling professional summary</Text>
        <Text style={styles.tipText}>• List experience in reverse chronological order</Text>
        <Text style={styles.tipText}>• Use action verbs and quantify achievements</Text>
        <Text style={styles.tipText}>• Include relevant skills and certifications</Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipCardTitle}>🚀 Stand Out Tips</Text>
        <Text style={styles.tipText}>• Tailor your CV to each job application</Text>
        <Text style={styles.tipText}>• Include keywords from the job description</Text>
        <Text style={styles.tipText}>• Highlight measurable accomplishments</Text>
        <Text style={styles.tipText}>• Keep personal information minimal</Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipCardTitle}>⚠️ Common Mistakes to Avoid</Text>
        <Text style={styles.tipText}>• Spelling and grammar errors</Text>
        <Text style={styles.tipText}>• Using outdated or unprofessional email</Text>
        <Text style={styles.tipText}>• Including irrelevant work experience</Text>
        <Text style={styles.tipText}>• Using generic templates without customization</Text>
      </View>

      <View style={styles.analysisPromo}>
        <Text style={styles.analysisPromoTitle}>🤖 Ready for AI Analysis?</Text>
        <Text style={styles.analysisPromoText}>
          Our AI will analyze your CV and provide personalized recommendations for:
        </Text>
        <Text style={styles.analysisPromoItem}>• Skills and experience optimization</Text>
        <Text style={styles.analysisPromoItem}>• Career path alignment</Text>
        <Text style={styles.analysisPromoItem}>• Marketability assessment</Text>
        <Text style={styles.analysisPromoItem}>• Improvement suggestions</Text>
      </View>

      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={() => setCurrentView('upload')}
        activeOpacity={0.8}
      >
        <Text style={styles.analyzeButtonText}>Start AI CV Analysis</Text>
      </TouchableOpacity>
    </View>
  );

  const CVUploadEnhancedComponent = () => (
    <View style={styles.uploadEnhancedContainer}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>🚀 AI-Powered CV Analysis</Text>
        <Text style={styles.heroSubtitle}>
          Get instant, professional feedback on your CV with our advanced AI technology
        </Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureTitle}>Smart Scoring</Text>
          <Text style={styles.featureText}>Get an overall CV score with detailed breakdown</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureTitle}>Career Alignment</Text>
          <Text style={styles.featureText}>Match your skills to your career goals</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💡</Text>
          <Text style={styles.featureTitle}>Smart Tips</Text>
          <Text style={styles.featureText}>Personalized improvement suggestions</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={styles.featureTitle}>Gap Analysis</Text>
          <Text style={styles.featureText}>Identify missing skills and certifications</Text>
        </View>
      </View>



      {/* Process Steps */}
      <View style={styles.processSection}>
        <Text style={styles.processTitle}>How It Works</Text>
        <View style={styles.processSteps}>
          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Upload your CV (PDF, DOC, or image)</Text>
          </View>
          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Our AI analyzes your content</Text>
          </View>
          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Get detailed insights and recommendations</Text>
          </View>
        </View>
      </View>

      {/* Upload Section */}
      <CVUploadComponent
        onUpload={handleUpload}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
        error={error}
      />

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Your CV is processed securely and never stored permanently. We respect your privacy.
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'tips':
        return <CVTipsComponent />;
      case 'upload':
        return <CVUploadEnhancedComponent />;
      case 'results':
        return (
          <AnalysisResultsComponent
            analysis={analysis}
            metadata={metadata}
          />
        );
      default:
        return <CVTipsComponent />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'tips':
        return 'CV Analysis';
      case 'upload':
        return 'Upload CV';
      case 'results':
        return 'Analysis Results';
      default:
        return 'CV Analysis';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header title={getHeaderTitle()} onBackPress={handleBackPress} />
      <View style={styles.content}>
        {renderContent()}
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
  tipsContainer: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  tipCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  analysisPromo: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  analysisPromoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  analysisPromoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  analysisPromoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  analyzeButton: {
    backgroundColor: '#5badec',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Enhanced Upload Component Styles
  uploadEnhancedContainer: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#5badec',
    padding: 30,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },

  processSection: {
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  processSteps: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5badec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 16,
  },
});

export default CVAnalysisScreen;
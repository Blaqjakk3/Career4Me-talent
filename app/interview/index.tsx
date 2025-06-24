// CareerSurveyScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { 
  generateSurveyQuestions, 
  submitCareerSurvey, 
  getSurveyStatus,
  selectCareerPathFromSurvey,
  SurveyQuestion, 
  SurveyResponse, 
  CareerMatchResult 
} from '@/lib/careerMatching';
import { getCurrentUser, selectCareerPath } from '@/lib/appwrite';

const { width: screenWidth } = Dimensions.get('window');

const CareerSurveyScreen = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<any>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<CareerMatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectingPathId, setSelectingPathId] = useState<string | null>(null);

  useEffect(() => {
    initializeSurvey();
  }, []);

  const initializeSurvey = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in to take the career survey');
        return;
      }
      setCurrentUser(user);

      // Check if user has already taken the test
      const surveyStatus = await getSurveyStatus();
      if (surveyStatus.testTaken && surveyStatus.hasSelectedPath) {
        Alert.alert(
          'Survey Complete', 
          'You have already completed the career survey and selected a path.',
          [
            { text: 'Retake Survey', onPress: () => loadSurveyQuestions(user.careerStage) },
            { text: 'Go Back', onPress: () => router.back() }
          ]
        );
        return;
      }

      await loadSurveyQuestions(user.careerStage);
    } catch (error) {
      console.error('Error initializing survey:', error);
      Alert.alert('Error', 'Failed to load survey questions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSurveyQuestions = async (careerStage: string) => {
    try {
      const surveyQuestions = await generateSurveyQuestions(careerStage);
      setQuestions(surveyQuestions);
      
      // Initialize responses object
      const initialResponses: any = {};
      surveyQuestions.forEach(q => {
        if (q.type === 'multi-select') {
          initialResponses[q.id] = [];
        } else {
          initialResponses[q.id] = '';
        }
      });
      setResponses(initialResponses);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load survey questions');
    }
  };

  const handleResponse = (questionId: string, value: any, isMultiSelect = false) => {
    if (isMultiSelect) {
      const currentValues = responses[questionId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: any) => v !== value)
        : [...currentValues, value];
      
      setResponses(prev => ({
        ...prev,
        [questionId]: newValues
      }));
    } else {
      // For dropdown with ID|Title format, extract just the ID
      const actualValue = value.includes('|') ? value.split('|')[0] : value;
      setResponses(prev => ({
        ...prev,
        [questionId]: actualValue
      }));
    }
  };

  const canProceed = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion?.required) return true;
    
    const response = responses[currentQuestion.id];
    if (currentQuestion.type === 'multi-select') {
      return Array.isArray(response) && response.length > 0;
    }
    return response && response.trim().length > 0;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare survey response
      const surveyResponse: SurveyResponse = {
        degrees: responses.degrees || [],
        skills: responses.skills || [],
        interests: responses.interests || [],
        interestedFields: responses.interestedFields || [],
        currentPath: responses.currentPath || undefined,
        currentSeniorityLevel: responses.currentSeniorityLevel || undefined,
        additionalContext: responses.additionalContext || undefined
      };

      // Submit survey and get matches
      const careerMatches = await submitCareerSurvey(surveyResponse);
      setMatches(careerMatches);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error submitting survey:', error);
      Alert.alert('Error', 'Failed to process your survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLearnMore = (careerPathId: string) => {
    // Navigate to the path-info screen with the career path ID using Expo Router
    router.push(`/path-info/${careerPathId}`);
  };

  const handleSelectCareerPath = async (careerPathId: string) => {
    try {
      setSelectingPathId(careerPathId);
      
      // Use the selectCareerPath function from appwrite.ts
      const result = await selectCareerPath(careerPathId);
      
      if (result.success) {
        Alert.alert(
          'Success!', 
          'Your career path has been selected. You can now explore learning resources and opportunities.',
          [{ text: 'Continue', onPress: () => router.replace('/dashboard') }] 
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to select career path. Please try again.');
      }
    } catch (error) {
      console.error('Error selecting career path:', error);
      Alert.alert('Error', 'Failed to select career path. Please try again.');
    } finally {
      setSelectingPathId(null);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const response = responses[question.id];

    switch (question.type) {
      case 'multi-select':
        return (
          <View>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  response?.includes(option) && styles.selectedOption
                ]}
                onPress={() => handleResponse(question.id, option, true)}
              >
                <Text style={[
                  styles.optionText,
                  response?.includes(option) && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'dropdown':
        return (
          <View>
            {question.options?.map((option, index) => {
              const displayText = option.includes('|') ? option.split('|')[1] : option;
              const isSelected = response === (option.includes('|') ? option.split('|')[0] : option);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => handleResponse(question.id, option)}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {displayText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            value={response}
            onChangeText={(text) => handleResponse(question.id, text)}
            placeholder="Type your answer here..."
            multiline
            numberOfLines={4}
          />
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Your Career Matches</Text>
          <Text style={styles.resultsSubtitle}>
            Based on your responses, here are your top career matches:
          </Text>

          {matches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchTitle}>{match.careerPath.title}</Text>
                <Text style={styles.matchScore}>{match.matchScore}% match</Text>
              </View>
              
              <Text style={styles.matchIndustry}>{match.careerPath.industry}</Text>
              
              <Text style={styles.sectionTitle}>Why this matches you:</Text>
              <Text style={styles.reasoning}>{match.reasoning}</Text>
              
              <Text style={styles.sectionTitle}>Your strengths:</Text>
              {match.strengths.map((strength, i) => (
                <Text key={i} style={styles.listItem}>• {strength}</Text>
              ))}
              
              <Text style={styles.sectionTitle}>Areas to develop:</Text>
              {match.developmentAreas.map((area, i) => (
                <Text key={i} style={styles.listItem}>• {area}</Text>
              ))}
              
              {/* Action Buttons Container */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.learnMoreButton]}
                  onPress={() => handleLearnMore(match.careerPath.$id)}
                >
                  <Text style={styles.learnMoreButtonText}>Learn More</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.selectButton]}
                  onPress={() => handleSelectCareerPath(match.careerPath.$id)}
                  disabled={selectingPathId === match.careerPath.$id}
                >
                  {selectingPathId === match.careerPath.$id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.selectButtonText}>Select This Path</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading your personalized survey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults) {
    return renderResults();
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No survey questions available.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={initializeSurvey}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Career Survey</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.required && (
          <Text style={styles.requiredText}>* Required</Text>
        )}
        
        <View style={styles.optionsContainer}>
          {renderQuestion(currentQuestion)}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.previousButton,
            currentQuestionIndex === 0 && styles.disabledButton
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.disabledButtonText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            !canProceed() && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[
              styles.navButtonText,
              styles.nextButtonText,
              !canProceed() && styles.disabledButtonText
            ]}>
              {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#0066cc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 28,
  },
  requiredText: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  selectedOption: {
    borderColor: '#0066cc',
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#0066cc',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    minHeight: 52,
  },
  previousButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  nextButton: {
    backgroundColor: '#0066cc',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
    borderColor: '#e9ecef',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
  },
  disabledButtonText: {
    color: '#adb5bd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  matchIndustry: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  reasoning: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 4,
  },
  // New styles for action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  learnMoreButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  selectButton: {
    backgroundColor: '#0066cc',
  },
  learnMoreButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CareerSurveyScreen;
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { questions, multiSelectIds, searchEnabledIds, Question } from '../stores/CareerTestStore';

// Type definitions
interface CareerTestProps {
  onComplete: (answers: Record<string, any>) => void;
  careerStage: keyof typeof questions | string;
}

const CareerTest: React.FC<CareerTestProps> = ({ onComplete, careerStage }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [searchInputs, setSearchInputs] = useState<Record<string, string>>({});

  const currentQuestions: Question[] = (questions as any)[careerStage] || [];

  // Filter out conditional questions that shouldn't be shown
  const getVisibleQuestions = () => {
    return currentQuestions.filter((question: Question) => {
      if (question.conditional) {
        return question.conditional(answers);
      }
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentStep];
  const isMultiSelect = multiSelectIds.includes(currentQuestion?.id);
  const isSearchEnabled = searchEnabledIds.includes(currentQuestion?.id);

  // Filter options by search
  const filteredOptions = isSearchEnabled && searchInputs[currentQuestion.id]
    ? currentQuestion.options.filter(option =>
        option.toLowerCase().includes(searchInputs[currentQuestion.id].toLowerCase())
      )
    : currentQuestion.options;

  // Handle answer selection
  const handleAnswer = (questionId: string, answer: string) => {
    if (isMultiSelect) {
      setAnswers(prev => {
        const prevArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        if (prevArr.includes(answer)) {
          // Deselect
          return { ...prev, [questionId]: prevArr.filter((a: string) => a !== answer) };
        } else {
          // Select
          return { ...prev, [questionId]: [...prevArr, answer] };
        }
      });
      // Clear custom input if not 'Other'
      if (answer !== 'Other') {
        setCustomInputs(prev => ({ ...prev, [questionId]: '' }));
      }
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
      // Clear custom input if not 'Other'
      if (answer !== 'Other') {
        setCustomInputs(prev => ({ ...prev, [questionId]: '' }));
      }
    }
  };

  // Handle custom input for 'Other'
  const handleCustomInput = (questionId: string, value: string) => {
    setCustomInputs(prev => ({ ...prev, [questionId]: value }));
    if (isMultiSelect) {
      setAnswers(prev => {
        const prevArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        // Remove any previous custom value
        const filtered = prevArr.filter((a: string) => !a.startsWith('Other:'));
        if (value.trim()) {
          return { ...prev, [questionId]: [...filtered, `Other: ${value.trim()}`] };
        } else {
          return { ...prev, [questionId]: filtered };
        }
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value.trim() ? `Other: ${value.trim()}` : undefined }));
    }
  };

  // Handle search input
  const handleSearchInput = (questionId: string, value: string) => {
    setSearchInputs(prev => ({ ...prev, [questionId]: value }));
  };

  // Next/Back logic
  const handleNext = () => {
    const newVisibleQuestions = getVisibleQuestions();
    if (currentStep < newVisibleQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Progress bar calculation
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  // Validation: require at least one answer for multi-select, or a value for single-select
  const isAnswered = isMultiSelect
    ? Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0
    : !!answers[currentQuestion.id];

  if (currentQuestions.length === 0) {
    return (
      <View style={styles.centered}><Text>No questions available for your career stage.</Text></View>
    );
  }
  if (!currentQuestion) {
    return (
      <View style={styles.centered}><Text>Loading...</Text></View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>
          Question {currentStep + 1} of {visibleQuestions.length}
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <Text style={styles.questionText}>{currentQuestion.question}</Text>

      {/* Search Bar for options */}
      {isSearchEnabled && (
        <TextInput
          style={styles.searchBar}
          value={searchInputs[currentQuestion.id] || ''}
          onChangeText={text => handleSearchInput(currentQuestion.id, text)}
          placeholder="Search options..."
          placeholderTextColor="#b3d3f6"
        />
      )}

      {/* Options List */}
      {filteredOptions.map((option, index) => {
        const isSelected = isMultiSelect
          ? Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].some((a: string) => a === option || a === `Other: ${customInputs[currentQuestion.id]}`)
          : answers[currentQuestion.id] === option;
        const showCustomInput = option === 'Other' && (
          (isMultiSelect && Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes('Other')) ||
          (!isMultiSelect && answers[currentQuestion.id] === 'Other')
        );
        return (
          <View key={index} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => handleAnswer(currentQuestion.id, option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
                {isSelected && (
                  <Text style={styles.checkmark}> ✓</Text>
                )}
              </Text>
            </TouchableOpacity>
            {/* Inline custom input for 'Other' */}
            {option === 'Other' && ((isMultiSelect && Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes('Other')) || (!isMultiSelect && answers[currentQuestion.id] === 'Other')) && (
              <TextInput
                style={styles.customInput}
                value={customInputs[currentQuestion.id] || ''}
                onChangeText={text => handleCustomInput(currentQuestion.id, text)}
                placeholder="Please specify..."
                placeholderTextColor="#b3d3f6"
                multiline
              />
            )}
          </View>
        );
      })}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !isAnswered && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === visibleQuestions.length - 1 ? 'Submit' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#5badec',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#e3f0fa',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#5badec',
    borderRadius: 5,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#5badec',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    color: '#222',
    backgroundColor: '#f7fbff',
  },
  optionWrapper: {
    marginBottom: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#b3d3f6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f7fbff',
  },
  optionButtonSelected: {
    backgroundColor: '#e3f0fa',
    borderColor: '#5badec',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  optionTextSelected: {
    color: '#5badec',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#5badec',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#5badec',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    color: '#222',
    backgroundColor: '#f7fbff',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  backButton: {
    backgroundColor: '#e3f0fa',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#5badec',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#b3d3f6',
  },
  navButtonText: {
    color: '#5badec',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CareerTest;
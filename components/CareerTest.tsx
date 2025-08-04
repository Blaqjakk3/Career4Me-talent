import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { questions, multiSelectIds, searchEnabledIds, Question } from '../stores/CareerTestStore';
import Header from './Header';
import { useRouter } from 'expo-router';

// Type definitions
interface CareerTestProps {
  onComplete: (answers: Record<string, any>) => void;
  careerStage: keyof typeof questions | string;
}

interface OptionItem {
  option: string;
  index: number;
}

const { height: screenHeight } = Dimensions.get('window');

const CareerTest: React.FC<CareerTestProps> = ({ onComplete, careerStage }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [searchInputs, setSearchInputs] = useState<Record<string, string>>({});
  const [showOtherInput, setShowOtherInput] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const currentQuestions: Question[] = (questions as any)[careerStage] || [];

  // Filter out conditional questions that shouldn't be shown
  const getVisibleQuestions = useCallback(() => {
    return currentQuestions.filter((question: Question) => {
      if (question.conditional) {
        return question.conditional(answers);
      }
      return true;
    });
  }, [currentQuestions, answers]);

  const visibleQuestions = useMemo(() => getVisibleQuestions(), [getVisibleQuestions]);
  const currentQuestion = visibleQuestions[currentStep];
  const isMultiSelect = currentQuestion ? multiSelectIds.includes(currentQuestion.id) : false;
  const isSearchEnabled = currentQuestion ? searchEnabledIds.includes(currentQuestion.id) : false;

  // Utility to move "Other" to the first option
  const reorderOptions = (options: string[]) => {
    const otherIdx = options.findIndex(opt => opt.trim().toLowerCase().includes('other'));
    if (otherIdx > -1) {
      return [options[otherIdx], ...options.slice(0, otherIdx), ...options.slice(otherIdx + 1)];
    }
    return options;
  };

  // Filter options by search - memoized for performance
  const filteredOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const searchTerm = searchInputs[currentQuestion.id];
    let opts = currentQuestion.options;
    if (isSearchEnabled && searchTerm) {
      opts = opts.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return reorderOptions(opts);
  }, [currentQuestion, isSearchEnabled, searchInputs]);

  // Convert to FlatList data format
  const optionData = useMemo(() => 
    filteredOptions.map((option, index) => ({ option, index, key: `${option}-${index}` }))
  , [filteredOptions]);

  // Capsule display for selected options (multi-select)
  const renderSelectedCapsules = () => {
    if (!currentQuestion) return null;
    const selected = isMultiSelect
      ? (answers[currentQuestion.id] || [])
      : answers[currentQuestion.id]
        ? [answers[currentQuestion.id]]
        : [];
    if (!selected || selected.length === 0) return null;

    return (
      <View style={styles.capsuleContainer}>
        {selected.map((sel: string, idx: number) => (
          <View key={sel + idx} style={styles.capsule}>
            <Text style={styles.capsuleText}>{sel}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveSelected(sel)}
              style={styles.capsuleRemove}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // Remove selected option
  const handleRemoveSelected = (option: string) => {
    if (!currentQuestion) return;
    if (isMultiSelect) {
      setAnswers(prev => {
        const prevArr = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] : [];
        return { ...prev, [currentQuestion.id]: prevArr.filter((a: string) => a !== option) };
      });
    } else {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: undefined }));
      setShowOtherInput(prev => ({ ...prev, [currentQuestion.id]: false }));
    }
  };

  // Handle "Other" option click
  const handleOtherClick = (questionId: string) => {
    setShowOtherInput(prev => ({ ...prev, [questionId]: true }));
    setCustomInputs(prev => ({ ...prev, [questionId]: '' }));
  };

  // Check if option is "Other" variant
  const isOtherOption = (option: string) => {
    return option.toLowerCase().includes('other');
  };

  // Handle answer selection
  const handleAnswer = useCallback((questionId: string, answer: string) => {
    if (isOtherOption(answer)) {
      handleOtherClick(questionId);
      return;
    }
    
    if (isMultiSelect) {
      setAnswers(prev => {
        const prevArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        if (prevArr.includes(answer)) {
          return { ...prev, [questionId]: prevArr.filter((a: string) => a !== answer) };
        } else {
          return { ...prev, [questionId]: [...prevArr, answer] };
        }
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
      setShowOtherInput(prev => ({ ...prev, [questionId]: false }));
    }
  }, [isMultiSelect]);

  // Handle custom input for 'Other'
  const handleCustomInput = useCallback((questionId: string, value: string) => {
    setCustomInputs(prev => ({ ...prev, [questionId]: value }));
  }, []);

  // Handle adding custom option
  const handleAddCustomOption = useCallback((questionId: string) => {
    const customValue = customInputs[questionId]?.trim();
    if (!customValue) return;

    if (isMultiSelect) {
      setAnswers(prev => {
        const prevArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        // Check if this custom value already exists
        if (prevArr.includes(customValue)) return prev;
        return { ...prev, [questionId]: [...prevArr, customValue] };
      });
      // Reset for next custom input
      setCustomInputs(prev => ({ ...prev, [questionId]: '' }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: customValue }));
      setShowOtherInput(prev => ({ ...prev, [questionId]: false }));
      setCustomInputs(prev => ({ ...prev, [questionId]: '' }));
    }
  }, [isMultiSelect, customInputs]);

  // Handle search input
  const handleSearchInput = useCallback((questionId: string, value: string) => {
    setSearchInputs(prev => ({ ...prev, [questionId]: value }));
  }, []);

  // Next/Back logic
  const handleNext = useCallback(() => {
    const newVisibleQuestions = getVisibleQuestions();
    if (currentStep < newVisibleQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  }, [currentStep, getVisibleQuestions, onComplete, answers]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Progress bar calculation
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  // Validation: require at least one answer for multi-select, or a value for single-select
  const isAnswered = useMemo(() => {
    if (!currentQuestion) return false;
    
    if (isMultiSelect) {
      const questionAnswers = answers[currentQuestion.id];
      return Array.isArray(questionAnswers) && questionAnswers.length > 0;
    } else {
      return !!answers[currentQuestion.id];
    }
  }, [currentQuestion, isMultiSelect, answers]);

  // Check if option is selected
  const isOptionSelected = useCallback((option: string) => {
    if (!currentQuestion) return false;
    
    if (isMultiSelect) {
      const questionAnswers = answers[currentQuestion.id];
      if (!Array.isArray(questionAnswers)) return false;
      return questionAnswers.includes(option);
    } else {
      return answers[currentQuestion.id] === option;
    }
  }, [currentQuestion, isMultiSelect, answers]);

  // Render individual option item
  const renderOptionItem = useCallback(({ item }: { item: OptionItem }) => {
    const { option } = item;
    if (!currentQuestion) return null;

    const isSelected = isOptionSelected(option);
    const isOther = isOtherOption(option);

    return (
      <View style={styles.optionWrapper}>
        <TouchableOpacity
          style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
          onPress={() => handleAnswer(currentQuestion.id, option)}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
            {option}
            {isSelected && !isOther && <Text style={styles.checkmark}> ✓</Text>}
          </Text>
        </TouchableOpacity>
        
        {/* Custom input for 'Other' options */}
        {isOther && showOtherInput[currentQuestion.id] && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              value={customInputs[currentQuestion.id] || ''}
              onChangeText={text => handleCustomInput(currentQuestion.id, text)}
              placeholder={currentQuestion.id === 'program' ? "Enter your program..." : "Please specify..."}
              placeholderTextColor="#b3d3f6"
              multiline
              onSubmitEditing={() => handleAddCustomOption(currentQuestion.id)}
              blurOnSubmit={true}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                (!customInputs[currentQuestion.id]?.trim()) && styles.addButtonDisabled
              ]}
              onPress={() => handleAddCustomOption(currentQuestion.id)}
              disabled={!customInputs[currentQuestion.id]?.trim()}
            >
              <Text style={styles.addButtonText}>
                {currentQuestion.id === 'program' ? 'Select' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [currentQuestion, isOptionSelected, customInputs, handleAnswer, handleCustomInput, handleAddCustomOption, showOtherInput]);

  // Fixed getItemLayout for FlatList
  const getItemLayout = useCallback((data: any, index: number) => {
    const baseHeight = 62; // Base height for option button + margin
    const item = data?.[index];
    const extraHeight = item && isOtherOption(item.option) && showOtherInput[currentQuestion?.id || ''] ? 80 : 0; // Extra height for custom input + button
    
    return {
      length: baseHeight + extraHeight,
      offset: (baseHeight + extraHeight) * index,
      index,
    };
  }, [showOtherInput, currentQuestion]);

  if (currentQuestions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No questions available for your career stage.</Text>
      </View>
    );
  }
  
  if (!currentQuestion) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Calculate available height for options list
  const headerHeight = 120; // Approximate height for progress bar and question
  const searchBarHeight = isSearchEnabled ? 60 : 0;
  const navButtonHeight = 80;
  const availableHeight = screenHeight - headerHeight - searchBarHeight - navButtonHeight - 40; // 40 for padding

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Career Assessment"
        onBackPress={() => router.replace('/career-path')}
      />

      {/* Fixed Header */}
      <View style={styles.header}>
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
      </View>

      {/* Capsules for selected options */}
      {renderSelectedCapsules()}

      {/* Options List */}
      <View style={[styles.optionsContainer, { height: availableHeight }]}>
        {optionData.length > 20 ? (
          <FlatList
            data={optionData}
            renderItem={renderOptionItem}
            keyExtractor={(item) => item.key}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            // Removing getItemLayout as it's causing issues with dynamic heights
          />
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {optionData.map((item) => (
              <View key={item.key}>
                {renderOptionItem({ item })}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Floating Navigation Buttons */}
      <View style={styles.floatingNavButtons}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3f0fa',
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
    marginBottom: 10,
    color: '#222',
    backgroundColor: '#f7fbff',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
    minHeight: 50,
    justifyContent: 'center',
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
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#5badec',
    borderRadius: 8,
    padding: 10,
    color: '#222',
    backgroundColor: '#f7fbff',
    minHeight: 40,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#5badec',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#b3d3f6',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  floatingNavButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e3f0fa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  capsuleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  capsuleText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  capsuleRemove: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CareerTest;
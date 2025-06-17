import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native';
import { CheckCircle, Circle, ExternalLink, DollarSign, Clock, BarChart3, Timer } from 'lucide-react-native';
import { generateProjectsWithRetry } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/appwrite';
import AIProjectModal from './AIProjectModal';

// Types (unchanged)
interface LearningStage {
  $id: string;
  title: string;
  description: string;
  order: number;
  careerPathId: string;
}

interface Topic {
  $id: string;
  title: string;
  description: string;
  order: number;
  learning_stageId: string;
}

interface Certification {
  $id: string;
  name: string;
  provider: string;
  link: string;
  is_paid: boolean;
  duration: string;
  careerPathId: string;
}

interface Project {
  $id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  tools: string[];
  prerequisites: string[];
  careerPathId: string;
  outcome: string;
  steps: string[];
  evaluationCriteria: string[];
}

interface AIProject {
  title: string;
  objectives: string[];
  steps: string[];
  tools: string[];
  timeCommitment: string;
  realWorldRelevance: string;
}

interface LearningContentProps {
  activeTab: 'learning' | 'certifications' | 'projects';
  learningStages: LearningStage[];
  topicsByStage: Record<string, Topic[]>;
  userProgress: Record<string, boolean>;
  certifications: Certification[];
  projects: Project[];
  onTopicClick: (topic: Topic) => void;
  onProjectClick: (project: Project) => void;
}

const LearningContent: React.FC<LearningContentProps> = ({
  activeTab,
  learningStages,
  topicsByStage,
  userProgress,
  certifications,
  projects,
  onTopicClick,
  onProjectClick,
}) => {
  // AI Project Generator State (unchanged)
  const [aiProjects, setAIProjects] = useState<AIProject[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAIProject, setSelectedAIProject] = useState<AIProject | null>(null);
  const [aiProjectModalVisible, setAIProjectModalVisible] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Helper functions (unchanged)
  const getStageProgress = (stageId: string): number => {
    const topics = topicsByStage[stageId] || [];
    if (topics.length === 0) return 0;
    const completedTopics = topics.filter(topic => userProgress[topic.$id]);
    return (completedTopics.length / topics.length) * 100;
  };

  const handleResourceClick = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleGenerateProjects = async () => {
    try {
      setIsGenerating(true);
      const user = await getCurrentUser();
      
      if (!user?.selectedPath) {
        Alert.alert('Error', 'Please select a career path first');
        return;
      }

      const generatedProjects = await generateProjectsWithRetry(user.selectedPath, difficulty, 3);
      setAIProjects(generatedProjects);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate projects. Please try again.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // renderLearningTab and renderCertificationsTab remain unchanged
  const renderLearningTab = () => (
    <View style={styles.tabContent}>
      {learningStages.map((stage) => (
        <View key={stage.$id} style={styles.stageContainer}>
          {/* Compact Stage Header */}
          <View style={styles.stageHeader}>
            <View style={styles.stageTitleContainer}>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getStageProgress(stage.$id))}%
              </Text>
            </View>
            <Text style={styles.stageDescription}>{stage.description}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getStageProgress(stage.$id)}%` }
                ]} 
              />
            </View>
          </View>

          {/* Compact Topics Grid */}
          <View style={styles.topicsGrid}>
            {(topicsByStage[stage.$id] || []).map((topic) => {
              const isCompleted = userProgress[topic.$id] || false;
              return (
                <TouchableOpacity
                  key={topic.$id}
                  style={[styles.topicCard, isCompleted && styles.completedTopicCard]}
                  onPress={() => onTopicClick(topic)}
                  activeOpacity={0.7}
                >
                  <View style={styles.topicCardHeader}>
                    {isCompleted ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : (
                      <Circle size={16} color="#94a3b8" />
                    )}
                    <ExternalLink size={12} color="#94a3b8" />
                  </View>
                  <Text style={[styles.topicCardTitle, isCompleted && styles.completedTopicCardTitle]} numberOfLines={2}>
                    {topic.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCertificationsTab = () => (
    <View style={styles.tabContent}>
      {certifications.map((cert) => (
        <TouchableOpacity
          key={cert.$id}
          style={styles.compactCard}
          onPress={() => handleResourceClick(cert.link)}
          activeOpacity={0.7}
        >
          <View style={styles.compactCardHeader}>
            <View style={styles.compactCardTitleContainer}>
              <Text style={styles.compactCardTitle} numberOfLines={1}>{cert.name}</Text>
              <Text style={styles.compactCardSubtitle} numberOfLines={1}>by {cert.provider}</Text>
            </View>
            <View style={styles.compactCardMeta}>
              {cert.is_paid && (
                <View style={styles.compactBadge}>
                  <DollarSign size={10} color="#f59e0b" />
                </View>
              )}
              <View style={styles.durationBadge}>
                <Clock size={10} color="#6b7280" />
                <Text style={styles.durationBadgeText}>{cert.duration}</Text>
              </View>
              <ExternalLink size={14} color="#5badec" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
      
      {certifications.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No certifications available</Text>
        </View>
      )}
    </View>
  );

  // Updated renderProjectsTab with visual separation
  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      {/* Generator Controls */}
      <View style={styles.generatorControls}>
        <View style={styles.difficultySelector}>
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.selectedDifficultyButton
              ]}
              onPress={() => setDifficulty(level)}
              disabled={isGenerating}
            >
              <Text style={[
                styles.difficultyButtonText,
                difficulty === level && styles.selectedDifficultyButtonText
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateProjects}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate AI Projects</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* AI Generated Projects Section */}
      {aiProjects.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>AI-Generated Projects</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </View>
          {aiProjects.map((project, index) => (
            <TouchableOpacity
              key={`ai-${index}`}
              style={[styles.compactCard, styles.aiProjectCard]}
              onPress={() => {
                setSelectedAIProject(project);
                setAIProjectModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.compactCardHeader}>
                <View style={styles.compactCardTitleContainer}>
                  <Text style={styles.compactCardTitle} numberOfLines={1}>{project.title}</Text>
                  <Text style={styles.compactCardSubtitle} numberOfLines={2}>
                    {project.objectives[0]}
                  </Text>
                </View>
                <View style={styles.compactCardMeta}>
                  <View style={styles.durationBadge}>
                    <Timer size={10} color="#6b7280" />
                    <Text style={styles.durationBadgeText}>{project.timeCommitment}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Standard Projects Section */}
      {projects.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Standard Projects</Text>
            <View style={styles.standardBadge}>
              <Text style={styles.standardBadgeText}>Standard</Text>
            </View>
          </View>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.$id}
              style={styles.compactCard}
              onPress={() => onProjectClick(project)}
              activeOpacity={0.7}
            >
              <View style={styles.compactCardHeader}>
                <View style={styles.compactCardTitleContainer}>
                  <Text style={styles.compactCardTitle} numberOfLines={1}>{project.title}</Text>
                  <Text style={styles.compactCardSubtitle} numberOfLines={2}>{project.description}</Text>
                </View>
                <View style={styles.compactCardMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(project.difficulty) + '30' }]}>
                    <Text style={[styles.difficultyBadgeText, { color: getDifficultyColor(project.difficulty) }]}>
                      {project.difficulty.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Timer size={10} color="#6b7280" />
                    <Text style={styles.durationBadgeText}>{project.estimatedDuration}</Text>
                  </View>
                  <ExternalLink size={14} color="#5badec" />
                </View>
              </View>

              {/* Compact Tools Display */}
              {project.tools && project.tools.length > 0 && (
                <View style={styles.toolsRow}>
                  {project.tools.slice(0, 4).map((tool, index) => (
                    <View key={index} style={styles.compactToolTag}>
                      <Text style={styles.compactToolText}>{tool}</Text>
                    </View>
                  ))}
                  {project.tools.length > 4 && (
                    <Text style={styles.moreToolsCompact}>+{project.tools.length - 4}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {projects.length === 0 && aiProjects.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No projects available</Text>
        </View>
      )}
    </View>
  );

  // Main render (unchanged)
  return (
    <>
      {activeTab === 'learning' && renderLearningTab()}
      {activeTab === 'certifications' && renderCertificationsTab()}
      {activeTab === 'projects' && renderProjectsTab()}
      
      <AIProjectModal
        visible={aiProjectModalVisible}
        project={selectedAIProject}
        onClose={() => setAIProjectModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  
  // Compact Learning Stage Styles (unchanged)
  stageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  stageHeader: {
    marginBottom: 12,
  },
  stageTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stageDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5badec',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5badec',
    borderRadius: 3,
  },

  // Topics Grid Layout (unchanged)
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 70,
  },
  completedTopicCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  topicCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 16,
  },
  completedTopicCardTitle: {
    color: '#10b981',
  },

  // Compact Card Styles (unchanged)
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  compactCardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  compactCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 3,
  },
  compactCardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 17,
  },
  compactCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Compact Badges (unchanged)
  compactBadge: {
    width: 20,
    height: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  durationBadgeText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  difficultyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Compact Tools (unchanged)
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  compactToolTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactToolText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '500',
  },
  moreToolsCompact: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },

  // Empty State (unchanged)
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // AI Project Generator Styles (unchanged)
  generatorControls: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  difficultySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficultyButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  selectedDifficultyButton: {
    backgroundColor: '#5badec',
  },
  difficultyButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedDifficultyButtonText: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#5badec',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // New styles for project sections
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  aiBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  standardBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  standardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  aiProjectCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
});

export default LearningContent;
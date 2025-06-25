import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
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

interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  visible,
  onClose,
  project,
}) => {
  if (!project) return null;

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Project Header */}
          <View style={styles.projectHeader}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            
            <View style={styles.projectMeta}>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(project.difficulty) + '20' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(project.difficulty) }
                ]}>
                  {project.difficulty}
                </Text>
              </View>
              
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.durationText}>{project.estimatedDuration}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>

          {/* Outcome */}
          {project.outcome && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}> 
                <Ionicons name="bulb-outline" size={18} color="#5badec" />
                <Text style={styles.sectionTitle}>Learning Outcome</Text>
              </View>
              <View style={styles.outcomeContainer}>
                <Text style={styles.outcomeText}>{project.outcome}</Text>
              </View>
            </View>
          )}

          {/* Prerequisites */}
          {project.prerequisites && project.prerequisites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Prerequisites</Text>
              </View>
              <View style={styles.listContainer}>
                {project.prerequisites.map((prerequisite, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{prerequisite}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tools & Technologies */}
          {project.tools && project.tools.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={18} color="#10b981" />
                <Text style={styles.sectionTitle}>Tools & Technologies</Text>
              </View>
              <View style={styles.toolsGrid}>
                {project.tools.map((tool, index) => (
                  <View key={index} style={styles.toolTag}>
                    <Text style={styles.toolText}>{tool}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Project Steps */}
          {project.steps && project.steps.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkbox-outline" size={18} color="#5badec" />
                <Text style={styles.sectionTitle}>Project Steps</Text>
              </View>
              <View style={styles.stepsContainer}>
                {project.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Evaluation Criteria */}
          {project.evaluationCriteria && project.evaluationCriteria.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="ribbon-outline" size={18} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Evaluation Criteria</Text>
              </View>
              <View style={styles.listContainer}>
                {project.evaluationCriteria.map((criteria, index) => (
                  <View key={index} style={styles.criteriaItem}>
                    <Ionicons name="star-outline" size={16} color="#8b5cf6" />
                    <Text style={styles.criteriaText}>{criteria}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  closeButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  projectHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  outcomeContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#5badec',
  },
  outcomeText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    fontWeight: '500',
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#5badec',
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toolText: {
    fontSize: 13,
    color: '#5badec',
    fontWeight: '600',
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5badec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  criteriaText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});

export default ProjectModal;
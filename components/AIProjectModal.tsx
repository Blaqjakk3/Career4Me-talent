import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Download, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Project {
  title: string;
  objectives: string[];
  steps: string[];
  tools: string[];
  timeCommitment: string;
  realWorldRelevance: string;
}

interface AIProjectModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
}

const AIProjectModal: React.FC<AIProjectModalProps> = ({ visible, project, onClose }) => {
  if (!project) return null;

  const handleDownload = async () => {
    try {
      const content = `Project: ${project.title}

Objectives:
${project.objectives.map(o => `- ${o}`).join('\n')}

Steps:
${project.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Tools: ${project.tools.join(', ')}

Time Commitment: ${project.timeCommitment}

Real-World Relevance: ${project.realWorldRelevance}`;

      // Create filename with sanitized project title
      const sanitizedTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${sanitizedTitle}_project.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Write file to device storage
      await FileSystem.writeAsStringAsync(filePath, content);

      // Share the file (this will allow user to save it or share it)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Success', `Project saved as ${fileName}`);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      Alert.alert('Error', 'Failed to save project file');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.title}>{project.title}</Text>
            
            <Text style={styles.sectionTitle}>Objectives</Text>
            {project.objectives.map((obj, i) => (
              <Text key={i} style={styles.listItem}>• {obj}</Text>
            ))}

            <Text style={styles.sectionTitle}>Steps</Text>
            {project.steps.map((step, i) => (
              <Text key={i} style={styles.listItem}>{i + 1}. {step}</Text>
            ))}

            <Text style={styles.sectionTitle}>Tools</Text>
            <Text style={styles.text}>{project.tools.join(', ')}</Text>

            <Text style={styles.sectionTitle}>Time Commitment</Text>
            <Text style={styles.text}>{project.timeCommitment}</Text>

            <Text style={styles.sectionTitle}>Real-World Relevance</Text>
            <Text style={styles.text}>{project.realWorldRelevance}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <Download size={18} color="#fff" />
              <Text style={styles.downloadText}>Save as TXT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#444',
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 3,
    lineHeight: 20,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 15,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  downloadText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default AIProjectModal;
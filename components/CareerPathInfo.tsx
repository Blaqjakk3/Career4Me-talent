import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CareerPath {
  $id: string;
  title: string;
  description: string;
  tags: string[];
  time_to_complete: string;
  required_background: string;
  learning_style: string[];
  suggestedDegrees: string[];
}

interface CareerPathInfoProps {
  careerPath: CareerPath;
}

const CareerPathInfo: React.FC<CareerPathInfoProps> = ({ careerPath }) => {
  return (
    <View style={styles.container}>
      {/* Header with Title and Tags */}
      <View style={styles.header}>
        <Text style={styles.title}>{careerPath.title}</Text>
        {careerPath.tags && careerPath.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {careerPath.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {careerPath.tags.length > 3 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{careerPath.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Duration */}
        <View style={styles.durationContainer}>
          <Ionicons name="time-outline" size={14} color="#5badec" />
          <Text style={styles.durationText}>{careerPath.time_to_complete}</Text>
        </View>
      </View>

      {/* Compact Description */}
      <Text style={styles.description} numberOfLines={2}>
        {careerPath.description}
      </Text>

      {/* Info Cards - 3 items in single column */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Ionicons name="person-outline" size={16} color="#5badec" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Background Required</Text>
            <Text style={styles.infoValue}>
              {careerPath.required_background}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="book-outline" size={16} color="#5badec" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Learning Style</Text>
            <Text style={styles.infoValue}>
              {careerPath.learning_style.join(', ')}
            </Text>
          </View>
        </View>

        {careerPath.suggestedDegrees && careerPath.suggestedDegrees.length > 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="school-outline" size={16} color="#5badec" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Education</Text>
              <Text style={styles.infoValue}>
                {careerPath.suggestedDegrees.join(', ')}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1f2ff',
  },
  tagText: {
    color: '#5badec',
    fontSize: 11,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 13,
    color: '#5badec',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafb',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5badec',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default CareerPathInfo;
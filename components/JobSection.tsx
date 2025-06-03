import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

type JobSectionProps = {
  title: string;
  items: string[];
};

const JobSection = ({ title, items }: JobSectionProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <CheckCircle size={16} color="#4f46e5" style={styles.icon} />
          <Text style={styles.listItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
});

export default JobSection;
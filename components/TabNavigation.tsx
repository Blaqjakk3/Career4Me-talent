import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabNavigationProps {
  activeTab: 'learning' | 'certifications' | 'projects';
  onTabChange: (tab: 'learning' | 'certifications' | 'projects') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: 'learning' | 'certifications' | 'projects'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'learning', label: 'Learning', icon: 'book-outline' },
    { id: 'certifications', label: 'Certs', icon: 'ribbon-outline' },
    { id: 'projects', label: 'Projects', icon: 'rocket-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={isActive ? '#007AFF' : '#8E8E93'}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    position: 'relative',
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 20,
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
});

export default TabNavigation;
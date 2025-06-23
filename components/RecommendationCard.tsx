import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface RecommendationCardProps {
  title: string;
  items: string[];
  type: 'strength' | 'weakness' | 'info' | 'warning' | 'action';
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  items,
  type,
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const getTypeStyle = () => {
    switch (type) {
      case 'strength':
        return {
          borderColor: '#22c55e',
          iconColor: '#22c55e',
          icon: '✓',
        };
      case 'weakness':
        return {
          borderColor: '#ef4444',
          iconColor: '#ef4444',
          icon: '!',
        };
      case 'warning':
        return {
          borderColor: '#f59e0b',
          iconColor: '#f59e0b',
          icon: '⚠',
        };
      case 'action':
        return {
          borderColor: '#8b5cf6',
          iconColor: '#8b5cf6',
          icon: '→',
        };
      default: // info
        return {
          borderColor: '#007bff',
          iconColor: '#007bff',
          icon: 'i',
        };
    }
  };

  const typeStyle = getTypeStyle();

  return (
    <View style={[styles.container, { borderLeftColor: typeStyle.borderColor }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={[styles.itemIcon, { color: typeStyle.iconColor }]}>
              {typeStyle.icon}
            </Text>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  itemIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
    minWidth: 16,
    textAlign: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default RecommendationCard;
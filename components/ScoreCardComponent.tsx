import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface ScoreCardComponentProps {
  title: string;
  score: number;
  description?: string;
  color?: string;
  subtitle?: string;
}

const ScoreCardComponent: React.FC<ScoreCardComponentProps> = ({
  title,
  score,
  description,
  color = '#007bff',
  subtitle,
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const finalColor = color || getScoreColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, { color: finalColor }]}>
            {score}
          </Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>

        <View style={styles.scoreDetails}>
          {description && (
            <Text style={[styles.description, { color: finalColor }]}>
              {description}
            </Text>
          )}
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${score}%`,
                    backgroundColor: finalColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{score}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: -4,
  },
  scoreDetails: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default ScoreCardComponent;
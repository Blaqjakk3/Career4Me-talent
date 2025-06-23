import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ScoreCardComponent from './ScoreCardComponent';
import RecommendationCard from './RecommendationCard';

interface AnalysisResultsComponentProps {
  analysis: any;
  metadata: any;
}

const AnalysisResultsComponent: React.FC<AnalysisResultsComponentProps> = ({
  analysis,
  metadata,
}) => {
  return (
    <View style={styles.container}>
      {/* Overall Score */}
      <ScoreCardComponent
        title="Overall CV Score"
        score={analysis.overallScore}
        description={analysis.overallScoreFormatted?.description}
        color={analysis.overallScoreFormatted?.color}
      />

      {/* Marketability Score */}
      <ScoreCardComponent
        title="Marketability Score"
        score={analysis.marketability.score}
        description={analysis.marketabilityFormatted?.description}
        color={analysis.marketabilityFormatted?.color}
        subtitle={analysis.marketability.summary}
      />

      {/* Career Path Alignment */}
      {analysis.careerPathAlignment && (
        <ScoreCardComponent
          title="Career Path Alignment"
          score={analysis.careerPathAlignment.alignmentScore}
          description={analysis.careerAlignmentFormatted?.description}
          color={analysis.careerAlignmentFormatted?.color}
          subtitle={metadata.careerPath?.title}
        />
      )}

      {/* Strengths */}
      <RecommendationCard
        title="Key Strengths"
        items={analysis.strengths}
        type="strength"
      />

      {/* Weaknesses */}
      <RecommendationCard
        title="Areas for Improvement"
        items={analysis.weaknesses}
        type="weakness"
      />

      {/* Profile vs CV Gaps */}
      <View style={styles.gapsSection}>
        <Text style={styles.sectionTitle}>Profile vs CV Analysis</Text>
        
        {analysis.profileVsCvGaps.missingFromCV.length > 0 && (
          <RecommendationCard
            title="Skills in Profile but Missing from CV"
            items={analysis.profileVsCvGaps.missingFromCV}
            type="info"
          />
        )}

        {analysis.profileVsCvGaps.missingFromProfile.length > 0 && (
          <RecommendationCard
            title="Skills in CV but Missing from Profile"
            items={analysis.profileVsCvGaps.missingFromProfile}
            type="info"
          />
        )}

        {analysis.profileVsCvGaps.inconsistencies.length > 0 && (
          <RecommendationCard
            title="Inconsistencies Found"
            items={analysis.profileVsCvGaps.inconsistencies}
            type="warning"
          />
        )}
      </View>

      {/* Career Path Details */}
      {analysis.careerPathAlignment && (
        <View style={styles.careerSection}>
          <Text style={styles.sectionTitle}>Career Path Analysis</Text>
          
          {analysis.careerPathAlignment.matchingSkills.length > 0 && (
            <RecommendationCard
              title="Matching Skills"
              items={analysis.careerPathAlignment.matchingSkills}
              type="strength"
            />
          )}

          {analysis.careerPathAlignment.missingSkills.length > 0 && (
            <RecommendationCard
              title="Skills to Develop"
              items={analysis.careerPathAlignment.missingSkills}
              type="weakness"
            />
          )}

          {analysis.careerPathAlignment.matchingCertifications.length > 0 && (
            <RecommendationCard
              title="Relevant Certifications"
              items={analysis.careerPathAlignment.matchingCertifications}
              type="strength"
            />
          )}

          {analysis.careerPathAlignment.missingCertifications.length > 0 && (
            <RecommendationCard
              title="Recommended Certifications"
              items={analysis.careerPathAlignment.missingCertifications}
              type="info"
            />
          )}
        </View>
      )}

      {/* Marketability Details */}
      <View style={styles.marketabilitySection}>
        <Text style={styles.sectionTitle}>Marketability Analysis</Text>
        
        <RecommendationCard
          title="Competitive Advantages"
          items={analysis.marketability.competitiveAdvantages}
          type="strength"
        />

        <RecommendationCard
          title="Areas to Improve"
          items={analysis.marketability.improvementAreas}
          type="weakness"
        />
      </View>

      {/* Recommendations */}
      <RecommendationCard
        title="Recommendations"
        items={analysis.recommendations}
        type="info"
      />

      {/* Next Steps */}
      <RecommendationCard
        title="Next Steps"
        items={analysis.nextSteps}
        type="action"
      />

      {/* Metadata */}
      <View style={styles.metadataSection}>
        <Text style={styles.metadataTitle}>Analysis Details</Text>
        <Text style={styles.metadataText}>
          File: {metadata.fileName}
        </Text>
        <Text style={styles.metadataText}>
          Analyzed: {new Date(metadata.analyzedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.metadataText}>
          Processing time: {Math.round(metadata.executionTime / 1000)}s
        </Text>
        {metadata.usedFallback && (
          <Text style={styles.fallbackText}>
            * Basic analysis used due to processing limitations
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 24,
  },
  gapsSection: {
    marginTop: 8,
  },
  careerSection: {
    marginTop: 8,
  },
  marketabilitySection: {
    marginTop: 8,
  },
  metadataSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fallbackText: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default AnalysisResultsComponent;
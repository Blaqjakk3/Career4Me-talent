import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookmarkPlus, Check } from 'lucide-react-native';

interface CareerPath {
  $id: string;
  title: string;
  description?: string;
  requiredSkills?: string[];
  industry?: string;
  matchScore?: number;
}

interface SurveyCareerCardProps {
  careerPath: CareerPath;
  onSelectPath: (pathId: string) => void;
  isSaved: boolean;
  onToggleSave: (pathId: string) => void;
}

const SurveyCareerCard: React.FC<SurveyCareerCardProps> = ({ 
  careerPath, 
  onSelectPath, 
  isSaved, 
  onToggleSave 
}) => {
  return (
    <View 
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1 }}>
          {careerPath.title}
        </Text>
        
        <TouchableOpacity 
          style={{
            padding: 8,
            borderRadius: 999,
            backgroundColor: isSaved ? '#e5e9f0' : 'transparent',
          }}
          onPress={() => onToggleSave(careerPath.$id)}
        >
          <BookmarkPlus size={20} color={isSaved ? "#5badec" : "#6b7280"} />
        </TouchableOpacity>
      </View>
      
      {careerPath.description && (
        <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
          {careerPath.description}
        </Text>
      )}
      
      {careerPath.requiredSkills && careerPath.requiredSkills.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {careerPath.requiredSkills.slice(0, 3).map((skill, index) => (
            <View 
              key={index} 
              style={{
                backgroundColor: '#e5e7eb',
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: '#1f2937' }}>{skill}</Text>
            </View>
          ))}
          {careerPath.requiredSkills.length > 3 && (
            <View 
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                +{careerPath.requiredSkills.length - 3} more
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {careerPath.industry && (
          <View style={{ marginRight: 16, marginBottom: 8 }}>
            <Text style={{ fontSize: 14 }}>
              <Text style={{ fontWeight: '600', color: '#4b5563' }}>Industry: </Text>
              <Text style={{ color: '#6b7280' }}>{careerPath.industry}</Text>
            </Text>
          </View>
        )}
        
        {careerPath.matchScore !== undefined && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 14 }}>
              <Text style={{ fontWeight: '600', color: '#4b5563' }}>Match: </Text>
              <Text style={{ color: '#5badec', fontWeight: '600' }}>{Math.round(careerPath.matchScore)}%</Text>
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={{
          backgroundColor: '#5badec',
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => onSelectPath(careerPath.$id)}
      >
        <Check size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14, marginLeft: 4 }}>
          Select this path
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SurveyCareerCard;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { saveCareerPath, isCareerPathSaved, isCareerPathSelected } from '@/lib/appwrite';
import { useSavedCareerPaths } from '@/lib/savedCareerPathsContext';
import { Ionicons } from '@expo/vector-icons';

interface Skill {
  name: string;
}

interface CareerCardProps {
  id: string;
  title: string;
  description: string;
  skills: Skill[] | string[];
}

const CareerCard: React.FC<CareerCardProps> = ({
  id,
  title,
  description,
  skills = [],
}) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const visibleSkills = skills.slice(0, 3);
  const remainingSkillsCount = Math.max(0, skills.length - 3);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [saved, selected] = await Promise.all([
          isCareerPathSaved(id),
          isCareerPathSelected(id)
        ]);
        setIsSaved(saved);
        setIsSelected(selected);
      } catch (error) {
        console.error("Error checking status:", error);
        // Set default values on error
        setIsSaved(false);
        setIsSelected(false);
      }
    };
    checkStatus();
  }, [id]);

  const getSkillName = (skill: string | Skill): string => {
    if (typeof skill === 'string') {
      return skill;
    } else if (typeof skill === 'object' && skill && 'name' in skill) {
      return skill.name || 'Unknown skill';
    }
    return 'Unknown skill';
  };

  const handleLearnMore = () => {
    router.push(`/path-info/${id}`);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await saveCareerPath(id);
      if (result.success) {
        setIsSaved(result.isSaved);
      }
    } catch (error) {
      console.error("Failed to save career path:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure we have valid strings for display
  const displayTitle = title || 'Untitled Career Path';
  const displayDescription = description || 'No description available';

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1 }}>
          {displayTitle}
        </Text>
        {isSelected ? (
          <View style={{
            padding: 8,
            borderRadius: 999,
            backgroundColor: '#e5f9e0',
          }}>
            <Text style={{ fontSize: 12, color: '#16a34a' }}>Selected</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={{
              padding: 8,
              borderRadius: 999,
              backgroundColor: isSaved ? '#e5e9f0' : 'transparent',
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#5badec" />
            ) : (
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isSaved ? "#5badec" : "#6b7280"}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
        {displayDescription}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
        {visibleSkills.map((skill, index) => {
          const skillName = getSkillName(skill);
          return (
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
              <Text style={{ fontSize: 12, color: '#1f2937' }}>
                {skillName}
              </Text>
            </View>
          );
        })}
        {remainingSkillsCount > 0 && (
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
              +{remainingSkillsCount} more
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleLearnMore}
        style={{
          backgroundColor: '#5badec', 
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14 }}>
          Learn More
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CareerCard;
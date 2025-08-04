import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdditionalInfo {
  degrees: string[];
  certifications: string[];
  skills: string[];
  interests: string[];
  interestedFields: string[];
}

interface AdditionalInfoCardProps {
  additionalInfo: AdditionalInfo;
  editedAdditionalInfo: AdditionalInfo;
  isEditing: boolean;
  onEditDataChange: (data: AdditionalInfo) => void;
}

// Placeholder options based on CareerTestStore
const skillsOptions = [
  "2D/3D Animation", "3D Modeling", "Accounting", "Adobe Creative Suite", "AI Systems Knowledge", 
  "Algorithms", "Android Development", "API Design", "AWS", "Azure", "Backend Development", 
  "Big Data", "Blockchain", "C#", "C#/C++ Programming", "CAD Design", "Cloud Computing", 
  "Communication", "Creative Writing", "Cybersecurity", "Data Analysis", "Data Science", 
  "Database Management", "Deep Learning", "Digital Design Tools", "Frontend Development", 
  "Game Design", "JavaScript", "Machine Learning", "Marketing Strategy", "Photography", 
  "Project Management", "Python", "React", "SQL", "UI/UX Design Principles", 
  "Other (please specify)"
];

const degreesOptions = [
  "Accounting", "Aerospace Engineering", "Animation", "Applied Mathematics", "Architecture", 
  "Artificial Intelligence", "Biology", "Business Administration", "Chemical Engineering", 
  "Chemistry", "Civil Engineering", "Computer Science", "Cybersecurity", "Data Science", 
  "Economics", "Education", "Electrical Engineering", "Engineering", "Finance", 
  "Graphic Design", "Information Technology", "Marketing", "Mathematics", "Mechanical Engineering", 
  "Medicine", "Physics", "Psychology", "Software Engineering", "Statistics", 
  "Other (please specify)"
];

const interestsOptions = [
  "3D Graphics", "AI", "Animation", "App Development", "Architecture", "Art", 
  "Artificial Intelligence", "Astronomy", "Automotive", "Biology", "Biotechnology", 
  "Blockchain", "Business", "Chemistry", "Climate Change", "Coding", "Content Creation", 
  "Creativity", "Cybersecurity", "Data Analysis", "Design", "Economics", "Education", 
  "Engineering", "Entrepreneurship", "Environmental Science", "Fashion", "Finance", 
  "Game Development", "Healthcare", "Innovation", "Marketing", "Music", "Photography", 
  "Psychology", "Research", "Science", "Technology", "Writing", 
  "Other (please specify)"
];

const interestedFieldsOptions = [
  "Technology", "Business", "Healthcare", "Finance", "Creative Arts", "Engineering", 
  "Science", "Education", "Environment", "Other"
];

const MultiSelectModal: React.FC<{
  visible: boolean;
  title: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  onCustomAdd?: (value: string) => void;
  allowCustom?: boolean;
}> = ({ visible, title, options, selectedValues, onToggle, onClose, onCustomAdd, allowCustom }) => {
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomAdd = () => {
    if (customValue.trim() && onCustomAdd) {
      onCustomAdd(customValue.trim());
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            const isOther = option.includes('Other (please specify)');
            
            return (
              <View key={option}>
                <TouchableOpacity
                  onPress={() => {
                    if (isOther && allowCustom) {
                      setShowCustomInput(true);
                    } else {
                      onToggle(option);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: isSelected ? '#f0f9ff' : 'white',
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#0ea5e9' : '#e2e8f0',
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isSelected ? '#0ea5e9' : '#d1d5db',
                    backgroundColor: isSelected ? '#0ea5e9' : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? '#0ea5e9' : '#1e293b',
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>

                {isOther && showCustomInput && (
                  <View style={{
                    marginTop: 8,
                    marginBottom: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}>
                    <TextInput
                      value={customValue}
                      onChangeText={setCustomValue}
                      placeholder="Please specify..."
                      style={{
                        fontSize: 16,
                        color: '#1e293b',
                        marginBottom: 12,
                      }}
                      autoFocus
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={handleCustomAdd}
                        style={{
                          backgroundColor: '#0ea5e9',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCustomInput(false);
                          setCustomValue('');
                        }}
                        style={{
                          backgroundColor: '#f1f5f9',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const CertificationsModal: React.FC<{
  visible: boolean;
  certifications: string[];
  onAdd: (certification: string) => void;
  onRemove: (index: number) => void;
  onClose: () => void;
}> = ({ visible, certifications, onAdd, onRemove, onClose }) => {
  const [newCertification, setNewCertification] = useState('');

  const handleAdd = () => {
    if (newCertification.trim()) {
      onAdd(newCertification.trim());
      setNewCertification('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>Certifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <View style={{
            flexDirection: 'row',
            marginBottom: 20,
          }}>
            <TextInput
              value={newCertification}
              onChangeText={setNewCertification}
              placeholder="Add a certification..."
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: 'white',
                marginRight: 8,
              }}
            />
            <TouchableOpacity
              onPress={handleAdd}
              style={{
                backgroundColor: '#0ea5e9',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {certifications.map((cert, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: 'white',
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}>
                <Text style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#1e293b',
                }}>
                  {cert}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemove(index)}
                  style={{
                    padding: 4,
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({
  additionalInfo,
  editedAdditionalInfo,
  isEditing,
  onEditDataChange,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleToggleSelection = (field: keyof AdditionalInfo, value: string) => {
    const currentValues = editedAdditionalInfo[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onEditDataChange({
      ...editedAdditionalInfo,
      [field]: newValues
    });
  };

  const handleCustomAdd = (field: keyof AdditionalInfo, value: string) => {
    const currentValues = editedAdditionalInfo[field] as string[];
    if (!currentValues.includes(value)) {
      onEditDataChange({
        ...editedAdditionalInfo,
        [field]: [...currentValues, value]
      });
    }
  };

  const handleCertificationAdd = (certification: string) => {
    const currentCertifications = editedAdditionalInfo.certifications;
    if (!currentCertifications.includes(certification)) {
      onEditDataChange({
        ...editedAdditionalInfo,
        certifications: [...currentCertifications, certification]
      });
    }
  };

  const handleCertificationRemove = (index: number) => {
    const newCertifications = editedAdditionalInfo.certifications.filter((_, i) => i !== index);
    onEditDataChange({
      ...editedAdditionalInfo,
      certifications: newCertifications
    });
  };

  const InfoSection: React.FC<{
    title: string;
    field: keyof AdditionalInfo;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = ({ title, field, icon, color, bgColor, borderColor }) => {
    const values = (isEditing ? editedAdditionalInfo[field] : additionalInfo[field]) as string[];
    
    return (
      <View style={{ marginBottom: 24 }}>
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '600', 
          color: '#64748b', 
          marginBottom: 8, 
          textTransform: 'uppercase', 
          letterSpacing: 0.5 
        }}>
          {title}
        </Text>
        
        {isEditing ? (
          <TouchableOpacity
            onPress={() => setActiveModal(field)}
            style={{
              borderWidth: 2,
              borderColor: '#e2e8f0',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 16,
              backgroundColor: '#f8fafc',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name={icon as any} size={20} color={color} style={{ marginRight: 12 }} />
            <Text style={{
              fontSize: 16,
              flex: 1,
              color: values.length > 0 ? '#1e293b' : '#94a3b8',
              fontWeight: '500',
            }}>
              {values.length > 0 ? `${values.length} selected` : `Select ${title.toLowerCase()}`}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
        ) : (
          <View>
            {values.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {values.map((value, index) => (
                  <View key={index} style={{
                    backgroundColor: bgColor,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: borderColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons name={icon as any} size={14} color={color} style={{ marginRight: 6 }} />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: color,
                    }}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 16, color: '#94a3b8', fontStyle: 'italic' }}>
                No {title.toLowerCase()} added yet
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={{
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 8,
      }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 24 }}>
          Additional Information
        </Text>

        <InfoSection
          title="Degrees"
          field="degrees"
          icon="school-outline"
          color="#7c3aed"
          bgColor="#f3e8ff"
          borderColor="#d8b4fe"
        />

        <InfoSection
          title="Certifications"
          field="certifications"
          icon="medal-outline"
          color="#f59e0b"
          bgColor="#fef3c7"
          borderColor="#fcd34d"
        />

        <InfoSection
          title="Skills"
          field="skills"
          icon="code-slash-outline"
          color="#10b981"
          bgColor="#d1fae5"
          borderColor="#86efac"
        />

        <InfoSection
          title="Interests"
          field="interests"
          icon="heart-outline"
          color="#ef4444"
          bgColor="#fee2e2"
          borderColor="#fca5a5"
        />

        <InfoSection
          title="Interested Fields"
          field="interestedFields"
          icon="compass-outline"
          color="#0ea5e9"
          bgColor="#e0f2fe"
          borderColor="#7dd3fc"
        />
      </View>

      {/* Modals */}
      <MultiSelectModal
        visible={activeModal === 'degrees'}
        title="Select Degrees"
        options={degreesOptions}
        selectedValues={editedAdditionalInfo.degrees}
        onToggle={(value) => handleToggleSelection('degrees', value)}
        onClose={() => setActiveModal(null)}
        onCustomAdd={(value) => handleCustomAdd('degrees', value)}
        allowCustom={true}
      />

      <CertificationsModal
        visible={activeModal === 'certifications'}
        certifications={editedAdditionalInfo.certifications}
        onAdd={handleCertificationAdd}
        onRemove={handleCertificationRemove}
        onClose={() => setActiveModal(null)}
      />

      <MultiSelectModal
        visible={activeModal === 'skills'}
        title="Select Skills"
        options={skillsOptions}
        selectedValues={editedAdditionalInfo.skills}
        onToggle={(value) => handleToggleSelection('skills', value)}
        onClose={() => setActiveModal(null)}
        onCustomAdd={(value) => handleCustomAdd('skills', value)}
        allowCustom={true}
      />

      <MultiSelectModal
        visible={activeModal === 'interests'}
        title="Select Interests"
        options={interestsOptions}
        selectedValues={editedAdditionalInfo.interests}
        onToggle={(value) => handleToggleSelection('interests', value)}
        onClose={() => setActiveModal(null)}
        onCustomAdd={(value) => handleCustomAdd('interests', value)}
        allowCustom={true}
      />

      <MultiSelectModal
        visible={activeModal === 'interestedFields'}
        title="Select Interested Fields"
        options={interestedFieldsOptions}
        selectedValues={editedAdditionalInfo.interestedFields}
        onToggle={(value) => handleToggleSelection('interestedFields', value)}
        onClose={() => setActiveModal(null)}
        allowCustom={false}
      />
    </>
  );
};

export default AdditionalInfoCard;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/appwrite';
import { 
  generateCVWithRetry, 
  downloadCV, 
  validateCVRequest,
  formatCVDate,
  type CVGenerationRequest 
} from '@/lib/gemini';

interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  location?: string;
}

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string;
  link?: string;
  details: string[];
}

interface Certification {
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

interface ContactInfo {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  phone?: string;
}

const CVGenerator: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [additionalSkills, setAdditionalSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [educationDetails, setEducationDetails] = useState<Education[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Initialize empty education (don't pre-populate with existing degrees to avoid duplication)
        setEducationDetails([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const addSkill = () => {
    if (newSkill.trim() && !additionalSkills.includes(newSkill.trim())) {
      setAdditionalSkills([...additionalSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setAdditionalSkills(additionalSkills.filter(s => s !== skill));
  };

  const addEducation = () => {
    setEducationDetails([...educationDetails, {
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      location: ''
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educationDetails];
    updated[index][field] = value;
    setEducationDetails(updated);
  };

  const removeEducation = (index: number) => {
    setEducationDetails(educationDetails.filter((_, i) => i !== index));
  };

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      location: ''
    }]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workExperiences];
    updated[index][field] = value;
    setWorkExperiences(updated);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      technologies: '',
      link: '',
      details: ['']
    }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const updated = [...projects];
    updated[index][field] = value as any;
    setProjects(updated);
  };

  const addProjectDetail = (projectIndex: number) => {
    const updated = [...projects];
    updated[projectIndex].details.push('');
    setProjects(updated);
  };

  const updateProjectDetail = (projectIndex: number, detailIndex: number, value: string) => {
    const updated = [...projects];
    updated[projectIndex].details[detailIndex] = value;
    setProjects(updated);
  };

  const removeProjectDetail = (projectIndex: number, detailIndex: number) => {
    const updated = [...projects];
    updated[projectIndex].details = updated[projectIndex].details.filter((_, i) => i !== detailIndex);
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      title: '',
      issuer: '',
      date: '',
      link: ''
    }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateContactInfo = (field: keyof ContactInfo, value: string) => {
    setContactInfo({ ...contactInfo, [field]: value });
  };

  const handleGenerateCV = async () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }

    try {
      const request: CVGenerationRequest = {
        talentId: user.talentId,
        additionalSkills,
        educationDetails: educationDetails.filter(edu => edu.degree && edu.institution),
        workExperiences: workExperiences.filter(exp => exp.company && exp.position),
        projects: projects.filter(proj => proj.title && proj.description),
        certifications: certifications.filter(cert => cert.title && cert.issuer),
        contactInfo
      };

      validateCVRequest(request);
      setLoading(true);

      const result = await generateCVWithRetry(request);
      
      if (result.success && result.pdfData) {
        setGeneratedCV(result.pdfData);
        Alert.alert('Success', 'CV generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate CV');
      }

    } catch (error) {
      console.error('CV generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!generatedCV) return;

    try {
      const fileName = `${user?.fullname?.replace(/\s+/g, '_')}_CV.pdf` || 'my_cv.pdf';
      await downloadCV(generatedCV, fileName);
      Alert.alert('Success', 'CV downloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download CV');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header title="CV Generator" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading user data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="CV Generator" onBackPress={handleBackPress} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Generate Your Professional CV</Text>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TextInput
            style={styles.input}
            value={contactInfo.phone}
            onChangeText={(value) => updateContactInfo('phone', value)}
            placeholder="Phone Number"
          />
          <TextInput
            style={styles.input}
            value={contactInfo.linkedin}
            onChangeText={(value) => updateContactInfo('linkedin', value)}
            placeholder="LinkedIn Profile URL"
          />
          <TextInput
            style={styles.input}
            value={contactInfo.github}
            onChangeText={(value) => updateContactInfo('github', value)}
            placeholder="GitHub Profile URL"
          />
          <TextInput
            style={styles.input}
            value={contactInfo.portfolio}
            onChangeText={(value) => updateContactInfo('portfolio', value)}
            placeholder="Portfolio Website URL"
          />
        </View>

        {/* Existing Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Skills</Text>
          <View style={styles.skillsContainer}>
            {user.skills?.map((skill: string, index: number) => (
              <View key={index} style={[styles.skillChip, styles.existingSkill]}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Skills</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a skill"
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillsContainer}>
            {additionalSkills.map((skill, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.skillChip, styles.additionalSkill]}
                onPress={() => removeSkill(skill)}
              >
                <Text style={styles.skillText}>{skill} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity style={styles.addButton} onPress={addEducation}>
              <Text style={styles.addButtonText}>Add Education</Text>
            </TouchableOpacity>
          </View>
          {educationDetails.map((edu, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={edu.degree}
                onChangeText={(value) => updateEducation(index, 'degree', value)}
                placeholder="Degree (e.g., BSc Computer Science)"
              />
              <TextInput
                style={styles.input}
                value={edu.institution}
                onChangeText={(value) => updateEducation(index, 'institution', value)}
                placeholder="Institution"
              />
              <TextInput
                style={styles.input}
                value={edu.location}
                onChangeText={(value) => updateEducation(index, 'location', value)}
                placeholder="Location (optional)"
              />
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={edu.startDate}
                  onChangeText={(value) => updateEducation(index, 'startDate', value)}
                  placeholder="Start Date"
                />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={edu.endDate}
                  onChangeText={(value) => updateEducation(index, 'endDate', value)}
                  placeholder="End Date"
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeEducation(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Work Experience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            <TouchableOpacity style={styles.addButton} onPress={addWorkExperience}>
              <Text style={styles.addButtonText}>Add Experience</Text>
            </TouchableOpacity>
          </View>
          {workExperiences.map((exp, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={exp.position}
                onChangeText={(value) => updateWorkExperience(index, 'position', value)}
                placeholder="Position/Job Title"
              />
              <TextInput
                style={styles.input}
                value={exp.company}
                onChangeText={(value) => updateWorkExperience(index, 'company', value)}
                placeholder="Company/Organization"
              />
              <TextInput
                style={styles.input}
                value={exp.location}
                onChangeText={(value) => updateWorkExperience(index, 'location', value)}
                placeholder="Location (optional)"
              />
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={exp.startDate}
                  onChangeText={(value) => updateWorkExperience(index, 'startDate', value)}
                  placeholder="Start Date"
                />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={exp.endDate}
                  onChangeText={(value) => updateWorkExperience(index, 'endDate', value)}
                  placeholder="End Date"
                />
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={exp.description}
                onChangeText={(value) => updateWorkExperience(index, 'description', value)}
                placeholder="Job description and achievements"
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeWorkExperience(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <TouchableOpacity style={styles.addButton} onPress={addProject}>
              <Text style={styles.addButtonText}>Add Project</Text>
            </TouchableOpacity>
          </View>
          {projects.map((project, projectIndex) => (
            <View key={projectIndex} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={project.title}
                onChangeText={(value) => updateProject(projectIndex, 'title', value)}
                placeholder="Project Title"
              />
              <TextInput
                style={styles.input}
                value={project.description}
                onChangeText={(value) => updateProject(projectIndex, 'description', value)}
                placeholder="Brief Description"
              />
              <TextInput
                style={styles.input}
                value={project.technologies}
                onChangeText={(value) => updateProject(projectIndex, 'technologies', value)}
                placeholder="Technologies Used (comma separated)"
              />
              <TextInput
                style={styles.input}
                value={project.link}
                onChangeText={(value) => updateProject(projectIndex, 'link', value)}
                placeholder="Project Link/URL (optional)"
              />
              
              <Text style={styles.subSectionTitle}>Project Details/Achievements:</Text>
              {project.details.map((detail, detailIndex) => (
                <View key={detailIndex} style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={detail}
                    onChangeText={(value) => updateProjectDetail(projectIndex, detailIndex, value)}
                    placeholder="Project detail or achievement"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.miniRemoveButton}
                    onPress={() => removeProjectDetail(projectIndex, detailIndex)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.smallAddButton}
                onPress={() => addProjectDetail(projectIndex)}
              >
                <Text style={styles.addButtonText}>Add Detail</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeProject(projectIndex)}
              >
                <Text style={styles.removeButtonText}>Remove Project</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity style={styles.addButton} onPress={addCertification}>
              <Text style={styles.addButtonText}>Add Certification</Text>
            </TouchableOpacity>
          </View>
          {certifications.map((cert, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={cert.title}
                onChangeText={(value) => updateCertification(index, 'title', value)}
                placeholder="Certification Title"
              />
              <TextInput
                style={styles.input}
                value={cert.issuer}
                onChangeText={(value) => updateCertification(index, 'issuer', value)}
                placeholder="Issuing Organization"
              />
              <TextInput
                style={styles.input}
                value={cert.date}
                onChangeText={(value) => updateCertification(index, 'date', value)}
                placeholder="Date Obtained"
              />
              <TextInput
                style={styles.input}
                value={cert.link}
                onChangeText={(value) => updateCertification(index, 'link', value)}
                placeholder="Certification Link/URL (optional)"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeCertification(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Generate CV Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.disabledButton]}
          onPress={handleGenerateCV}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Professional CV</Text>
          )}
        </TouchableOpacity>

        {/* Download Button */}
        {generatedCV && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadCV}
          >
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    color: '#555',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },
  existingSkill: {
    backgroundColor: '#e3f2fd',
  },
  additionalSkill: {
    backgroundColor: '#fff3e0',
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  miniRemoveButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  generateButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#17a2b8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default CVGenerator;
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { uploadFile, createApplication, createEmployerNotification, createTalentNotification, checkExistingApplication } from '../lib/appwrite';
import CustomButton from './CustomButton';

const QuickApplyModal = ({ isVisible, onClose, job, currentUser, onApplicationSubmitted }) => {
  const [cv, setCv] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [coverLetter, setCoverLetter] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Compatibility Calculation Logic ---
  function calculateSkillsMatch(userSkills = [], jobSkills = []) {
    if (!jobSkills || jobSkills.length === 0) return 100;
    const userSkillsLower = (userSkills || []).map(s => s.toLowerCase().trim());
    const jobSkillsLower = (jobSkills || []).map(s => s.toLowerCase().trim());
    const matched = jobSkillsLower.filter(skill =>
      userSkillsLower.some(userSkill =>
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    return Math.round((matched.length / jobSkillsLower.length) * 100);
  }

  function calculateDegreesMatch(userDegrees = [], jobDegrees = []) {
    if (!jobDegrees || jobDegrees.length === 0) return 100;
    const userDegreesLower = (userDegrees || []).map(d => d.toLowerCase().trim());
    const jobDegreesLower = (jobDegrees || []).map(d => d.toLowerCase().trim());
    const matched = jobDegreesLower.filter(degree =>
      userDegreesLower.some(userDegree =>
        userDegree.includes(degree) || degree.includes(userDegree)
      )
    );
    return Math.round((matched.length / jobDegreesLower.length) * 100);
  }

  function calculateCertificationsMatch(userCerts = [], jobCerts = []) {
    if (!jobCerts || jobCerts.length === 0) return 100;
    const userCertsLower = (userCerts || []).map(c => c.toLowerCase().trim());
    const jobCertsLower = (jobCerts || []).map(c => c.toLowerCase().trim());
    const matched = jobCertsLower.filter(cert =>
      userCertsLower.some(userCert =>
        userCert.includes(cert) || cert.includes(userCert)
      )
    );
    return Math.round((matched.length / jobCertsLower.length) * 100);
  }

  function calculateOverallScore(skillsMatch, degreesMatch, certsMatch) {
    // Weighted average: Skills (50%), Degrees (30%), Certifications (20%)
    return Math.round((skillsMatch * 0.5) + (degreesMatch * 0.3) + (certsMatch * 0.2));
  }

  // --- Calculate compatibility using user's and job's data ---
  const skillsPercent = calculateSkillsMatch(currentUser?.skills, job?.skills);
  const degreesPercent = calculateDegreesMatch(currentUser?.degrees, job?.requiredDegrees);
  const certsPercent = calculateCertificationsMatch(currentUser?.certifications, job?.suggestedCertifications);
  const overallPercent = calculateOverallScore(skillsPercent, degreesPercent, certsPercent);

  const handleCvPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.canceled) {
        return; // User cancelled
      }

      const file = result.assets[0];

      // Validate file size (max 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'File size must be less than 10MB');
        return;
      }

      setCv(file);
      console.log('CV selected:', { name: file.name, size: file.size, type: file.mimeType });
    } catch (error) {
      console.error('Error picking CV:', error);
      Alert.alert('Error', 'Could not pick the CV.');
    }
  };

  const handleCoverLetterPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.canceled) {
        return; // User cancelled
      }

      const file = result.assets[0];

      // Validate file size (max 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'File size must be less than 10MB');
        return;
      }

      setCoverLetter(file);
      console.log('Cover letter selected:', { name: file.name, size: file.size, type: file.mimeType });
    } catch (error) {
      console.error('Error picking cover letter:', error);
      Alert.alert('Error', 'Could not pick the cover letter.');
    }
  };

  const handleSubmit = async () => {
    if (!cv || !coverLetter) {
      Alert.alert('Missing Documents', 'Please upload both your CV and cover letter.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('QuickApplyModal - Starting application submission');
      console.log('Current user:', {
        talentId: currentUser?.talentId,
        fullname: currentUser?.fullname
      });
      console.log('Job:', {
        id: job?.$id,
        name: job?.name
      });

      // Check if the talent has already applied to this job with pending or shortlisted status
      const existingApplication = await checkExistingApplication(currentUser.talentId, job.$id);

      console.log('Existing application check result:', existingApplication);

      if (existingApplication.hasApplied) {
        console.log('Application blocked - user has already applied');
        setIsSubmitting(false);
        Alert.alert(
          'Already Applied',
          `You have already applied to this job and your application is currently ${existingApplication.status}. You cannot apply again until the current application is processed.`,
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('No existing application found - proceeding with submission');
      const cvFile = {
        uri: cv.uri,
        name: cv.name,
        type: cv.mimeType || 'application/pdf',
        size: cv.size || 0,
      };
      const coverLetterFile = {
        uri: coverLetter.uri,
        name: coverLetter.name,
        type: coverLetter.mimeType || 'application/pdf',
        size: coverLetter.size || 0,
      };

      console.log('Uploading CV:', cvFile);
      const cvUrl = await uploadFile(cvFile);
      console.log('CV uploaded successfully:', cvUrl);

      console.log('Uploading cover letter:', coverLetterFile);
      const coverLetterUrl = await uploadFile(coverLetterFile);
      console.log('Cover letter uploaded successfully:', coverLetterUrl);

      const applicationData = {
        jobId: job.$id,
        talentId: currentUser.talentId,
        employerId: job.employer,
        cvUrl,
        coverLetterUrl,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        viewedByEmployer: false,
      };

      const createdApplication = await createApplication(applicationData);

      await createEmployerNotification({
        employerId: job.employer,
        type: 'new_application',
        title: `New Application for ${job.name}`,
        message: `${currentUser.fullname} has applied for the job: ${job.name}`,
        relatedJobId: job.$id,
      });

      await createTalentNotification({
        talentId: currentUser.talentId,
        type: 'application_submitted',
        title: 'Application Submitted Successfully',
        message: `Your application for ${job.name} has been submitted successfully and is now pending review.`,
        relatedJobId: job.$id,
        relatedApplicationId: createdApplication.$id,
      });

      Alert.alert('Success', 'Your application has been submitted.');

      // Call the callback to refresh application status in parent component
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }

      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get compatibility color
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Helper function to get suggestions based on compatibility
  const getCompatibilitySuggestions = () => {
    const suggestions = [];

    if (skillsPercent < 70) {
      suggestions.push("Consider highlighting transferable skills in your CV");
    }
    if (degreesPercent < 70) {
      suggestions.push("Emphasize relevant coursework or certifications");
    }
    if (certsPercent < 70) {
      suggestions.push("Consider obtaining relevant certifications");
    }
    if (overallPercent >= 80) {
      suggestions.push("Great match! You're a strong candidate for this role");
    }

    return suggestions;
  };

  const suggestions = getCompatibilitySuggestions();

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quick Apply</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Compatibility Score */}
        <View style={styles.compatibilitySection}>
          <View style={styles.compatibilityHeader}>
            <Text style={styles.compatibilityTitle}>Compatibility Score</Text>
            <View style={[styles.scoreCircle, { backgroundColor: getCompatibilityColor(overallPercent) }]}>
              <Text style={styles.scoreText}>{overallPercent}%</Text>
            </View>
          </View>

          {/* Detailed Breakdown */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Skills</Text>
              <Text style={styles.breakdownValue}>{skillsPercent}%</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Education</Text>
              <Text style={styles.breakdownValue}>{degreesPercent}%</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Certifications</Text>
              <Text style={styles.breakdownValue}>{certsPercent}%</Text>
            </View>
          </View>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
              ))}
            </View>
          )}
        </View>

        {/* CV Section */}
        <View style={styles.documentSection}>
          <TouchableOpacity onPress={handleCvPick} style={styles.uploadButton}>
            <Feather name={cv ? 'check-circle' : 'upload'} size={24} color={cv ? '#10B981' : '#6B7280'} />
            <Text style={[styles.uploadText, cv && styles.uploadedText]}>
              {cv ? cv.name : 'Upload CV'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/analysis')}
            >
              <Feather name="search" size={16} color="#5B21B6" />
              <Text style={styles.secondaryButtonText}>Analyze your CV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/cvgeneration')}
            >
              <Feather name="file-plus" size={16} color="#5B21B6" />
              <Text style={styles.secondaryButtonText}>Don't have a CV? Generate one</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cover Letter Section */}
        <View style={styles.documentSection}>
          <TouchableOpacity onPress={handleCoverLetterPick} style={styles.uploadButton}>
            <Feather name={coverLetter ? 'check-circle' : 'upload'} size={24} color={coverLetter ? '#10B981' : '#6B7280'} />
            <Text style={[styles.uploadText, coverLetter && styles.uploadedText]}>
              {coverLetter ? coverLetter.name : 'Upload Cover Letter'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {/* TODO: Implement cover letter generation */}}
            >
              <Feather name="edit-3" size={16} color="#5B21B6" />
              <Text style={styles.secondaryButtonText}>Don't have one? Generate one for this job</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (!cv || !coverLetter || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!cv || !coverLetter || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Feather name="send" size={20} color="white" />
          )}
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  compatibilitySection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  suggestionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 16,
  },
  documentSection: {
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  uploadText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  uploadedText: {
    color: '#10B981',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5B21B6',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B21B6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default QuickApplyModal;
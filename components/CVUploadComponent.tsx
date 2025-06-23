import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface CVUploadComponentProps {
  onUpload: () => void;
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

const CVUploadComponent: React.FC<CVUploadComponentProps> = ({
  onUpload,
  isUploading,
  isAnalyzing,
  error,
}) => {
  const isLoading = isUploading || isAnalyzing;

  const getStatusText = () => {
    if (isUploading) return 'Uploading CV...';
    if (isAnalyzing) return 'Analyzing CV...';
    return 'Upload CV';
  };

  const getStatusSubtext = () => {
    if (isUploading) return 'Please wait while we upload your file';
    if (isAnalyzing) return 'AI is analyzing your CV. This may take a moment.';
    return 'Select PDF, DOC, DOCX, or image files (max 5MB)';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.uploadButton,
          isLoading && styles.uploadButtonDisabled,
          error && styles.uploadButtonError,
        ]}
        onPress={onUpload}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <View style={styles.uploadContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.uploadIcon}>📄</Text>
          )}
          
          <Text style={styles.uploadText}>{getStatusText()}</Text>
          <Text style={styles.uploadSubtext}>{getStatusSubtext()}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.supportedFormats}>
        <Text style={styles.supportedTitle}>Supported formats:</Text>
        <Text style={styles.supportedText}>PDF, DOC, DOCX, JPG, PNG</Text>
      </View>

      {isAnalyzing && (
        <View style={styles.analysisInfo}>
          <Text style={styles.analysisText}>
            Our AI is reviewing your CV for:
          </Text>
          <Text style={styles.analysisItem}>• Skills and experience match</Text>
          <Text style={styles.analysisItem}>• Career path alignment</Text>
          <Text style={styles.analysisItem}>• Improvement recommendations</Text>
          <Text style={styles.analysisItem}>• Marketability assessment</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  uploadButtonError: {
    backgroundColor: '#dc3545',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  uploadText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportedFormats: {
    marginTop: 20,
    alignItems: 'center',
  },
  supportedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  supportedText: {
    fontSize: 12,
    color: '#666',
  },
  analysisInfo: {
    marginTop: 30,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  analysisText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  analysisItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default CVUploadComponent;
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CareerStage {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface CareerStageModalProps {
  visible: boolean;
  careerStages: CareerStage[];
  selectedCareerStage: string;
  onSelectCareerStage: (careerStage: string) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const CareerStageModal: React.FC<CareerStageModalProps> = ({
  visible,
  careerStages,
  selectedCareerStage,
  onSelectCareerStage,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{
          width: width - 40,
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 24,
          maxHeight: '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.25,
          shadowRadius: 25,
          elevation: 25,
        }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 20, textAlign: 'center' }}>
            Select Career Stage
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {careerStages.map((stage, index) => (
              <TouchableOpacity
                key={stage.value}
                onPress={() => {
                  onSelectCareerStage(stage.value);
                  onClose();
                }}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: '#f8fafc',
                  marginBottom: index < careerStages.length - 1 ? 12 : 0,
                  borderWidth: selectedCareerStage === stage.value ? 2 : 0,
                  borderColor: '#5badec',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: selectedCareerStage === stage.value ? '#5badec' : '#e2e8f0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}>
                    <Ionicons 
                      name={stage.icon as any} 
                      size={24} 
                      color={selectedCareerStage === stage.value ? 'white' : '#64748b'} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: selectedCareerStage === stage.value ? '#5badec' : '#1e293b',
                      marginBottom: 4,
                    }}>
                      {stage.label}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#64748b',
                      lineHeight: 20,
                    }}>
                      {stage.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: '#f1f5f9',
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CareerStageModal; 
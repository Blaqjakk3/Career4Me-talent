import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CareerCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon: ReactNode;
  onButtonPress: () => void;
}

const CareerPathCard: React.FC<CareerCardProps> = ({
  title,
  description,
  buttonText,
  icon,
  onButtonPress,
}) => {
  return (
    <View className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md shadow-gray-300 w-full mb-4">
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center">
          {icon}
        </View>
      </View>
      
      <Text className="text-xl font-extrabold text-gray-900 mb-2">
        {title}
      </Text>
      
      <View className="border-l-4 border-blue-400 pl-4 mb-6">
        <Text className="text-base text-gray-500 leading-6 font-normal">
          {description}
        </Text>
      </View>
      
      <TouchableOpacity 
        className="bg-[#5badec] py-3 px-5 rounded-lg w-full items-center shadow-md shadow-blue-300 border border-blue-600"
        onPress={onButtonPress}
        activeOpacity={0.7}
      >
        <Text className="text-black font-semibold text-base">
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CareerPathCard;
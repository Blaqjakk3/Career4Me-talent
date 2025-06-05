import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { ArrowLeft, Star } from 'lucide-react-native'
import { router } from 'expo-router'
import { getCareerPathById } from '@/lib/appwrite'

interface SelectedProps {
  selectedPathId: string
}

interface CareerPath {
  $id: string
  title: string
  industry: string
  description: string
  minSalary?: number
  maxSalary?: number
  jobOutlook?: string
  dayToDayResponsibilities?: string
  toolsAndTechnologies?: string
  careerProgression?: string
  typicalEmployers?: string
  time_to_complete?: string
  required_background?: string
  learning_style?: string
  requiredSkills?: string[]
  requiredInterests?: string[]
  requiredCertifications?: string[]
  suggestedDegrees?: string[]
  tags?: string[]
}

const Selected: React.FC<SelectedProps> = ({ selectedPathId }) => {
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCareerPath()
  }, [selectedPathId])

  const fetchCareerPath = async () => {
    try {
      setIsLoading(true)
      const pathData = await getCareerPathById(selectedPathId)
      
      if (pathData) {
        // Map or cast the Document to CareerPath
        const mappedCareerPath: CareerPath = {
          $id: pathData.$id,
          title: pathData.title,
          industry: pathData.industry,
          description: pathData.description,
          minSalary: pathData.minSalary,
          maxSalary: pathData.maxSalary,
          jobOutlook: pathData.jobOutlook,
          dayToDayResponsibilities: pathData.dayToDayResponsibilities,
          toolsAndTechnologies: pathData.toolsAndTechnologies,
          careerProgression: pathData.careerProgression,
          typicalEmployers: pathData.typicalEmployers,
          time_to_complete: pathData.time_to_complete,
          required_background: pathData.required_background,
          learning_style: pathData.learning_style,
          requiredSkills: pathData.requiredSkills,
          requiredInterests: pathData.requiredInterests,
          requiredCertifications: pathData.requiredCertifications,
          suggestedDegrees: pathData.suggestedDegrees,
          tags: pathData.tags,
        }
        setCareerPath(mappedCareerPath)
      } else {
        Alert.alert('Error', 'Career path not found')
      }
    } catch (error) {
      console.error('Error fetching career path:', error)
      Alert.alert('Error', 'Failed to load career path details')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#5badec" />
        <Text className="text-gray-600 mt-4">Loading career path...</Text>
      </View>
    )
  }

  if (!careerPath) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-lg text-gray-600 text-center">
          Career path not found
        </Text>
        <TouchableOpacity
          className="mt-4 bg-[#5badec] px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity 
          className="p-2 rounded-full bg-gray-50" 
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-800">Your Career Path</Text>
        </View>
        <View style={{ width: 40 }}>{/* Spacer for balanced layout */}</View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Career Path Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-800 mb-4">
            {careerPath.title}
          </Text>
          <Text className="text-base text-gray-600 leading-6 mb-4">
            {careerPath.description}
          </Text>
          
          {/* Learn More Link */}
          <TouchableOpacity
            onPress={() => router.push(`/path-info/${careerPath.$id}`)}
            className="self-start"
          >
            <Text className="text-[#5badec] font-semibold text-base underline">
              Learn More
            </Text>
          </TouchableOpacity>
        </View>

        {/* Saved Paths Button */}
        <View className="mb-6">
          <TouchableOpacity
            className="bg-[#5badec] p-4 rounded-lg flex-row items-center justify-center"
            onPress={() => router.push('/SavedPaths')}
          >
            <Star size={20} color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">
              View Saved Paths
            </Text>
          </TouchableOpacity>
        </View>

        {/* Change Path Section */}
        <View className="bg-gray-50 p-6 rounded-lg">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Want to explore other options?
          </Text>
          <Text className="text-gray-600 mb-4">
            You can browse through other career paths or take our career survey to discover new opportunities.
          </Text>
          <TouchableOpacity
            className="border border-[#5badec] p-4 rounded-lg"
            onPress={() => router.push('/career-path/Select')}
          >
            <Text className="text-[#5badec] text-center font-semibold text-lg">
              Change Career Path
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default Selected
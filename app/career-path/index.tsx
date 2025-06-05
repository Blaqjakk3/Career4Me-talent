import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import Selected from './Selected'
import CareerDiscovery from './Select'
import { getCurrentUser } from '@/lib/appwrite'

const CareerPath = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasSelectedPath, setHasSelectedPath] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)

  useEffect(() => {
    checkUserCareerPath()
  }, [])

  const checkUserCareerPath = async () => {
    try {
      setIsLoading(true)
      const currentUser = await getCurrentUser()
      
      if (currentUser && currentUser.selectedPath) {
        setHasSelectedPath(true)
        setSelectedPathId(currentUser.selectedPath)
      } else {
        setHasSelectedPath(false)
        setSelectedPathId(null)
      }
    } catch (error) {
      console.error('Error checking user career path:', error)
      setHasSelectedPath(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#5badec" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    )
  }

  // If user has a selected career path, show the Selected component
  if (hasSelectedPath && selectedPathId) {
    return <Selected selectedPathId={selectedPathId} />
  }

  // If user doesn't have a selected career path, show the CareerDiscovery component
  return <CareerDiscovery />
}

export default CareerPath
import {
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import debounce from 'lodash/debounce'
import Header from '@/components/Header'
import JobCard from '@/components/JobCard'
import SavedPathSection from '@/components/SavedPathSection'
import TabButton from '@/components/TabButton'
import SearchBar from '@/components/SearchBar'
import JobsEmptyState from '@/components/JobsEmptyState'
import { useJobsData } from '@/hooks/useJobsData'
import { Job } from '@/types/jobs'

const Jobs = () => {
  const [activeTab, setActiveTab] = useState<'selected' | 'saved'>('selected')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const {
    loading,
    selectedPathJobs,
    savedPathSections,
    filteredSelectedJobs,
    employers,
    selectedPathTitle,
    user,
    savedPathsLoaded,
    fetchSavedPathsJobs,
    toggleSavedPathSection,
    updateFilteredJobs
  } = useJobsData()

  const handleTabSwitch = (tab: 'selected' | 'saved') => {
    if (tab === activeTab) return
    setActiveTab(tab)
    if (tab === 'saved') {
      fetchSavedPathsJobs()
    }
    setSearchQuery('')
  }

  const handleSearch = debounce((text: string) => {
    if (activeTab === 'selected') {
      if (!text) {
        updateFilteredJobs(selectedPathJobs)
        return
      }

      const query = text.toLowerCase()
      const filtered = selectedPathJobs.filter(job => {
        const nameMatch = job.name?.toLowerCase().includes(query)
        const employerMatch = employers[job.employer]?.name?.toLowerCase().includes(query)
        const skillsMatch = job.skills?.some(skill => skill.toLowerCase().includes(query))
        return nameMatch || employerMatch || skillsMatch
      })

      updateFilteredJobs(filtered)
    }
  }, 300)

  const onSearchChange = (text: string) => {
    setSearchQuery(text)
    handleSearch(text)
  }

  const navigateToJobDetails = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`)
  }

  const getSelectedJobsCount = () => filteredSelectedJobs.length
  const getSavedJobsCount = () => savedPathSections.reduce((total, section) => total + section.jobs.length, 0)

  const renderJobCard = ({ item }: { item: Job }) => (
    <JobCard 
      item={item} 
      employers={employers} 
      onPress={navigateToJobDetails} 
    />
  )

  const renderSavedPathSection = ({ item }: { item: any }) => (
    <SavedPathSection
      item={item}
      onToggle={toggleSavedPathSection}
      employers={employers}
      onJobPress={navigateToJobDetails}
    />
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ position: 'relative' }}>
        <Header
          title="Job Opportunities"
          onBackPress={() => router.back()}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 16,
            top: 10,
            padding: 8,
            borderRadius: 20,
            backgroundColor: '#f9fafb',
            zIndex: 2,
          }}
          onPress={() => router.push('/jobs/savedjobs')}
        >
          <MaterialCommunityIcons name="bookmark-check-outline" size={22} color="#5badec" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 6,
        flexDirection: 'row',
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <TabButton
          title={selectedPathTitle || 'Selected Path'}
          count={getSelectedJobsCount()}
          isActive={activeTab === 'selected'}
          onPress={() => handleTabSwitch('selected')}
        />
        <TabButton
          title="Saved Paths"
          count={getSavedJobsCount()}
          isActive={activeTab === 'saved'}
          onPress={() => handleTabSwitch('saved')}
        />
      </View>

      {/* Search Bar */}
      {activeTab === 'selected' && (
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      )}

      {/* Content */}
      {loading ? (
        <JobsEmptyState
          type="loading"
          title=""
          subtitle=""
          icon=""
        />
      ) : (
        <View style={{ flex: 1 }}>
          {activeTab === 'selected' ? (
            filteredSelectedJobs.length === 0 ? (
              <JobsEmptyState
                type="no-jobs"
                title="No job opportunities found"
                subtitle="Try adjusting your search or check back later"
                icon="briefcase"
              />
            ) : (
              <FlatList
                data={filteredSelectedJobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : (
            savedPathSections.length === 0 ? (
              <JobsEmptyState
                type="no-saved-paths"
                title={user?.savedPaths?.length === 0 
                  ? "No saved paths yet"
                  : "Loading saved paths..."
                }
                subtitle="Explore career paths to start building your collection!"
                icon="bookmark"
              />
            ) : (
              <FlatList
                data={savedPathSections}
                renderItem={renderSavedPathSection}
                keyExtractor={(item) => item.pathId}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
            )
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

export default Jobs
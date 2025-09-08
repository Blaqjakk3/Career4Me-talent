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

/**
 * Jobs Screen
 * This component serves as the main hub for job listings. It features two tabs:
 * 1. 'selected': Shows jobs related to the user's chosen career path.
 * 2. 'saved': Shows jobs from all career paths the user has saved.
 * It includes search functionality for the 'selected' path jobs.
 */
const Jobs = () => {
  // State to manage which tab is currently active ('selected' or 'saved').
  const [activeTab, setActiveTab] = useState<'selected' | 'saved'>('selected')
  // State to hold the current search query input by the user.
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Custom hook `useJobsData` encapsulates all the logic for fetching and managing job data.
  const { // This simplifies the component and keeps it clean.
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

  // Switches the active tab and fetches data for the 'saved' tab if it's selected.
  const handleTabSwitch = (tab: 'selected' | 'saved') => {
    if (tab === activeTab) return
    setActiveTab(tab)
    if (tab === 'saved') {
      fetchSavedPathsJobs()
    }
    setSearchQuery('')
  }

  // Debounced search handler to filter jobs based on user input.
  const handleSearch = debounce((text: string) => {
    if (activeTab === 'selected') {
      if (!text) {
        updateFilteredJobs(selectedPathJobs)
        return
      }

      // Filters jobs by name, employer name, or skills.
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

  // Updates the search query state and triggers the debounced search handler.
  const onSearchChange = (text: string) => {
    setSearchQuery(text)
    handleSearch(text)
  }

  // Navigates to the job details page for the selected job.
  const navigateToJobDetails = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`)
  }

  // Helper functions to get the count of jobs for each tab.
  const getSelectedJobsCount = () => filteredSelectedJobs.length
  const getSavedJobsCount = () => savedPathSections.reduce((total, section) => total + section.jobs.length, 0)

  // Renders a single job card in the FlatList for the 'selected' tab.
  const renderJobCard = ({ item }: { item: Job }) => (
    <JobCard 
      item={item} 
      employers={employers} 
      onPress={navigateToJobDetails} 
    />
  )

  // Renders a section for a saved career path in the FlatList for the 'saved' tab.
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
      {/* Header section with title, back button, and a link to the saved jobs page. */}
      <View style={{ position: 'relative' }}>
        <Header
          title="Job Opportunities"
          onBackPress={() => router.back()}
        />
        {/* Shortcut button to navigate to the dedicated "Saved Jobs" page. */}
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
      {/* Tab navigation to switch between 'Selected Path' and 'Saved Paths'. */}
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
      {/* Search bar, only visible on the 'selected' tab. */}
      {activeTab === 'selected' && (
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      )}

      {/* Content */}
      {/* Main content area: displays a loading indicator, a list of jobs, or an empty state message. */}
      {loading ? (
        <JobsEmptyState
          type="loading"
          title=""
          subtitle=""
          icon=""
        />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Conditional rendering based on the active tab. */}
          {activeTab === 'selected' ? (
            filteredSelectedJobs.length === 0 ? (
              <JobsEmptyState
                type="no-jobs"
                title="No job opportunities found"
                subtitle="Try adjusting your search or check back later"
                icon="briefcase"
              />
            ) : (
              // List of jobs for the selected career path.
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
              // List of saved career paths and their associated jobs.
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
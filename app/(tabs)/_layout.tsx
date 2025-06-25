import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const TLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarInactiveTintColor: '#555',
          tabBarActiveTintColor: '#5badec',
          tabBarStyle: {
            borderTopWidth: 1,
            height: 50,
          }
        }}
      >
        <Tabs.Screen 
          name="dashboard"
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="grid-outline" size={24} color={focused ? '#5badec' : '#222'} />
              </View>
            )
          }} 
        />
        <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="person-outline" size={24} color={focused ? '#5badec' : '#222'} />
              </View>
            )
          }} 
        />
      </Tabs>
    </>
  )
}

export default TLayout
import { View, Text } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import { LayoutDashboard, User } from 'lucide-react-native'

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
            headerShown:false,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <LayoutDashboard color={focused ? '#5badec' : '#222'} />
              </View>
            )
          }} 
        />
         <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            headerShown:false,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <User color={focused ? '#5badec' : '#222'} />
              </View>
            )
          }} 
        />
      </Tabs>
    </>
  )
}

export default TLayout
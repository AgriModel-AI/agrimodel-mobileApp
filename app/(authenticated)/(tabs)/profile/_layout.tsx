import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false
        }}   
       />
       <Stack.Screen
        name='edit'
        options={{
          headerShown: false
        }}   
       />
       <Stack.Screen
        name='changePassword'
        options={{
          headerShown: false
        }}   
       />
       <Stack.Screen
        name='terms'
        options={{
          headerShown: false
        }}   
       />
       <Stack.Screen
        name='help'
        options={{
          headerShown: false
        }}   
       />
    </Stack>
  )
}

export default _layout
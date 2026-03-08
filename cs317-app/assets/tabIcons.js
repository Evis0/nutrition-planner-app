import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

//this file contains icons from the react-native vector icons directory
//https://withfra.me/react-native-vector-icons/directory
//they are bundled with the expo download so we can use them

export function HomeIcon({color}) {
  return (
    <AntDesign name="home" color={color} size={24} />
  )
}

export function ScanIcon({color}) {
  return (
    <MaterialCommunityIcons name="barcode-scan" color={color} size={24} />
  )
}

export function JournalIcon({color}) {
  return (
    <Ionicons name="journal-outline" color={color} size={24} />
  )
}

export function ProgressIcon({color}) {
  return (
    <MaterialCommunityIcons name="progress-pencil" color={color} size={24} />
  )
}

export function SettingsIcon({color}) {
  return (
    <Ionicons name="settings-outline" color={color} size={24} />
  )
}
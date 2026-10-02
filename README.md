Nutrition & Meal Planner Mobile App
A React Native mobile application built with Expo designed to help users track daily food intake, log meals, scan barcodes to fetch detailed nutritional information, and monitor health goals with dynamic theme customization.

Key Features
Barcode Scanning & Food Retrieval: Integrates camera hardware to scan food barcodes and parse nutritional data (carbohydrates, sugars, calorie counts) directly into the app lifecycle.

Daily Meal Journaling: Allows users to easily search, log, and categorize food items across breakfast, lunch, dinner, and snacks.

Progress Tracking & Goals: Visual dashboard to track daily intake against customizable wellness targets.

Persistent Local Data: Uses @react-native-async-storage/async-storage to preserve user meal logs and journal entries across sessions without requiring an external cloud backend.

Dynamic Dark/Light Theme: Built-in dynamic theme context supporting user overrides and automatic synchronization with system preferences.

Tech Stack & Dependencies
Frontend Framework: React Native (React 19)

Tooling & Ecosystem: Expo SDK 54

Navigation: React Navigation (Native Stack & Bottom Tabs)

Storage: @react-native-async-storage/async-storage

Hardware & Sensors: expo-camera, expo-sensors

Getting Started
Prerequisites
Node.js (v18 or higher recommended)

Expo Go app installed on your physical mobile device (iOS or Android) OR an active simulator/emulator environment.

Installation & Setup
Clone the repository:
git clone https://github.com/Evis0/nutrition-planner-app.git
cd nutrition-planner-app

Install project dependencies:
npm install

Start the Expo development server:
npx expo start

Run on your device:
Scan the generated QR code in your terminal or Expo developer tools using the Expo Go app (Android) or Camera app (iOS).

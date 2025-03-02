# React Native Timer App

A comprehensive timer application built with React Native and Expo. This app allows users to create, manage, and track multiple timers organized by categories.

## Features

- Create timers with custom names, durations, and categories
- Group timers by categories with bulk actions (start, pause, reset)
- Real-time progress tracking with visual indicators
- Notifications at halfway point and completion
- View and export timer history
- Filter timers by category

## Tech Stack

- React Native
- Expo
- Expo Router for navigation
- AsyncStorage for local data persistence
- React Native Safe Area Context
- Expo File System & Sharing for exporting data

## Download and Installation

### Android App

You can download the Android app directly from:
- Download the APK file from the [Here](https://expo.dev/accounts/pravenn/projects/assignment/builds/24488bc1-c00a-46a4-aa83-b407b42fdd4f)

### Setup Development Environment

#### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator/Android Emulator or physical device

#### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/timer-app.git](https://github.com/Pravenn18/assignment.git](https://github.com/Pravenn18/assignment.git)
   cd assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn start
   ```

4. Run on device/simulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with the Expo Go app on your physical device

## Project Structure

- `app/(tabs)/_layout.tsx` - Main app layout and state management
- `app/(tabs)/index.tsx` - Timer list screen
- `app/(tabs)/explore.tsx` - Timer history screen

## Development Assumptions

1. **User Experience**:
   - Users need visual feedback during timer progress
   - Category-based organization improves usability
   - Users want to be notified at key points (halfway, completion)

2. **Data Management**:
   - Timers should persist between app sessions using AsyncStorage
   - History of completed timers should be maintained
   - Export functionality is important for data backup

3. **Technical**:
   - App should work on both iOS and Android
   - UI should respect safe areas across different devices
   - Performance optimization for potentially many timers

4. **Extended Usage**:
   - Users may create multiple categories of timers
   - Some timers may be used repeatedly (reset functionality)
   - Users will want to perform bulk actions on timers

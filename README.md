# TradesPro - Mobile App

A React Native mobile application for connecting users with local tradespeople (electricians, bricklayers, plumbers, carpenters, mechanics).

## Features

### 🗺️ Interactive Map View
- View your location and nearby tradespeople within a 20-mile radius
- Filter tradespeople by trade type (electrician, bricklayer, plumber, carpenter, mechanic)
- Search for specific tradespeople by name or trade
- Color-coded markers for different trade types

### 👷 Tradesperson Profiles
- Detailed profiles with photos and bio
- Hourly rates and years of experience
- Credentials and certifications
- Weekly availability with time slots
- Customer reviews and ratings
- Direct call and message options

### 💬 Messaging
- In-app messaging system
- View conversation history
- Unread message indicators

### 👤 User Profile
- Manage your profile information
- Payment methods
- Booking history
- Saved tradespeople
- Settings and preferences

## Tech Stack

- **React Native** with **TypeScript**
- **Expo** for development and deployment
- **React Navigation** for app navigation
- **react-native-maps** for map functionality
- **expo-location** for location services
- **@expo/vector-icons** for icons

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd hazparo
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure Google Maps API:
   - Get API keys for both iOS and Android from [Google Cloud Console](https://console.cloud.google.com/)
   - Update the API keys in `app.json`:
     - iOS: `ios.config.googleMapsApiKey`
     - Android: `android.config.googleMaps.apiKey`

### Running the App

Start the Expo development server:
\`\`\`bash
npm start
\`\`\`

Then:
- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan the QR code with Expo Go app on your physical device

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Project Structure

\`\`\`
hazparo/
├── src/
│   ├── data/
│   │   └── mockData.ts          # Mock data for tradespeople, messages, and users
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Navigation configuration
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Map view with search and filters
│   │   ├── TradespersonDetailScreen.tsx  # Tradesperson profile details
│   │   ├── MessagesScreen.tsx   # Messages list
│   │   └── ProfileScreen.tsx    # User profile
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── App.tsx                      # Root component
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
\`\`\`

## Available Trade Types

1. **Electrician** - Electrical repairs and installations
2. **Bricklayer** - Masonry and brickwork
3. **Plumber** - Plumbing repairs and installations
4. **Carpenter** - Woodwork and carpentry
5. **Mechanic** - Automotive repair and maintenance

## Mock Data

The app includes mock data for:
- 6 tradespeople with complete profiles
- 3 message conversations
- 1 user profile with saved tradespeople

## Future Enhancements

- [ ] Real-time chat functionality
- [ ] Payment integration
- [ ] Booking system with calendar
- [ ] Push notifications
- [ ] User authentication (login/signup)
- [ ] Backend API integration
- [ ] Reviews and ratings submission
- [ ] Photo galleries for tradespeople
- [ ] Distance calculation and routing
- [ ] Advanced search filters

## License

MIT License

## Support

For support, email support@tradespro.com or create an issue in the repository.

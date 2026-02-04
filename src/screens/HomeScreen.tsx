import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { mockTradespeople, mockUserLocation } from '../data/mockData';
import { TradeType, Tradesperson } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const RADIUS_MILES = 20;
const MILES_TO_METERS = 1609.34;

const tradeIcons: Record<TradeType, keyof typeof Ionicons.glyphMap> = {
  electrician: 'flash',
  plumber: 'water',
  carpenter: 'hammer',
  bricklayer: 'home',
  mechanic: 'car',
};

const tradeColors: Record<TradeType, string> = {
  electrician: '#f59e0b',
  plumber: '#3b82f6',
  carpenter: '#92400e',
  bricklayer: '#dc2626',
  mechanic: '#1f2937',
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTrade, setSelectedTrade] = useState<TradeType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(mockUserLocation);
  const [filteredTradespeople, setFilteredTradespeople] = useState<Tradesperson[]>(mockTradespeople);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    filterTradespeople();
  }, [selectedTrade, searchQuery]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get location');
    }
  };

  const filterTradespeople = () => {
    let filtered = mockTradespeople;

    if (selectedTrade) {
      filtered = filtered.filter((tp) => tp.trade === selectedTrade);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (tp) =>
          tp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tp.trade.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTradespeople(filtered);
  };

  const handleMarkerPress = (tradesperson: Tradesperson) => {
    navigation.navigate('TradespersonDetail', { tradespersonId: tradesperson.id });
  };

  const trades: TradeType[] = ['electrician', 'bricklayer', 'plumber', 'carpenter', 'mechanic'];

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Radius circle */}
        <Circle
          center={userLocation}
          radius={RADIUS_MILES * MILES_TO_METERS}
          strokeColor="rgba(37, 99, 235, 0.3)"
          fillColor="rgba(37, 99, 235, 0.1)"
        />

        {/* Tradesperson markers */}
        {filteredTradespeople.map((tradesperson) => (
          <Marker
            key={tradesperson.id}
            coordinate={tradesperson.location}
            onPress={() => handleMarkerPress(tradesperson)}
          >
            <View style={[styles.marker, { backgroundColor: tradeColors[tradesperson.trade] }]}>
              <Ionicons name={tradeIcons[tradesperson.trade]} size={20} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for tradespeople..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Trade type filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedTrade === null && styles.filterButtonActive]}
            onPress={() => setSelectedTrade(null)}
          >
            <Text style={[styles.filterText, selectedTrade === null && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {trades.map((trade) => (
            <TouchableOpacity
              key={trade}
              style={[
                styles.filterButton,
                selectedTrade === trade && styles.filterButtonActive,
                { borderColor: tradeColors[trade] },
              ]}
              onPress={() => setSelectedTrade(trade)}
            >
              <Ionicons
                name={tradeIcons[trade]}
                size={18}
                color={selectedTrade === trade ? tradeColors[trade] : '#6b7280'}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedTrade === trade && { color: tradeColors[trade] },
                ]}
              >
                {trade.charAt(0).toUpperCase() + trade.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredTradespeople.length} {filteredTradespeople.length === 1 ? 'tradesperson' : 'tradespeople'} nearby
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  filterButtonActive: {
    borderWidth: 2,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterTextActive: {
    fontWeight: '700',
  },
  resultsContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

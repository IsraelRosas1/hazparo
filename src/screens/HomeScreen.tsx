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
  Modal,
  FlatList,
} from 'react-native';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { mockTradespeople, getRandomLocation, type realUserLocation } from '../data/mockData';
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
  limpieza: 'broom',
  jardineria: 'leaf',
  pintura: 'color-palette',
};

const tradeColors: Record<TradeType, string> = {
  electrician: '#f59e0b',
  plumber: '#3b82f6',
  carpenter: '#92400e',
  bricklayer: '#dc2626',
  mechanic: '#1f2937',
  limpieza: '#10b981',
  jardineria: '#059669',
  pintura: '#ef4444',
};

const tradeLabels: Record<TradeType, string> = {
  electrician: 'Electricista',
  plumber: 'Plomero',
  carpenter: 'Carpintero',
  bricklayer: 'Albañil',
  mechanic: 'Mecánico',
  limpieza: 'Limpieza',
  jardineria: 'Jardinería',
  pintura: 'Pintura',
};

const tradeLogos: Partial<Record<TradeType, any>> = {
  electrician: require('../../assets/electricista.jpg'),
  plumber: require('../../assets/plomeria.jpg'),
  carpenter: require('../../assets/carpinteria.jpg'),
  bricklayer: require('../../assets/albanil.jpg'),
  mechanic: require('../../assets/mecanico.jpg'),
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTrade, setSelectedTrade] = useState<TradeType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<realUserLocation| null> (null);
  // const [filteredTradespeople, setFilteredTradespeople] = useState<Tradesperson[]>(mockTradespeople);
// 1. Keep a master list of localized people so they don't 'reset'
  const [masterTradespeople, setMasterTradespeople] = useState<Tradesperson[]>([]);
  const [filteredTradespeople, setFilteredTradespeople] = useState<Tradesperson[]>([]);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState('');
  const [selectedModalTrade, setSelectedModalTrade] = useState<TradeType | null>(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        const localizedData = mockTradespeople.map(tp => ({
          ...tp,
          location: getRandomLocation(userCoords)
        }));
        setUserLocation(userCoords);
        setFilteredTradespeople(localizedData);
        setMasterTradespeople(localizedData); // Save the localized list
      }
      // console.log("Location of user: ",userLocation?.latitude,userLocation?.longitude)
    } catch (error) {
      Alert.alert('Error', 'Unable to get location');
    }
  };
  useEffect(() => {
    
    requestLocationPermission();
  }, []);
// Run the filter whenever trade, search, OR the master list changes
  useEffect(() => {
    filterTradespeople();
  }, [selectedTrade, searchQuery, masterTradespeople]);
  const filterTradespeople = () => {
      // Filter from the MASTER list (localized), not the mock import
      let filtered = [...masterTradespeople];

      if (selectedTrade) {
        filtered = filtered.filter((tp) => tp.trade === selectedTrade);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (tp) =>
            tp.name.toLowerCase().includes(query) ||
            tp.trade.toLowerCase().includes(query)
        );
      }

      setFilteredTradespeople(filtered);
    };
//   useEffect(() => {
//   if (userLocation) {
//     console.log("State updated! User is now at:", userLocation.latitude, userLocation.longitude);
//   }


// }, [userLocation]); // This runs every time userLocation changes


  const handleMarkerPress = (tradesperson: Tradesperson) => {
    navigation.navigate('TradespersonDetail', { tradespersonId: tradesperson.id });
  };

  const getFilteredTradesForModal = () => {
    if (!searchModalQuery) {
      return trades;
    }
    
    const query = searchModalQuery.toLowerCase();
    return trades.filter(trade => 
      tradeLabels[trade].toLowerCase().includes(query) ||
      trade.toLowerCase().includes(query)
    );
  };

  const getFilteredTradespeopleForModal = () => {
    if (!selectedModalTrade) return [];
    
    let filtered = masterTradespeople.filter(tp => tp.trade === selectedModalTrade);
    
    if (searchModalQuery) {
      const query = searchModalQuery.toLowerCase();
      filtered = filtered.filter(tp =>
        tp.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const trades: TradeType[] = ['electrician', 'bricklayer', 'plumber', 'carpenter', 'mechanic', 'limpieza', 'jardineria', 'pintura'];

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <Text>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Inicio content sections (replaces map) */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120, paddingTop: 180 }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Popular en Hazparo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trades.slice(0, 6).map((t) => (
              <TouchableOpacity key={t} style={{ width: 140, height: 120, backgroundColor: '#fff', marginRight: 12, borderRadius: 12, padding: 12, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }} onPress={() => { setIsSearchModalVisible(true); setSelectedModalTrade(t); }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {tradeLogos[t] ? (
                    <Image source={tradeLogos[t]} style={{ width: 40, height: 40, borderRadius: 8 }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tradeColors[t], justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={tradeIcons[t]} size={20} color="#fff" />
                    </View>
                  )}
                  <Text style={{ marginLeft: 8, fontWeight: '600' }}>{tradeLabels[t]}</Text>
                </View>
                <Text style={{ color: '#6b7280' }}>Profesionales disponibles</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height: 20 }} />

          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Recomendados cerca</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredTradespeople.slice(0, 8).map(tp => (
              <TouchableOpacity key={tp.id} style={{ width: 180, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }} onPress={() => handleMarkerPress(tp)}>
                <Image source={{ uri: tp.imageUrl }} style={{ width: '100%', height: 90, borderRadius: 8 }} />
                <Text style={{ marginTop: 8, fontWeight: '700' }}>{tp.name}</Text>
                <Text style={{ color: '#6b7280' }}>⭐ {tp.rating.toFixed(1)} • ${tp.hourlyRate}/hr</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height: 20 }} />

          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Nuevos en tu área</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredTradespeople.slice(2, 10).map(tp => (
              <TouchableOpacity key={tp.id} style={{ width: 160, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }} onPress={() => handleMarkerPress(tp)}>
                <Image source={{ uri: tp.imageUrl }} style={{ width: '100%', height: 80, borderRadius: 8 }} />
                <Text style={{ marginTop: 8, fontWeight: '700' }}>{tp.name}</Text>
                <Text style={{ color: '#6b7280' }}>{tradeLabels[tp.trade]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Search bar */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => setIsSearchModalVisible(true)}
      >
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>
          {selectedTrade ? tradeLabels[selectedTrade] : 'Con que necesita ayuda?'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      {/* Trades filter removed to prevent sticky overlap; search bar retained */}

      {/* Results count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredTradespeople.length} {filteredTradespeople.length === 1 ? 'profesional' : 'profesionales'} cerca
        </Text>
      </View>

      {/* Trade Selection Modal */}
      <Modal
        visible={isSearchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsSearchModalVisible(false);
          setSearchModalQuery('');
          setSelectedModalTrade(null);
        }}
      >
        <View style={styles.modalFullScreen}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (selectedModalTrade) {
                  setSelectedModalTrade(null);
                } else {
                  setIsSearchModalVisible(false);
                  setSearchModalQuery('');
                }
              }}
            >
              <Ionicons name={selectedModalTrade ? "arrow-back" : "close"} size={28} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedModalTrade ? tradeLabels[selectedModalTrade] : 'Seleccionar Profesional'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.modalSearchInput}
              placeholder={selectedModalTrade ? "Buscar en esta profesión..." : "Buscar oficio..."}
              placeholderTextColor="#9ca3af"
              value={searchModalQuery}
              onChangeText={setSearchModalQuery}
            />
            {searchModalQuery && (
              <TouchableOpacity onPress={() => setSearchModalQuery('')}>
                <Ionicons name="close-circle" size={20} color="#d1d5db" />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          {!selectedModalTrade ? (
            /* Trade Types List */
            <FlatList
              data={getFilteredTradesForModal()}
              keyExtractor={(item) => item}
              renderItem={({ item: trade }) => {
                const tradeCount = masterTradespeople.filter(tp => tp.trade === trade).length;
                return (
                  <TouchableOpacity
                    style={styles.tradeItem}
                    onPress={() => setSelectedModalTrade(trade)}
                  >
                    <View style={[styles.tradeIconModal, { backgroundColor: tradeColors[trade] }]}>
                      <Ionicons name={tradeIcons[trade]} size={24} color="white" />
                    </View>
                    <View style={styles.tradeInfo}>
                      <Text style={styles.tradeItemText}>{tradeLabels[trade]}</Text>
                      <Text style={styles.tradeCount}>{tradeCount} {tradeCount === 1 ? 'profesional' : 'profesionales'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No se encontraron profesiones</Text>
                </View>
              }
            />
          ) : (
            /* Tradespeople List for Selected Trade */
            <FlatList
              data={getFilteredTradespeopleForModal()}
              keyExtractor={(item) => item.id}
              renderItem={({ item: tradesperson }) => (
                <TouchableOpacity
                  style={styles.tradespersonItem}
                  onPress={() => {
                    handleMarkerPress(tradesperson);
                    setIsSearchModalVisible(false);
                    setSearchModalQuery('');
                    setSelectedModalTrade(null);
                  }}
                >
                  <Image source={{ uri: tradesperson.imageUrl }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }} />
                  <View style={styles.tradespersonInfo}>
                    <Text style={styles.tradespersonName}>{tradesperson.name}</Text>
                    <Text style={styles.tradespersonTrade}>{tradeLabels[tradesperson.trade]} • ⭐ {tradesperson.rating.toFixed(1)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#6b7280' }}>${tradesperson.hourlyRate}/hr</Text>
                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No se encontraron profesionales</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
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
    backgroundColor: '#0b3d91',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#0b3d91',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingTop: 100, // This pushes the modal down by 100 pixels
  },
  modalContentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '80%',
    width: '100%',
    overflow: 'hidden', 
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
    paddingTop: 30,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b3d91',
  },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tradeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tradeCount: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  tradeItemSelected: {
    backgroundColor: '#f9fafb',
  },
  tradeIconModal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tradeItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  tradespersonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tradespersonIconModal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tradespersonInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tradespersonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  tradespersonTrade: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});

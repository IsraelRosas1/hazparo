import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockTradespeople, getRandomLocation, INITIAL_LOCATION } from '../data/mockData';
import { Tradesperson, TradeType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

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

export default function BuscarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [userLocation, setUserLocation] = useState(INITIAL_LOCATION);
  const [masterTradespeople, setMasterTradespeople] = useState<Tradesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchModalQuery, setSearchModalQuery] = useState('');
  const [selectedModalTrade, setSelectedModalTrade] = useState<TradeType | null>(null);

  const trades: TradeType[] = ['electrician', 'bricklayer', 'plumber', 'carpenter', 'mechanic', 'limpieza', 'jardineria', 'pintura'];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let coords = INITIAL_LOCATION;
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        }
        const localizedList = mockTradespeople.map(tp => ({ ...tp, location: getRandomLocation(coords) }));
        setUserLocation(coords);
        setMasterTradespeople(localizedList);
      } catch (e) {
        const localizedList = mockTradespeople.map(tp => ({ ...tp, location: getRandomLocation(INITIAL_LOCATION) }));
        setMasterTradespeople(localizedList);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getFilteredTradesForModal = () => {
    if (!searchModalQuery) return trades;
    const q = searchModalQuery.toLowerCase();
    return trades.filter(trade => tradeLabels[trade].toLowerCase().includes(q) || trade.toLowerCase().includes(q));
  };

  const getFilteredTradespeopleForModal = () => {
    if (!selectedModalTrade) return [];
    let filtered = masterTradespeople.filter(tp => tp.trade === selectedModalTrade);
    if (searchModalQuery) {
      const q = searchModalQuery.toLowerCase();
      filtered = filtered.filter(tp => tp.name.toLowerCase().includes(q));
    }
    return filtered;
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" /></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => { setSelectedModalTrade(null); setSearchModalQuery(''); }} style={styles.backButton}>
          <Ionicons name={selectedModalTrade ? 'arrow-back' : 'close'} size={28} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{selectedModalTrade ? tradeLabels[selectedModalTrade] : 'Seleccionar Profesional'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.modalSearchInput}
          placeholder={selectedModalTrade ? 'Buscar en esta profesión...' : 'Buscar oficio...'}
          placeholderTextColor="#9ca3af"
          value={searchModalQuery}
          onChangeText={setSearchModalQuery}
        />
        {searchModalQuery ? (
          <TouchableOpacity onPress={() => setSearchModalQuery('')}>
            <Ionicons name="close-circle" size={20} color="#d1d5db" />
          </TouchableOpacity>
        ) : null}
      </View>

      {!selectedModalTrade ? (
        <FlatList
          data={getFilteredTradesForModal()}
          keyExtractor={(item) => item}
          renderItem={({ item: trade }) => {
            const tradeCount = masterTradespeople.filter(tp => tp.trade === trade).length;
            return (
              <TouchableOpacity style={styles.tradeItem} onPress={() => setSelectedModalTrade(trade)}>
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
        <FlatList
          data={getFilteredTradespeopleForModal()}
          keyExtractor={(item) => item.id}
          renderItem={({ item: tradesperson }) => (
            <TouchableOpacity
              style={styles.tradespersonItem}
              onPress={() => navigation.navigate('TradespersonDetail', { tradespersonId: tradesperson.id })}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 14, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f3f4f6', borderRadius: 12 },
  modalSearchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1f2937' },
  tradeItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tradeIconModal: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  tradeInfo: { flex: 1, justifyContent: 'center' },
  tradeItemText: { flex: 1, fontSize: 16, color: '#1f2937', fontWeight: '500' },
  tradeCount: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tradespersonItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tradespersonInfo: { flex: 1, justifyContent: 'center' },
  tradespersonName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  tradespersonTrade: { fontSize: 13, color: '#6b7280' },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { width: 28 },
});

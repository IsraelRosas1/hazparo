import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockTradespeople, getRandomLocation, INITIAL_LOCATION } from '../data/mockData';
import { Tradesperson, TradeType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const SEARCH_RADIUS_MIN = 5;
const SEARCH_RADIUS_MAX = 100;
const SEARCH_RADIUS_STEP = 5;
const STORAGE_KEYS = {
  location: 'hazparo.buscar.location',
  address: 'hazparo.buscar.address',
  radius: 'hazparo.buscar.radius',
};

const tradeIcons: Record<TradeType, keyof typeof Ionicons.glyphMap> = {
  electrician: 'flash',
  plumber: 'water',
  carpenter: 'hammer',
  bricklayer: 'home',
  mechanic: 'car',
  limpieza: 'sparkles',
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

export default function BuscarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [userLocation, setUserLocation] = useState(INITIAL_LOCATION);
  const [masterTradespeople, setMasterTradespeople] = useState<Tradesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchModalQuery, setSearchModalQuery] = useState('');
  const [selectedModalTrade, setSelectedModalTrade] = useState<TradeType | null>(null);
  const [address, setAddress] = useState('');
  const [questionnaireVisible, setQuestionnaireVisible] = useState(false);
  const [questionTradesperson, setQuestionTradesperson] = useState<Tradesperson | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openDetails, setOpenDetails] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);

  const clampRadius = (value: number) =>
    Math.max(
      SEARCH_RADIUS_MIN,
      Math.min(SEARCH_RADIUS_MAX, Math.round(value / SEARCH_RADIUS_STEP) * SEARCH_RADIUS_STEP),
    );

  const milesBetween = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ) => {
    const toRadians = (n: number) => (n * Math.PI) / 180;
    const earthRadiusMiles = 3958.8;
    const deltaLat = toRadians(b.latitude - a.latitude);
    const deltaLon = toRadians(b.longitude - a.longitude);
    const latA = toRadians(a.latitude);
    const latB = toRadians(b.latitude);

    const haversine =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2) * Math.cos(latA) * Math.cos(latB);

    const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return earthRadiusMiles * arc;
  };

  const saveSearchRadius = async (nextRadius: number) => {
    const normalized = clampRadius(nextRadius);
    setSearchRadius(normalized);
    await AsyncStorage.setItem(STORAGE_KEYS.radius, String(normalized));
  };

  const localizeTradespeople = (coords: { latitude: number; longitude: number }) => {
    const localizedList = mockTradespeople.map((tp) => ({
      ...tp,
      location: getRandomLocation(coords),
    }));

    setUserLocation(coords);
    setMasterTradespeople(localizedList);
  };

  const resolveReadableAddress = async (coords: { latitude: number; longitude: number }) => {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      const first = results[0];

      if (!first) {
        return `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
      }

      const parts = [
        first.streetNumber,
        first.street,
        first.district,
        first.city,
        first.region,
      ].filter(Boolean);

      if (parts.length === 0) {
        return `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
      }

      return parts.join(', ');
    } catch {
      return `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
    }
  };

  const detectAndFillAddress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ubicación', 'Permiso de ubicación denegado.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      localizeTradespeople(coords);
      const readableAddress = await resolveReadableAddress(coords);
      setAddress(readableAddress);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.location, JSON.stringify(coords)],
        [STORAGE_KEYS.address, readableAddress],
      ]);
    } catch {
      Alert.alert('Ubicación', 'No se pudo detectar tu ubicación automáticamente.');
    }
  };

  const trades: TradeType[] = [
    'electrician',
    'bricklayer',
    'plumber',
    'carpenter',
    'mechanic',
    'limpieza',
    'jardineria',
    'pintura',
  ];

  const tradeQuestionnaires: Record<TradeType, { id: string; text: string; options?: string[] }[]> =
    {
      electrician: [
        {
          id: 'urgency',
          text: '¿Qué tan urgente es el trabajo?',
          options: ['Inmediato', 'Esta semana', 'Flexible'],
        },
        {
          id: 'serviceType',
          text: 'Tipo de servicio',
          options: ['Instalación', 'Reparación', 'Mantenimiento'],
        },
      ],
      plumber: [
        {
          id: 'urgency',
          text: '¿Qué tan urgente es el trabajo?',
          options: ['Inmediato', 'Esta semana', 'Flexible'],
        },
        {
          id: 'problem',
          text: '¿Qué problema principal?',
          options: ['Fuga', 'Atasco', 'Instalación'],
        },
      ],
      carpenter: [
        {
          id: 'project',
          text: '¿Qué proyecto necesita?',
          options: ['Muebles', 'Reparación', 'Instalación'],
        },
        { id: 'size', text: 'Tamaño del trabajo', options: ['Pequeño', 'Mediano', 'Grande'] },
      ],
      bricklayer: [
        { id: 'type', text: 'Tipo de obra', options: ['Muro', 'Reparación', 'Pavimento'] },
        { id: 'scale', text: 'Escala del proyecto', options: ['Pequeña', 'Mediana', 'Grande'] },
      ],
      mechanic: [
        { id: 'vehicle', text: 'Tipo de vehículo', options: ['Auto', 'Camioneta', 'Moto'] },
        { id: 'issue', text: 'Problema principal', options: ['Frenos', 'Motor', 'Otros'] },
      ],
      limpieza: [
        { id: 'space', text: 'Tipo de espacio', options: ['Casa', 'Departamento', 'Oficina'] },
        { id: 'frequency', text: 'Frecuencia deseada', options: ['Una vez', 'Semanal', 'Mensual'] },
      ],
      jardineria: [
        { id: 'service', text: 'Servicio requerido', options: ['Poda', 'Diseño', 'Mantenimiento'] },
        { id: 'area', text: 'Tamaño del área', options: ['Pequeña', 'Mediana', 'Grande'] },
      ],
      pintura: [
        { id: 'area', text: 'Área a pintar', options: ['Interior', 'Exterior', 'Ambos'] },
        { id: 'surface', text: 'Superficie', options: ['Paredes', 'Techo', 'Madera'] },
      ],
    };

  const personQuestionnaires: Record<string, { id: string; text: string; options?: string[] }[]> =
    useMemo(() => {
      const map: Record<string, { id: string; text: string; options?: string[] }[]> = {};
      mockTradespeople.forEach((tp) => {
        const base = tradeQuestionnaires[tp.trade] || [];
        map[tp.id] = [
          ...base,
          { id: `custom_${tp.id}`, text: `¿Alguna instrucción o preferencia para ${tp.name}?` },
        ];
      });
      return map;
    }, []);

  useEffect(() => {
    const hydrateBuscarPreferences = async () => {
      try {
        const [storedLocation, storedAddress, storedRadius] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.location),
          AsyncStorage.getItem(STORAGE_KEYS.address),
          AsyncStorage.getItem(STORAGE_KEYS.radius),
        ]);

        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation) as {
            latitude: number;
            longitude: number;
          };

          if (
            typeof parsedLocation.latitude === 'number' &&
            typeof parsedLocation.longitude === 'number'
          ) {
            localizeTradespeople(parsedLocation);
          }
        }

        if (storedAddress) {
          setAddress(storedAddress);
        }

        if (storedRadius) {
          const parsedRadius = Number(storedRadius);
          if (Number.isFinite(parsedRadius)) {
            setSearchRadius(clampRadius(parsedRadius));
          }
        }
      } catch {
        // Ignore malformed cache and continue with live GPS.
      }
    };

    hydrateBuscarPreferences().catch(() => {
      // Ignore cache hydration issues.
    });

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let coords = INITIAL_LOCATION;
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        }
        localizeTradespeople(coords);

        const readableAddress = await resolveReadableAddress(coords);
        setAddress((prevAddress) => prevAddress || readableAddress);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.location, JSON.stringify(coords)],
          [STORAGE_KEYS.address, readableAddress],
        ]);
      } catch (e) {
        localizeTradespeople(INITIAL_LOCATION);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getFilteredTradesForModal = () => {
    if (!searchModalQuery) return trades;
    const q = searchModalQuery.toLowerCase();
    return trades.filter(
      (trade) => tradeLabels[trade].toLowerCase().includes(q) || trade.toLowerCase().includes(q),
    );
  };

  const getFilteredTradespeopleForModal = () => {
    if (!selectedModalTrade) return [];
    let filtered = masterTradespeople.filter((tp) => tp.trade === selectedModalTrade);
    if (searchModalQuery) {
      const q = searchModalQuery.toLowerCase();
      filtered = filtered.filter((tp) => tp.name.toLowerCase().includes(q));
    }

    filtered = filtered
      .map((tp) => ({ ...tp, distanceMiles: milesBetween(userLocation, tp.location) }))
      .filter((tp) => tp.distanceMiles <= searchRadius)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);

    return filtered;
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.modalHeader}>
        <TouchableOpacity
          onPress={() => {
            setSelectedModalTrade(null);
            setSearchModalQuery('');
          }}
          style={styles.backButton}
        >
          <Ionicons name={selectedModalTrade ? 'arrow-back' : 'close'} size={28} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>
          {selectedModalTrade ? tradeLabels[selectedModalTrade] : 'Seleccionar Profesional'}
        </Text>
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

      {/* Address input below search */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text style={{ color: '#466298', marginBottom: 6 }}>Dirección</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[
              styles.modalSearchInput,
              { flex: 1, backgroundColor: '#f0eded', borderRadius: 8, paddingHorizontal: 10 },
            ]}
            placeholder="Introduce o cambia tu dirección"
            value={address}
            onChangeText={setAddress}
            onFocus={() => {
              detectAndFillAddress().catch(() => {
                Alert.alert('Ubicación', 'No se pudo detectar tu ubicación automáticamente.');
              });
            }}
          />
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => {
              detectAndFillAddress().catch(() => {
                Alert.alert('Ubicación', 'No se pudo detectar tu ubicación automáticamente.');
              });
            }}
          >
            <Ionicons name="locate" size={24} color="#0b3d91" />
          </TouchableOpacity>
        </View>

        <View style={styles.radiusRow}>
          <Text style={styles.radiusLabel}>Radio de búsqueda: {searchRadius} mi</Text>
          <View style={styles.radiusActions}>
            <TouchableOpacity
              style={styles.radiusButton}
              onPress={() => {
                saveSearchRadius(searchRadius - SEARCH_RADIUS_STEP).catch(() => {
                  Alert.alert('Radio', 'No se pudo actualizar el radio de búsqueda.');
                });
              }}
            >
              <Ionicons name="remove" size={18} color="#0b3d91" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radiusButton}
              onPress={() => {
                saveSearchRadius(searchRadius + SEARCH_RADIUS_STEP).catch(() => {
                  Alert.alert('Radio', 'No se pudo actualizar el radio de búsqueda.');
                });
              }}
            >
              <Ionicons name="add" size={18} color="#0b3d91" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Questionnaire modal */}
      <Modal
        visible={questionnaireVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setQuestionnaireVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View style={{ width: '94%', backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0b3d91' }}>
                Solicitud - {questionTradesperson ? questionTradesperson.name : ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Cancelar solicitud',
                    '¿Deseas cancelar la solicitud o volver a editarla?',
                    [
                      {
                        text: 'Cancelar solicitud',
                        style: 'destructive',
                        onPress: () => {
                          setQuestionnaireVisible(false);
                          setAnswers({});
                          setOpenDetails('');
                          setQuestionTradesperson(null);
                        },
                      },
                      { text: 'Volver', style: 'cancel' },
                    ],
                  );
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              {(questionTradesperson
                ? (personQuestionnaires[questionTradesperson.id] ??
                  tradeQuestionnaires[questionTradesperson.trade])
                : []
              ).map((q) => (
                <View key={q.id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '600' }}>{q.text}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    {q.options?.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        style={{
                          padding: 8,
                          marginRight: 8,
                          borderRadius: 8,
                          backgroundColor: answers[q.id] === opt ? '#0b3d91' : '#f3f4f6',
                        }}
                      >
                        <Text style={{ color: answers[q.id] === opt ? '#fff' : '#1f2937' }}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <Text style={{ fontWeight: '600' }}>Detalles (opcional)</Text>
              <TextInput
                value={openDetails}
                onChangeText={setOpenDetails}
                placeholder="Añade más información"
                multiline
                style={{
                  minHeight: 80,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  padding: 8,
                  marginTop: 8,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setQuestionnaireVisible(false);
                  setAnswers({});
                  setOpenDetails('');
                  setQuestionTradesperson(null);
                }}
                style={{ paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 }}
              >
                <Text style={{ color: '#6b7280' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // submit (mock) and navigate to profile
                  setQuestionnaireVisible(false);
                  Alert.alert('Solicitud enviada', 'Tu solicitud fue enviada al profesional.');
                  const id = questionTradesperson?.id;
                  setAnswers({});
                  setOpenDetails('');
                  setQuestionTradesperson(null);
                  if (id) navigation.navigate('TradespersonDetail', { tradespersonId: id });
                }}
                style={{
                  backgroundColor: '#0b3d91',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {!selectedModalTrade ? (
        <FlatList
          data={getFilteredTradesForModal()}
          keyExtractor={(item) => item}
          renderItem={({ item: trade }) => {
            const tradeCount = masterTradespeople.filter((tp) => tp.trade === trade).length;
            return (
              <TouchableOpacity
                style={styles.tradeItem}
                onPress={() => setSelectedModalTrade(trade)}
              >
                {tradeLogos[trade] ? (
                  <Image
                    source={tradeLogos[trade]}
                    style={{ width: 44, height: 44, borderRadius: 8, marginRight: 14 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.tradeIconModal, { backgroundColor: tradeColors[trade] }]}>
                    <Ionicons name={tradeIcons[trade]} size={24} color="white" />
                  </View>
                )}
                <View style={styles.tradeInfo}>
                  <Text style={styles.tradeItemText}>{tradeLabels[trade]}</Text>
                  <Text style={styles.tradeCount}>
                    {tradeCount} {tradeCount === 1 ? 'profesional' : 'profesionales'}
                  </Text>
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
            <View style={styles.tradespersonItem}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() =>
                  navigation.navigate('TradespersonDetail', { tradespersonId: tradesperson.id })
                }
              >
                <Image
                  source={{ uri: tradesperson.imageUrl }}
                  style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
                />
                <View style={styles.tradespersonInfo}>
                  <Text style={styles.tradespersonName}>{tradesperson.name}</Text>
                  <Text style={styles.tradespersonTrade}>
                    {tradeLabels[tradesperson.trade]} • ⭐ {tradesperson.rating.toFixed(1)}
                  </Text>
                  <Text style={styles.tradespersonDistance}>
                    A {milesBetween(userLocation, tradesperson.location).toFixed(1)} mi de ti
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#6b7280' }}>${tradesperson.hourlyRate}/hr</Text>
                <TouchableOpacity
                  onPress={() => {
                    setQuestionTradesperson(tradesperson);
                    setQuestionnaireVisible(true);
                  }}
                  style={{
                    marginTop: 8,
                    backgroundColor: '#0b3d91',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Solicitar Presupuesto</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
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
  modalSearchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1f2937' },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tradeIconModal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tradeInfo: { flex: 1, justifyContent: 'center' },
  tradeItemText: { flex: 1, fontSize: 16, color: '#1f2937', fontWeight: '500' },
  tradeCount: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tradespersonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tradespersonInfo: { flex: 1, justifyContent: 'center' },
  tradespersonName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  tradespersonTrade: { fontSize: 13, color: '#6b7280' },
  tradespersonDistance: { fontSize: 12, color: '#2563eb', marginTop: 2 },
  radiusRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusLabel: {
    color: '#0b3d91',
    fontWeight: '600',
  },
  radiusActions: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { width: 28 },
});

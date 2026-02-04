import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { mockTradespeople } from '../data/mockData';
import { TradeType } from '../types';

type TradespersonDetailRouteProp = RouteProp<RootStackParamList, 'TradespersonDetail'>;

const tradeColors: Record<TradeType, string> = {
  electrician: '#f59e0b',
  plumber: '#3b82f6',
  carpenter: '#92400e',
  bricklayer: '#dc2626',
  mechanic: '#1f2937',
};

const tradeLabels: Record<TradeType, string> = {
  electrician: 'Electricista',
  plumber: 'Plomero',
  carpenter: 'Carpintero',
  bricklayer: 'Albañil',
  mechanic: 'Mecánico',
};

export default function TradespersonDetailScreen() {
  const route = useRoute<TradespersonDetailRouteProp>();
  const navigation = useNavigation();
  const { tradespersonId } = route.params;

  const tradesperson = mockTradespeople.find((tp) => tp.id === tradespersonId);

  if (!tradesperson) {
    return (
      <View style={styles.container}>
        <Text>Profesional no encontrado</Text>
      </View>
    );
  }

  const handleSendMessage = () => {
    Alert.alert('Mensaje', `¿Iniciar conversación con ${tradesperson.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Enviar', onPress: () => Alert.alert('Éxito', '¡Mensaje enviado!') },
    ]);
  };

  const handleCall = () => {
    Alert.alert('Llamar', `¿Llamar a ${tradesperson.name} al ${tradesperson.phoneNumber}?`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={16}
          color="#f59e0b"
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <Image source={{ uri: tradesperson.imageUrl }} style={styles.headerImage} />

      {/* Main Info */}
      <View style={styles.mainInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{tradesperson.name}</Text>
          {tradesperson.verified && (
            <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
          )}
        </View>
        <View style={styles.tradeRow}>
          <View
            style={[
              styles.tradeBadge,
              { backgroundColor: tradeColors[tradesperson.trade] },
            ]}
          >
            <Text style={styles.tradeBadgeText}>
              {tradeLabels[tradesperson.trade]}
            </Text>
          </View>
          <Text style={styles.experience}>{tradesperson.yearsExperience} años de experiencia</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>{renderStars(tradesperson.rating)}</View>
          <Text style={styles.ratingText}>
            {tradesperson.rating} ({tradesperson.reviews.length} reseñas)
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Ionicons name="cash-outline" size={20} color="#059669" />
          <Text style={styles.priceText}>${tradesperson.hourlyRate}/hora</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <Text style={styles.bioText}>{tradesperson.bio}</Text>
      </View>

      {/* Credentials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credenciales</Text>
        {tradesperson.credentials.map((credential, index) => (
          <View key={index} style={styles.credentialItem}>
            <Ionicons name="ribbon" size={18} color="#2563eb" />
            <Text style={styles.credentialText}>{credential}</Text>
          </View>
        ))}
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disponibilidad</Text>
        {tradesperson.availability.map((day, index) => (
          <View key={index} style={styles.availabilityRow}>
            <Text style={styles.dayText}>{day.day}</Text>
            {day.available ? (
              <View style={styles.timeSlotsContainer}>
                {day.timeSlots.map((slot, i) => (
                  <Text key={i} style={styles.timeSlot}>
                    {slot}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.unavailableText}>No disponible</Text>
            )}
          </View>
        ))}
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reseñas</Text>
        {tradesperson.reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.callButtonText}>Llamar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage}>
          <Ionicons name="chatbubble" size={20} color="white" />
          <Text style={styles.messageButtonText}>Mensaje</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e7eb',
  },
  mainInfo: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  tradeBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  experience: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 8,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  credentialText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 10,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    width: 100,
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlot: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  unavailableText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import type { TradeType } from '../types';

type Persona = 'client' | 'tradesperson';

const tradeLabels: Record<TradeType, string> = {
  electrician: 'Electricista',
  bricklayer: 'Albañil',
  plumber: 'Plomero',
  carpenter: 'Carpintero',
  mechanic: 'Mecánico',
  limpieza: 'Limpieza',
  jardineria: 'Jardinería',
  pintura: 'Pintura',
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

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [persona, setPersona] = useState<Persona>('client');
  const [trade, setTrade] = useState<TradeType>('electrician');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (persona === 'tradesperson' && !trade) {
      Alert.alert('Completa tu perfil', 'Selecciona tu oficio principal para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding({ role: persona, trade: persona === 'tradesperson' ? trade : undefined });
      Alert.alert('Onboarding completado', 'Tu perfil ha sido configurado correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el onboarding.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Configura tu experiencia</Text>
        <Text style={styles.subtitle}>Elige cómo usarás Hazparo</Text>

        <TouchableOpacity
          style={[styles.option, persona === 'client' && styles.optionActive]}
          onPress={() => setPersona('client')}
        >
          <Text style={styles.optionTitle}>Cliente</Text>
          <Text style={styles.optionDescription}>Busca y contrata profesionales locales.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, persona === 'tradesperson' && styles.optionActive]}
          onPress={() => setPersona('tradesperson')}
        >
          <Text style={styles.optionTitle}>Profesional</Text>
          <Text style={styles.optionDescription}>Recibe solicitudes y gestiona tus servicios.</Text>
        </TouchableOpacity>

        {persona === 'tradesperson' && (
          <View style={styles.tradePickerContainer}>
            <Text style={styles.tradePickerTitle}>Selecciona tu oficio principal</Text>
            <View style={styles.tradeGrid}>
              {trades.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeOption, trade === item && styles.tradeOptionActive]}
                  onPress={() => setTrade(item)}
                >
                  <Text style={[styles.tradeOptionText, trade === item && styles.tradeOptionTextActive]}>
                    {tradeLabels[item]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Continuar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f7ff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0b3d91',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0b3d91',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#4b5563',
  },
  option: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  optionActive: {
    borderColor: '#0b3d91',
    backgroundColor: '#eef4ff',
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  optionDescription: {
    marginTop: 4,
    color: '#4b5563',
  },
  tradePickerContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  tradePickerTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
    fontWeight: '600',
  },
  tradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tradeOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  tradeOptionActive: {
    borderColor: '#0b3d91',
    backgroundColor: '#eef4ff',
  },
  tradeOptionText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  tradeOptionTextActive: {
    color: '#0b3d91',
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#0b3d91',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
type Persona = 'client' | 'tradesperson';

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { session } = useAuth();
  const [persona, setPersona] = useState<Persona>('client');

  const handleContinue = () => {
    Alert.alert(
      'Onboarding listo',
      `Seleccionaste el perfil: ${persona === 'client' ? 'Cliente' : 'Profesional'}.`,
    );

    if (!session) {
      navigation.navigate('Login');
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

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continuar</Text>
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
});

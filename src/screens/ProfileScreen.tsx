import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const {
    session,
    profile,
    tradespersonProfile,
    clientProfile,
    isTradespersonProfileComplete,
    isClientProfileComplete,
    updateTradespersonProfile,
    updateClientProfile,
    signOut,
  } = useAuth();
  const [bioInput, setBioInput] = useState('');
  const [hourlyRateInput, setHourlyRateInput] = useState('');
  const [yearsExperienceInput, setYearsExperienceInput] = useState('0');
  const [isSavingProfessionalInfo, setIsSavingProfessionalInfo] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [postalCodeInput, setPostalCodeInput] = useState('');
  const [isSavingClientInfo, setIsSavingClientInfo] = useState(false);

  useEffect(() => {
    setBioInput(tradespersonProfile?.bio ?? '');
    setHourlyRateInput(
      tradespersonProfile?.hourly_rate !== null && tradespersonProfile?.hourly_rate !== undefined
        ? String(tradespersonProfile.hourly_rate)
        : '',
    );
    setYearsExperienceInput(String(tradespersonProfile?.years_experience ?? 0));
  }, [tradespersonProfile]);

  useEffect(() => {
    setPhoneInput(clientProfile?.phone_number ?? '');
    setAddressInput(clientProfile?.default_address ?? '');
    setCityInput(clientProfile?.city ?? '');
    setStateInput(clientProfile?.state ?? '');
    setPostalCodeInput(clientProfile?.postal_code ?? '');
  }, [clientProfile]);

  const roleLabel = useMemo(() => {
    if (profile?.role === 'tradesperson') {
      return 'Profesional';
    }
    if (profile?.role === 'client') {
      return 'Cliente';
    }
    return 'Cuenta';
  }, [profile?.role]);

  const displayName =
    profile?.full_name || session?.user.user_metadata?.full_name || session?.user.email || 'Usuario';
  const displayEmail = profile?.email || session?.user.email || 'Sin correo';
  const avatarUrl =
    session?.user.user_metadata?.avatar_url || 'https://i.pravatar.cc/300?img=33';
  const savedCount = 0;

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', '¡Edición de perfil próximamente!');
  };

  const handleSettings = () => {
    Alert.alert('Configuración', '¡Página de configuración próximamente!');
  };

  const handlePaymentMethods = () => {
    Alert.alert('Métodos de Pago', '¡Gestión de métodos de pago próximamente!');
  };

  const handleBookingHistory = () => {
    Alert.alert('Historial de Reservas', '¡Historial de reservas próximamente!');
  };

  const handleSavedTradespeople = () => {
    Alert.alert('Guardados', `Tienes ${savedCount} profesionales guardados`);
  };

  const handleHelp = () => {
    Alert.alert('Ayuda y Soporte', '¡Centro de ayuda próximamente!');
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo cerrar sesión.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handleSaveProfessionalInfo = async () => {
    const parsedHourlyRate = Number(hourlyRateInput);
    const parsedYearsExperience = Number(yearsExperienceInput);

    if (!bioInput.trim()) {
      Alert.alert('Datos incompletos', 'Agrega una biografía para tu perfil profesional.');
      return;
    }

    if (!Number.isFinite(parsedHourlyRate) || parsedHourlyRate <= 0) {
      Alert.alert('Tarifa inválida', 'Ingresa una tarifa por hora mayor a 0.');
      return;
    }

    if (!Number.isFinite(parsedYearsExperience) || parsedYearsExperience < 0) {
      Alert.alert('Experiencia inválida', 'Ingresa años de experiencia válidos.');
      return;
    }

    setIsSavingProfessionalInfo(true);
    try {
      await updateTradespersonProfile({
        bio: bioInput.trim(),
        hourlyRate: parsedHourlyRate,
        yearsExperience: parsedYearsExperience,
      });
      Alert.alert('Perfil actualizado', 'Tu perfil profesional ya está completo.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar el perfil profesional.';
      Alert.alert('Error', message);
    } finally {
      setIsSavingProfessionalInfo(false);
    }
  };

  const handleSaveClientInfo = async () => {
    if (!phoneInput.trim()) {
      Alert.alert('Datos incompletos', 'Agrega un número de teléfono.');
      return;
    }

    if (!addressInput.trim()) {
      Alert.alert('Datos incompletos', 'Agrega una dirección principal.');
      return;
    }

    setIsSavingClientInfo(true);
    try {
      await updateClientProfile({
        phoneNumber: phoneInput.trim(),
        defaultAddress: addressInput.trim(),
        city: cityInput,
        state: stateInput,
        postalCode: postalCodeInput,
      });
      Alert.alert('Perfil actualizado', 'Tu perfil de cliente ya está completo.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar el perfil de cliente.';
      Alert.alert('Error', message);
    } finally {
      setIsSavingClientInfo(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
        <Text style={styles.onboardingStateText}>
          Estado de onboarding: {profile?.onboarding_completed ? 'Completado' : 'Pendiente'}
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={16} color="white" />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      {profile?.role === 'tradesperson' && !isTradespersonProfileComplete && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completa tu Perfil Profesional</Text>
          <View style={styles.professionalPromptCard}>
            <Text style={styles.professionalPromptText}>
              Para recibir solicitudes, agrega tu biografía, tarifa y años de experiencia.
            </Text>

            <TextInput
              value={bioInput}
              onChangeText={setBioInput}
              multiline
              placeholder="Biografía profesional"
              style={[styles.input, styles.bioInput]}
            />
            <TextInput
              value={hourlyRateInput}
              onChangeText={setHourlyRateInput}
              keyboardType="numeric"
              placeholder="Tarifa por hora (MXN)"
              style={styles.input}
            />
            <TextInput
              value={yearsExperienceInput}
              onChangeText={setYearsExperienceInput}
              keyboardType="numeric"
              placeholder="Años de experiencia"
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.completeButton, isSavingProfessionalInfo && styles.completeButtonDisabled]}
              onPress={handleSaveProfessionalInfo}
              disabled={isSavingProfessionalInfo}
            >
              {isSavingProfessionalInfo ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.completeButtonText}>Guardar Perfil Profesional</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {profile?.role === 'client' && !isClientProfileComplete && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completa tu Perfil de Cliente</Text>
          <View style={styles.professionalPromptCard}>
            <Text style={styles.professionalPromptText}>
              Agrega tus datos básicos para agilizar reservas y recomendaciones cercanas.
            </Text>

            <TextInput
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="Número de teléfono"
              style={styles.input}
            />
            <TextInput
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="Dirección principal"
              style={styles.input}
            />
            <TextInput
              value={cityInput}
              onChangeText={setCityInput}
              placeholder="Ciudad"
              style={styles.input}
            />
            <TextInput
              value={stateInput}
              onChangeText={setStateInput}
              placeholder="Estado"
              style={styles.input}
            />
            <TextInput
              value={postalCodeInput}
              onChangeText={setPostalCodeInput}
              placeholder="Código postal"
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.completeButton, isSavingClientInfo && styles.completeButtonDisabled]}
              onPress={handleSaveClientInfo}
              disabled={isSavingClientInfo}
            >
              {isSavingClientInfo ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.completeButtonText}>Guardar Perfil de Cliente</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handlePaymentMethods}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="card-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Métodos de Pago</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleBookingHistory}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="time-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Historial de Reservas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSavedTradespeople}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="heart-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Profesionales Guardados</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{savedCount}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="location-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Ubicación</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Idioma</Text>
          </View>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuItemValue}>Español</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Ayuda y Soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Términos y Condiciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-outline" size={22} color="#2563eb" />
            <Text style={styles.menuItemText}>Política de Privacidad</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>Versión 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#e8f0ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  roleBadgeText: {
    color: '#0b3d91',
    fontWeight: '700',
    fontSize: 12,
  },
  onboardingStateText: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    paddingVertical: 10,
  },
  professionalPromptCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fbff',
    padding: 14,
  },
  professionalPromptText: {
    color: '#1f2937',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  completeButton: {
    backgroundColor: '#0b3d91',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  menuItemValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    paddingBottom: 30,
  },
});

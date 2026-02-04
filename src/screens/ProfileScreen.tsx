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
import { mockUser } from '../data/mockData';

export default function ProfileScreen() {
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
    Alert.alert('Guardados', `Tienes ${mockUser.savedTradespeople.length} profesionales guardados`);
  };

  const handleHelp = () => {
    Alert.alert('Ayuda y Soporte', '¡Centro de ayuda próximamente!');
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', style: 'destructive', onPress: () => Alert.alert('Sesión cerrada') },
    ]);
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
        <Image source={{ uri: mockUser.imageUrl }} style={styles.profileImage} />
        <Text style={styles.userName}>{mockUser.name}</Text>
        <Text style={styles.userEmail}>{mockUser.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={16} color="white" />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

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
              <Text style={styles.badgeText}>{mockUser.savedTradespeople.length}</Text>
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
    marginBottom: 16,
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

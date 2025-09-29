// En: components/CustomDrawerContent.tsx

import Colors from '@/constants/Colors';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Constants from 'expo-constants'; // Importamos Constants para leer la versión
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Divider, Text } from 'react-native-paper';

export function CustomDrawerContent(props: any) {
  // Obtenemos la versión de la app desde app.json
  const appVersion = Constants.expoConfig?.version;

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Encabezado con Logo y Nombre */}
        <View style={styles.header}>
          <Avatar.Image size={64} source={require('@/assets/images/logo-agro.png')} />
          <Text variant="titleLarge" style={styles.headerText}>Agrícola Bernal</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>Monitoreo de Campo</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Lista de Pantallas */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Pie de página con la versión de la app */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión {appVersion}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background, // <-- CORREGIDO: Color de fondo unificado
  },
  header: {
    padding: 20,
    alignItems: 'flex-start',
  },
  headerText: {
    marginTop: 12,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    color: Colors.light.info,
  },
  divider: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.light.subtle,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.subtle,
  },
});
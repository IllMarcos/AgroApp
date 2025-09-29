// En: app/(drawer)/_layout.tsx

import { CustomDrawerContent } from "@/components/CustomDrawerContent";
import Colors from "@/constants/Colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'slide',
        // Estilos del Header
        headerStyle: { backgroundColor: Colors.light.background, elevation: 0, shadowOpacity: 0 },
        headerTintColor: Colors.light.text,
        headerTitleStyle: { fontWeight: 'bold' },
        // Estilos de los items del Menú
        drawerActiveTintColor: Colors.light.tint,
        drawerInactiveTintColor: Colors.light.info,
        drawerActiveBackgroundColor: Colors.light.accent,
        drawerLabelStyle: { fontSize: 15 }, // <-- CORREGIDO: Sin marginLeft
      }}
    >
      <Drawer.Screen
        name="inicio"
        options={{
          title: "Dashboard",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="reporte"
        options={{
          title: "Nuevo Reporte",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="guia"
        options={{
          title: "Guía Fitosanitaria",
          drawerIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="mapa"
        options={{
          title: "Mapa Interactivo",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="historial"
        options={{
          title: "Historial de Reportes",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="reporte-resumen"
        options={{
          title: "Resumen del Reporte",
          drawerItemStyle: { display: 'none' }, // <-- La magia está aquí
          headerShown: true, // Dejamos que esta pantalla muestre su propio header
        }}
      />
    </Drawer>
  );
}
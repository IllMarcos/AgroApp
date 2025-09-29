// En: app/(drawer)/inicio.tsx

import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Button, FAB, Text } from 'react-native-paper';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAllReports } from '@/app/services/reportService';
import { getWeatherByCity } from '@/app/services/weatherService';
import { RecentReportItem } from '@/components/ReportItem';
import Colors from '@/constants/Colors';

// --- COMPONENTES VISUALES ---

const GreetingHeader = () => (
  <View style={styles.greetingContainer}>
    <Avatar.Image size={48} source={require('@/assets/images/logo-agro.png')} />
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.greetingSubtitle}>Bienvenido de vuelta,</Text>
      <Text style={styles.greetingTitle}>Agrícola Bernal</Text>
    </View>
  </View>
);

const WeatherCard = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeatherByCity('Los Mochis')
      .then(setWeather)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={[styles.weatherCard, styles.skeleton]}><ActivityIndicator color={Colors.light.card} /></View>;
  }

  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherContent}>
        <View>
          <Text style={styles.weatherLocation}>{weather?.name || 'Los Mochis'}, SIN</Text>
          <Text style={styles.weatherTemp}>{weather ? `${Math.round(weather.main.temp)}°C` : '--'}</Text>
          <Text style={styles.weatherCondition}>{weather ? weather.weather[0].description : 'No disponible'}</Text>
        </View>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={80} color={Colors.light.text} style={{ opacity: 0.8 }} />
      </View>
    </View>
  );
};

const StatCard = ({ icon, value, label, color }: { icon: any; value: string; label: string; color: string }) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <View style={styles.statContent}>
      <Feather name={icon} size={20} color="white" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

// --- PANTALLA PRINCIPAL ---

export default function InicioScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [reportCount, setReportCount] = useState<number | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 60], [0, 1]);
    return { opacity };
  });

  useEffect(() => {
    const unsubscribe = getAllReports((reports) => {
      setRecentReports(reports.slice(0, 3));
      setReportCount(reports.length);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* --- ENCABEZADO ANIMADO Y RESPONSIVO --- */}
      <Animated.View style={[styles.header, { height: insets.top + 60, paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedHeaderStyle]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.headerButton}>
          <Ionicons name="menu" size={28} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerButton} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: 100, paddingHorizontal: 20 }}
      >
        <GreetingHeader />
        <WeatherCard />
        <View style={styles.statsContainer}>
          <StatCard icon="file-text" value={reportCount !== null ? `${reportCount}` : '--'} label="Reportes" color={Colors.light.tint} />
          <StatCard icon="wind" value="5" label="Parcelas" color={Colors.light.info} />
          <StatCard icon="alert-triangle" value="3" label="Alertas" color={Colors.dark.error} />
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            {reportCount !== null && reportCount > 3 && (
                <Button mode="text" onPress={() => router.push('/(drawer)/historial')}>Ver Todos</Button>
            )}
        </View>

        {reportCount === null ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={Colors.light.tint} />
        ) : recentReports.length > 0 ? (
            recentReports.map((report) => (
                <RecentReportItem
                    key={report.id}
                    id={report.id}
                    folio={report.folio}
                    cultivo={report.cultivo}
                    fecha={report.fecha}
                    onPress={() => router.push({ pathname: '/(drawer)/reporte-resumen', params: { reportId: report.id } })}
                />
            ))
        ) : (
            <View style={styles.emptyStateContainer}><Text>No hay reportes recientes.</Text></View>
        )}
      </Animated.ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom > 0 ? insets.bottom + 16 : 16 }]}
        color="white"
        onPress={() => router.push('/(drawer)/reporte')}
      />
    </View>
  );
}

// --- HOJA DE ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.light.text,
    },
    contentContainer: {
      // El padding se maneja dinámicamente en el componente
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    greetingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    greetingSubtitle: {
        fontSize: 16,
        color: Colors.light.info,
    },
    weatherCard: {
        borderRadius: 20,
        backgroundColor: Colors.light.subtle,
        marginBottom: 24,
        padding: 20,
    },
    skeleton: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weatherContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    weatherLocation: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.light.text,
        opacity: 0.7,
    },
    weatherTemp: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    weatherCondition: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        textTransform: 'capitalize',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'flex-start',
    },
    statContent: {
        backgroundColor: 'transparent',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: 'white',
        opacity: 0.8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    emptyStateContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: Colors.light.card,
        borderRadius: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        backgroundColor: Colors.light.tint,
        borderRadius: 28,
        elevation: 4,
    },
});
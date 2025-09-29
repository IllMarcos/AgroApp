// En: app/(drawer)/historial.tsx

import { getAllReports } from '@/app/services/reportService';
import { RecentReportItem } from '@/components/ReportItem';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistorialScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [allReports, setAllReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getAllReports((reports) => {
      setAllReports(reports);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredReports = useMemo(() => {
    if (!searchQuery) return allReports;
    return allReports.filter(report =>
      report.cultivo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.folio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allReports]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.light.tint} /></View>;
  }

  const EmptyState = () => (
    <View style={styles.centered}>
        <Feather name="archive" size={60} color={Colors.light.subtle} />
        <Text style={styles.emptyTitle}>No se encontraron reportes</Text>
        <Text style={styles.emptySubtitle}>
            {searchQuery ? "Intenta con otra búsqueda." : "Los reportes que crees aparecerán aquí."}
        </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Searchbar
        placeholder="Buscar por cultivo o folio..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={{ color: Colors.light.text }}
        iconColor={Colors.light.info}
        placeholderTextColor={Colors.light.subtle}
        elevation={1}
        onIconPress={() => Keyboard.dismiss()}
      />
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <RecentReportItem
            id={item.id}
            folio={item.folio}
            cultivo={item.cultivo}
            fecha={item.fecha}
            onPress={() => router.push({ pathname: '/(drawer)/reporte-resumen', params: { reportId: item.id } })}
          />
        )}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.background 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  searchbar: { 
    marginHorizontal: 16, 
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.card, // Color de fondo personalizado
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  emptySubtitle: {
    marginTop: 8,
    color: Colors.light.info,
    textAlign: 'center',
  },
});
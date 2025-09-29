// En: app/(drawer)/reporte-resumen.tsx

import { generatePdf, getReportById } from '@/app/services/reportService';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, List, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- 1. IMPORTAR

export default function ReporteResumenScreen() {
  const { reportId } = useLocalSearchParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets(); // <-- 2. OBTENER LOS VALORES DEL ÁREA SEGURA

  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        try {
          const data = await getReportById(reportId as string);
          setReport(data);
        } catch (error) {
          Alert.alert("Error", "No se pudo cargar el reporte.");
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [reportId]);

  const shareSimpleText = () => {
    if (!report) return;
    let message = `*Resumen de Reporte Agrícola*\n\n`;
    message += `*Folio:* ${report.folio || 'N/A'}\n`;
    message += `*Fecha:* ${report.fecha}\n`;
    message += `*Cultivo:* ${report.cultivo}\n`;
    message += `*Responsable:* ${report.responsable}\n\n`;
    message += `*Observaciones:* ${report.observaciones || 'Sin observaciones.'}`;
    
    Share.share({ message });
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.light.tint} /></View>;
  }

  if (!report) {
    return <View style={styles.centered}><Text>No se encontró el reporte.</Text></View>;
  }

  const plagasDetectadas = Object.entries(report.plagas).filter(([, data]: any) => data.grado || data.estadoBiologico);
  const enfermedadesDetectadas = Object.entries(report.enfermedades).filter(([, data]: any) => data.grado);

  return (
    <>
      <Stack.Screen options={{ title: `Reporte: ${report.folio || report.cultivo}` }} />
      {/* 3. APLICAR EL PADDING INFERIOR DINÁMICO */}
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        
        <Card style={styles.card}>
          <Card.Title 
            title="Datos Generales" 
            titleVariant="titleLarge" 
            titleStyle={styles.cardTitle} 
            left={(props) => <Feather {...props} name="file-text" size={24} color={Colors.light.tint} />}
          />
          <Divider />
          <Card.Content>
            <List.Item title={report.cultivo} description="Cultivo" left={() => <List.Icon icon="leaf" />} />
            <List.Item title={report.responsable} description="Responsable" left={() => <List.Icon icon="account-circle-outline" />} />
            <List.Item title={report.fecha} description="Fecha" left={() => <List.Icon icon="calendar" />} />
            <List.Item title={report.superficie ? `${report.superficie} ha` : 'N/A'} description="Superficie" left={() => <List.Icon icon="texture-box" />} />
            {report.ubicacion && <List.Item title={`${report.ubicacion.lat.toFixed(4)}, ${report.ubicacion.lng.toFixed(4)}`} description="Ubicación" left={() => <List.Icon icon="map-marker" />} />}
          </Card.Content>
        </Card>

        {(plagasDetectadas.length > 0 || enfermedadesDetectadas.length > 0) &&
          <Card style={styles.card}>
            <Card.Title 
              title="Análisis Fitosanitario" 
              titleVariant="titleLarge" 
              titleStyle={styles.cardTitle} 
              left={(props) => <Feather {...props} name="wind" size={24} color={Colors.light.tint} />}
            />
            <Divider />
            <Card.Content>
              {plagasDetectadas.map(([plaga, data]: any) => (
                <List.Item key={plaga} title={plaga.replace(/_/g, ' ')} description={`Grado: ${data.grado}, Estado: ${data.estadoBiologico}`} left={() => <List.Icon icon="bug" />} />
              ))}
              {enfermedadesDetectadas.map(([enfermedad, data]: any) => (
                <List.Item key={enfermedad} title={enfermedad.replace(/_/g, ' ')} description={`Grado: ${data.grado}`} left={() => <List.Icon icon="virus-outline" />} />
              ))}
            </Card.Content>
          </Card>
        }

        <Card style={styles.card}>
          <Card.Title 
            title="Observaciones" 
            titleVariant="titleLarge" 
            titleStyle={styles.cardTitle} 
            left={(props) => <Feather {...props} name="edit-3" size={24} color={Colors.light.tint} />}
          />
          <Divider />
          <Card.Content>
            <Text style={styles.paragraph}>{report.observaciones || 'Sin observaciones.'}</Text>
          </Card.Content>
        </Card>

        {/* --- ACCIONES --- */}
        <View style={styles.actionsContainer}>
          <Button icon="share-variant" mode="contained" onPress={shareSimpleText} style={styles.button}>Compartir Resumen</Button>
          <Button icon="file-pdf-box" mode="outlined" onPress={() => generatePdf(report)} style={styles.button}>Exportar PDF</Button>
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  paragraph: {
    paddingTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.info,
  },
  actionsContainer: {
    marginTop: 10,
    gap: 12,
  },
  button: {
    paddingVertical: 4,
    borderRadius: 50,
  },
});
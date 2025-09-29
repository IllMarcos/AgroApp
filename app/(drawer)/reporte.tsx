// En: app/(drawer)/reporte.tsx

import { createReport } from "@/app/services/reportService";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import MapPicker from "@/components/MapPicker";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, List, Menu, ProgressBar, Text, TextInput, useTheme } from "react-native-paper";

// --- Constantes ---
const ESTADO_BIOLOGICO_OPTIONS = ["Huevo", "Larva", "Pupa", "Adulto", "Ninfa"];
const GRADO_INFESTACION_OPTIONS = ["Presente", "Bajo", "Medio", "Fuerte"];
const PLAGAS = ["Ácaros","Gusano Alfiler","Gusano del Cuerno","Gusano Cogollero","Gusano del Fruto","Gusano Falso Medidor","G. Minador de la Hoja","Gusano Peludo","Gusano Soldado","Gusano Trozador","Grillos","Gallina Ciega","Mosca Blanca","Pulgón","Pulga Saltosa","Trips","Chicharritas"];
const ENFERMEDADES = ["Tizón Temprano","Tizón Tardío","Mildiu Velloso","Cenicilla","Mosaico Común","Chahuixtle","Antracnosis","Moho de la Hoja","Damping Off","Corynespora","Fusarium","Mancha Bacteriana","Moho Blanco","Mancha Gris","Cáncer Bacteriana","Botrytis","Otros"];
type ReportPayload = { folio: string; fecha: string; cultivo: string; superficie: string; responsable: string; observaciones: string; ubicacion: { lat: number; lng: number } | null; plagas: any; enfermedades: any; images: string[]; };

// --- Componente Dropdown ---
const DropdownPicker = ({ label, value, onSelect, options }: { label: string; value: string; onSelect: (value: string) => void; options: string[] }) => {
    const [visible, setVisible] = useState(false);
    return (
        <Menu visible={visible} onDismiss={() => setVisible(false)} anchor={<Button mode="outlined" onPress={() => setVisible(true)} style={styles.dropdown} contentStyle={{ justifyContent: 'space-between' }} icon="chevron-down" textColor={value ? Colors.light.text : Colors.light.info}>{value || label}</Button>}>
            {options.map(o => <Menu.Item key={o} onPress={() => { onSelect(o); setVisible(false); }} title={o} />)}
        </Menu>
    );
};

// --- Componente principal con el Wizard ---
export default function ReporteScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [step, setStep] = useState(0);

    const [folio, setFolio] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [cultivo, setCultivo] = useState("");
    const [superficie, setSuperficie] = useState("");
    const [responsable, setResponsable] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
    const [imagenes, setImagenes] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [plagasState, setPlagasState] = useState<any>(PLAGAS.reduce((acc, name) => ({ ...acc, [name]: { estadoBiologico: "", grado: "" } }), {}));
    const [enfState, setEnfState] = useState<any>(ENFERMEDADES.reduce((acc, name) => ({ ...acc, [name]: { grado: "" } }), {}));
    
    const handleUpdatePlaga = (name: string, field: 'estadoBiologico' | 'grado', value: string) => setPlagasState((p:any) => ({ ...p, [name]: { ...p[name], [field]: value }}));
    const handleUpdateEnfermedad = (name: string, value: string) => setEnfState((p:any) => ({ ...p, [name]: { ...p[name], grado: value }}));

    const onSave = async () => {
        setSaving(true);
        try {
            const payload: ReportPayload = { folio, fecha, cultivo, superficie, responsable, observaciones, ubicacion, plagas: plagasState, enfermedades: enfState, images: [] };
            const res = await createReport(payload, imagenes);
            router.push({ pathname: '/(drawer)/reporte-resumen', params: { reportId: res.id } });
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Ocurrió un error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Datos Generales
                return (
                    <Card.Content style={styles.cardContent}>
                        <TextInput label="Cultivo *" value={cultivo} onChangeText={setCultivo} style={styles.input} mode="outlined" />
                        <TextInput label="Responsable *" value={responsable} onChangeText={setResponsable} style={styles.input} mode="outlined" />
                        <View style={styles.row}>
                            <TextInput label="Fecha" value={fecha} onChangeText={setFecha} style={[styles.input, styles.flexInput]} mode="outlined" />
                            <TextInput label="Superficie (ha)" value={superficie} onChangeText={setSuperficie} style={[styles.input, styles.flexInput]} mode="outlined" keyboardType="numeric" />
                        </View>
                        <TextInput label="Folio (opcional)" value={folio} onChangeText={setFolio} style={styles.input} mode="outlined" />
                    </Card.Content>
                );
            case 1: // Ubicación y Evidencia
                return (
                    <Card.Content style={styles.cardContent}>
                        <MapPicker onLocationSelect={setUbicacion} />
                        <Text variant="bodySmall" style={styles.helperText}>{ubicacion ? `Coordenadas: ${ubicacion.lat.toFixed(5)}, ${ubicacion.lng.toFixed(5)}` : "Toca el mapa para seleccionar un punto"}</Text>
                        <Divider style={{ marginVertical: 16 }} />
                        <ImagePickerComponent onChange={setImagenes} />
                    </Card.Content>
                );
            case 2: // Análisis Fitosanitario
                return (
                    <List.AccordionGroup>
                        <List.Accordion title="Plagas Detectadas" id="plagas" style={{ backgroundColor: Colors.light.card }}>
                            {PLAGAS.map((name) => (
                                <View key={name} style={styles.itemContainer}><Text variant="titleMedium" style={styles.itemName}>{name}</Text><View style={styles.row}><DropdownPicker label="Estado Biológico" value={plagasState[name].estadoBiologico} onSelect={(v) => handleUpdatePlaga(name, 'estadoBiologico', v)} options={ESTADO_BIOLOGICO_OPTIONS} /><DropdownPicker label="Grado Infestación" value={plagasState[name].grado} onSelect={(v) => handleUpdatePlaga(name, 'grado', v)} options={GRADO_INFESTACION_OPTIONS} /></View></View>
                            ))}
                        </List.Accordion>
                        <Divider />
                        <List.Accordion title="Enfermedades Detectadas" id="enfermedades" style={{ backgroundColor: Colors.light.card }}>
                            {ENFERMEDADES.map((name) => (
                                <View key={name} style={styles.itemContainer}><Text variant="titleMedium" style={styles.itemName}>{name}</Text><DropdownPicker label="Grado Infestación" value={enfState[name].grado} onSelect={(v) => handleUpdateEnfermedad(name, v)} options={GRADO_INFESTACION_OPTIONS} /></View>
                            ))}
                        </List.Accordion>
                    </List.AccordionGroup>
                );
            case 3: // Observaciones
                return (
                    <Card.Content style={styles.cardContent}>
                        <TextInput label="Notas, recomendaciones y conclusiones" value={observaciones} onChangeText={setObservaciones} multiline numberOfLines={10} style={styles.input} mode="outlined" />
                    </Card.Content>
                );
            default:
                return null;
        }
    };

    const stepTitles = ["Datos Generales", "Ubicación y Evidencia", "Análisis Fitosanitario", "Observaciones"];

    return (
        <View style={styles.container}>
            <ProgressBar progress={(step + 1) / 4} color={Colors.light.tint} style={styles.progressBar} />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Card style={styles.card}>
                    <Card.Title 
                        title={`${step + 1}. ${stepTitles[step]}`}
                        titleVariant="titleLarge" 
                        titleStyle={styles.cardTitle} 
                    />
                    <Divider />
                    {renderStepContent()}
                </Card>

                <View style={styles.navigationButtons}>
                    <Button mode="text" onPress={() => setStep(s => s - 1)} disabled={step === 0}>Atrás</Button>
                    {step < 3 ? (
                        <Button mode="contained" onPress={() => setStep(s => s + 1)} disabled={(step === 0 && (!cultivo || !responsable))}>Siguiente</Button>
                    ) : (
                        <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>Finalizar y Guardar</Button>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

// --- HOJA DE ESTILOS ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    progressBar: { height: 6 },
    contentContainer: { padding: 20 },
    card: { 
        borderRadius: 16, 
        backgroundColor: Colors.light.card,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardTitle: { fontWeight: 'bold', color: Colors.light.text },
    cardContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8 },
    input: { marginBottom: 16, backgroundColor: Colors.light.background },
    row: { flexDirection: 'row', gap: 16 },
    flexInput: { flex: 1 },
    helperText: { textAlign: 'center', paddingVertical: 8, color: Colors.light.info, fontSize: 12 },
    itemContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.background },
    itemName: { marginBottom: 12, fontWeight: '600', color: Colors.light.text },
    dropdown: { flex: 1, borderColor: Colors.light.subtle, backgroundColor: Colors.light.background },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    }
});
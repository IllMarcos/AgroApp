// En: app/(drawer)/mapa.tsx

import { getAllParcels, saveParcel } from "@/app/services/reportService";
import Colors from '@/constants/Colors';
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, FAB, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const OPENWEATHERMAP_API_KEY = "fd2d74c664ffbbcb2245dfba30d0c781";

// --- INTERFACES ---
interface Point { latitude: number; longitude: number; }
interface Parcel { id: string; name: string; crop: string; coordinates: Point[]; }
interface RainInfo { available: boolean; oneHour: number | null; }
interface WeatherResponse { type: "weather_response"; lat: number; lng: number; humidity: number | null; rainInfo: RainInfo | null; temp?: number | null; weatherDesc?: string | null; error?: string; }

const LayerChip = ({ icon, label, value, activeValue, onPress }: any) => {
    const isActive = activeValue === value;
    return (
        <Chip icon={() => <Feather name={icon} size={16} color={isActive ? Colors.light.card : Colors.light.tint} />} selected={isActive} onPress={() => onPress(value)} style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]} textStyle={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>{label}</Chip>
    );
};

function createHtml(lat: number, lng: number, savedParcels: Parcel[]): string {
  return `
    <!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/><title>Mapa</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: ${Colors.light.background}; }
        .leaflet-control-zoom, .leaflet-control-attribution { display: none; }
        .custom-popup .leaflet-popup-content-wrapper { background: rgba(255, 255, 255, 0.9); border-radius: 12px; box-shadow: 0 3px 14px rgba(0,0,0,0.4); }
        .custom-popup .leaflet-popup-content { margin: 15px; font-family: system-ui, -apple-system; }
        .popup-title { font-weight: bold; color: ${Colors.light.tint}; font-size: 16px; margin-bottom: 5px; text-transform: capitalize; }
        .popup-info { font-size: 14px; color: ${Colors.light.text}; }
        .parcel-label { background: transparent; border: none; box-shadow: none; font-weight: bold; color: #333; font-size: 12px; text-shadow: 1px 1px 2px white; }
    </style></head>
    <body><div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map').setView([${lat}, ${lng}], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
      L.circleMarker([${lat}, ${lng}], { radius: 8, fillColor: '#4A90E2', color: '#fff', weight: 2, opacity: 1, fillOpacity: 1 }).addTo(map);

      const savedParcels = ${JSON.stringify(savedParcels)};
      savedParcels.forEach(parcel => {
        const leafletCoords = parcel.coordinates.map(p => [p.latitude, p.longitude]);
        L.polygon(leafletCoords, { color: '${Colors.light.tint}', fillColor: 'rgba(163, 178, 160, 0.5)', weight: 2 }).addTo(map)
          .bindTooltip(parcel.name, { permanent: true, direction: 'center', className: 'parcel-label' });
      });

      let isEditing = false;
      let points = [];
      let tempPolygon = L.polygon([], { color: '${Colors.light.tint}', dashArray: '5, 5' }).addTo(map);
      let pointMarkers = [];

      const layers = {
        precipitation: L.tileLayer("https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHERMAP_API_KEY}", { opacity: 0.7 }),
        temperature: L.tileLayer("https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHERMAP_API_KEY}", { opacity: 0.6 }),
        clouds: L.tileLayer("https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHERMAP_API_KEY}", { opacity: 0.5 })
      };
      
      let lastPopup = null;
      let currentLayer = null;

      function showPopup(latlng, weatherData){
        if (lastPopup) map.closePopup(lastPopup);
        let html = '<div class="popup-content">';
        if (!weatherData) html += '<b>Obteniendo datos...</b>';
        else {
          html += '<div class="popup-title">' + (weatherData.weatherDesc || 'Condición Desconocida') + '</div>';
          html += '<div class="popup-info">Temperatura: ' + (weatherData.temp !== null ? weatherData.temp.toFixed(1) + ' °C' : 'N/A') + '</div>';
          html += '<div class="popup-info">Humedad: ' + (weatherData.humidity !== null ? weatherData.humidity + '%' : 'N/A') + '</div>';
        }
        html += '</div>';
        lastPopup = L.popup({ className: 'custom-popup' }).setLatLng(latlng).setContent(html).openOn(map);
      }

      function clearDrawing() {
          points = [];
          tempPolygon.setLatLngs([]);
          pointMarkers.forEach(m => map.removeLayer(m));
          pointMarkers = [];
          window.ReactNativeWebView?.postMessage(JSON.stringify({type:'points_updated', points: [] }));
      }

      map.on('click', e => {
        if (isEditing) {
          points.push(e.latlng);
          tempPolygon.setLatLngs(points);
          const marker = L.circleMarker(e.latlng, { radius: 6, fillColor: '${Colors.light.tint}', color: 'white', weight: 2, fillOpacity: 1 }).addTo(map);
          pointMarkers.push(marker);
          window.ReactNativeWebView?.postMessage(JSON.stringify({type:'points_updated', points: points.map(p => ({latitude: p.lat, longitude: p.lng})) }));
        } else {
            showPopup(e.latlng, null);
            window.ReactNativeWebView?.postMessage(JSON.stringify({type:'clicked', lat: e.latlng.lat, lng: e.latlng.lng}));
        }
      });

      function handleMsg(evt) {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === 'toggle_draw_mode') {
            isEditing = data.enabled;
            if (!isEditing) {
              clearDrawing();
            }
          } else if (data.type === 'undo_point') {
            points.pop();
            tempPolygon.setLatLngs(points);
            const markerToRemove = pointMarkers.pop();
            if (markerToRemove) map.removeLayer(markerToRemove);
            window.ReactNativeWebView?.postMessage(JSON.stringify({type:'points_updated', points: points.map(p => ({latitude: p.lat, longitude: p.lng})) }));
          } else if (data.type === 'clear_points') {
            clearDrawing();
          }
          else if (data.type === 'weather_response') {
            showPopup(L.latLng(data.lat, data.lng), data);
          } else if (data.type === 'toggle_layer') {
            if (currentLayer && map.hasLayer(layers[currentLayer])) map.removeLayer(layers[currentLayer]);
            if (data.layer && layers[data.layer]) map.addLayer(layers[data.layer]);
            currentLayer = data.layer;
          }
        } catch (e) {}
      }
      window.addEventListener('message', handleMsg);
      document.addEventListener('message', handleMsg);
    </script></body></html>`;
}

export default function MapaScreen() {
    const webviewRef = useRef<WebView>(null);
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [activeLayer, setActiveLayer] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [drawnCoordinates, setDrawnCoordinates] = useState<Point[] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [parcelName, setParcelName] = useState("");
    const [parcelCrop, setParcelCrop] = useState("");
    const [savedParcels, setSavedParcels] = useState<Parcel[]>([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") { setLocation({ lat: 25.78, lng: -108.98 }); return; }
            try {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            } catch (error) { setLocation({ lat: 25.78, lng: -108.98 }); }
        })();
        const unsubscribe = getAllParcels(setSavedParcels);
        return () => unsubscribe();
    }, []);

    const onMessage = async (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "clicked") {
                const { lat, lng } = data;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=es`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Error en la API del clima.");
                const json = await res.json();
                const payload = { type: "weather_response", lat, lng, humidity: json.main?.humidity, temp: json.main?.temp, weatherDesc: json.weather?.[0]?.description };
                webviewRef.current?.postMessage(JSON.stringify(payload));
            } else if (data.type === "points_updated") {
                setDrawnCoordinates(data.points);
            }
        } catch (err) { console.warn("Error procesando mensaje:", err); }
    };

    const enterEditMode = () => {
        setIsEditing(true);
        setDrawnCoordinates([]);
        webviewRef.current?.postMessage(JSON.stringify({ type: 'toggle_draw_mode', enabled: true }));
    };

    const exitEditMode = () => {
        setIsEditing(false);
        setDrawnCoordinates(null);
        webviewRef.current?.postMessage(JSON.stringify({ type: 'toggle_draw_mode', enabled: false }));
    };

    const handleUndo = () => webviewRef.current?.postMessage(JSON.stringify({ type: 'undo_point' }));
    const handleClear = () => webviewRef.current?.postMessage(JSON.stringify({ type: 'clear_points' }));

    const handleSaveParcel = async () => {
        if (!parcelName || !parcelCrop || !drawnCoordinates || drawnCoordinates.length < 3) {
            Alert.alert("Datos incompletos", "Dibuja una parcela (mínimo 3 puntos) y asígnale un nombre y cultivo.");
            return;
        }
        try {
            await saveParcel({ name: parcelName, crop: parcelCrop, coordinates: drawnCoordinates });
            Alert.alert("Éxito", `La parcela "${parcelName}" ha sido guardada.`);
            setModalVisible(false);
            exitEditMode();
            setParcelName("");
            setParcelCrop("");
        } catch (error) { Alert.alert("Error", "No se pudo guardar la parcela."); }
    };

    const handleLayerPress = (layerName: string) => {
        const newActiveLayer = activeLayer === layerName ? null : layerName;
        setActiveLayer(newActiveLayer);
        webviewRef.current?.postMessage(JSON.stringify({ type: 'toggle_layer', layer: newActiveLayer }));
    };

    if (!location) {
        return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={Colors.light.tint} /><Text style={styles.infoText}>Cargando mapa...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Guardar Parcela</Text>
                    <TextInput label="Nombre de la Parcela" value={parcelName} onChangeText={setParcelName} mode="outlined" style={styles.input} />
                    <TextInput label="Cultivo Principal" value={parcelCrop} onChangeText={setParcelCrop} mode="outlined" style={styles.input} />
                    <Button mode="contained" onPress={handleSaveParcel} style={{ marginTop: 10 }}>Guardar</Button>
                </Modal>
            </Portal>

            <WebView
                ref={webviewRef}
                originWhitelist={["*"]}
                source={{ html: createHtml(location.lat, location.lng, savedParcels) }}
                onMessage={onMessage}
                onLoad={() => setLoading(false)}
                style={styles.webview}
            />
            {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />}

            {isEditing ? (
                <>
                    <View style={[styles.editIndicatorContainer, { top: insets.top > 0 ? insets.top + 10 : 20 }]}>
                        <BlurView intensity={80} tint="light" style={styles.editIndicatorBlur}>
                            <Feather name="edit-3" size={18} color={Colors.light.tint} />
                            <Text style={styles.editIndicatorText}>Modo edición: Toca para añadir puntos</Text>
                        </BlurView>
                    </View>
                    <View style={[styles.editControls, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                        <Button onPress={exitEditMode} mode="outlined" style={styles.editButton} icon="close">Cancelar</Button>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Button onPress={handleUndo} mode="outlined" style={styles.editButton} disabled={!drawnCoordinates || drawnCoordinates.length === 0}>Deshacer</Button>
                            <Button onPress={handleClear} mode="outlined" style={styles.editButton} disabled={!drawnCoordinates || drawnCoordinates.length === 0}>Limpiar</Button>
                        </View>
                        <Button onPress={() => setModalVisible(true)} mode="contained" style={styles.editButton} disabled={!drawnCoordinates || drawnCoordinates.length < 3}>Guardar</Button>
                    </View>
                </>
            ) : (
                <>
                    <View style={[styles.controlsContainer, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                        <BlurView intensity={80} tint="light" style={styles.blurView}>
                            <LayerChip icon="thermometer" label="Temp." value="temperature" activeValue={activeLayer} onPress={handleLayerPress} />
                            <LayerChip icon="cloud-rain" label="Lluvia" value="precipitation" activeValue={activeLayer} onPress={handleLayerPress} />
                            <LayerChip icon="cloud" label="Nubes" value="clouds" activeValue={activeLayer} onPress={handleLayerPress} />
                        </BlurView>
                    </View>
                    <FAB icon="shape-polygon-plus" style={[styles.fab, { bottom: insets.bottom > 0 ? insets.bottom + 80 : 100 }]} onPress={enterEditMode} label="Nueva Parcela" color={Colors.light.card} />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    webview: { flex: 1, backgroundColor: 'transparent' },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background, },
    infoText: { marginTop: 16, color: Colors.light.info, },
    controlsContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', },
    blurView: { flexDirection: 'row', gap: 8, padding: 8, borderRadius: 50, overflow: 'hidden', },
    chip: { height: 40, justifyContent: 'center' },
    chipActive: { backgroundColor: Colors.light.tint },
    chipInactive: { backgroundColor: Colors.light.card },
    chipText: { fontSize: 14, fontWeight: '500' },
    chipTextActive: { color: Colors.light.card },
    chipTextInactive: { color: Colors.light.tint },
    fab: { position: 'absolute', right: 16, backgroundColor: Colors.light.tint, },
    editControls: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: 'transparent'
    },
    editButton: { borderRadius: 50, backgroundColor: Colors.light.card, elevation: 4, },
    modalContainer: { backgroundColor: Colors.light.card, padding: 20, margin: 20, borderRadius: 16, },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: Colors.light.text, },
    input: { marginBottom: 10, backgroundColor: Colors.light.background, },
    editIndicatorContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', },
    editIndicatorBlur: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 50, overflow: 'hidden',
    },
    editIndicatorText: { fontSize: 15, fontWeight: '600', color: Colors.light.tint, },
});
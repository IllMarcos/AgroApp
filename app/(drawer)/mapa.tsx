// En: app/(drawer)/mapa.tsx

import Colors from '@/constants/Colors';
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Text } from 'react-native-paper';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const OPENWEATHERMAP_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || "fd2d74c664ffbbcb2245dfba30d0c781";

// --- Tipos de datos ---
interface RainInfo { available: boolean; oneHour: number | null; }
interface WeatherResponse { type: "weather_response"; lat: number; lng: number; humidity: number | null; rainInfo: RainInfo | null; temp?: number | null; weatherDesc?: string | null; error?: string; }

// --- Componente para los botones de capa ---
const LayerChip = ({ icon, label, value, activeValue, onPress }: any) => {
    const isActive = activeValue === value;
    
    return (
        <Chip
            icon={() => <Feather name={icon} size={16} color={isActive ? Colors.light.card : Colors.light.tint} />}
            selected={isActive}
            onPress={() => onPress(value)}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            textStyle={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}
        >
            {label}
        </Chip>
    );
};

// --- HTML Y JAVASCRIPT PARA EL WEBPVIEW ---
function createHtml(lat: number, lng: number): string {
  return `
    <!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/><title>Mapa</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: ${Colors.light.background}; }
        .leaflet-control-zoom, .leaflet-control-attribution { display: none; }
        .custom-popup .leaflet-popup-content-wrapper { background: rgba(255, 255, 255, 0.9); border-radius: 12px; box-shadow: 0 3px 14px rgba(0,0,0,0.4); }
        .custom-popup .leaflet-popup-content { margin: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .popup-title { font-weight: bold; color: ${Colors.light.tint}; font-size: 16px; margin-bottom: 5px; text-transform: capitalize; }
        .popup-info { font-size: 14px; color: ${Colors.light.text}; }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 0.2; }
            100% { transform: scale(2); opacity: 0; }
        }
    </style></head>
    <body><div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map').setView([${lat}, ${lng}], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      L.circleMarker([${lat}, ${lng}], { 
          radius: 8, 
          fillColor: '#4A90E2', 
          color: '#fff', 
          weight: 2, 
          opacity: 1, 
          fillOpacity: 1 
      }).addTo(map);
      
      L.circleMarker([${lat}, ${lng}], {
          radius: 8,
          fillColor: 'transparent',
          color: '#4A90E2',
          weight: 2,
          opacity: 0.5
      }).addTo(map);

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
        else if (weatherData.error) html += '<b style="color:red;">Error: ' + weatherData.error + '</b>';
        else {
          html += '<div class="popup-title">' + (weatherData.weatherDesc || 'Condición Desconocida') + '</div>';
          html += '<div class="popup-info">Temperatura: ' + (weatherData.temp !== null ? weatherData.temp.toFixed(1) + ' °C' : 'N/A') + '</div>';
          html += '<div class="popup-info">Humedad: ' + (weatherData.humidity !== null ? weatherData.humidity + '%' : 'N/A') + '</div>';
          html += '<div class="popup-info">Lluvia (1h): ' + (weatherData.rainInfo?.oneHour !== null ? weatherData.rainInfo.oneHour.toFixed(1) + ' mm' : '0 mm') + '</div>';
        }
        html += '</div>';

        lastPopup = L.popup({ className: 'custom-popup' })
          .setLatLng(latlng)
          .setContent(html)
          .openOn(map);
      }

      map.on('click', e => {
        showPopup(e.latlng, null);
        window.ReactNativeWebView?.postMessage(JSON.stringify({type:'clicked', lat: e.latlng.lat, lng: e.latlng.lng}));
      });

      function handleMsg(evt) {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === 'weather_response') {
            showPopup(L.latLng(data.lat, data.lng), data);
          } else if (data.type === 'toggle_layer') {
            if (currentLayer && map.hasLayer(layers[currentLayer])) {
                map.removeLayer(layers[currentLayer]);
            }
            if (data.layer && layers[data.layer]) {
                map.addLayer(layers[data.layer]);
            }
            currentLayer = data.layer;
          }
        } catch (e) {}
      }
      window.addEventListener('message', handleMsg);
      document.addEventListener('message', handleMsg);
    </script></body></html>`;
}

// --- Componente principal ---
export default function MapaScreen() {
    const webviewRef = useRef<WebView>(null);
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [activeLayer, setActiveLayer] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLocation({ lat: 25.78, lng: -108.98 });
                setLoading(false);
                return;
            }
            try {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            } catch (error) {
                setLocation({ lat: 25.78, lng: -108.98 });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onMessage = async (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "clicked") {
                const { lat, lng } = data;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=es`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Error en la API del clima: " + res.status);
                const json = await res.json();
                const rainInfo: RainInfo = { available: !!json.rain, oneHour: json.rain?.["1h"] ?? null };
                const payload: WeatherResponse = { type: "weather_response", lat, lng, humidity: json.main?.humidity ?? null, rainInfo, temp: json.main?.temp ?? null, weatherDesc: json.weather?.[0]?.description ?? null };
                webviewRef.current?.postMessage(JSON.stringify(payload));
            }
        } catch (err) {
            console.warn("Error procesando mensaje:", err);
        }
    };

    const handleLayerPress = (layerName: string) => {
        const newActiveLayer = activeLayer === layerName ? null : layerName;
        setActiveLayer(newActiveLayer);
        webviewRef.current?.postMessage(JSON.stringify({ type: 'toggle_layer', layer: newActiveLayer }));
    };

    if (loading || !location) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text style={styles.infoText}>Cargando mapa...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                ref={webviewRef}
                originWhitelist={["*"]}
                source={{ html: createHtml(location.lat, location.lng) }}
                onMessage={onMessage}
                style={styles.webview}
            />

            <View style={[styles.controlsContainer, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <BlurView intensity={80} tint="light" style={styles.blurView}>
                    <LayerChip icon="thermometer" label="Temp." value="temperature" activeValue={activeLayer} onPress={handleLayerPress} />
                    <LayerChip icon="cloud-rain" label="Lluvia" value="precipitation" activeValue={activeLayer} onPress={handleLayerPress} />
                    <LayerChip icon="cloud" label="Nubes" value="clouds" activeValue={activeLayer} onPress={handleLayerPress} />
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    webview: { flex: 1, backgroundColor: 'transparent' },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    infoText: {
        marginTop: 16,
        color: Colors.light.info,
    },
    controlsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    blurView: {
        flexDirection: 'row',
        gap: 8,
        padding: 8,
        borderRadius: 50,
        overflow: 'hidden',
    },
    chip: {
        height: 40,
        justifyContent: 'center',
    },
    chipActive: {
        backgroundColor: Colors.light.tint,
    },
    chipInactive: {
        backgroundColor: Colors.light.card,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    chipTextActive: {
        color: Colors.light.card,
    },
    chipTextInactive: {
        color: Colors.light.tint,
    },
});
// En: components/MapPicker.tsx
import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function MapPicker({ initialLat = 25.78, initialLng = -108.98, onLocationSelect }: any) {
  const html = `
    <!doctype html><html><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <style>html,body,#map{height:100%;margin:0;padding:0}</style></head>
    <body><div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map').setView([${initialLat}, ${initialLng}], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
      let marker = L.marker([${initialLat}, ${initialLng}]).addTo(map);
      map.on('click', function(e){
        const {lat,lng} = e.latlng;
        marker.setLatLng(e.latlng);
        window.ReactNativeWebView?.postMessage(JSON.stringify({lat, lng}));
      });
      // Enviar ubicación inicial
      window.ReactNativeWebView?.postMessage(JSON.stringify({lat: ${initialLat}, lng: ${initialLng}}));
    </script></body></html>`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(e) => {
          try {
            if (onLocationSelect) onLocationSelect(JSON.parse(e.nativeEvent.data));
          } catch (err) {}
        }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.subtle,
    borderRadius: 16,
  }
});
// En: components/ImagePickerComponent.tsx
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

export default function ImagePickerComponent({ onChange }: { onChange: (uris: string[]) => void }) {
  const [uris, setUris] = useState<string[]>([]);

  const pickImage = async (camera: boolean) => {
    let permissionResult;
    if (camera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionResult.granted === false) {
      Alert.alert("Permisos requeridos", `Necesitas conceder permisos de ${camera ? 'cámara' : 'galería'} para continuar.`);
      return;
    }

    const result = camera 
      ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.6,
          selectionLimit: 5,
          allowsMultipleSelection: true,
        });

    if (!result.canceled) {
      const selectedUris = result.assets.map(a => a.uri);
      const nextUris = [...uris, ...selectedUris];
      setUris(nextUris);
      onChange(nextUris);
    }
  };

  return (
    <View style={{ marginTop: 8 }}>
      <Button icon="camera" mode="contained-tonal" onPress={() => pickImage(true)} buttonColor={Colors.light.accent}>
        Tomar foto
      </Button>
      <View style={{ height: 8 }} />
      <Button icon="image-multiple" mode="contained-tonal" onPress={() => pickImage(false)} buttonColor={Colors.light.accent}>
        Elegir desde galería
      </Button>
      <ScrollView horizontal style={{ marginTop: 10 }}>
        {uris.map((u, i) => (
          <Image key={i} source={{ uri: u }} style={styles.imagePreview} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  imagePreview: {
    width: 120,
    height: 90,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.subtle,
  },
});
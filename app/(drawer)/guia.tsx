import { ENFERMEDADES_DATA, FitoInfo, PLAGAS_DATA } from '@/app/data/fitoData';
import Colors from '@/constants/Colors';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal, Searchbar, SegmentedButtons, Text } from 'react-native-paper';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- NUEVO DISEÑO DE TARJETA PARA LA CUADRÍCULA ---
const InfoCard = ({ item, onPress }: { item: FitoInfo; onPress: () => void }) => (
  <Pressable style={styles.cardContainer} onPress={onPress}>
    <Image source={item.imagen} style={styles.cardImage} />
    <View style={styles.cardOverlay} />
    <Text style={styles.cardTitle}>{item.nombre}</Text>
  </Pressable>
);

// --- NUEVO DISEÑO DE MODAL DETALLADO ---
const DetailModal = ({ item, visible, onDismiss }: { item: FitoInfo | null; visible: boolean; onDismiss: () => void }) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Efecto Parallax para la imagen
  const animatedImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-200, 0], [2, 1], 'clamp');
    const translateY = interpolate(scrollY.value, [0, 200], [0, 100], 'clamp');
    return { transform: [{ scale }, { translateY }] };
  });

  if (!item) return null;

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
      <View style={{ flex: 1 }}>
        <IconButton icon="close-circle" size={32} onPress={onDismiss} style={styles.closeButton} iconColor="white" />
        <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
          <View style={styles.modalImageContainer}>
            <Animated.Image source={item.imagen} style={[styles.modalImage, animatedImageStyle]} />
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{item.nombre}</Text>
            </View>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción General</Text>
              <Text style={styles.paragraph}>{item.descripcion}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Síntomas Comunes</Text>
              <Text style={styles.paragraph}>
                - Decoloración de hojas (clorosis).{'\n'}- Presencia de melaza pegajosa.{'\n'}- Deformación de brotes
                nuevos.
              </Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tratamiento Sugerido</Text>
              <Text style={styles.paragraph}>
                Aplicación de jabones insecticidas o aceites de neem. Fomentar la presencia de depredadores naturales
                como las mariquitas.
              </Text>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </Modal>
  );
};

// --- PANTALLA PRINCIPAL DE LA GUÍA ---
export default function GuiaScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState('plagas');
  const [selectedItem, setSelectedItem] = useState<FitoInfo | null>(null);

  const dataToShow = useMemo(() => {
    const sourceData = activeSegment === 'plagas' ? PLAGAS_DATA : ENFERMEDADES_DATA;
    if (!searchQuery) return sourceData;
    return sourceData.filter((item) => item.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeSegment]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Portal>
        <DetailModal item={selectedItem} visible={selectedItem !== null} onDismiss={() => setSelectedItem(null)} />
      </Portal>

      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar en la guía..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ color: Colors.light.text }}
          iconColor={Colors.light.info}
          placeholderTextColor={Colors.light.subtle}
          elevation={1}
        />
        <SegmentedButtons
          value={activeSegment}
          onValueChange={setActiveSegment}
          style={styles.segmentedButtons}
          buttons={[
            { value: 'plagas', label: 'Plagas' },
            { value: 'enfermedades', label: 'Enfermedades' },
          ]}
        />
      </View>

      <FlatList
        data={dataToShow}
        renderItem={({ item }) => <InfoCard item={item} onPress={() => setSelectedItem(item)} />}
        keyExtractor={(item) => item.id}
        numColumns={2} // <--- DISEÑO EN CUADRÍCULA
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

// --- HOJA DE ESTILOS DEL NUEVO DISEÑO ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.subtle },
  searchbar: { borderRadius: 12, backgroundColor: Colors.light.card },
  segmentedButtons: { marginTop: 16 },
  listContent: { padding: 16 },

  // Estilos de la tarjeta en la cuadrícula
  cardContainer: { flex: 1 / 2, margin: 8, aspectRatio: 1, borderRadius: 16, overflow: 'hidden', elevation: 3 },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  cardTitle: { position: 'absolute', bottom: 12, left: 12, color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Estilos del Modal
  modalContainer: { flex: 1, backgroundColor: Colors.light.background },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  modalImageContainer: { height: 300, overflow: 'hidden' },
  modalImage: { width: '100%', height: '100%' },
  modalTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalTitle: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  modalContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.light.tint, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  paragraph: { color: Colors.light.text, fontSize: 16, lineHeight: 24 },
});

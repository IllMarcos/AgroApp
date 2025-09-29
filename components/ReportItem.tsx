// En: components/ReportItem.tsx

import Colors from '@/constants/Colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface ReportItemProps {
  id: string;
  folio: string;
  cultivo: string;
  fecha: string;
  icon?: any;
  onPress: () => void;
}

export const RecentReportItem = ({ folio, cultivo, fecha, icon = 'file-text', onPress }: ReportItemProps) => {
  return (
    <Pressable style={styles.reportItem} onPress={onPress}>
      <View style={styles.reportIconContainer}>
        <Feather name={icon} size={24} color={Colors.light.tint} />
      </View>
      <View style={styles.reportTextContainer}>
        <Text style={styles.reportTitle}>{`Folio ${folio || 'N/A'} - ${cultivo}`}</Text>
        <Text style={styles.reportSubtitle}>{fecha}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.subtle} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    reportIconContainer: {
        padding: 12,
        backgroundColor: Colors.light.background,
        borderRadius: 8,
        marginRight: 16,
    },
    reportTextContainer: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    reportSubtitle: {
        fontSize: 14,
        color: Colors.light.info,
        marginTop: 2,
    },
});
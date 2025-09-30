// En: app/services/reportService.ts

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { child, DataSnapshot, get, getDatabase, onValue, push, query, ref, serverTimestamp, set } from "firebase/database";
import { Alert } from "react-native";
import { getPdfStyles } from './pdfStyles';

// --- CONFIGURACIÓN DE SERVICIOS EXTERNOS ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dculhg48d/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "AgroApp";
const logoUrl = 'https://res.cloudinary.com/dculhg48d/image/upload/v1759167807/logo-agro_h5qjj9.png';

// --- FUNCIONES DE LÓGICA DE DATOS ---

function sanitizeKey(key: string): string {
  return key.replace(/[.#$/\[\]]/g, '_');
}

async function uploadImages(localImageUris: string[]): Promise<string[]> {
  if (!CLOUDINARY_URL || CLOUDINARY_URL.includes('TU_CLOUD_NAME')) {
    Alert.alert('Configuración Requerida', 'Añade tus credenciales de Cloudinary.');
    return [];
  }
  const imageUrls: string[] = [];
  for (const uri of localImageUris) {
    const formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
      const data = await response.json();
      if (data.secure_url) {
        imageUrls.push(data.secure_url);
      }
    } catch (err) {
      console.error("Error subiendo a Cloudinary:", err);
      throw new Error('No se pudo subir una de las imágenes.');
    }
  }
  return imageUrls;
}

export async function createReport(reportData: any, localImageUris: string[] = []) {
  try {
    const imageUrls = await uploadImages(localImageUris);
    const sanitizedPlagas = Object.entries(reportData.plagas).reduce((acc, [key, val]) => ({ ...acc, [sanitizeKey(key)]: val }), {});
    const sanitizedEnfermedades = Object.entries(reportData.enfermedades).reduce((acc, [key, val]) => ({ ...acc, [sanitizeKey(key)]: val }), {});
    const payload = { ...reportData, plagas: sanitizedPlagas, enfermedades: sanitizedEnfermedades, images: imageUrls, createdAt: serverTimestamp() };
    const newReportRef = push(ref(getDatabase(), 'reportes'));
    await set(newReportRef, payload);
    return { id: newReportRef.key, imageUrls };
  } catch (err) {
    console.error("createReport error:", err);
    throw err;
  }
}

export async function getReportById(reportId: string) {
  try {
    const snapshot = await get(child(ref(getDatabase()), `reportes/${reportId}`));
    if (snapshot.exists()) { return snapshot.val(); }
    else { throw new Error("No se encontró el reporte."); }
  } catch (error) {
    console.error("Error obteniendo el reporte:", error);
    throw error;
  }
}

export function getAllReports(callback: (reports: any[]) => void) {
  const dbRef = query(ref(getDatabase(), 'reportes'));
  const unsubscribe = onValue(dbRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const reportList = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => b.createdAt - a.createdAt);
      callback(reportList);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// --- NUEVAS FUNCIONES PARA PARCELAS ---
export async function saveParcel(parcelData: { name: string; crop: string; coordinates: any[] }) {
    try {
        const payload = { ...parcelData, createdAt: serverTimestamp() };
        const dbRef = ref(getDatabase(), 'parcelas');
        const newParcelRef = push(dbRef);
        await set(newParcelRef, payload);
        return { id: newParcelRef.key };
    } catch (err) {
        console.error("Error guardando la parcela:", err);
        throw err;
    }
}

export function getAllParcels(callback: (parcels: any[]) => void) {
    const dbRef = query(ref(getDatabase(), 'parcelas'));
    const unsubscribe = onValue(dbRef, (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const parcelList = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            callback(parcelList);
        } else {
            callback([]);
        }
    });
    return unsubscribe;
}

// --- FUNCIÓN DE PDF SIMPLIFICADA ---
export async function generatePdf(reportData: any) {
  try {
    const plagasHtml = Object.entries(reportData.plagas).filter(([, d]: any) => d.grado || d.estadoBiologico).map(([p, d]: any) => `<tr><td>${p.replace(/_/g, ' ')}</td><td>${d.estadoBiologico || 'N/A'}</td><td>${d.grado || 'N/A'}</td></tr>`).join('');
    const enfermedadesHtml = Object.entries(reportData.enfermedades).filter(([, d]: any) => d.grado).map(([e, d]: any) => `<tr><td>${e.replace(/_/g, ' ')}</td><td>${d.grado}</td></tr>`).join('');
    const imagenesHtml = (reportData.images || []).map((url: string) => `<div class="image-container"><img src="${url}" class="report-image"/></div>`).join('');

    const htmlContent = `
      <html>
        <head><style>${getPdfStyles()}</style></head>
        <body>
          <div class="header">
            <img src="${logoUrl}" alt="Logo" />
            <div class="header-text"><h1>Agrícola Bernal Produce</h1><h2>Reporte Fitosanitario</h2></div>
          </div>
          <h3 class="section-title">Datos Generales</h3>
          <div class="info-grid">
              <div class="info-item"><b>Folio:</b> ${reportData.folio || 'N/A'}</div>
              <div class="info-item"><b>Fecha:</b> ${reportData.fecha}</div>
              <div class="info-item"><b>Cultivo:</b> ${reportData.cultivo}</div>
              <div class="info-item"><b>Superficie:</b> ${reportData.superficie || 'N/A'} ha</div>
              <div class="info-item"><b>Responsable:</b> ${reportData.responsable}</div>
              <div class="info-item"><b>Ubicación:</b> ${reportData.ubicacion ? `${reportData.ubicacion.lat.toFixed(5)}, ${reportData.ubicacion.lng.toFixed(5)}` : 'N/A'}</div>
          </div>
          ${plagasHtml ? `<h3 class="section-title">Plagas Detectadas</h3><table class="report-table"><thead><tr><th>Plaga</th><th>Estado</th><th>Grado</th></tr></thead><tbody>${plagasHtml}</tbody></table>` : ''}
          ${enfermedadesHtml ? `<h3 class="section-title">Enfermedades Detectadas</h3><table class="report-table"><thead><tr><th>Enfermedad</th><th>Grado</th></tr></thead><tbody>${enfermedadesHtml}</tbody></table>` : ''}
          <h3 class="section-title">Observaciones</h3>
          <p class="observations">${reportData.observaciones || 'Sin observaciones.'}</p>
          ${imagenesHtml ? `<h3 class="section-title">Evidencia Fotográfica</h3><div class="gallery">${imagenesHtml}</div>` : ''}
          <div class="footer">Generado por Monitoreo Agrícola App | ${new Date().toLocaleDateString('es-MX')}</div>
        </body>
      </html>`;

    const { uri } = await Print.printToFileAsync({ html: htmlContent, width: 595, height: 842 });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartir Reporte' });
  } catch (error) {
    console.error("Error generando PDF:", error);
    Alert.alert("Error", "No se pudo generar el PDF.");
  }
}